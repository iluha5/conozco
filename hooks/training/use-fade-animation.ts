import { useState, useEffect, useCallback } from 'react';

export interface UseFadeAnimationOptions {
    delay?: number;
}

export interface UseFadeAnimationReturn {
    fadeIn: boolean;
    animationKey: number;
    triggerAnimation: () => void;
    reset: () => void;
}

export function useFadeAnimation(
    options: UseFadeAnimationOptions = {},
): UseFadeAnimationReturn {
    const { delay = 50 } = options;

    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        setFadeIn(false);
        const timer = setTimeout(() => setFadeIn(true), delay);
        return () => clearTimeout(timer);
    }, [animationKey, delay]);

    const triggerAnimation = useCallback(() => {
        setAnimationKey(prev => prev + 1);
    }, []);

    const reset = useCallback(() => {
        setAnimationKey(0);
        setFadeIn(false);
    }, []);

    return { fadeIn, animationKey, triggerAnimation, reset };
}
