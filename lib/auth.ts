import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

// Helper to get user with relations
async function getUserWithRelations(email: string) {
    return prisma.user.findUnique({
        where: { email },
        include: { role: true, accounts: true },
    });
}

export const authOptions: NextAuthOptions = {
    // Adapter for OAuth (NextAuth automatically ignores it for Credentials)
    adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await getUserWithRelations(credentials.email);

                // IMPORTANT: Always same error for all cases
                const genericError = 'Invalid credentials';

                if (!user) {
                    // Log failed attempt without revealing details
                    await logAudit({
                        userId: null,
                        action: 'LOGIN_FAILED',
                        ipAddress:
                            (req?.headers?.['x-forwarded-for'] as string) ||
                            null,
                        metadata: {
                            email: credentials.email,
                            reason: 'user_not_found',
                        },
                    });
                    throw new Error(genericError);
                }

                // Check 1: If user is OAuth only - reject
                const hasOAuthAccount = user.accounts.some(
                    acc => acc.provider === 'google',
                );
                if (hasOAuthAccount && !user.password) {
                    await logAudit({
                        userId: user.id,
                        action: 'LOGIN_FAILED',
                        ipAddress:
                            (req?.headers?.['x-forwarded-for'] as string) ||
                            null,
                        metadata: {
                            email: credentials.email,
                            reason: 'oauth_only',
                        },
                    });
                    throw new Error(genericError);
                }

                // Check 2: Email must be verified
                if (!user.emailVerified) {
                    await logAudit({
                        userId: user.id,
                        action: 'LOGIN_FAILED',
                        ipAddress:
                            (req?.headers?.['x-forwarded-for'] as string) ||
                            null,
                        metadata: {
                            email: credentials.email,
                            reason: 'email_not_verified',
                        },
                    });
                    // Return different error for not verified (so we can show special message)
                    throw new Error('EMAIL_NOT_VERIFIED');
                }

                // Check 3: Password must exist
                if (!user.password) {
                    await logAudit({
                        userId: user.id,
                        action: 'LOGIN_FAILED',
                        ipAddress:
                            (req?.headers?.['x-forwarded-for'] as string) ||
                            null,
                        metadata: {
                            email: credentials.email,
                            reason: 'no_password',
                        },
                    });
                    throw new Error(genericError);
                }

                // Check 4: Password must match
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password,
                );

                if (!isPasswordValid) {
                    await logAudit({
                        userId: user.id,
                        action: 'LOGIN_FAILED',
                        ipAddress:
                            (req?.headers?.['x-forwarded-for'] as string) ||
                            null,
                        metadata: {
                            email: credentials.email,
                            reason: 'invalid_password',
                        },
                    });
                    throw new Error(genericError);
                }

                // Successful login
                await logAudit({
                    userId: user.id,
                    action: 'LOGIN_SUCCESS',
                    ipAddress:
                        (req?.headers?.['x-forwarded-for'] as string) || null,
                    metadata: { email: credentials.email },
                });

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role.code,
                    emailVerified: user.emailVerified,
                    registrationMethod: user.registrationMethod,
                    passwordChangedAt: user.passwordChangedAt,
                };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                const email = user.email;
                if (!email) {
                    return false;
                }

                // Check email_verified from Google
                const emailVerified = (profile as any)?.email_verified ?? false;
                if (!emailVerified) {
                    return '/auth/error?error=EmailNotVerifiedByProvider';
                }

                const existingUser = await prisma.user.findUnique({
                    where: { email },
                    include: { accounts: true },
                });

                if (existingUser) {
                    // Update emailVerified for existing user
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            emailVerified: new Date(),
                            registrationMethod: 'OAUTH_GOOGLE',
                        },
                    });

                    await logAudit({
                        userId: existingUser.id,
                        action: 'OAUTH_LOGIN',
                        metadata: { provider: 'google', email },
                    });
                } else {
                    // New user will be created by PrismaAdapter
                    // We'll log it in events.createUser
                    await logAudit({
                        userId: null,
                        action: 'OAUTH_REGISTRATION',
                        metadata: { provider: 'google', email },
                    });
                }

                return true;
            }

            return true;
        },

        async jwt({ token, user, trigger }) {
            // First login - save user data in token
            if (user) {
                token.id = user.id;
                token.image = user.image;
                token.emailVerified = user.emailVerified;
                token.registrationMethod = user.registrationMethod;
                token.passwordChangedAt = user.passwordChangedAt;

                // For OAuth users, role might not be populated - fetch from DB
                if (user.role) {
                    token.role = user.role;
                } else {
                    // Fetch user with role from DB
                    const dbUser = await prisma.user.findUnique({
                        where: { id: Number(user.id) },
                        include: { role: true },
                    });
                    token.role = dbUser?.role.code || 'user';
                }
            }

            // On session update - check if password changed
            if (trigger === 'update' && token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: Number(token.id) },
                    select: { passwordChangedAt: true, emailVerified: true },
                });

                if (dbUser) {
                    // If password changed after token issued - invalidate
                    if (
                        dbUser.passwordChangedAt &&
                        token.passwordChangedAt &&
                        new Date(dbUser.passwordChangedAt) >
                            new Date(token.passwordChangedAt as string)
                    ) {
                        return {}; // Empty token = logout user
                    }

                    token.emailVerified = dbUser.emailVerified;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.image = token.image as string | null;
                session.user.emailVerified = token.emailVerified as Date | null;
                session.user.registrationMethod =
                    token.registrationMethod as string;
            }
            return session;
        },
    },

    events: {
        async createUser({ user }) {
            // Called when PrismaAdapter creates a new user (OAuth)
            // Update registrationMethod and emailVerified for OAuth user
            await prisma.user.update({
                where: { id: Number(user.id) },
                data: {
                    registrationMethod: 'OAUTH_GOOGLE',
                    emailVerified: new Date(),
                },
            });

            await logAudit({
                userId: Number(user.id),
                action: 'USER_CREATED',
                metadata: {
                    email: user.email,
                    registrationMethod: 'OAUTH_GOOGLE',
                },
            });
        },
    },

    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // IMPORTANT: Don't use fallback for production
    secret:
        process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === 'development'
            ? 'dev-secret-change-in-production-or-app-will-fail'
            : undefined),
};

// Validate required env variables on startup
if (!process.env.NEXTAUTH_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_SECRET is required in production');
    } else {
        console.warn(
            '⚠️  NEXTAUTH_SECRET not set. Using insecure fallback for development.',
        );
        console.warn('   Generate one with: openssl rand -base64 32');
        console.warn(
            '   Add it to .env.local: NEXTAUTH_SECRET=<generated-secret>',
        );
    }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials not configured');
}
