'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { AddWordDialog } from '@/components/AddWordDialog';
import { WordsList } from '@/components/WordList/WordList';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { BulkActions } from '@/components/WordList/components/BulkActions';
import { ConfirmationDialogs } from '@/components/WordList/components/ConfirmationDialogs';
import { useUserSettings } from '@/hooks/settings';
import { useWordsData, useWordsFilter, useWordsStats } from '@/hooks/words';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { useWordSelection } from '@/components/WordList/hooks/useWordSelection';
import { useConfirmationDialogs } from '@/components/WordList/hooks/useConfirmationDialogs';
import { useWordStatus } from '@/components/WordList/hooks/useWordStatus';
import { useWordDeletion } from '@/components/WordList/hooks/useWordDeletion';
import { useToast } from '@/hooks/shared';
import {
    getSelectionState,
    getBulkSelectText,
} from '@/components/WordList/helpers/selectionHelpers';
import { WordsFilter, Word } from '@/types/words.types';
import { useTranslation } from '@/lib/i18n';

export default function WordsPage() {
    const { settings: userSettings } = useUserSettings();
    const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED');
    const [isClient, setIsClient] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Загрузка данных
    const { words, loading, refetch, updateWord, removeWord } = useWordsData();

    // Фильтр по группам
    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('myWords');

    // Получаем язык для фильтрации из настроек пользователя
    const learnLanguageCode = useMemo(() => {
        return userSettings?.learnLanguage?.code || 'ALL';
    }, [userSettings?.learnLanguage?.code]);

    // Формирование фильтра
    const filter: WordsFilter = {
        language: learnLanguageCode,
        status: selectedStatus,
        groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
    };

    // Фильтрация слов
    const filteredWords = useWordsFilter(words, filter);

    // Статистика (по языку, без учета статуса)
    const stats = useWordsStats(words, learnLanguageCode);

    // Логика выбора слов
    const wordSelection = useWordSelection(filteredWords);
    const selectionState = getSelectionState(
        wordSelection.selectedWords,
        filteredWords,
    );

    // Логика подтверждений и команд
    const confirmations = useConfirmationDialogs();
    const status = useWordStatus({
        onWordUpdate: (wordId, updates) => {
            const typedUpdates = updates as Partial<Word>;
            updateWord(Number(wordId), typedUpdates);
        },
        onWordsChange: refetch,
    });
    const deletion = useWordDeletion({
        onWordRemove: wordId => removeWord(Number(wordId)),
        onWordsChange: refetch,
    });
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Обработчики команд
    const handleMarkAsLearned = () => {
        confirmations.openStatusConfirmation('LEARNED');
    };

    const handleBulkStatusChange = (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (wordSelection.selectedWords.length === 0) {
            toast({
                title: t('Error'),
                description: t('Select words to change status'),
                variant: 'destructive',
            });
            return;
        }
        confirmations.openStatusConfirmation(newStatus);
    };

    const executeBulkStatusChange = async () => {
        if (!confirmations.pendingStatusAction) return;

        const newStatus = confirmations.pendingStatusAction;
        const successCount = wordSelection.selectedWords.length;

        setIsUpdatingStatus(true);

        const success = await status.executeBulkStatusChange(
            wordSelection.selectedWords,
            newStatus,
            (wordId, updates) => {
                const typedUpdates = updates as Partial<Word>;
                updateWord(Number(wordId), typedUpdates);
            },
            refetch,
            errorMessage => {
                toast({
                    title: t('Error'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsUpdatingStatus(false);

        if (success) {
            const statusText =
                newStatus === 'LEARNED'
                    ? t('marked as learned')
                    : t('marked as not learned');
            toast({
                title: t('Success'),
                description: `${successCount} ${t('words')} ${statusText}`,
                variant: 'success',
            });
        }

        wordSelection.clearSelection();
        confirmations.closeStatusConfirmation();
    };

    const handleBulkDelete = () => {
        if (wordSelection.selectedWords.length === 0) {
            toast({
                title: t('Error'),
                description: t('Select words to delete'),
                variant: 'destructive',
            });
            return;
        }
        confirmations.openDeleteConfirmation();
    };

    const executeBulkDelete = async () => {
        const successCount = wordSelection.selectedWords.length;

        setIsDeleting(true);

        const success = await deletion.executeBulkDelete(
            wordSelection.selectedWords,
            wordId => removeWord(Number(wordId)),
            refetch,
            errorMessage => {
                toast({
                    title: t('Error'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsDeleting(false);

        if (success) {
            toast({
                title: t('Success'),
                description: `${successCount} ${t('words')} ${t('deleted')}`,
                variant: 'success',
            });
        }

        wordSelection.clearSelection();
        confirmations.handleCloseDeleteDialog();
    };

    const handleAddWord = async () => {
        await refetch();
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600">{t('Loading...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-3">
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('Back')}
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {t('My words')}
                    </h1>
                    <div className="flex flex-row gap-2 w-auto">
                        <div className="flex-none min-w-0">
                            <AddWordDialog onWordAdded={handleAddWord} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'ALL'
                                ? 'ring-2 ring-black shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('ALL')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Total words')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'NOT_LEARNED'
                                ? 'ring-2 ring-orange-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('NOT_LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Not learned')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.notLearned}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'LEARNED'
                                ? 'ring-2 ring-green-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Learned')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.learned}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Команды (Удалить, Выучено и т.д.) */}
                {!loading && (
                    <div className="mb-6">
                        <BulkActions
                            words={filteredWords}
                            selectedWords={wordSelection.selectedWords}
                            onToggleAllSelection={
                                wordSelection.toggleAllWordsSelection
                            }
                            onMarkAsLearned={handleMarkAsLearned}
                            onChangeStatus={handleBulkStatusChange}
                            onDelete={handleBulkDelete}
                            hideSelectAllButton={true}
                        />
                    </div>
                )}

                {/* Фильтры (Выбрать все, Группы и т.д.) */}
                {!loading && (
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={wordSelection.toggleAllWordsSelection}
                        >
                            {(() => {
                                if (selectionState === 'none') {
                                    return <Square className="mr-2 h-4 w-4" />;
                                } else if (selectionState === 'all') {
                                    return (
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                    );
                                } else {
                                    return (
                                        <MinusSquare className="mr-2 h-4 w-4" />
                                    );
                                }
                            })()}
                            {getBulkSelectText(selectionState, t)}
                        </Button>
                        <WordGroupsFilter
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={toggleGroup}
                            onToggleAll={toggleAll}
                        />
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-sm text-gray-600">
                                {t('Shown:')}{' '}
                            </span>
                            <Badge
                                variant="outline"
                                className="gap-1.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-sm"
                            >
                                <span className="text-gray-900 dark:text-gray-100">
                                    {filteredWords.length}
                                </span>
                                {wordSelection.selectedWords.length > 0 && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">
                                            |
                                        </span>
                                        <span className="text-orange-600 dark:text-orange-500">
                                            {wordSelection.selectedWords.length}
                                        </span>
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">{t('Loading...')}</p>
                    </div>
                ) : (
                    <WordsList
                        words={filteredWords}
                        onWordsChange={refetch}
                        onWordUpdate={(wordId, updates) => {
                            updateWord(
                                Number(wordId),
                                updates as Partial<Word>,
                            );
                        }}
                        onWordRemove={wordId => {
                            removeWord(Number(wordId));
                        }}
                        showBulkActions={false}
                        emptyMessage={t('No words found. Add a new word!')}
                        externalSelection={wordSelection}
                    />
                )}

                {/* Диалоги подтверждения */}
                <ConfirmationDialogs
                    deleteDialogOpen={confirmations.confirmDeleteDialogOpen}
                    statusDialogOpen={confirmations.confirmStatusDialogOpen}
                    pendingStatusAction={confirmations.pendingStatusAction}
                    selectedWordsCount={wordSelection.selectedWords.length}
                    isDeleting={isDeleting}
                    isUpdatingStatus={isUpdatingStatus}
                    onCloseDeleteDialog={confirmations.handleCloseDeleteDialog}
                    onCloseStatusDialog={confirmations.handleCloseStatusDialog}
                    onConfirmDelete={executeBulkDelete}
                    onConfirmStatus={executeBulkStatusChange}
                />
            </div>
        </div>
    );
}
