import { getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type TranslationDisplayProps = {
    word: Word;
};

export function TranslationDisplay({ word }: TranslationDisplayProps) {
    return (
        <div className="text-center mb-6">
            <p className="text-4xl font-bold text-purple-600 mb-2 font-ubuntu">
                {getWordTranslation(word)}
            </p>
        </div>
    );
}
