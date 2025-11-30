import type { LetterState } from '../typing';

type LettersGridProps = {
    letters: LetterState[];
    flashingLetter: number | null;
    isComplete: boolean;
    onLetterClick: (_index: number) => void;
};

export function LettersGrid({
    letters,
    flashingLetter,
    isComplete,
    onLetterClick,
}: LettersGridProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            {letters.map((letterState, index) => (
                <div key={index} className="relative w-12 h-12">
                    {letterState.selected ? (
                        // Светло-серый блок-заполнитель для выбранных букв с текстом
                        <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-400">
                                {letterState.letter}
                            </span>
                        </div>
                    ) : (
                        // Активная кнопка для невыбранных букв
                        <button
                            onClick={() => onLetterClick(index)}
                            disabled={isComplete}
                            className={`w-full h-full rounded-lg text-xl font-bold text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                flashingLetter === index
                                    ? 'bg-red-500 border-red-500 text-white shadow-lg scale-110'
                                    : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                            {letterState.letter}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
