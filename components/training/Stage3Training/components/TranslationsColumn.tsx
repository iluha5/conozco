import { Button } from '@/components/ui/button';
import type { MatchPair } from '../typing';

type TranslationsColumnProps = {
    shuffledTranslations: string[];
    pairs: MatchPair[];
    selectedTranslation: string | null;
    errorTranslation: string | null;
    onTranslationClick: (_translation: string) => void;
};

export function TranslationsColumn({
    shuffledTranslations,
    pairs,
    selectedTranslation,
    errorTranslation,
    onTranslationClick,
}: TranslationsColumnProps) {
    const sortedTranslations = [...shuffledTranslations].sort(
        (translationA, translationB) => {
            // Сначала matched переводы, затем неугаданные
            const pairA = pairs.find(p => p.translation === translationA);
            const pairB = pairs.find(p => p.translation === translationB);
            const isMatchedA = pairA?.matched || false;
            const isMatchedB = pairB?.matched || false;

            if (isMatchedA && !isMatchedB) return -1;
            if (!isMatchedA && isMatchedB) return 1;
            return 0;
        },
    );

    return (
        <div className="space-y-3 transition-all duration-200 ease-in-out">
            {sortedTranslations.map(translation => {
                const pair = pairs.find(p => p.translation === translation);
                const isMatched = pair?.matched || false;

                return (
                    <Button
                        key={translation}
                        variant={
                            isMatched
                                ? 'outline'
                                : selectedTranslation === translation
                                  ? 'default'
                                  : 'outline'
                        }
                        className={`w-full h-auto py-4 text-lg transition-all duration-500 ease-in-out ${
                            isMatched
                                ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                                : errorTranslation === translation
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : ''
                        }`}
                        onClick={() => onTranslationClick(translation)}
                        disabled={isMatched}
                    >
                        {translation}
                    </Button>
                );
            })}
        </div>
    );
}
