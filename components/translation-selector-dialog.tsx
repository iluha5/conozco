'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Language = {
    id: string | number;
    code: string;
    name: string;
};

type Word = {
    id: string | number;
    userId: string | number;
    baseWordId?: string | number;
    customWord?: string;
    customTranslation?: string;
    languageId: string | number;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string | number;
        word: string;
        partOfSpeech: {
            id: string | number;
            name: string;
            displayName: string;
        };
        languageId: string | number;
        translations: Array<{
            translation: string;
            priority: number;
        }>;
        examples?: Array<any>;
        grammaticalExamples?: Array<any>;
    };
    customTranslations?: Array<{
        id: number;
        translation: string;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
        partOfSpeechId?: number | null;
        originalLanguage: Language;
        translationLanguage: Language;
    }>;
    trainingSessions?: Array<any>;
};

type PartOfSpeech = {
    id: number;
    name: string;
    displayName: string;
};

type TranslationSelectorDialogProps = {
    word: Word;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => Promise<void>;
    partsOfSpeech: PartOfSpeech[];
};

export function TranslationSelectorDialog({
    word,
    open,
    onOpenChange,
    onSave,
    partsOfSpeech,
}: TranslationSelectorDialogProps) {
    const [selectedTranslation, setSelectedTranslation] = useState<string>('');
    const [customTranslationText, setCustomTranslationText] =
        useState<string>('');
    const [selectedPartOfSpeech, setSelectedPartOfSpeech] =
        useState<string>('none');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Инициализация состояния при открытии диалога
    useEffect(() => {
        if (open) {
            setIsSaving(false);
            const customTranslation = word.customTranslations?.[0];

            if (customTranslation) {
                setSelectedTranslation('custom');
                setCustomTranslationText(customTranslation.translation);
                setSelectedPartOfSpeech(
                    customTranslation.partOfSpeechId?.toString() || 'none',
                );
            } else if (
                word.baseWord?.translations &&
                word.baseWord.translations.length > 0
            ) {
                setSelectedTranslation('0');
                setCustomTranslationText('');
                setSelectedPartOfSpeech('none');
            } else {
                setSelectedTranslation('custom');
                setCustomTranslationText('');
                setSelectedPartOfSpeech('none');
            }
        }
    }, [open, word]);

    // Автоматическая установка фокуса при активации кастомного варианта
    useEffect(() => {
        if (selectedTranslation === 'custom') {
            // Небольшая задержка для гарантии обновления DOM
            const timer = setTimeout(() => {
                const input = document.getElementById(
                    `custom-text-${word.id}`,
                ) as HTMLInputElement;
                if (input && !input.disabled) {
                    input.focus();
                }
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [selectedTranslation, word.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (selectedTranslation === 'custom') {
                // Сохраняем кастомный перевод
                const customText = customTranslationText?.trim();
                const partOfSpeechId =
                    selectedPartOfSpeech === 'none'
                        ? null
                        : parseInt(selectedPartOfSpeech);

                if (!customText) {
                    toast({
                        title: 'Ошибка',
                        description: 'Введите текст перевода',
                        variant: 'destructive',
                    });
                    return;
                }

                const response = await fetch(`/api/words/${word.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customTranslation: {
                            translation: customText,
                            partOfSpeechId: partOfSpeechId,
                            originalLanguageCode: word.language.code,
                            translationLanguageCode: 'ru',
                        },
                    }),
                });

                if (response.ok) {
                    await onSave();
                    onOpenChange(false);
                    toast({
                        title: 'Успешно',
                        description: 'Перевод сохранен',
                    });
                } else {
                    throw new Error('Failed to save translation');
                }
            } else {
                // Выбран перевод из базы данных
                const translationIndex = parseInt(selectedTranslation);
                if (
                    word.baseWord?.translations &&
                    word.baseWord.translations[translationIndex]
                ) {
                    const translation =
                        word.baseWord.translations[translationIndex];

                    // Если выбран первый перевод (index 0), удаляем кастомный перевод
                    // Если выбран другой перевод (index > 0), сохраняем его как кастомный
                    if (translationIndex === 0) {
                        const response = await fetch(`/api/words/${word.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                customTranslation: null,
                            }),
                        });

                        if (response.ok) {
                            await onSave();
                            onOpenChange(false);
                            toast({
                                title: 'Успешно',
                                description: 'Перевод сохранен',
                            });
                        } else {
                            throw new Error('Failed to save translation');
                        }
                    } else {
                        // Сохраняем выбранный перевод как кастомный
                        const response = await fetch(`/api/words/${word.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                customTranslation: {
                                    translation: translation.translation,
                                    partOfSpeechId: null,
                                    originalLanguageCode: word.language.code,
                                    translationLanguageCode: 'ru',
                                },
                            }),
                        });

                        if (response.ok) {
                            await onSave();
                            onOpenChange(false);
                            toast({
                                title: 'Успешно',
                                description: 'Перевод сохранен',
                            });
                        } else {
                            throw new Error('Failed to save translation');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error updating translation:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось сохранить перевод',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] sm:!w-full"
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
            >
                <DialogHeader>
                    <div className="text-xl font-semibold">
                        {word.baseWord?.word || word.customWord}
                    </div>
                    <DialogDescription>
                        Выберите вариант перевода
                    </DialogDescription>
                </DialogHeader>
                <div
                    className="space-y-4 py-4"
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <RadioGroup
                        value={selectedTranslation}
                        onValueChange={value => {
                            setSelectedTranslation(value);
                        }}
                        className="flex flex-col gap-5 sm:gap-4"
                        ref={el => {
                            // Сохраняем ссылку на RadioGroup для программного выбора
                            if (el) {
                                (window as any).radioGroupRef = el;
                            }
                        }}
                    >
                        {word.baseWord?.translations
                            ?.slice(0, 3)
                            .map((translation, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                    onClick={e => e.stopPropagation()}
                                    onMouseDown={e => e.stopPropagation()}
                                >
                                    <RadioGroupItem
                                        value={index.toString()}
                                        id={`translation-${word.id}-${index}`}
                                    />
                                    <Label
                                        htmlFor={`translation-${word.id}-${index}`}
                                        className="flex-1 cursor-pointer"
                                    >
                                        {translation.translation}
                                    </Label>
                                </div>
                            ))}
                        <div
                            className="space-y-3"
                            onClick={e => e.stopPropagation()}
                            onMouseDown={e => e.stopPropagation()}
                        >
                            <div className="space-y-3">
                                <div
                                    className="flex items-center space-x-2"
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (selectedTranslation !== 'custom') {
                                            setSelectedTranslation('custom');
                                            // Небольшая задержка для активации поля перед фокусом
                                            setTimeout(() => {
                                                const input =
                                                    document.getElementById(
                                                        `custom-text-${word.id}`,
                                                    ) as HTMLInputElement;
                                                if (input) {
                                                    input.focus();
                                                }
                                            }, 50);
                                        }
                                    }}
                                    onMouseDown={e => {
                                        e.stopPropagation();
                                        if (selectedTranslation !== 'custom') {
                                            setSelectedTranslation('custom');
                                        }
                                    }}
                                >
                                    <RadioGroupItem
                                        value="custom"
                                        id={`translation-${word.id}-custom`}
                                    />
                                    <div className="flex-1 relative">
                                        <Input
                                            id={`custom-text-${word.id}`}
                                            value={customTranslationText}
                                            onChange={e => {
                                                e.stopPropagation();
                                                setSelectedTranslation(
                                                    'custom',
                                                );
                                                setCustomTranslationText(
                                                    e.target.value,
                                                );
                                            }}
                                            onFocus={e => {
                                                e.stopPropagation();
                                                setSelectedTranslation(
                                                    'custom',
                                                );
                                            }}
                                            placeholder="свой вариант"
                                            disabled={
                                                selectedTranslation !== 'custom'
                                            }
                                            className={
                                                selectedTranslation !== 'custom'
                                                    ? 'pointer-events-none'
                                                    : ''
                                            }
                                        />
                                        {selectedTranslation !== 'custom' && (
                                            <div
                                                className="absolute inset-0 cursor-pointer z-10"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedTranslation(
                                                        'custom',
                                                    );
                                                }}
                                                onMouseDown={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedTranslation(
                                                        'custom',
                                                    );
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="pl-6">
                                    <Select
                                        value={selectedPartOfSpeech}
                                        onValueChange={value => {
                                            setSelectedPartOfSpeech(value);
                                        }}
                                        disabled={
                                            selectedTranslation !== 'custom'
                                        }
                                    >
                                        <SelectTrigger
                                            id={`part-of-speech-${word.id}`}
                                        >
                                            <SelectValue placeholder="Выберите часть речи" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                часть речи (не указана)
                                            </SelectItem>
                                            {partsOfSpeech.length > 0 ? (
                                                partsOfSpeech.map(pos => (
                                                    <SelectItem
                                                        key={pos.id}
                                                        value={pos.id.toString()}
                                                    >
                                                        {pos.displayName}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem
                                                    value="loading"
                                                    disabled
                                                >
                                                    Загрузка...
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    className="gap-2"
                >
                    <Button
                        variant="outline"
                        onClick={e => {
                            e.stopPropagation();
                            onOpenChange(false);
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={e => {
                            e.stopPropagation();
                            handleSave();
                        }}
                        disabled={isSaving}
                    >
                        {isSaving && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
