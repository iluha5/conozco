'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Stage4Settings } from '@/lib/training-settings';
import { useTranslation } from '@/lib/i18n';

type Stage4SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    settings: Stage4Settings;
    onChange: (_settings: Partial<Stage4Settings>) => void;
};

export function Stage4SettingsModal({
    isOpen,
    onClose,
    settings,
    onChange,
}: Stage4SettingsModalProps) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const difficultyOptions = [
        {
            key: 'easy' as const,
            label: t('Easy'),
            description: t('Only letters from the word'),
        },
        {
            key: 'medium' as const,
            label: t('Medium'),
            description: t('+ 3 additional letters'),
        },
        {
            key: 'hard' as const,
            label: t('Hard'),
            description: t('+ 6 additional letters'),
        },
    ];

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 max-w-sm mx-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('Stage 4 settings')}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 h-auto"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        {t('Difficulty level:')}
                    </p>

                    <div className="space-y-2">
                        {difficultyOptions.map(option => (
                            <Button
                                key={option.key}
                                variant={
                                    settings.difficulty === option.key
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    onChange({ difficulty: option.key })
                                }
                                className="w-full justify-start h-auto p-3 text-left"
                            >
                                <div>
                                    <div className="font-medium">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {option.description}
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        {t('Close')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
