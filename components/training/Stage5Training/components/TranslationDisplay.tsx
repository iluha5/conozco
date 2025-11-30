import type { Phrase } from '../typing';

type TranslationDisplayProps = {
    phrase: Phrase;
};

export function TranslationDisplay({ phrase }: TranslationDisplayProps) {
    return (
        <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 mb-2">
                {phrase.translation}
            </p>
            <p className="text-gray-600">Составьте предложение из слов</p>
        </div>
    );
}
