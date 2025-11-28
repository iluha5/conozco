import { useState } from 'react';
import type { Word } from '../WordList';

export function useWordTranslation() {
    const [translationDialogOpen, setTranslationDialogOpen] = useState<{
        [key: string | number]: boolean;
    }>({});
    const [selectedWordForTranslation, setSelectedWordForTranslation] =
        useState<Word | null>(null);

    const openTranslationDialog = (word: Word) => {
        setSelectedWordForTranslation(word);
        setTranslationDialogOpen({ ...translationDialogOpen, [word.id]: true });
    };

    const handleDialogClose = (wordId: string | number, open: boolean) => {
        setTranslationDialogOpen(prev => ({
            ...prev,
            [wordId]: open,
        }));
        if (!open) {
            setSelectedWordForTranslation(null);
        }
    };

    return {
        translationDialogOpen,
        selectedWordForTranslation,
        openTranslationDialog,
        handleDialogClose,
    };
}
