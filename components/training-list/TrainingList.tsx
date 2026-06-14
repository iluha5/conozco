'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
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
import { useEffectiveSettings } from '@/hooks/settings';
import { useTestModes } from './hooks/useTestModes';
import { useHashDialog } from '@/hooks/shared';
import { DeleteTrainingConfirmationDialog } from './components/DeleteTrainingConfirmationDialog';

export function TrainingList() {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { settings: userSettings } = useEffectiveSettings();
    const languageCode = userSettings?.learnLanguage?.code || null;

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
        isGuest,
    } = useTrainingModes();

    const { testModes, isLoading: isLoadingTests } = useTestModes(
        languageCode,
        t,
        isGuest,
    );

    const trainingModeGroups = useMemo(
        () => getTrainingModeGroups(t, testModes),
        [t, testModes],
    );
    const { savedState, hasUnfinishedTraining, clearProgress } =
        useTrainingStorage();
    const { open: deleteDialogOpen, setOpen: setDeleteDialogOpen } =
        useHashDialog('delete-training-confirmation');

    useEffect(() => {
        queryClient.invalidateQueries({
            queryKey: ['training-list-words', languageCode],
        });
    }, [queryClient, languageCode]);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        const tabFromHash = getTabFromHash(hash, t);
        if (tabFromHash) {
            setActiveTab(tabFromHash);
        }
    }, [setActiveTab, t]);

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

    const handleDeleteTraining = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDeleteTraining = () => {
        clearProgress();
    };

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

            {isGuest && (
                <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-gray-700">
                    <Link href="/auth/login" className="underline">
                        {t('Log in')}
                    </Link>
                    {t(
                        ' to unlock all training modes and save your progress. No paid features. No ads.',
                    )}
                </div>
            )}

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
                            locked={isGuest}
                            lockedDimmed={isGuest}
                            activeTraining={
                                !isGuest && hasUnfinishedTraining && savedState
                                    ? savedState
                                    : null
                            }
                            onContinueTraining={handleContinueTraining}
                            onDeleteTraining={handleDeleteTraining}
                        />
                    ),
                    learned: (
                        <>
                            <TrainingModeCardsGrid
                                modes={trainingModeGroups.learned.modes}
                                onModeClick={handleModeClick}
                                disabled={
                                    !isGuest &&
                                    (isStarting || learnedWords.length === 0)
                                }
                                locked={isGuest}
                                lockedDimmed={false}
                                variant="learned"
                            />
                            {!isGuest && learnedWords.length === 0 && (
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

            {showFlashCardsReview && flashCardsParams && (
                <FlashCardsReview
                    params={flashCardsParams}
                    onClose={handleFlashCardsClose}
                />
            )}

            <GroupReviewSetupDialog
                open={showGroupReviewSetup}
                onOpenChange={handleGroupSetupClose}
                isGuest={isGuest}
                learnLanguageCode={languageCode}
                onStart={params => {
                    handleFlashCardsOpen(params);
                    handleGroupSetupClose(false);
                }}
            />

            <DeleteTrainingConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDeleteTraining}
            />
        </div>
    );
}
