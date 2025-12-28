import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type WordBuilderProps = {
    userWord: string[];
    isComplete: boolean;
    showResultPopup: boolean;
    isCorrect: boolean | null;
    onRemoveLetter: (_index: number) => void;
};

export function WordBuilder({
    userWord,
    isComplete,
    showResultPopup,
    isCorrect,
    onRemoveLetter,
}: WordBuilderProps) {
    const { t } = useTranslation();
    return (
        <div
            className="relative min-h-[132px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
            data-testid="stage4-word-builder"
        >
            <div className="flex flex-wrap gap-2 justify-center">
                {userWord.length === 0 ? (
                    <p className="text-gray-400">{t('Select letters below')}</p>
                ) : (
                    userWord.map((letter, index) => (
                        <button
                            key={index}
                            onClick={() => !isComplete && onRemoveLetter(index)}
                            disabled={isComplete}
                            className="w-12 h-12 bg-white border-2 border-purple-500 rounded-lg text-xl font-bold text-gray-900 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed"
                        >
                            {letter}
                        </button>
                    ))
                )}
            </div>

            {/* Попап с результатом */}
            {showResultPopup && (
                <div className="absolute bottom-2 right-2 pointer-events-none">
                    <div
                        className={`p-2 rounded-lg border-2 shadow-lg transform transition-all duration-500 ease-out ${
                            isCorrect
                                ? 'bg-green-50 border-green-400 text-green-600'
                                : 'bg-red-50 border-red-400 text-red-600'
                        } ${
                            showResultPopup
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 translate-y-2 scale-95'
                        }`}
                    >
                        {isCorrect ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <XCircle className="w-6 h-6" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
