import { getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type TranslationDisplayProps = {
    word: Word;
    showExamples: boolean;
};

export function TranslationDisplay({
    word,
    showExamples,
}: TranslationDisplayProps) {
    return (
        <div className="space-y-4 text-center">
            <p className="text-3xl text-purple-600 font-semibold">
                {getWordTranslation(word)}
            </p>
            {showExamples &&
                word.baseWord?.examples &&
                word.baseWord.examples.length > 0 && (
                    <div className="text-gray-600 space-y-2">
                        <p className="font-medium text-sm">Примеры:</p>
                        {word.baseWord.examples
                            .slice(0, 2)
                            .map((example, exampleIndex) => (
                                <p
                                    key={exampleIndex}
                                    className="text-sm italic"
                                >
                                    • {example.example} - {example.translation}
                                </p>
                            ))}
                    </div>
                )}
        </div>
    );
}
