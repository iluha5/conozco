/**
 * Параметры для загрузки слов для проверки
 */
export interface FlashCardsReviewParams {
    status?: 'LEARNED' | 'NOT_LEARNED';
    limit?: number;
    random?: boolean;
    groupIds?: number[];
    languageCode?: string;
}

/**
 * Результат действия с карточкой
 */
export type CardAction = 'know' | 'dont-know' | 'delete' | 'skip';

/**
 * Статистика тренировки
 */
export interface FlashCardsReviewStats {
    total: number;
    known: number;
    dontKnow: number;
    deleted: number;
}

/**
 * Состояние карточки
 */
export interface FlashCardState {
    isFlipped: boolean;
    isAnimating: boolean;
    swipeOffset: {
        x: number;
        y: number;
    };
}

/**
 * Направление свайпа
 */
export type SwipeDirection = 'left' | 'right' | 'down' | null;

/**
 * Расширенный тип слова для проверки с информацией о принадлежности пользователю
 */
export type FlashCardWord = import('@/types/training.types').Word & {
    belongsToUser?: boolean;
};
