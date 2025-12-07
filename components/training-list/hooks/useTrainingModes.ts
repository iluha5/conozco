import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserSettings } from '@/hooks/settings';
import { useTrainingWords } from '@/contexts/training-words-context';
import { useToast } from '@/hooks/shared';
import { trainingApi } from '@/lib/api/training.api';
import { Word } from '@/types/training.types';
import { TrainingModeId } from '../types/typing';
import { TRAINING_MODES } from '../constants/training-modes';
import { startTrainingMode } from '../helpers/startTrainingMode';

export function useTrainingModes() {
    const router = useRouter();
    const { data: session } = useSession();
    const { settings: userSettings } = useUserSettings();
    const { setSelectedWords } = useTrainingWords();
    const { toast } = useToast();

    const [allWords, setAllWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [showNoWordsDialog, setShowNoWordsDialog] = useState(false);

    useEffect(() => {
        const loadWords = async () => {
            try {
                setIsLoading(true);
                const words = await trainingApi.fetchWords();
                setAllWords(words);
            } catch (error) {
                console.error('Failed to load words:', error);
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось загрузить слова',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadWords();
    }, [toast]);

    const handleStartMode = async (modeId: TrainingModeId) => {
        if (!session?.user?.id || !userSettings?.learnLanguage?.id) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось получить настройки пользователя',
                variant: 'destructive',
            });
            return;
        }

        const config = TRAINING_MODES.find(mode => mode.id === modeId);

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
            );

            if (!result.success && result.noWords) {
                setShowNoWordsDialog(true);
                setIsStarting(false);
            }
        } catch (error) {
            console.error('Failed to start training mode:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось запустить тренировку',
                variant: 'destructive',
            });
            setIsStarting(false);
        }
    };

    return {
        modes: TRAINING_MODES,
        startMode: handleStartMode,
        isLoading,
        isStarting,
        showNoWordsDialog,
        setShowNoWordsDialog,
    };
}
