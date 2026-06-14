'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Volume2 } from 'lucide-react';
import { getLanguageFlag, getPartOfSpeechAbbrev } from '@/lib/word-utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/training';
import { useTranslation } from '@/lib/i18n';
import { useEffectiveSettings } from '@/hooks/settings';

interface BaseWord {
    id: number;
    word: string;
    language: {
        code: string;
        name: string;
    };
    translations: Array<{
        translation: string;
        priority: number;
        partOfSpeech?: {
            name: string;
        };
    }>;
    customTranslations?: Array<{
        translation: string;
        partOfSpeech?: {
            name: string;
        };
    }>;
}

interface GroupWordsDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    groupId: number;
    groupName: string;
    wordsCount: number;
    isGuest?: boolean;
}

const WORDS_PER_PAGE = 50;

interface WordCardProps {
    word: BaseWord;
}

function WordCard({ word }: WordCardProps) {
    const { t } = useTranslation();
    const {
        speak,
        prime,
        isPlaying,
        isSupported: speechSupported,
    } = useSpeech({
        languageCode: word.language.code,
    });

    const translation =
        word.customTranslations && word.customTranslations.length > 0
            ? word.customTranslations[0].translation
            : word.translations && word.translations.length > 0
              ? word.translations[0].translation
              : t('No translation');
    const partOfSpeech =
        word.customTranslations?.[0]?.partOfSpeech?.name ||
        word.translations[0]?.partOfSpeech?.name;

    const handlePlayWord = (e: React.MouseEvent) => {
        e.stopPropagation();
        prime();
        speak(word.word, { showErrorToast: true });
    };

    return (
        <Card className="transition-all hover:bg-gray-50 m-1">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                            <span className="break-words">{word.word}</span>
                            <span className="text-sm shrink-0">
                                {getLanguageFlag(word.language.code)}
                            </span>
                            {partOfSpeech && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                    {getPartOfSpeechAbbrev(partOfSpeech)}
                                </span>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-blue-500 break-words">
                                {translation}
                            </span>
                        </div>
                    </div>
                    {speechSupported && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handlePlayWord}
                            disabled={isPlaying}
                            title={t('Listen to word')}
                        >
                            <Volume2
                                className={`h-4 w-4 ${
                                    isPlaying ? 'animate-pulse' : ''
                                }`}
                            />
                        </Button>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}

export function GroupWordsDialog({
    open,
    onOpenChange,
    groupId,
    groupName,
    wordsCount,
    isGuest = false,
}: GroupWordsDialogProps) {
    const { t } = useTranslation();
    const { settings, loading: settingsLoading } = useEffectiveSettings();
    const learnLanguageCode = settings?.learnLanguage?.code;
    const translationLanguageCode = settings?.ownLanguage?.code || 'en';
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedCount, setDisplayedCount] = useState(WORDS_PER_PAGE);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setDisplayedCount(WORDS_PER_PAGE);
            setSearchQuery('');
            // Drop focus from the search input if it grabbed it on mount
            setTimeout(() => {
                if (
                    searchInputRef.current &&
                    document.activeElement === searchInputRef.current
                ) {
                    searchInputRef.current.blur();
                }
            }, 0);
        }
        // eslint-disable-next-line no-unused-vars
    }, [open]);

    const {
        data: words,
        isLoading,
        isError,
    } = useQuery<BaseWord[]>({
        queryKey: [
            'group-words',
            groupId,
            searchQuery,
            isGuest,
            learnLanguageCode,
            translationLanguageCode,
        ],
        queryFn: async () => {
            const params = new URLSearchParams({
                wordGroupIds: groupId.toString(),
                limit: '1000',
                offset: '0',
                translationLanguageCode,
            });

            if (learnLanguageCode) {
                params.set('languageCode', learnLanguageCode);
            }

            if (searchQuery) {
                params.set('search', searchQuery);
            }

            const response = await fetch(
                `${isGuest ? '/api/public/base-words' : '/api/base-words'}?${params}`,
            );
            if (!response.ok) {
                throw new Error('Failed to fetch words');
            }
            return response.json();
        },
        enabled: open && !!learnLanguageCode && !settingsLoading,
    });

    // Client-side filter as a fallback when server search is not applied
    const filteredWords =
        words?.filter(word => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                word.word.toLowerCase().includes(query) ||
                word.translations.some(t =>
                    t.translation.toLowerCase().includes(query),
                ) ||
                word.customTranslations?.some(t =>
                    t.translation.toLowerCase().includes(query),
                )
            );
        }) || [];

    const visibleWords = filteredWords.slice(0, displayedCount);
    const hasMore = displayedCount < filteredWords.length;

    const handleLoadMore = () => {
        setDisplayedCount(prev => prev + WORDS_PER_PAGE);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{groupName}</DialogTitle>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 mb-2">
                        <span className="text-sm text-gray-600 mt-2 mb-2">
                            {t('Words in group:')}{' '}
                        </span>
                        <Badge
                            variant="outline"
                            className="gap-1.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-sm font-normal"
                        >
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                                {wordsCount}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">
                                |
                            </span>
                            <span className="text-green-600 dark:text-green-500 font-normal">
                                {visibleWords.length}
                            </span>
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        placeholder={t('Search words...')}
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setDisplayedCount(WORDS_PER_PAGE);
                        }}
                        className="pl-9"
                        autoFocus={false}
                    />
                </div>

                <div
                    className="flex-1 overflow-y-auto"
                    style={{
                        minHeight: 'min(30vh, 400px)',
                    }}
                >
                    {isLoading ? (
                        <div
                            className="flex items-center justify-center py-12 h-full"
                            style={{
                                minHeight: 'min(66vh, 400px)',
                            }}
                        >
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : isError ? (
                        <div
                            className="text-center py-12 text-red-600 h-full flex items-center justify-center"
                            style={{
                                minHeight: 'min(66vh, 400px)',
                            }}
                        >
                            {t('Failed to load words')}
                        </div>
                    ) : visibleWords.length === 0 ? (
                        <div
                            className="text-center py-12 text-gray-600 h-full flex items-center justify-center"
                            style={{
                                minHeight: 'min(66vh, 400px)',
                            }}
                        >
                            {searchQuery
                                ? t('Words not found')
                                : t('No words in group yet')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-2">
                            {visibleWords.map(word => (
                                <WordCard key={word.id} word={word} />
                            ))}
                        </div>
                    )}
                </div>

                {hasMore && !isLoading && (
                    <div className="flex justify-center pt-2 border-t">
                        <button
                            onClick={handleLoadMore}
                            className="text-sm text-blue-600 underline decoration-dotted decoration-1 underline-offset-2 hover:text-blue-700"
                        >
                            {t('Show more')}{' '}
                            {Math.min(
                                WORDS_PER_PAGE,
                                filteredWords.length - displayedCount,
                            )}
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
