'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Stage5Settings } from '@/lib/training-settings';

type Stage5SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    settings: Stage5Settings;
    onChange: (_settings: Partial<Stage5Settings>) => void;
};

export function Stage5SettingsModal({
    isOpen,
    onClose,
    settings,
    onChange,
}: Stage5SettingsModalProps) {
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
                        Настройки этапа 5
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
                        Количество предложений на слово:
                    </p>

                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(num => (
                            <Button
                                key={num}
                                variant={
                                    settings.sentencesPerWord === num
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    onChange({ sentencesPerWord: num })
                                }
                                className="h-10"
                            >
                                {num}
                            </Button>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        Если в базе меньше предложений, будут использованы все
                        доступные.
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
