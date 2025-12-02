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
        <div className="space-y-4 sm:space-y-6">
            {/* Блок перевода */}
            <div className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 sm:px-6 sm:py-5 text-center">
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 font-medium break-words">
                    {getWordTranslation(word)}
                </p>
            </div>

            {/* Блок примеров */}
            {filteredExamples.length > 0 && (
                <div className="bg-gray-50 rounded-xl px-4 py-4 sm:px-6 sm:py-5">
                    <div className="space-y-3 sm:space-y-4">
                        {filteredExamples.map((example, exampleIndex) => (
                            <div
                                key={exampleIndex}
                                className="border-l-4 border-gray-400 pl-3 sm:pl-4"
                            >
                                <p className="text-sm sm:text-base text-gray-700 mb-1 break-words">
                                    {example.example}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 italic break-words">
                                    {example.translation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
