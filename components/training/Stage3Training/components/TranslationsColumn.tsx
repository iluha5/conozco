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
    return (
        <div className="space-y-3 transition-all duration-200 ease-in-out">
            {shuffledTranslations.map(translation => {
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
