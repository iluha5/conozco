/**
 * Хук для управления fade-in/fade-out анимацией
 * Используется для плавного появления карточек при переходе между упражнениями
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseFadeAnimationOptions {
    /**
     * Задержка перед началом fade-in анимации (мс)
     * @default 50
     */
    delay?: number;
}

export interface UseFadeAnimationReturn {
    /**
     * Флаг для применения fade-in стилей
     */
    fadeIn: boolean;

    /**
     * Ключ для принудительного перемонтирования компонента
     * Увеличивайте его при смене упражнения
     */
    animationKey: number;

    /**
     * Триггер новой анимации (вызывайте при смене упражнения)
     */
    triggerAnimation: () => void;

    /**
     * Сбросить состояние анимации
     */
    reset: () => void;
}

export function useFadeAnimation(
    options: UseFadeAnimationOptions = {},
): UseFadeAnimationReturn {
    const { delay = 50 } = options;

    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    // Запускаем fade-in анимацию при изменении animationKey
    useEffect(() => {
        // Сначала делаем невидимым
        setFadeIn(false);

        // Затем с небольшой задержкой делаем видимым для плавного появления
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [animationKey, delay]);

    /**
     * Триггер новой анимации
     */
    const triggerAnimation = useCallback(() => {
        setAnimationKey(prev => prev + 1);
    }, []);

    /**
     * Сбросить состояние
     */
    const reset = useCallback(() => {
        setAnimationKey(0);
        setFadeIn(false);
    }, []);

    return {
        fadeIn,
        animationKey,
        triggerAnimation,
        reset,
    };
}
