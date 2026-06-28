import { useState } from 'react';
import type { Word } from '../typing';

export function useWordTranslation() {
    const [translationDialogOpen, setTranslationDialogOpen] = useState<{
        [key: string | number]: boolean;
    }>({});
    const [selectedWordForTranslation, setSelectedWordForTranslation] =
        useState<Word | null>(null);

    const openTranslationDialog = async (word: Word) => {
        try {
            const response = await fetch(`/api/words/${word.id}`);
            if (!response.ok) {
                return;
            }

            const fullWord = (await response.json()) as Word;
            setSelectedWordForTranslation(fullWord);
            setTranslationDialogOpen(prev => ({ ...prev, [word.id]: true }));
        } catch (error) {
            console.error('Error loading word for translation dialog:', error);
        }
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
