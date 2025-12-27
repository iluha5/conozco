'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
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
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: t('Error'),
                description: t('Fill all fields'),
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: t('Login error'),
                    description: t('Invalid email or password'),
                    variant: 'destructive',
                });
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred during login'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('Login')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('Enter email and password to login')}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('Password')}
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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
                                    {t('Logging in...')}
                                </>
                            ) : (
                                t('Sign in')
                            )}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            {t("Don't have an account?")}{' '}
                            <Link
                                href="/auth/register"
                                className="text-blue-600 hover:underline"
                            >
                                {t('Sign up')}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
