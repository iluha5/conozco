import { useState } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import type { BaseWord } from '@/types/add-word-dialog.types';
import type { LearnLanguageCode } from '@/config/learn-languages';

type AiSearchResponse = {
    alreadyExists?: boolean;
    foundExamples?: number;
    resolvedWord?: string;
    error?: string;
    errorCode?: string;
};

function describeAiSearchError(
    data: AiSearchResponse,
    translate: (_key: string) => string,
): string {
    if (data.errorCode === 'mixed-script') {
        return translate('Enter a word in one language');
    }
    if (data.errorCode === 'outside-pair') {
        return translate(
            'This word does not match your learning or native language',
        );
    }
    return data.error || translate('Failed to find or add word');
}

function describeAiSearchSuccess(
    data: AiSearchResponse,
    query: string,
    resolvedWord: string,
    translate: (_key: string, _values?: Record<string, string>) => string,
): string {
    const differs = resolvedWord.toLowerCase() !== query.toLowerCase();
    const exampleCount = data.foundExamples ?? 0;
    const examples =
        exampleCount > 0
            ? ` ${translate('with')} ${exampleCount} ${translate('examples')}`
            : '';

    if (data.alreadyExists && differs) {
        return translate(
            '"{{query}}" is already in the database as "{{word}}"',
            { query, word: resolvedWord },
        );
    }

    if (data.alreadyExists) {
        return translate(
            'Word "{{word}}" already exists in database{{examples}}',
            {
                word: resolvedWord,
                examples:
                    exampleCount > 0
                        ? ` (${exampleCount} ${translate('examples')})`
                        : '',
            },
        );
    }

    if (differs) {
        return translate('Added "{{word}}" for "{{query}}"{{examples}}', {
            word: resolvedWord,
            query,
            examples,
        });
    }

    return translate('Word "{{word}}" added to database{{examples}}', {
        word: resolvedWord,
        examples,
    });
}

type UseAiSearchProps = {
    searchTerm: string;
    languageCode: LearnLanguageCode;
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    addWord: (_baseWordId: string) => Promise<boolean>;
};

export function useAiSearch({
    searchTerm,
    languageCode,
    setAvailableWords,
    setOffset,
    setHasMore,
    addWord,
}: UseAiSearchProps) {
    const [aiSearching, setAiSearching] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleAiSearch = async () => {
        if (!searchTerm.trim()) {
            toast({
                title: t('Error'),
                description: t('Enter a word to search'),
                variant: 'destructive',
            });
            return;
        }

        setAiSearching(true);

        try {
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: searchTerm.trim(),
                    languageCode,
                }),
            });

            const data: AiSearchResponse = await response.json();

            if (response.ok) {
                const query = searchTerm.trim();
                const resolvedWord = data.resolvedWord || query;
                const message = describeAiSearchSuccess(
                    data,
                    query,
                    resolvedWord,
                    t,
                );

                toast({
                    title: t('Success'),
                    description: message,
                });

                setTimeout(async () => {
                    setOffset(0);
                    setHasMore(true);

                    const params = new URLSearchParams({
                        languageCode,
                        limit: '30',
                        offset: '0',
                        search: resolvedWord,
                    });

                    const listResponse = await fetch(
                        `/api/base-words?${params}`,
                    );
                    if (listResponse.ok) {
                        const words = await listResponse.json();
                        setAvailableWords(words);
                        setHasMore(words.length === 30);
                        setOffset(words.length);

                        const addedBaseWord = words.find(
                            (catalogWord: BaseWord) =>
                                catalogWord.word.toLowerCase() ===
                                resolvedWord.toLowerCase(),
                        );
                        if (addedBaseWord && !addedBaseWord.isAddedByUser) {
                            await addWord(addedBaseWord.id);
                        }
                    }
                }, 300);
            } else {
                toast({
                    title: t('Error'),
                    description: describeAiSearchError(data, t),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error in AI search:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred while searching for word'),
                variant: 'destructive',
            });
        } finally {
            setAiSearching(false);
        }
    };

    return {
        aiSearching,
        handleAiSearch,
    };
}
