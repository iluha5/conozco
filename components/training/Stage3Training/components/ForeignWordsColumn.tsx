import { Button } from '@/components/ui/button';
import type { MatchPair } from '../typing';

type ForeignWordsColumnProps = {
    pairs: MatchPair[];
    selectedForeign: string | null;
    errorForeign: string | null;
    onForeignClick: (_foreign: string) => void;
};

export function ForeignWordsColumn({
    pairs,
    selectedForeign,
    errorForeign,
    onForeignClick,
}: ForeignWordsColumnProps) {
    return (
        <div className="space-y-3 transition-all duration-200 ease-in-out">
            {pairs.map(pair => (
                <Button
                    key={pair.id}
                    variant={
                        pair.matched
                            ? 'outline'
                            : selectedForeign === pair.foreign
                              ? 'default'
                              : 'outline'
                    }
                    className={`w-full h-auto py-4 text-lg transition-all duration-200 ease-in-out whitespace-normal ${
                        pair.matched
                            ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                            : errorForeign === pair.foreign
                              ? 'bg-red-500 border-red-500 text-white'
                              : ''
                    }`}
                    onClick={() => onForeignClick(pair.foreign)}
                    disabled={pair.matched}
                >
                    <span className="break-words break-all">
                        {pair.foreign}
                    </span>
                </Button>
            ))}
        </div>
    );
}
