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
        <div className="space-y-3 sm:space-y-4 md:space-y-4">
            {/* Блок перевода */}
            <div className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 text-center">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-800 font-medium break-words">
                    {getWordTranslation(word)}
                </p>
            </div>

            {/* Блок примеров */}
            {filteredExamples.length > 0 && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4">
                    <div className="space-y-2.5 sm:space-y-3 md:space-y-3">
                        {filteredExamples.map((example, exampleIndex) => (
                            <div
                                key={exampleIndex}
                                className="border-l-4 border-gray-400 pl-3 sm:pl-3.5 md:pl-4"
                            >
                                <p className="text-sm sm:text-sm md:text-base text-gray-700 mb-1 break-words">
                                    {example.example}
                                </p>
                                <p className="text-xs sm:text-xs md:text-sm text-gray-500 italic break-words">
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
