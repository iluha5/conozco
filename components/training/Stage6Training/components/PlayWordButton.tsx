import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

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
    return (
        <div className="text-center mb-6">
            <Button
                onClick={onPlay}
                disabled={isPlaying || !speechSupported}
                variant="outline"
                size="sm"
                className="gap-2"
            >
                <Volume2
                    className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}
                />
                {isPlaying ? 'Проигрывается...' : 'Прослушать слово'}
            </Button>
        </div>
    );
}
