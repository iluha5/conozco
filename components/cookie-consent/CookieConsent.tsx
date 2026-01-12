'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCookieConsent } from '@/hooks/shared/useCookieConsent';
import { CookiePreferences } from '@/types/cookie-consent.types';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export function CookieConsent() {
    const { consent, saving, needsConsent, saveConsent } = useCookieConsent();
    const { t } = useTranslation();
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
    });

    // Используем needsConsent напрямую - он уже учитывает loading для зарегистрированных пользователей
    // и данные из БД/localStorage для определения необходимости показа баннера
    useEffect(() => {
        // needsConsent уже учитывает:
        // - для зарегистрированных: не показывать пока loadingDb === true
        // - для незарегистрированных: данные из localStorage доступны сразу
        const shouldShow = needsConsent();
        setShowBanner(shouldShow);
    }, [needsConsent]);

    // Инициализируем preferences из существующего согласия
    useEffect(() => {
        if (consent) {
            setPreferences(consent.preferences);
        }
    }, [consent]);

    const handleAcceptAll = async () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true,
        };
        setShowBanner(false);
        await saveConsent(allAccepted, true);
        // После сохранения needsConsent обновится автоматически через useEffect
    };

    const handleRejectAll = async () => {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
        };
        // При отказе сохраняем given: false - явный отказ пользователя
        // withdrawnAt будет установлен автоматически в saveConsent
        setShowBanner(false);
        await saveConsent(onlyNecessary, false);
        // После сохранения needsConsent обновится автоматически через useEffect
    };

    const handleSavePreferences = async () => {
        setShowSettings(false);
        setShowBanner(false);
        await saveConsent(preferences, true);
        // После сохранения needsConsent обновится автоматически через useEffect
    };

    if (!showBanner) {
        return null;
    }

    return (
        <>
            {/* Баннер согласия */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                                {t('Cookie Consent')}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {t(
                                    'We use cookies and similar technologies to provide, protect and improve our services. By clicking "Accept All", you consent to our use of cookies.',
                                )}
                            </p>
                            <Link
                                href="/privacy-policy"
                                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                            >
                                {t('Learn more')}
                            </Link>
                        </div>
                        <div className="flex flex-row justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowSettings(true)}
                                disabled={saving}
                            >
                                {t('Settings')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRejectAll}
                                disabled={saving}
                            >
                                {t('Reject All')}
                            </Button>
                            <Button onClick={handleAcceptAll} disabled={saving}>
                                {saving ? t('Saving...') : t('Accept All')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Диалог настроек */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('Cookie Settings')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Manage your cookie preferences. You can enable or disable different types of cookies below.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {/* Necessary Cookies */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label
                                    htmlFor="necessary"
                                    className="font-semibold cursor-pointer"
                                >
                                    {t('Necessary Cookies')}
                                </Label>
                                <Checkbox
                                    id="necessary"
                                    checked={preferences.necessary}
                                    disabled
                                    className="w-4 h-4"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {t(
                                    'These cookies are essential for the website to function properly. They cannot be disabled.',
                                )}
                            </p>
                        </div>

                        {/* Functional Cookies */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label
                                    htmlFor="functional"
                                    className="font-semibold cursor-pointer"
                                >
                                    {t('Functional Cookies')}
                                </Label>
                                <Checkbox
                                    id="functional"
                                    checked={preferences.functional}
                                    onCheckedChange={checked =>
                                        setPreferences({
                                            ...preferences,
                                            functional: checked === true,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {t(
                                    'These cookies allow the website to remember your preferences and provide enhanced features, such as saving your training progress.',
                                )}
                            </p>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label
                                    htmlFor="analytics"
                                    className="font-semibold cursor-pointer"
                                >
                                    {t('Analytics Cookies')}
                                </Label>
                                <Checkbox
                                    id="analytics"
                                    checked={preferences.analytics}
                                    onCheckedChange={checked =>
                                        setPreferences({
                                            ...preferences,
                                            analytics: checked === true,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {t(
                                    'These cookies help us understand how visitors interact with our website. We use Google Analytics to collect anonymous statistical data.',
                                )}
                            </p>
                        </div>

                        {/* Marketing Cookies */}
                        <div className="border rounded-lg p-4 opacity-60">
                            <div className="flex items-center justify-between mb-2">
                                <Label
                                    htmlFor="marketing"
                                    className="font-semibold cursor-pointer"
                                >
                                    {t('Marketing Cookies')}
                                </Label>
                                <Checkbox
                                    id="marketing"
                                    checked={preferences.marketing}
                                    disabled
                                    className="w-4 h-4"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {t(
                                    'These cookies are used to deliver personalized advertisements.',
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowSettings(false)}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleSavePreferences}
                            disabled={saving}
                        >
                            {saving ? t('Saving...') : t('Save Preferences')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
