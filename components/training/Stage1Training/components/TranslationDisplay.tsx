import { getWordTranslation } from '@/lib/training-utils';
import { useUserSettings } from '@/hooks/settings';
import type { Word } from '@/types/training.types';

type TranslationDisplayProps = {
    word: Word;
    showExamples: boolean;
};

export function TranslationDisplay({
    word,
    showExamples,
}: TranslationDisplayProps) {
    const { settings: userSettings } = useUserSettings();
    const ownLanguageCode = userSettings?.ownLanguage?.code;

    const filteredExamples =
        showExamples && word.baseWord?.examples && ownLanguageCode
            ? word.baseWord.examples
                  .filter(
                      example =>
                          example.translationLanguage?.code === ownLanguageCode,
                  )
                  .slice(0, 2)
            : [];

    return (
        <div className="space-y-4 text-center">
            <p className="text-3xl text-purple-600 font-semibold">
                {getWordTranslation(word)}
            </p>
            {filteredExamples.length > 0 && (
                <div className="text-gray-600 space-y-2">
                    <p className="font-medium text-sm">Примеры:</p>
                    {filteredExamples.map((example, exampleIndex) => (
                        <p key={exampleIndex} className="text-sm italic">
                            • {example.example} - {example.translation}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
