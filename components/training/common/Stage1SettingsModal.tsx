'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import type { Stage1Settings } from '@/lib/training-settings';

type Stage1SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    settings: Stage1Settings;
    onChange: (_settings: Partial<Stage1Settings>) => void;
};

export function Stage1SettingsModal({
    isOpen,
    onClose,
    settings,
    onChange,
}: Stage1SettingsModalProps) {
    if (!isOpen) return null;

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
                        Настройки этапа 1
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

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show-examples"
                            checked={settings.showExamples}
                            onCheckedChange={checked =>
                                onChange({ showExamples: checked as boolean })
                            }
                        />
                        <label
                            htmlFor="show-examples"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Показывать примеры использования слов
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">
                        При включении будут показаны примеры предложений с
                        изучаемым словом
                    </p>
                </div>

                <div className="flex flex-row justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Закрыть
                    </Button>
                </div>
            </div>
        </div>
    );
}
