import { useEffect } from 'react';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type UseWordInitializationParams = {
    currentWord: Word | undefined;
    currentIndex: number;
    triggerAnimation: () => void;
    setShowTranslation: (_show: boolean) => void;
    speak: (_text: string) => void;
    speechSupported: boolean;
};

export function useWordInitialization({
    currentWord,
    currentIndex,
    triggerAnimation,
    setShowTranslation,
    speak,
    speechSupported,
}: UseWordInitializationParams) {
    useEffect(() => {
        if (currentWord) {
            triggerAnimation();
            setShowTranslation(false);

            // Pronounce word
            const wordText = getWordText(currentWord);
            if (speechSupported && wordText) {
                speak(wordText);
            }
        }
    }, [
        currentIndex,
        currentWord,
        triggerAnimation,
        setShowTranslation,
        speak,
        speechSupported,
    ]);
}
