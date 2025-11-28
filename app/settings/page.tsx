'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Settings, Save, Loader2 } from 'lucide-react';
import { useUserSettings, useLanguages } from '@/hooks/settings';
import { useToast } from '@/hooks/shared';

export default function SettingsPage() {
    const {
        settings,
        loading: settingsLoading,
        saving,
        updateSettings,
    } = useUserSettings();
    const { languages, loading: languagesLoading } = useLanguages();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        ownLanguageId: '',
        learnLanguageId: '',
        interfaceLanguageId: '',
    });

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (settings) {
            setFormData({
                name: settings.name || '',
                ownLanguageId: settings.ownLanguageId?.toString() || '',
                learnLanguageId: settings.learnLanguageId?.toString() || '',
                interfaceLanguageId:
                    settings.interfaceLanguageId?.toString() || '',
            });
        }
    }, [settings]);

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

            await updateSettings(updates);

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

    if (!isClient || settingsLoading || languagesLoading) {
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
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Настройки
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Личная информация */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>👤</span>
                                Личная информация
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={settings?.email || ''}
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
                                        onChange={e =>
                                            setFormData(prev => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Введите ваше имя"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Настройки языков */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>🌍</span>
                                Настройки языков
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="own-language">
                                    Родной язык
                                </Label>
                                <Select
                                    value={formData.ownLanguageId}
                                    onValueChange={value =>
                                        setFormData(prev => ({
                                            ...prev,
                                            ownLanguageId: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите ваш родной язык" />
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
                                <p className="text-xs text-gray-500">
                                    Язык, которым вы владеете в совершенстве
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="learn-language">
                                    Изучаемый язык
                                </Label>
                                <Select
                                    value={formData.learnLanguageId}
                                    onValueChange={value =>
                                        setFormData(prev => ({
                                            ...prev,
                                            learnLanguageId: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите язык для изучения" />
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
                                <p className="text-xs text-gray-500">
                                    Язык, который вы хотите изучать
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interface-language">
                                    Язык интерфейса
                                </Label>
                                <Select
                                    value={formData.interfaceLanguageId}
                                    onValueChange={value =>
                                        setFormData(prev => ({
                                            ...prev,
                                            interfaceLanguageId: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите язык интерфейса" />
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
                                <p className="text-xs text-gray-500">
                                    Язык, на котором отображается интерфейс
                                    приложения
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Будущие настройки */}
                    <Card className="border-dashed border-gray-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-500">
                                <span>🚀</span>
                                Будущие настройки
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">
                                Здесь в будущем появятся дополнительные
                                настройки: уведомления, тема оформления,
                                настройки обучения и многое другое.
                            </p>
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
