import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserSettings } from '@/hooks/settings';
import { useTrainingWords } from '@/contexts/training-words-context';
import { useToast, useHashDialog } from '@/hooks/shared';
import { useTrainingStorage } from '@/hooks/training';
import { TrainingModeId, TrainingModeGroupId } from '../types/typing';
import { getNewWordsTrainingModes } from '../constants/training-modes';
import { getLearnedTrainingModes } from '../constants/learned-training-modes';
import { startTrainingMode } from '../helpers/startTrainingMode';
import { FlashCardsReviewParams } from '@/components/flash-cards-review/typing';
import { getTrainingModeConfig } from '../helpers/getTrainingModeConfig';
import { useTranslation, useI18n } from '@/lib/i18n';
import { useTrainingListWords } from '@/hooks/training-list/use-training-list-words';

export function useTrainingModes() {
    const { t } = useTranslation();
    const i18n = useI18n();
    const router = useRouter();
    const { data: session } = useSession();
    const { settings: userSettings } = useUserSettings();
    const { setSelectedWords } = useTrainingWords();
    const { toast } = useToast();
    const { hasUnfinishedTraining, clearProgress } = useTrainingStorage();
    const { open: showConfirmDialog, setOpen: setShowConfirmDialog } =
        useHashDialog('new-training-confirm');

    // Load words via React Query with language filtering
    const languageCode = userSettings?.learnLanguage?.code || null;
    const { words: allWords, isLoading } = useTrainingListWords(languageCode);

    const [isStarting, setIsStarting] = useState(false);
    const [showNoWordsDialog, setShowNoWordsDialog] = useState(false);
    const [pendingModeId, setPendingModeId] = useState<TrainingModeId | null>(
        null,
    );
    const [isContinueLoading, setIsContinueLoading] = useState(false);

    // New state for tabs and FlashCards
    const [activeTab, setActiveTab] = useState<TrainingModeGroupId>('new');
    const [flashCardsParams, setFlashCardsParams] =
        useState<FlashCardsReviewParams | null>(null);
    const [showFlashCardsReview, setShowFlashCardsReview] = useState(false);
    const [showGroupReviewSetup, setShowGroupReviewSetup] = useState(false);

    // Memoization of words by status
    const { learnedWords, notLearnedWords } = useMemo(() => {
        const learned = allWords.filter(w => w.status === 'LEARNED');
        const notLearned = allWords.filter(w => w.status !== 'LEARNED');
        return { learnedWords: learned, notLearnedWords: notLearned };
    }, [allWords]);

    // FlashCards open handler
    const handleFlashCardsOpen = (params: FlashCardsReviewParams) => {
        const returnUrl =
            window.location.pathname +
            window.location.search +
            window.location.hash;
        setFlashCardsParams({
            ...params,
            returnUrl,
        });
        setShowFlashCardsReview(true);
    };

    // Group selection dialog open handler
    const handleGroupSetupOpen = () => {
        setShowGroupReviewSetup(true);
    };

    const handleStartMode = async (modeId: TrainingModeId) => {
        if (!session?.user?.id || !userSettings?.learnLanguage?.id) {
            toast({
                title: t('Error'),
                description: t('Failed to get user settings'),
                variant: 'destructive',
            });
            return;
        }

        // Check for unfinished training
        if (hasUnfinishedTraining) {
            setPendingModeId(modeId);
            setShowConfirmDialog(true);
            return;
        }

        const config = getTrainingModeConfig(modeId, t);

        if (!config) {
            return;
        }

        setIsStarting(true);

        try {
            const result = await startTrainingMode(
                modeId,
                config,
                session.user.id,
                userSettings.learnLanguage.id,
                allWords,
                router,
                setSelectedWords,
                toast,
                handleFlashCardsOpen,
                handleGroupSetupOpen,
                i18n.language || 'en',
            );

            if (!result.success && result.noWords) {
                setShowNoWordsDialog(true);
                setIsStarting(false);
            } else if (!result.success && !result.noWords) {
                setIsStarting(false);
            }
        } catch (error) {
            console.error('Failed to start training mode:', error);
            toast({
                title: t('Error'),
                description: t('Failed to start training'),
                variant: 'destructive',
            });
            setIsStarting(false);
        }
    };

    const handleContinueExisting = async () => {
        setShowConfirmDialog(false);
        setIsContinueLoading(true);

        // Wait for dialog close animation and hash removal
        await new Promise(resolve => setTimeout(resolve, 100));

        router.push('/training');
    };

    const handleStartNew = async () => {
        if (
            !pendingModeId ||
            !session?.user?.id ||
            !userSettings?.learnLanguage?.id
        ) {
            return;
        }

        const modeIdToStart = pendingModeId;
        clearProgress();
        setPendingModeId(null);
        setShowConfirmDialog(false);

        // Wait for dialog close animation and hash removal
        await new Promise(resolve => setTimeout(resolve, 100));

        const config = getTrainingModeConfig(modeIdToStart, t);

        if (!config) {
            return;
        }

        setIsStarting(true);

        try {
            const result = await startTrainingMode(
                modeIdToStart,
                config,
                session.user.id,
                userSettings.learnLanguage.id,
                allWords,
                router,
                setSelectedWords,
                toast,
                handleFlashCardsOpen,
                handleGroupSetupOpen,
                i18n.language || 'en',
            );

            if (!result.success && result.noWords) {
                setShowNoWordsDialog(true);
                setIsStarting(false);
            } else if (!result.success && !result.noWords) {
                setIsStarting(false);
            }
        } catch (error) {
            console.error('Failed to start training mode:', error);
            toast({
                title: t('Error'),
                description: t('Failed to start training'),
                variant: 'destructive',
            });
            setIsStarting(false);
        }
    };

    // FlashCards close handler
    const handleFlashCardsClose = () => {
        setShowFlashCardsReview(false);
        setIsStarting(false);
    };

    // Group selection dialog close handler
    const handleGroupSetupClose = (open: boolean) => {
        setShowGroupReviewSetup(open);
        if (!open) {
            setIsStarting(false);
        }
    };

    const modes = useMemo(() => getNewWordsTrainingModes(t), [t]);
    const learnedModes = useMemo(() => getLearnedTrainingModes(t), [t]);

    return {
        modes,
        learnedModes,
        startMode: handleStartMode,
        isLoading,
        isStarting,
        showNoWordsDialog,
        setShowNoWordsDialog,
        showConfirmDialog,
        setShowConfirmDialog,
        handleContinueExisting,
        handleStartNew,
        isContinueLoading,
        // New return values
        activeTab,
        setActiveTab,
        learnedWords,
        notLearnedWords,
        allWords,
        flashCardsParams,
        showFlashCardsReview,
        setShowFlashCardsReview,
        showGroupReviewSetup,
        handleFlashCardsOpen,
        handleFlashCardsClose,
        handleGroupSetupOpen,
        handleGroupSetupClose,
    };
}
