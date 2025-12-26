'use client';

import { useEffect } from 'react';
import { TrainingModeCard } from './components/TrainingModeCard';
import { NoWordsDialog } from './components/NoWordsDialog';
import { NewTrainingConfirmationDialog } from '@/components/training/common/NewTrainingConfirmationDialog';
import { FlashCardsReview } from '@/components/flash-cards-review/FlashCardsReview';
import { GroupReviewSetupDialog } from '@/components/flash-cards-review/components/GroupReviewSetupDialog';
import { useTrainingModes } from './hooks/useTrainingModes';
import { Loader2 } from 'lucide-react';
import { TRAINING_MODE_GROUPS } from './constants/training-modes-config';
import { TrainingTabs } from './components/TrainingTabs';

const LEARNED_TAB_HASH = 'learned';

export function TrainingList() {
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
        notLearnedWords,
        flashCardsParams,
        showFlashCardsReview,
        showGroupReviewSetup,
        handleFlashCardsOpen,
        handleFlashCardsClose,
        handleGroupSetupClose,
    } = useTrainingModes();

    // Инициализация таба на основе хеша при монтировании
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash === LEARNED_TAB_HASH) {
            setActiveTab('learned');
        }
    }, [setActiveTab]);

    // Обработка изменений хеша (кнопка "назад" в браузере)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            if (hash === LEARNED_TAB_HASH) {
                setActiveTab('learned');
            } else {
                setActiveTab('new');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [setActiveTab]);

    // Обработчик переключения табов с управлением хешем
    const handleTabChange = (value: string) => {
        if (value === 'learned') {
            // Добавляем хеш для таба "Закрепление"
            window.history.pushState(null, '', `#${LEARNED_TAB_HASH}`);
            setActiveTab('learned');
        } else {
            // Убираем хеш для таба "Новые слова"
            if (window.location.hash) {
                // Используем history.back() только если это переход от learned к new
                // В противном случае просто убираем хеш
                const currentHash = window.location.hash.slice(1);
                if (currentHash === LEARNED_TAB_HASH) {
                    window.history.back();
                }
            }
            setActiveTab('new');
        }
    };

    const handleModeClick = (modeId: string) => {
        startMode(modeId as any);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Режимы тренировок
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Выберите подходящий режим тренировки или настройте свой
                    собственный
                </p>
            </div>

            <TrainingTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                notLearnedCount={notLearnedWords.length}
                learnedCount={learnedWords.length}
            >
                {{
                    new: (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:grid-cols-4">
                            {TRAINING_MODE_GROUPS.new.modes.map(mode => (
                                <div
                                    key={mode.id}
                                    className="md:max-w-[230px] lg:max-w-none"
                                >
                                    <TrainingModeCard
                                        mode={mode}
                                        onClick={() => handleModeClick(mode.id)}
                                        disabled={isStarting}
                                    />
                                </div>
                            ))}
                        </div>
                    ),
                    learned: (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:grid-cols-4">
                                {TRAINING_MODE_GROUPS.learned.modes.map(
                                    mode => (
                                        <div
                                            key={mode.id}
                                            className="md:max-w-[230px] lg:max-w-none"
                                        >
                                            <TrainingModeCard
                                                mode={mode}
                                                onClick={() =>
                                                    handleModeClick(mode.id)
                                                }
                                                disabled={
                                                    isStarting ||
                                                    learnedWords.length === 0
                                                }
                                                variant="learned"
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                            {learnedWords.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Нет изученных слов для закрепления
                                </div>
                            )}
                        </>
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
