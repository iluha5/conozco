/**
 * Хук для управления речевым синтезом (Web Speech API)
 * Предотвращает наложение речи и обрабатывает ошибки
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSpeechLanguageCode } from '@/lib/training-utils';

export interface UseSpeechOptions {
    /**
     * Код языка (en, es, etc.)
     */
    languageCode: string;

    /**
     * Скорость речи (0.1 - 10)
     * @default 0.8
     */
    rate?: number;

    /**
     * Высота тона (0 - 2)
     * @default 1
     */
    pitch?: number;

    /**
     * Автоматически останавливать предыдущую речь при новом запросе
     * @default true
     */
    autoStop?: boolean;
}

export interface UseSpeechReturn {
    /**
     * Проигрывается ли речь в данный момент
     */
    isPlaying: boolean;

    /**
     * Была ли речь проиграна хотя бы раз (для отслеживания первого воспроизведения)
     */
    hasPlayedOnce: boolean;

    /**
     * Произнести текст
     */
    speak: (_text: string) => void;

    /**
     * Остановить текущее воспроизведение
     */
    stop: () => void;

    /**
     * Пауза
     */
    pause: () => void;

    /**
     * Возобновить с паузы
     */
    resume: () => void;

    /**
     * Сбросить состояние (например, при смене слова)
     */
    reset: () => void;

    /**
     * Поддерживается ли речевой синтез в браузере
     */
    isSupported: boolean;
}

export function useSpeech(options: UseSpeechOptions): UseSpeechReturn {
    const { languageCode, rate = 0.8, pitch = 1, autoStop = true } = options;

    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check Speech API support
    const isSupported =
        typeof window !== 'undefined' && 'speechSynthesis' in window;

    /**
     * Остановить текущее воспроизведение
     */
    const stop = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    }, [isSupported]);

    /**
     * Пауза
     */
    const pause = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        }
    }, [isSupported]);

    /**
     * Возобновить
     */
    const resume = useCallback(() => {
        if (isSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
        }
    }, [isSupported]);

    /**
     * Произнести текст
     */
    const speak = useCallback(
        (text: string) => {
            if (!isSupported || !text) {
                console.warn('Speech synthesis not supported or empty text');
                return;
            }

            // Stop previous playback if needed
            if (autoStop && window.speechSynthesis.speaking) {
                stop();
            }

            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = getSpeechLanguageCode(languageCode);
                utterance.rate = rate;
                utterance.pitch = pitch;

                utterance.onstart = () => {
                    setIsPlaying(true);
                };

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

    /**
     * Сбросить состояние
     */
    const reset = useCallback(() => {
        stop();
        setHasPlayedOnce(false);
    }, [stop]);

    // Cleanup on unmount
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
