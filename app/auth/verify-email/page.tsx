'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function VerifyEmailContent() {
    const [status, setStatus] = useState<
        'loading' | 'success' | 'error' | 'resending'
    >('loading');
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError(t('Invalid verification link'));
            return;
        }

        verifyEmail(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const verifyEmail = async (verificationToken: string) => {
        try {
            const response = await fetch(
                `/api/auth/verify-email?token=${verificationToken}`,
            );

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setError(data.error || t('Verification failed'));
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setError(t('An error occurred during verification'));
        }
    };

    const handleResendEmail = async () => {
        // This would need email from somewhere - for now redirect to resend page
        router.push('/auth/resend-verification');
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {t('Verifying your email...')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t(
                                'Please wait while we verify your email address',
                            )}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {t('Email verified!')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t('Your email has been successfully verified')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            {t('You can now log in to your account')}
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('Verification failed')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        {t('The verification link may be expired or invalid')}
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleResendEmail}
                            variant="outline"
                            className="w-full"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {t('Resend verification email')}
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/login')}
                            variant="ghost"
                            className="w-full"
                        >
                            {t('Back to login')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
