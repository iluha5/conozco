'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/Header';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useUserSettings, useLanguages } from '@/hooks/settings';
import { useToast, useHashDialog } from '@/hooks/shared';
import { useI18n, useTranslation } from '@/lib/i18n';
import { isLearnLanguageAvailable } from '@/config/learn-languages';
import { useTrainingStorage } from '@/hooks/training/use-training-storage';
import { LanguageChangeConfirmationDialog } from '@/components/settings/LanguageChangeConfirmationDialog';
import { CookieConsentSection } from '@/components/settings/CookieConsentSection';

export default function SettingsPage() {
    const { data: session } = useSession();
    const {
        settings,
        loading: settingsLoading,
        saving,
        updateSettings,
    } = useUserSettings();
    const { languages, loading: languagesLoading } = useLanguages();
    const { toast } = useToast();
    const i18n = useI18n();
    const { t } = useTranslation();
    const { hasUnfinishedTraining, clearProgress } = useTrainingStorage();
    const { open: isConfirmDialogOpen, setOpen: setConfirmDialogOpen } =
        useHashDialog('settings-language-change-confirm');

    const [formData, setFormData] = useState({
        name: '',
        ownLanguageId: '',
        learnLanguageId: '',
        interfaceLanguageId: '',
    });

    const [isClient, setIsClient] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (settings && !isInitialized) {
            setFormData({
                name: settings.name || '',
                ownLanguageId: settings.ownLanguageId?.toString() || '',
                learnLanguageId: settings.learnLanguageId?.toString() || '',
                interfaceLanguageId:
                    settings.interfaceLanguageId?.toString() || '',
            });
            setIsInitialized(true);
        }
    }, [settings, isInitialized]);

    const performSave = async () => {
        try {
            const updates = {
                name: formData.name.trim() || null,
                ownLanguageId: formData.ownLanguageId
                    ? parseInt(formData.ownLanguageId)
                    : null,
                learnLanguageId: formData.learnLanguageId
                    ? parseInt(formData.learnLanguageId)
                    : null,
                interfaceLanguageId: formData.interfaceLanguageId
                    ? parseInt(formData.interfaceLanguageId)
                    : null,
                hasConfigured: true, // Mark that user completed setup
            };

            const updatedSettings = await updateSettings(updates);

            // If interface language changed, switch it immediately
            if (
                updatedSettings?.interfaceLanguage?.code &&
                updatedSettings.interfaceLanguage.code !== i18n.language
            ) {
                const newLanguageCode = updatedSettings.interfaceLanguage.code;
                await i18n.changeLanguage(newLanguageCode);

                // Update HTML lang attribute
                if (typeof document !== 'undefined') {
                    document.documentElement.lang = newLanguageCode;
                }
            }

            toast({
                title: t('Settings saved'),
                description: t('Your settings have been successfully updated.'),
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: t('Error'),
                description: t('Failed to save settings. Please try again.'),
                variant: 'destructive',
            });
        }
    };

    const handleSave = async () => {
        // Check if learning language changed
        const isLearnLanguageChanged =
            formData.learnLanguageId !== settings?.learnLanguageId?.toString();

        // If active training exists and learning language changes, show confirmation
        if (hasUnfinishedTraining && isLearnLanguageChanged) {
            setConfirmDialogOpen(true);
            return;
        }

        // Otherwise save immediately
        await performSave();
    };

    const handleConfirmSave = async () => {
        setConfirmDialogOpen(false);
        // Clear training progress before saving
        clearProgress();
        await performSave();
    };

    const getLanguageFlag = (code: string) => {
        const flags: Record<string, string> = {
            en: '🇬🇧',
            es: '🇪🇸',
            ru: '🇷🇺',
        };
        return flags[code] || '🌍';
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600">{t('Loading...')}</p>
                    </div>
                </div>
            </div>
        );
    }

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

                <div className="flex flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {t('Settings')}
                    </h1>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Personal information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('Email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={
                                            session?.user?.email ||
                                            settings?.email ||
                                            ''
                                        }
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {t('Email cannot be changed')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Name')}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={e => {
                                            setIsInitialized(true);
                                            setFormData(prev => ({
                                                ...prev,
                                                name: e.target.value,
                                            }));
                                        }}
                                        placeholder={
                                            settingsLoading
                                                ? t('Loading...')
                                                : t('Enter your name')
                                        }
                                        disabled={settingsLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Language settings')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="own-language">
                                    {t('Native language')}
                                </Label>
                                <Select
                                    value={formData.ownLanguageId}
                                    onValueChange={value => {
                                        setIsInitialized(true);
                                        setFormData(prev => ({
                                            ...prev,
                                            ownLanguageId: value,
                                        }));
                                    }}
                                    disabled={
                                        settingsLoading || languagesLoading
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                settingsLoading ||
                                                languagesLoading
                                                    ? t('Loading...')
                                                    : t(
                                                          'Select your native language',
                                                      )
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map(language => (
                                            <SelectItem
                                                key={language.id}
                                                value={language.id.toString()}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>
                                                        {getLanguageFlag(
                                                            language.code,
                                                        )}
                                                    </span>
                                                    {language.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="learn-language">
                                    {t('Language to learn')}
                                </Label>
                                <Select
                                    value={formData.learnLanguageId}
                                    onValueChange={value => {
                                        setIsInitialized(true);
                                        setFormData(prev => ({
                                            ...prev,
                                            learnLanguageId: value,
                                        }));
                                    }}
                                    disabled={
                                        settingsLoading || languagesLoading
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                settingsLoading ||
                                                languagesLoading
                                                    ? t('Loading...')
                                                    : t(
                                                          'Select language to learn',
                                                      )
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages
                                            .filter(language =>
                                                isLearnLanguageAvailable(
                                                    language.code,
                                                ),
                                            )
                                            .map(language => (
                                                <SelectItem
                                                    key={language.id}
                                                    value={language.id.toString()}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>
                                                            {getLanguageFlag(
                                                                language.code,
                                                            )}
                                                        </span>
                                                        {language.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interface-language">
                                    {t('Interface language')}
                                </Label>
                                <Select
                                    value={formData.interfaceLanguageId}
                                    onValueChange={value => {
                                        setIsInitialized(true);
                                        setFormData(prev => ({
                                            ...prev,
                                            interfaceLanguageId: value,
                                        }));
                                    }}
                                    disabled={
                                        settingsLoading || languagesLoading
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                settingsLoading ||
                                                languagesLoading
                                                    ? t('Loading...')
                                                    : t(
                                                          'Select interface language',
                                                      )
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map(language => (
                                            <SelectItem
                                                key={language.id}
                                                value={language.id.toString()}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>
                                                        {getLanguageFlag(
                                                            language.code,
                                                        )}
                                                    </span>
                                                    {language.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & Cookies */}
                    <CookieConsentSection />

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('Saving...')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('Save')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <LanguageChangeConfirmationDialog
                    open={isConfirmDialogOpen}
                    onOpenChange={setConfirmDialogOpen}
                    onConfirm={handleConfirmSave}
                    saving={saving}
                />
            </div>
        </div>
    );
}
