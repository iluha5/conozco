import type { WordState } from '../typing';

type WordsGridProps = {
    words: WordState[];
    flashingWord: number | null;
    isComplete: boolean;
    onWordClick: (_index: number) => void;
};

export function WordsGrid({
    words,
    flashingWord,
    isComplete,
    onWordClick,
}: WordsGridProps) {
    return (
        <div
            className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto"
            data-testid="stage5-words-grid"
        >
            {words.map((wordState, index) => (
                <div key={index} className="relative">
                    {wordState.selected ? (
                        // Светло-серый блок-заполнитель для выбранных слов
                        <div className="px-3 py-2 bg-gray-200 border-2 border-gray-300 rounded-lg text-gray-400 font-medium min-w-[60px] h-10 flex items-center justify-center">
                            {wordState.word}
                        </div>
                    ) : (
                        // Активная кнопка для невыбранных слов
                        <button
                            onClick={() => onWordClick(index)}
                            disabled={isComplete}
                            className={`px-3 py-2 rounded-lg text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[60px] h-10 ${
                                flashingWord === index
                                    ? 'bg-red-500 border-red-500 text-white shadow-lg scale-110'
                                    : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                            {wordState.word}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
