import { useEffect } from 'react';

type UseStage3AutoAdvanceParams = {
    allMatched: boolean;
    pairsLength: number;
    currentBatch: number;
    totalBatches: number;
    exerciseResults: (boolean | null)[];
    isRetryMode: boolean;
    isLastStage?: boolean;
    onComplete: () => void;
    setCurrentBatch: (_batch: number) => void;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsRetryMode: (_value: boolean) => void;
    setIsCompleting: (_value: boolean) => void;
    findNextErrorBatch: (_startBatch: number) => number;
};

export function useStage3AutoAdvance({
    allMatched,
    pairsLength,
    currentBatch,
    totalBatches,
    exerciseResults,
    isRetryMode,
    isLastStage = false,
    onComplete,
    setCurrentBatch,
    setRefreshKey,
    setHasCompletedFirstRound,
    setIsRetryMode,
    setIsCompleting,
    findNextErrorBatch,
}: UseStage3AutoAdvanceParams) {
    useEffect(() => {
        if (allMatched && pairsLength > 0) {
            const timer = setTimeout(() => {
                if (currentBatch < totalBatches - 1) {
                    setCurrentBatch(currentBatch + 1);
                } else {
                    // Завершили все батчи первый раз
                    setHasCompletedFirstRound(true);

                    // Проверяем, есть ли ошибки во всех батчах
                    const hasAnyErrors = exerciseResults.some(
                        result => result === false,
                    );

                    if (hasAnyErrors) {
                        // Есть ошибки - переходим в режим исправления
                        setIsRetryMode(true);
                        const firstErrorBatch = findNextErrorBatch(-1); // Ищем первый батч с ошибками
                        if (firstErrorBatch !== -1) {
                            setCurrentBatch(firstErrorBatch);
                        }
                    } else {
                        // Все правильно - завершаем этап
                        // Если это последний этап и последний батч выполнен правильно
                        if (isLastStage && currentBatch === totalBatches - 1) {
                            // Проверяем, что все упражнения выполнены правильно
                            const allCorrect = exerciseResults.every(
                                result => result === true,
                            );
                            if (allCorrect) {
                                // Показываем лоадер и завершаем тренировку
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                                return;
                            }
                        }
                        // Обычное завершение этапа
                        onComplete();
                        setCurrentBatch(0);
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                }
            }, 1500); // Задержка 1.5 секунды для визуального подтверждения

            return () => clearTimeout(timer);
        } else if (isRetryMode && allMatched && pairsLength > 0) {
            // В режиме повторения, когда завершили текущий батч
            const timer = setTimeout(() => {
                const nextErrorBatch = findNextErrorBatch(currentBatch);

                if (nextErrorBatch === -1) {
                    // Все ошибки исправлены - завершаем этап
                    // Если это последний этап, показываем лоадер
                    if (isLastStage) {
                        setIsCompleting(true);
                        setTimeout(() => {
                            onComplete();
                        }, 500);
                    } else {
                        onComplete();
                        setCurrentBatch(0);
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                } else if (nextErrorBatch === currentBatch) {
                    // Это единственный батч с ошибками - перезагружаем его
                    setRefreshKey(prevKey => prevKey + 1);
                } else {
                    // Переходим к следующему батчу с ошибками
                    setCurrentBatch(nextErrorBatch);
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [
        allMatched,
        pairsLength,
        currentBatch,
        totalBatches,
        exerciseResults,
        isRetryMode,
        isLastStage,
        onComplete,
        setCurrentBatch,
        setRefreshKey,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
        findNextErrorBatch,
    ]);
}
