import { getWordTranslation } from '@/lib/training-utils';
import { useI18n } from '@/lib/i18n';
import type { Word } from '@/types/training.types';

type TranslationDisplayProps = {
    word: Word;
};

export function TranslationDisplay({ word }: TranslationDisplayProps) {
    const i18n = useI18n();
    return (
        <div
            className="text-center mb-6"
            data-testid="stage4-translation-display"
        >
            <p className="text-4xl font-bold text-purple-600 mb-2 font-ubuntu">
                {getWordTranslation(word, i18n.language || 'en')}
            </p>
        </div>
    );
}
