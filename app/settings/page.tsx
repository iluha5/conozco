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
import { useToast } from '@/hooks/shared';
import { useI18n } from '@/lib/i18n';

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

    const handleSave = async () => {
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
                hasConfigured: true, // Отмечаем, что пользователь прошел настройку
            };

            const updatedSettings = await updateSettings(updates);

            // Если изменился язык интерфейса, переключаем его сразу
            if (
                updatedSettings?.interfaceLanguage?.code &&
                updatedSettings.interfaceLanguage.code !== i18n.language
            ) {
                const newLanguageCode = updatedSettings.interfaceLanguage.code;
                await i18n.changeLanguage(newLanguageCode);

                // Обновляем HTML lang атрибут
                if (typeof document !== 'undefined') {
                    document.documentElement.lang = newLanguageCode;
                }
            }

            toast({
                title: 'Настройки сохранены',
                description: 'Ваши настройки успешно обновлены.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Ошибка',
                description:
                    'Не удалось сохранить настройки. Попробуйте еще раз.',
                variant: 'destructive',
            });
        }
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
                        <p className="text-gray-600">Загрузка...</p>
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
                            Назад
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Настройки
                    </h1>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Личная информация */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Личная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
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
                                        Email изменить нельзя
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Имя</Label>
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
                                                ? 'Загрузка...'
                                                : 'Введите ваше имя'
                                        }
                                        disabled={settingsLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Настройки языков */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Настройки языков</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="own-language">
                                    Родной язык
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
                                                    ? 'Загрузка...'
                                                    : 'Выберите ваш родной язык'
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
                                    Изучаемый язык
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
                                                    ? 'Загрузка...'
                                                    : 'Выберите язык для изучения'
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
                                <Label htmlFor="interface-language">
                                    Язык интерфейса
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
                                                    ? 'Загрузка...'
                                                    : 'Выберите язык интерфейса'
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

                    {/* Кнопка сохранения */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Сохранить
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
