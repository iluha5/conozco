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
        // Сбрасываем состояние :active на мобильных устройствах
        e.currentTarget.blur();
    };

    return (
        <div className="bg-white border border-gray-300 rounded-xl px-4 py-5 sm:px-6 sm:py-8">
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 tracking-tight break-words break-all">
                    {wordText}
                </h2>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSpeakClick}
                    onTouchEnd={handleTouchEnd}
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 shrink-0 inline-flex active:scale-95 ${
                        isPlaying ? 'opacity-90' : ''
                    }`}
                    disabled={!speechSupported}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    )}
                </Button>
            </div>
        </div>
    );
}
