'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateOptions } from '../helpers/generateOptions';
import { useI18n } from '@/lib/i18n';
import type { Word } from '@/types/training.types';

export function useTranslationOptions(
    currentWord: Word | undefined,
    currentIndex: number,
    allWords: Word[],
) {
    const { language } = useI18n();
    const [options, setOptions] = useState<string[]>([]);

    const generateAndSetOptions = useCallback(() => {
        if (currentWord) {
            const newOptions = generateOptions(
                currentWord,
                currentIndex,
                allWords,
                language || 'en',
            );
            setOptions(newOptions);
        }
    }, [currentWord, currentIndex, allWords, language]);

    useEffect(() => {
        generateAndSetOptions();
    }, [generateAndSetOptions]);

    return {
        options,
        regenerateOptions: generateAndSetOptions,
    };
}
