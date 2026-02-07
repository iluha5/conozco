'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/shared';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function RegisterPublicPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isPasswordValid =
        hasMinLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: t('Error'),
                description: t('Fill all required fields'),
                variant: 'destructive',
            });
            return;
        }

        if (!isPasswordValid) {
            toast({
                title: t('Error'),
                description: t('Password does not meet requirements'),
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register-public', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name: name || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: t('Registration error'),
                    description: data.error || t('Failed to create user'),
                    variant: 'destructive',
                });
                return;
            }

            setSuccess(true);
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred during registration'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {t('Check your email')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t(
                                'We sent a verification link to your email address',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            {t(
                                'Please check your inbox and click the link to verify your account',
                            )}
                        </p>
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full"
                        >
                            {t('Back to login')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('Create account')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('Sign up to start learning')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Email *')}
                            </label>
                            <Input
                                type="email"
                                placeholder={t('user@example.com')}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Name (optional)')}
                            </label>
                            <Input
                                type="text"
                                placeholder={t('John Doe')}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Password *')}
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                            />

                            {/* Password requirements */}
                            <div className="space-y-1 pt-2">
                                <p className="text-xs font-medium text-gray-700">
                                    {t('Password requirements:')}
                                </p>
                                <div className="space-y-1">
                                    <PasswordRequirement
                                        met={hasMinLength}
                                        text={t('At least 8 characters')}
                                    />
                                    <PasswordRequirement
                                        met={hasUpperCase}
                                        text={t('One uppercase letter')}
                                    />
                                    <PasswordRequirement
                                        met={hasLowerCase}
                                        text={t('One lowercase letter')}
                                    />
                                    <PasswordRequirement
                                        met={hasNumber}
                                        text={t('One number')}
                                    />
                                    <PasswordRequirement
                                        met={hasSpecialChar}
                                        text={t('One special character')}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isPasswordValid}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('Creating account...')}
                                </>
                            ) : (
                                t('Create account')
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">
                                    {t('Or continue with')}
                                </span>
                            </div>
                        </div>

                        <GoogleSignInButton />

                        <div className="text-center text-sm text-gray-600">
                            {t('Already have an account?')}{' '}
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:underline"
                            >
                                {t('Sign in')}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {met ? (
                <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
                <XCircle className="w-3 h-3 text-gray-400" />
            )}
            <span className={met ? 'text-green-600' : 'text-gray-500'}>
                {text}
            </span>
        </div>
    );
}
