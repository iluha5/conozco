import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type WordDisplayWithSoundProps = {
    word: Word;
    onSpeak: (_text: string) => void;
    speechSupported: boolean;
    isPlaying?: boolean;
};

export function WordDisplayWithSound({
    word,
    onSpeak,
    speechSupported,
    isPlaying = false,
}: WordDisplayWithSoundProps) {
    const wordText = getWordText(word);

    const handleSpeakClick = () => {
        onSpeak(wordText);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
        // Reset :active state on mobile devices
        e.currentTarget.blur();
    };

    return (
        <div
            className="bg-white border border-gray-300 rounded-xl px-4 py-4 sm:px-5 sm:py-5 md:px-5 md:py-4"
            data-testid="stage1-word-display"
        >
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <h2 className="text-3xl sm:text-4xl md:text-4xl font-light text-gray-900 tracking-tight break-words break-all">
                    {wordText}
                </h2>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSpeakClick}
                    onTouchEnd={handleTouchEnd}
                    className={`rounded-full w-10 h-10 sm:w-11 sm:h-11 md:w-10 md:h-10 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 shrink-0 inline-flex active:scale-95 ${
                        isPlaying ? 'opacity-90' : ''
                    }`}
                    disabled={!speechSupported}
                    data-testid="stage1-play-button"
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4" />
                    ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
