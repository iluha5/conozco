'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Loader2, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function ResetPasswordContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();
    const token = searchParams.get('token');

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch =
        password && confirmPassword && password === confirmPassword;

    const isPasswordValid =
        hasMinLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar &&
        passwordsMatch;

    useEffect(() => {
        if (!token) {
            toast({
                title: t('Error'),
                description: t('Invalid reset link'),
                variant: 'destructive',
            });
        }
    }, [token, toast, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast({
                title: t('Error'),
                description: t('Invalid reset link'),
                variant: 'destructive',
            });
            return;
        }

        if (!password || !confirmPassword) {
            toast({
                title: t('Error'),
                description: t('All fields are required'),
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
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: t('Error'),
                    description: data.error || t('Failed to reset password'),
                    variant: 'destructive',
                });
                return;
            }

            setSuccess(true);
        } catch (error) {
            console.error('Reset password error:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {t('Invalid link')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t('This password reset link is invalid')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push('/auth/forgot-password')}
                            className="w-full"
                        >
                            {t('Request new link')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {t('Password reset successful!')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t('Your password has been changed')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            {t('You can now log in with your new password')}
                        </p>
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full"
                        >
                            {t('Go to login')}
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
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('Reset your password')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('Enter your new password')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('New password')}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Confirm new password')}
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e =>
                                    setConfirmPassword(e.target.value)
                                }
                                disabled={loading}
                            />
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-xs text-red-600">
                                    {t('Passwords do not match')}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isPasswordValid}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('Resetting...')}
                                </>
                            ) : (
                                t('Reset password')
                            )}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:underline"
                            >
                                {t('Back to login')}
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

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
