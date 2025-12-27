'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/shared';
import { Stage1SettingsModal } from '@/components/training/common/Stage1SettingsModal';
import { Stage4SettingsModal } from '@/components/training/common/Stage4SettingsModal';
import { Stage5SettingsModal } from '@/components/training/common/Stage5SettingsModal';
import { useTrainingSettings } from '@/hooks/shared/use-training-settings';
import { useTrainingWords } from '@/contexts/training-words-context';
import {
    useSetupWords,
    useWordsSelection,
    useStageModals,
} from '@/hooks/training-setup';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { useUserSettings } from '@/hooks/settings';
import { WordsSelector, StagesSelector } from '@/components/training-setup';
import { STORAGE_KEYS } from '@/config/storage-keys';
import { useTranslation } from '@/lib/i18n';

export default function TrainingSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [isInitialSelection, setIsInitialSelection] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    // Настройки тренировки
    const {
        settings: trainingSettings,
        updateEnabledStages,
        updateStagesSettingsExpanded,
        isLoaded: trainingSettingsLoaded,
    } = useTrainingSettings();

    const { settings: userSettings } = useUserSettings();
    const { selectedWords, setSelectedWords, resetSelection } =
        useTrainingWords();

    // Используем learnLanguage пользователя вместо фильтра
    const selectedLanguage = userSettings?.learnLanguage?.code || 'ALL';

    // Фильтр по группам
    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('trainingSetup');

    // Данные слов и фильтрация
    const { filteredWords, isLoading } = useSetupWords(
        selectedLanguage,
        selectedGroupIds,
    );

    // Выбор слов
    const {
        toggleWord,
        toggleAllWordsSelection,
        isWordSelected,
        selectionState,
        getBulkSelectText,
        visibleWords,
        visibleWordsCount,
        loadMoreWords,
        hasMoreWords,
    } = useWordsSelection(filteredWords);

    // Модальные окна настроек этапов
    const {
        openModal,
        openStageModal,
        closeModal,
        handleStage1Change,
        handleStage4Change,
        handleStage5Change,
        settings: stageSettings,
    } = useStageModals();

    // Очистка выбранных слов при монтировании страницы
    useEffect(() => {
        resetSelection();
        setIsInitialSelection(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Автовыбор первых видимых слов
    useEffect(() => {
        if (
            visibleWords.length > 0 &&
            selectedWords.size === 0 &&
            isInitialSelection
        ) {
            const firstWords = visibleWords.map(word => String(word.id));
            setSelectedWords(new Set(firstWords));
            setIsInitialSelection(false);
        }
    }, [
        visibleWords,
        selectedWords.size,
        isInitialSelection,
        setSelectedWords,
    ]);

    // Производные значения
    const enabledStages = trainingSettings
        ? new Set(trainingSettings.enabledStages)
        : new Set([1, 2, 3, 4, 5, 6]);

    const showStagesSettings = trainingSettingsLoaded
        ? (trainingSettings?.stagesSettingsExpanded ?? true)
        : false;

    // Обработчики
    const toggleStagesSettings = () => {
        updateStagesSettingsExpanded(!showStagesSettings);
    };

    const toggleStage = (stage: number) => {
        const newSet = new Set(enabledStages);
        if (newSet.has(stage)) {
            if (newSet.size > 1) {
                newSet.delete(stage);
                updateEnabledStages(Array.from(newSet));
            } else {
                toast({
                    title: t('Error'),
                    description: t(
                        'At least one training stage must be selected',
                    ),
                    variant: 'destructive',
                });
            }
        } else {
            newSet.add(stage);
            updateEnabledStages(Array.from(newSet));
        }
    };

    const startTraining = () => {
        if (selectedWords.size === 0) {
            toast({
                title: t('Error'),
                description: t('Select at least one word for training'),
                variant: 'destructive',
            });
            return;
        }
        setIsStarting(true);
        // Устанавливаем флаг, что переход происходит со страницы настройки
        sessionStorage.setItem(STORAGE_KEYS.TRAINING_FROM_SETUP, 'true');
        router.push('/training');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Header />
            <div className="container mx-auto px-4 pb-8 pt-4">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-4">
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('Back')}
                            </Button>
                        </Link>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">
                                {t('Training setup')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Выбор слов */}
                            <WordsSelector
                                filteredWords={filteredWords}
                                selectedWords={selectedWords}
                                isLoading={isLoading}
                                onToggleWord={toggleWord}
                                onToggleAllWordsSelection={
                                    toggleAllWordsSelection
                                }
                                isWordSelected={isWordSelected}
                                selectedGroupIds={selectedGroupIds}
                                onToggleGroup={toggleGroup}
                                onToggleAllGroups={toggleAll}
                                selectionState={selectionState}
                                getBulkSelectText={getBulkSelectText}
                                visibleWords={visibleWords}
                                visibleWordsCount={visibleWordsCount}
                                loadMoreWords={loadMoreWords}
                                hasMoreWords={hasMoreWords}
                            />

                            {/* Настройки этапов тренировки */}
                            <StagesSelector
                                enabledStages={enabledStages}
                                showStagesSettings={showStagesSettings}
                                onToggleVisibility={toggleStagesSettings}
                                onToggleStage={toggleStage}
                                onOpenStageSettings={openStageModal}
                            />

                            {/* Кнопка начать */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={startTraining}
                                    size="lg"
                                    className="px-8 py-3 text-lg"
                                    disabled={
                                        enabledStages.size === 0 ||
                                        selectedWords.size === 0
                                    }
                                    loading={isStarting}
                                >
                                    {t('Start training')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Модальные окна настроек этапов */}
            <Stage1SettingsModal
                isOpen={openModal === 1}
                onClose={closeModal}
                settings={stageSettings.stage1}
                onChange={handleStage1Change}
            />
            <Stage4SettingsModal
                isOpen={openModal === 4}
                onClose={closeModal}
                settings={stageSettings.stage4}
                onChange={handleStage4Change}
            />
            <Stage5SettingsModal
                isOpen={openModal === 5}
                onClose={closeModal}
                settings={stageSettings.stage5}
                onChange={handleStage5Change}
            />
        </div>
    );
}
