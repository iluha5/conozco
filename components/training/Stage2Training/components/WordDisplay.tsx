import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type WordDisplayProps = {
    word: Word;
};

export function WordDisplay({ word }: WordDisplayProps) {
    return (
        <div className="text-center mb-8" data-testid="stage2-word-display">
            <h2 className="text-5xl font-bold text-gray-900 mb-2">
                {getWordText(word)}
            </h2>
        </div>
    );
}
