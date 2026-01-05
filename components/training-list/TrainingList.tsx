'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NoWordsDialog } from './components/NoWordsDialog';
import { NewTrainingConfirmationDialog } from '@/components/training/common/NewTrainingConfirmationDialog';
import { FlashCardsReview } from '@/components/flash-cards-review/FlashCardsReview';
import { GroupReviewSetupDialog } from '@/components/flash-cards-review/components/GroupReviewSetupDialog';
import { useTrainingModes } from './hooks/useTrainingModes';
import { Loader2 } from 'lucide-react';
import { getTrainingModeGroups } from './constants/training-modes-config';
import { TrainingTabs } from './components/TrainingTabs';
import { TrainingModeCardsGrid } from './components/TrainingModeCardsGrid';
import { TrainingListHeader } from './components/TrainingListHeader';
import { EmptyState } from './components/EmptyState';
import { getTabFromHash, updateUrlHash } from './helpers/tab-navigation';
import { TrainingModeGroupId } from './types/typing';
import { useTranslation } from '@/lib/i18n';
import { useTrainingStorage } from '@/hooks/training';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/hooks/settings';
import { useTestModes } from './hooks/useTestModes';

export function TrainingList() {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { settings: userSettings } = useUserSettings();
    const languageCode = userSettings?.learnLanguage?.code || null;

    // Загружаем тесты с названиями групп из БД
    const { testModes, isLoading: isLoadingTests } = useTestModes(
        languageCode,
        t,
    );

    const trainingModeGroups = useMemo(
        () => getTrainingModeGroups(t, testModes),
        [t, testModes],
    );
    const { savedState, hasUnfinishedTraining } = useTrainingStorage();
    const {
        startMode,
        isLoading,
        isStarting,
        showNoWordsDialog,
        setShowNoWordsDialog,
        showConfirmDialog,
        setShowConfirmDialog,
        handleContinueExisting,
        handleStartNew,
        isContinueLoading,
        activeTab,
        setActiveTab,
        learnedWords,
        notLearnedWords: _notLearnedWords,
        allWords,
        flashCardsParams,
        showFlashCardsReview,
        showGroupReviewSetup,
        handleFlashCardsOpen,
        handleFlashCardsClose,
        handleGroupSetupClose,
    } = useTrainingModes();

    // Инвалидация кэша при монтировании компонента
    useEffect(() => {
        queryClient.invalidateQueries({
            queryKey: ['training-list-words', languageCode],
        });
    }, [queryClient, languageCode]);

    // Инициализация таба на основе хеша при монтировании
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        const tabFromHash = getTabFromHash(hash, t);
        if (tabFromHash) {
            setActiveTab(tabFromHash);
        }
    }, [setActiveTab, t]);

    // Обработка изменений хеша (кнопка "назад" в браузере)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            const tabFromHash = getTabFromHash(hash, t);
            if (tabFromHash) {
                setActiveTab(tabFromHash);
            } else {
                setActiveTab('new');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [setActiveTab, t]);

    // Обработчик переключения табов с управлением хешем
    const handleTabChange = (value: string) => {
        const newTab = value as TrainingModeGroupId;
        updateUrlHash(newTab, t);
        setActiveTab(newTab);
    };

    const handleModeClick = (modeId: string) => {
        startMode(modeId as any);
    };

    const handleContinueTraining = () => {
        router.push('/training');
    };

    // Показываем лоадер только для тестов, слова загружаются в фоне
    if (isLoadingTests) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <TrainingListHeader
                title={t('Training modes')}
                description={t(
                    'Choose a suitable training mode or configure your own',
                )}
            />

            <TrainingTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                words={allWords}
                isLoading={isLoading}
            >
                {{
                    new: (
                        <TrainingModeCardsGrid
                            modes={trainingModeGroups.new.modes}
                            onModeClick={handleModeClick}
                            disabled={isStarting}
                            activeTraining={
                                hasUnfinishedTraining && savedState
                                    ? savedState
                                    : null
                            }
                            onContinueTraining={handleContinueTraining}
                        />
                    ),
                    learned: (
                        <>
                            <TrainingModeCardsGrid
                                modes={trainingModeGroups.learned.modes}
                                onModeClick={handleModeClick}
                                disabled={
                                    isStarting || learnedWords.length === 0
                                }
                                variant="learned"
                            />
                            {learnedWords.length === 0 && (
                                <EmptyState
                                    message={t(
                                        'No learned words for reinforcement',
                                    )}
                                />
                            )}
                        </>
                    ),
                    tests: (
                        <TrainingModeCardsGrid
                            modes={trainingModeGroups.tests.modes}
                            onModeClick={handleModeClick}
                            disabled={isStarting}
                            variant="learned"
                        />
                    ),
                }}
            </TrainingTabs>

            {/* Диалоги */}
            <NoWordsDialog
                open={showNoWordsDialog}
                onOpenChange={setShowNoWordsDialog}
                mode={activeTab}
            />

            <NewTrainingConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                onContinue={handleContinueExisting}
                onStartNew={handleStartNew}
                continueLoading={isContinueLoading}
                startNewLoading={isStarting}
            />

            {/* FlashCards Review */}
            {showFlashCardsReview && flashCardsParams && (
                <FlashCardsReview
                    params={flashCardsParams}
                    onClose={handleFlashCardsClose}
                />
            )}

            {/* Group Setup Dialog */}
            <GroupReviewSetupDialog
                open={showGroupReviewSetup}
                onOpenChange={handleGroupSetupClose}
                onStart={params => {
                    // Устанавливаем параметры для FlashCardsReview
                    handleFlashCardsOpen(params);
                    // Закрываем диалог настроек
                    handleGroupSetupClose(false);
                }}
            />
        </div>
    );
}
