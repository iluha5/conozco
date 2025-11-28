import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, X } from 'lucide-react';
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
}

export function BulkActions({
    words,
    selectedWords,
    onToggleAllSelection,
    onMarkAsLearned,
    onChangeStatus,
    onDelete,
    readOnly = false,
}: BulkActionsProps) {
    const selectionState = getSelectionState(selectedWords, words);

    return (
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleAllSelection}
                    disabled={readOnly}
                >
                    {(() => {
                        if (selectionState === 'none') {
                            return (
                                <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v16l16-8L4 4z"
                                    />
                                </svg>
                            );
                        } else if (selectionState === 'all') {
                            return (
                                <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            );
                        } else {
                            return (
                                <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 6L9 17l-5-5"
                                    />
                                </svg>
                            );
                        }
                    })()}
                    {getBulkSelectText(selectionState)}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={selectedWords.length === 0 || readOnly}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить ({selectedWords.length})
                </Button>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={onMarkAsLearned}
                    disabled={selectedWords.length === 0 || readOnly}
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Выучено ({selectedWords.length})
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onChangeStatus('NOT_LEARNED')}
                    disabled={selectedWords.length === 0 || readOnly}
                >
                    <X className="w-4 h-4 mr-2" />
                    Не выучено ({selectedWords.length})
                </Button>
            </div>
        </div>
    );
}
