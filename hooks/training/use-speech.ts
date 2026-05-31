'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSpeechLanguageCode } from '@/lib/training-utils';
import { useTranslation } from '@/lib/i18n';
import { showSpeechErrorToast } from '@/lib/show-speech-error-toast';
import {
    isSpeechApiAvailable,
    loadVoices,
    speakText,
    cancelSpeech,
    type SpeechError,
} from '@/lib/speech-synthesis';

export type { SpeechError };

export type SpeakOptions = {
    showErrorToast?: boolean;
};

export interface UseSpeechOptions {
    languageCode: string;
    rate?: number;
    pitch?: number;
    autoStop?: boolean;
}

export interface UseSpeechReturn {
    isPlaying: boolean;
    hasPlayedOnce: boolean;
    speak: (_text: string, _speakOptions?: SpeakOptions) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    prime: () => void;
    isSupported: boolean;
    isReady: boolean;
    lastError: SpeechError | null;
}

export function useSpeech(options: UseSpeechOptions): UseSpeechReturn {
    const { languageCode, rate = 0.8, pitch = 1, autoStop = true } = options;
    const { t } = useTranslation();

    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [lastError, setLastError] = useState<SpeechError | null>(null);

    const utteranceIdRef = useRef(0);

    const isSupported = isSpeechApiAvailable();

    const invalidatePendingSpeech = useCallback(() => {
        utteranceIdRef.current += 1;
    }, []);

    const stop = useCallback(() => {
        if (!isSupported) {
            return;
        }
        invalidatePendingSpeech();
        cancelSpeech();
        setIsPlaying(false);
    }, [isSupported, invalidatePendingSpeech]);

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

    const prime = useCallback(() => {
        if (!isSupported) {
            return;
        }
        void loadVoices().then(() => {
            setIsReady(true);
        });
    }, [isSupported]);

    const speak = useCallback(
        (text: string, speakOptions?: SpeakOptions) => {
            if (!isSupported || !text) {
                return;
            }

            const showErrorToast = speakOptions?.showErrorToast ?? false;

            if (autoStop) {
                invalidatePendingSpeech();
                cancelSpeech();
            }

            const utteranceId = ++utteranceIdRef.current;
            const lang = getSpeechLanguageCode(languageCode);

            setIsPlaying(true);
            setLastError(null);

            void speakText(text, { lang, rate, pitch })
                .then(() => {
                    if (utteranceId !== utteranceIdRef.current) {
                        return;
                    }
                    setIsPlaying(false);
                    setHasPlayedOnce(true);
                    setLastError(null);
                })
                .catch((error: SpeechError) => {
                    if (utteranceId !== utteranceIdRef.current) {
                        return;
                    }
                    setIsPlaying(false);
                    setLastError(error);
                    if (showErrorToast) {
                        showSpeechErrorToast(error, t);
                    }
                });
        },
        [
            isSupported,
            languageCode,
            rate,
            pitch,
            autoStop,
            invalidatePendingSpeech,
            t,
        ],
    );

    const reset = useCallback(() => {
        stop();
        setHasPlayedOnce(false);
        setLastError(null);
    }, [stop]);

    useEffect(() => {
        if (!isSupported) {
            return;
        }
        void loadVoices().then(() => {
            setIsReady(true);
        });
    }, [isSupported]);

    useEffect(() => {
        return () => {
            invalidatePendingSpeech();
            cancelSpeech();
        };
    }, [invalidatePendingSpeech]);

    return {
        isPlaying,
        hasPlayedOnce,
        speak,
        stop,
        pause,
        resume,
        reset,
        prime,
        isSupported,
        isReady,
        lastError,
    };
}
