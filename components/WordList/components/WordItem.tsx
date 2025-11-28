import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { TranslationSelectorDialog } from '@/components/TranslationSelectorDialog';
import {
    getLanguageFlag,
    getPartOfSpeechAbbrev,
    getCurrentTranslation,
    getTranslationsCountText,
    hasTranslations,
} from '@/lib/word-utils';
import { usePartsOfSpeech } from '@/hooks/shared';
import type { Word } from '../typing';

interface WordItemProps {
    word: Word;
    isSelected: boolean;
    isLoading: boolean;
    hasError: boolean;
    optimisticWord?: Word;
    isClient: boolean;
    translationDialogOpen: { [key: string | number]: boolean };
    selectedWordForTranslation: Word | null;
    onToggleSelection: (_wordId: string | number) => void;
    onToggleStatus: (_word: Word) => void;
    onDelete: (_wordId: string | number) => void;
    onOpenTranslation: (_word: Word) => void;
    onCloseTranslation: (_wordId: string | number, _open: boolean) => void;
    onTranslationSave: () => Promise<void>;
    readOnly?: boolean;
}

export function WordItem({
    word,
    isSelected,
    isLoading,
    hasError,
    optimisticWord,
    isClient,
    translationDialogOpen,
    selectedWordForTranslation,
    onToggleSelection,
    onToggleStatus,
    onDelete,
    onOpenTranslation,
    onCloseTranslation,
    onTranslationSave,
    readOnly = false,
}: WordItemProps) {
    const { partsOfSpeech } = usePartsOfSpeech('ru');
    const displayWord = optimisticWord || word;

    return (
        <Card
            key={word.id}
            className={`transition-all relative ${
                readOnly ? '' : 'cursor-pointer'
            } m-1 ${
                isSelected
                    ? 'ring-2 ring-primary bg-blue-50'
                    : 'hover:bg-gray-50'
            } ${hasError ? 'animate-pulse-red-border' : ''}`}
            onClick={() => !readOnly && onToggleSelection(word.id)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {!readOnly && (
                            <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                className="shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                <span className="truncate">
                                    {displayWord.baseWord?.word ||
                                        displayWord.customWord}
                                </span>
                                <span className="text-sm shrink-0">
                                    {getLanguageFlag(displayWord.language.code)}
                                </span>
                                {(() => {
                                    // Приоритет: часть речи из кастомного перевода, затем из перевода
                                    const customPartOfSpeech =
                                        displayWord.customTranslations?.[0]
                                            ?.partOfSpeech;
                                    const translationPartOfSpeech =
                                        displayWord.baseWord?.translations?.[0]
                                            ?.partOfSpeech;

                                    const partOfSpeech =
                                        customPartOfSpeech ||
                                        translationPartOfSpeech;

                                    // Не показываем плашку, если часть речи неизвестна
                                    if (!partOfSpeech) {
                                        return null;
                                    }

                                    return (
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                            {getPartOfSpeechAbbrev(
                                                partOfSpeech.name,
                                            )}
                                        </span>
                                    );
                                })()}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <span
                                    className={`truncate ${
                                        readOnly
                                            ? ''
                                            : 'cursor-pointer hover:text-blue-600'
                                    } transition-colors ${
                                        hasTranslations(
                                            displayWord.customTranslations,
                                            displayWord.baseWord?.translations,
                                        )
                                            ? 'text-blue-500'
                                            : 'text-gray-500'
                                    }`}
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (!readOnly && displayWord.baseWord) {
                                            onOpenTranslation(displayWord);
                                        }
                                    }}
                                >
                                    {getCurrentTranslation(
                                        displayWord.customTranslations,
                                        displayWord.baseWord?.translations,
                                    )}
                                </span>
                                {hasTranslations(
                                    displayWord.customTranslations,
                                    displayWord.baseWord?.translations,
                                ) && (
                                    <span className="text-xs text-gray-400 shrink-0">
                                        {getTranslationsCountText(
                                            displayWord.baseWord?.translations
                                                ?.length || 0,
                                            !!(
                                                displayWord.customTranslations &&
                                                displayWord.customTranslations
                                                    .length > 0
                                            ),
                                        )}
                                    </span>
                                )}
                            </div>
                            {isClient &&
                                selectedWordForTranslation &&
                                selectedWordForTranslation.id ===
                                    displayWord.id && (
                                    <TranslationSelectorDialog
                                        word={displayWord}
                                        open={
                                            translationDialogOpen[
                                                displayWord.id
                                            ] || false
                                        }
                                        onOpenChange={open =>
                                            onCloseTranslation(
                                                displayWord.id,
                                                open,
                                            )
                                        }
                                        onSave={onTranslationSave}
                                        partsOfSpeech={partsOfSpeech}
                                    />
                                )}
                        </div>
                    </div>
                    {!readOnly && (
                        <div className="flex gap-1 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={e => {
                                    e.stopPropagation();
                                    onToggleStatus(word);
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : displayWord.status === 'LEARNED' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={e => {
                                    e.stopPropagation();
                                    onDelete(word.id);
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                ) : (
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}
