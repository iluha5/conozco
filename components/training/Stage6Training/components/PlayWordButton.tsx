'use client';

import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type PlayWordButtonProps = {
    onPlay: () => void;
    isPlaying: boolean;
    speechSupported: boolean;
};

export function PlayWordButton({
    onPlay,
    isPlaying,
    speechSupported,
}: PlayWordButtonProps) {
    const { t } = useTranslation();
    return (
        <div className="text-center mb-6">
            <Button
                onClick={onPlay}
                disabled={isPlaying || !speechSupported}
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid="stage6-play-button"
            >
                <Volume2
                    className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}
                />
                {isPlaying ? t('Playing...') : t('Listen to word')}
            </Button>
        </div>
    );
}
