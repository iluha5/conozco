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
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function ResendVerificationPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: t('Error'),
                description: t('Email is required'),
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 429) {
                toast({
                    title: t('Too many requests'),
                    description: t(
                        'Please wait before requesting another email',
                    ),
                    variant: 'destructive',
                });
                return;
            }

            if (!response.ok) {
                toast({
                    title: t('Error'),
                    description:
                        data.error || t('Failed to send verification email'),
                    variant: 'destructive',
                });
                return;
            }

            setSuccess(true);
        } catch (error) {
            console.error('Resend error:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred'),
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
                            {t('Email sent!')}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {t('Check your inbox for the verification link')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            {t(
                                'We sent a new verification link to your email address',
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('Resend verification email')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t(
                            'Enter your email to receive a new verification link',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Email')}
                            </label>
                            <Input
                                type="email"
                                placeholder={t('your@email.com')}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('Sending...')}
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    {t('Send verification email')}
                                </>
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
