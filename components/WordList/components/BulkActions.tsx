import { Button } from '@/components/ui/button';
import {
    Trash2,
    CheckCircle2,
    X,
    Square,
    CheckSquare,
    MinusSquare,
} from 'lucide-react';
import {
    getSelectionState,
    getBulkSelectText,
} from '../helpers/selectionHelpers';
import type { Word } from '../typing';

interface BulkActionsProps {
    words: Word[];
    selectedWords: (string | number)[];
    onToggleAllSelection: () => void;
    onMarkAsLearned: () => void;
    onChangeStatus: (_status: 'LEARNED' | 'NOT_LEARNED') => void;
    onDelete: () => void;
    readOnly?: boolean;
    hideSelectAllButton?: boolean;
}

export function BulkActions({
    words,
    selectedWords,
    onToggleAllSelection,
    onMarkAsLearned,
    onChangeStatus,
    onDelete,
    readOnly = false,
    hideSelectAllButton = false,
}: BulkActionsProps) {
    const selectionState = getSelectionState(selectedWords, words);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-white rounded-lg border">
            <div className="flex gap-2">
                {!hideSelectAllButton && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleAllSelection}
                        disabled={readOnly}
                    >
                        {(() => {
                            if (selectionState === 'none') {
                                return <Square className="mr-2 h-4 w-4" />;
                            } else if (selectionState === 'all') {
                                return <CheckSquare className="mr-2 h-4 w-4" />;
                            } else {
                                return <MinusSquare className="mr-2 h-4 w-4" />;
                            }
                        })()}
                        {getBulkSelectText(selectionState)}
                    </Button>
                )}
                <Button
                    variant="default"
                    size="sm"
                    onClick={onMarkAsLearned}
                    disabled={selectedWords.length === 0 || readOnly}
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Выучено
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onChangeStatus('NOT_LEARNED')}
                    disabled={selectedWords.length === 0 || readOnly}
                >
                    <X className="w-4 h-4 mr-2" />
                    Не выучено
                </Button>
            </div>
            <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={selectedWords.length === 0 || readOnly}
            >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Удалить</span>
            </Button>
        </div>
    );
}
