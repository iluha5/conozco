import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type WordDisplayWithSoundProps = {
    word: Word;
    onSpeak: (_text: string) => void;
    speechSupported: boolean;
};

export function WordDisplayWithSound({
    word,
    onSpeak,
    speechSupported,
}: WordDisplayWithSoundProps) {
    const wordText = getWordText(word);

    const handleSpeakClick = () => {
        onSpeak(wordText);
    };

    return (
        <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-5xl font-bold text-gray-900">{wordText}</h2>
            <Button
                size="icon"
                variant="outline"
                onClick={handleSpeakClick}
                className="rounded-full w-12 h-12"
                disabled={!speechSupported}
            >
                <Volume2 className="w-6 h-6" />
            </Button>
        </div>
    );
}
