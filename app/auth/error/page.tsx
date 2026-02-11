'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

function ErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const error = searchParams.get('error');

    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case 'Configuration':
                return {
                    title: t('Configuration error'),
                    description: t(
                        'There is a problem with the server configuration',
                    ),
                };
            case 'AccessDenied':
                return {
                    title: t('Access denied'),
                    description: t('You do not have permission to sign in'),
                };
            case 'Verification':
                return {
                    title: t('Verification error'),
                    description: t(
                        'The verification token has expired or is invalid',
                    ),
                };
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
            case 'EmailCreateAccount':
            case 'Callback':
                return {
                    title: t('OAuth error'),
                    description: t(
                        'An error occurred during sign in with your provider',
                    ),
                };
            case 'OAuthAccountNotLinked':
                return {
                    title: t('Account not linked'),
                    description: t(
                        'This email is already registered with a different sign-in method',
                    ),
                };
            case 'EmailNotVerifiedByProvider':
                return {
                    title: t('Email not verified'),
                    description: t(
                        'Your email address is not verified by the provider. Please verify your email with Google first',
                    ),
                };
            case 'SessionRequired':
                return {
                    title: t('Session required'),
                    description: t('Please sign in to access this page'),
                };
            default:
                return {
                    title: t('Authentication error'),
                    description: t('An unexpected error occurred'),
                };
        }
    };

    const errorInfo = getErrorMessage(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {error === 'EmailNotVerifiedByProvider' ? (
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        ) : (
                            <XCircle className="w-8 h-8 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {errorInfo.title}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {errorInfo.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error === 'OAuthAccountNotLinked' && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                {t(
                                    'Try signing in with the method you used when you first registered',
                                )}
                            </p>
                        </div>
                    )}

                    {error === 'EmailNotVerifiedByProvider' && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <p className="text-sm text-orange-800">
                                {t(
                                    'Please go to your Google account settings and verify your email address',
                                )}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full"
                        >
                            {t('Back to login')}
                        </Button>

                        {error === 'OAuthAccountNotLinked' && (
                            <Button
                                onClick={() =>
                                    router.push('/auth/forgot-password')
                                }
                                variant="outline"
                                className="w-full"
                            >
                                {t('Reset password')}
                            </Button>
                        )}

                        <Link
                            href="/"
                            className="text-center text-sm text-blue-600 hover:underline"
                        >
                            {t('Go to home page')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}
