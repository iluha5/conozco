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
export type CardAction = 'know' | 'dont-know' | 'delete';

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
