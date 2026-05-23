import { useState, useCallback, useEffect, useRef } from 'react';
import { getSpeechLanguageCode } from '@/lib/training-utils';

export interface UseSpeechOptions {
    languageCode: string;
    rate?: number;
    pitch?: number;
    autoStop?: boolean;
}

export interface UseSpeechReturn {
    isPlaying: boolean;
    hasPlayedOnce: boolean;
    speak: (_text: string) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    isSupported: boolean;
}

export function useSpeech(options: UseSpeechOptions): UseSpeechReturn {
    const { languageCode, rate = 0.8, pitch = 1, autoStop = true } = options;

    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const isSupported =
        typeof window !== 'undefined' && 'speechSynthesis' in window;

    const stop = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    }, [isSupported]);

    const pause = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        }
    }, [isSupported]);

    const resume = useCallback(() => {
        if (isSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
        }
    }, [isSupported]);

    const speak = useCallback(
        (text: string) => {
            if (!isSupported || !text) return;

            if (autoStop && window.speechSynthesis.speaking) {
                stop();
            }

            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = getSpeechLanguageCode(languageCode);
                utterance.rate = rate;
                utterance.pitch = pitch;

                utterance.onstart = () => setIsPlaying(true);
                utterance.onend = () => {
                    setIsPlaying(false);
                    setHasPlayedOnce(true);
                };
                utterance.onerror = event => {
                    console.error('Speech synthesis error:', event);
                    setIsPlaying(false);
                    setHasPlayedOnce(true);
                };

                utteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Error in speech synthesis:', error);
                setIsPlaying(false);
            }
        },
        [isSupported, languageCode, rate, pitch, autoStop, stop],
    );

    const reset = useCallback(() => {
        stop();
        setHasPlayedOnce(false);
    }, [stop]);

    useEffect(() => {
        return () => {
            if (isSupported && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSupported]);

    return {
        isPlaying,
        hasPlayedOnce,
        speak,
        stop,
        pause,
        resume,
        reset,
        isSupported,
    };
}
