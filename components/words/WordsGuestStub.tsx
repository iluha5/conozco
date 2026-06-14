'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function WordsGuestStub() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-3">
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('Back')}
                        </Button>
                    </Link>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    {t('Words')}
                </h1>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>{t('Manage your vocabulary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            {t(
                                'Log in to manage your words, track progress, and build your personal dictionary. No paid features. No ads.',
                            )}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/auth/register-public">
                                <Button>{t('Register')}</Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline">{t('Login')}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
