/**
 * Карточка слова в диалоге добавления
 */

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { TranslationSelectorDialog } from '@/components/TranslationSelectorDialog';
import {
    getLanguageFlag,
    getPartOfSpeechAbbrev,
    getCurrentTranslation,
    getTranslationsCountText,
    hasTranslations,
} from '@/lib/word-utils';
import type { BaseWord } from '@/types/add-word-dialog.types';
import type { PartOfSpeech } from '@/hooks/shared';

type WordCardProps = {
    word: BaseWord;
    isSelected: boolean;
    onToggle: () => void;
    onOpenTranslationDialog?: () => void;
    translationDialogOpen?: boolean;
    onTranslationDialogClose?: (_open: boolean) => void;
    selectedWordForTranslation?: any;
    partsOfSpeech?: PartOfSpeech[];
    onTranslationSave?: () => Promise<void>;
    isClient?: boolean;
};

export function WordCard({
    word,
    isSelected,
    onToggle,
    onOpenTranslationDialog,
    translationDialogOpen = false,
    onTranslationDialogClose,
    selectedWordForTranslation,
    partsOfSpeech = [],
    onTranslationSave,
    isClient = false,
}: WordCardProps) {
    const handleTranslationClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (
            word.isAddedByUser &&
            hasTranslations(word.customTranslations, word.translations) &&
            onOpenTranslationDialog
        ) {
            onOpenTranslationDialog();
        }
    };

    return (
        <Card
            className={`transition-all cursor-pointer h-fit ${
                isSelected
                    ? 'ring-2 ring-primary bg-blue-50'
                    : 'hover:bg-gray-50 bg-white'
            }`}
            onClick={onToggle}
        >
            <CardHeader className="pb-2 pt-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                <span className="truncate">{word.word}</span>
                                <span className="text-sm shrink-0">
                                    {getLanguageFlag(word.language.code)}
                                </span>
                                {word.translations?.[0]?.partOfSpeech && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                        {getPartOfSpeechAbbrev(
                                            word.translations[0].partOfSpeech
                                                .displayName,
                                        )}
                                    </span>
                                )}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <span
                                    className={`truncate text-sm cursor-pointer hover:text-blue-600 transition-colors ${
                                        hasTranslations(
                                            word.customTranslations,
                                            word.translations,
                                        )
                                            ? 'text-blue-500'
                                            : 'text-gray-500'
                                    }`}
                                    onClick={handleTranslationClick}
                                >
                                    {getCurrentTranslation(
                                        word.customTranslations,
                                        word.translations,
                                    )}
                                </span>
                                {hasTranslations(
                                    word.customTranslations,
                                    word.translations,
                                ) && (
                                    <span className="text-xs text-gray-400 shrink-0">
                                        {getTranslationsCountText(
                                            word.translations.length || 0,
                                            !!(
                                                word.customTranslations &&
                                                word.customTranslations.length >
                                                    0
                                            ),
                                        )}
                                    </span>
                                )}
                            </div>
                            {isClient &&
                                selectedWordForTranslation &&
                                selectedWordForTranslation.baseWordId ===
                                    word.id && (
                                    <TranslationSelectorDialog
                                        word={selectedWordForTranslation}
                                        open={translationDialogOpen}
                                        onOpenChange={
                                            onTranslationDialogClose ||
                                            (() => {})
                                        }
                                        onSave={
                                            onTranslationSave ||
                                            (async () => {})
                                        }
                                        partsOfSpeech={partsOfSpeech}
                                    />
                                )}
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
