import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/config/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

interface UseTrainingStorageCheckProps {
    selectedWordsCount: number;
}

/**
 * Хук для проверки наличия незавершённой тренировки в localStorage
 * и выполнения редиректа на страницу настройки при необходимости
 */
export function useTrainingStorageCheck({
    selectedWordsCount,
}: UseTrainingStorageCheckProps) {
    const router = useRouter();
    const [isStorageChecked, setIsStorageChecked] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Ранняя проверка наличия незавершённой тренировки - выполняется ДО загрузки данных
    useEffect(() => {
        // Проверяем, пришёл ли пользователь со страницы настройки
        const fromSetup =
            sessionStorage.getItem(STORAGE_KEYS.TRAINING_FROM_SETUP) === 'true';

        if (fromSetup) {
            // Очищаем флаг после использования
            sessionStorage.removeItem(STORAGE_KEYS.TRAINING_FROM_SETUP);
            // Если пользователь пришёл со страницы настройки, разрешаем инициализацию
            setIsStorageChecked(true);
            return;
        }

        // Если есть выбранные слова в контексте, значит пользователь пришёл со страницы настройки
        if (selectedWordsCount > 0) {
            setIsStorageChecked(true);
            return;
        }

        // Проверяем localStorage синхронно
        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);

            if (!savedProgress) {
                // Если нет незавершённой тренировки, редиректим на страницу настройки
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            // Проверяем, что данные валидны
            const parsed = JSON.parse(savedProgress);

            if (!parsed || !parsed.sessionId || !parsed.selectedWordIds) {
                // Если данные невалидны, очищаем и редиректим
                localStorage.removeItem(STORAGE_KEY);
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            // Если есть валидная незавершённая тренировка, разрешаем инициализацию
            setIsStorageChecked(true);
        } catch (error) {
            // Если произошла ошибка при парсинге, очищаем и редиректим
            console.error('Error checking training progress:', error);
            localStorage.removeItem(STORAGE_KEY);
            setShouldRedirect(true);
            setIsStorageChecked(true);
        }
    }, [selectedWordsCount]);

    // Выполняем редирект после проверки localStorage
    useEffect(() => {
        if (shouldRedirect) {
            router.push('/training/setup');
        }
    }, [shouldRedirect, router]);

    return {
        isStorageChecked,
        shouldRedirect,
    };
}
