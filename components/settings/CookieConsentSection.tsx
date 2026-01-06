'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCookieConsent } from '@/hooks/shared/useCookieConsent';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function CookieConsentSection() {
    const { consent, withdrawing, withdrawConsent } = useCookieConsent();
    const { t } = useTranslation();
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

    const handleWithdraw = async () => {
        await withdrawConsent();
        setShowWithdrawDialog(false);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return null;
        try {
            return date.toLocaleDateString();
        } catch {
            return null;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('Privacy & Cookies')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            {t('Cookie Consent Status')}
                        </p>
                        {consent?.given ? (
                            <div className="space-y-2">
                                <p className="text-sm text-green-600">
                                    {t('Consent given')}
                                </p>
                                {consent.givenAt && (
                                    <p className="text-xs text-gray-500">
                                        {t('Date:')} {formatDate(consent.givenAt)}
                                    </p>
                                )}
                                {consent.version && (
                                    <p className="text-xs text-gray-500">
                                        {t('Policy version:')} {consent.version}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">
                                {t('No consent given')}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/privacy-policy">
                            <Button variant="outline" className="w-full sm:w-auto">
                                {t('View Privacy Policy')}
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        {consent?.given && (
                            <Button
                                variant="destructive"
                                onClick={() => setShowWithdrawDialog(true)}
                                disabled={withdrawing}
                                className="w-full sm:w-auto"
                            >
                                {withdrawing
                                    ? t('Withdrawing...')
                                    : t('Withdraw Consent')}
                            </Button>
                        )}
                    </div>

                    {consent?.preferences && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('Cookie Preferences')}
                            </p>
                            <div className="space-y-1 text-xs text-gray-600">
                                <p>
                                    {t('Necessary:')}{' '}
                                    {consent.preferences.necessary
                                        ? t('Enabled')
                                        : t('Disabled')}
                                </p>
                                <p>
                                    {t('Functional:')}{' '}
                                    {consent.preferences.functional
                                        ? t('Enabled')
                                        : t('Disabled')}
                                </p>
                                <p>
                                    {t('Analytics:')}{' '}
                                    {consent.preferences.analytics
                                        ? t('Enabled')
                                        : t('Disabled')}
                                </p>
                                <p>
                                    {t('Marketing:')}{' '}
                                    {consent.preferences.marketing
                                        ? t('Enabled')
                                        : t('Disabled')}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Диалог подтверждения отзыва согласия */}
            <Dialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('Withdraw Cookie Consent')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to withdraw your consent for cookies? This will disable functional and analytics cookies. Necessary cookies will remain enabled as they are required for the website to function.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-row justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowWithdrawDialog(false)}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleWithdraw}
                            disabled={withdrawing}
                        >
                            {withdrawing
                                ? t('Withdrawing...')
                                : t('Withdraw Consent')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

