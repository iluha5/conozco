import { useEffect } from 'react';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

const AUTO_SPEAK_DELAY_MS = 150;

type UseWordInitializationParams = {
    currentWord: Word | undefined;
    currentIndex: number;
    triggerAnimation: () => void;
    setShowTranslation: (_show: boolean) => void;
    speak: (_text: string) => void;
    speechSupported: boolean;
    speechReady: boolean;
};

export function useWordInitialization({
    currentWord,
    currentIndex,
    triggerAnimation,
    setShowTranslation,
    speak,
    speechSupported,
    speechReady,
}: UseWordInitializationParams) {
    useEffect(() => {
        if (!currentWord) {
            return;
        }

        triggerAnimation();
        setShowTranslation(false);

        if (!speechSupported || !speechReady) {
            return;
        }

        const wordText = getWordText(currentWord);
        if (!wordText) {
            return;
        }

        const timer = setTimeout(() => {
            speak(wordText);
        }, AUTO_SPEAK_DELAY_MS);

        return () => clearTimeout(timer);
    }, [
        currentIndex,
        currentWord,
        triggerAnimation,
        setShowTranslation,
        speak,
        speechSupported,
        speechReady,
    ]);
}
