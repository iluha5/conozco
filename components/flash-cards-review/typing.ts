export interface FlashCardsReviewParams {
    status?: 'LEARNED' | 'NOT_LEARNED';
    limit?: number;
    random?: boolean;
    groupIds?: number[];
    languageCode?: string;
    translationLanguageCode?: string;
    source?: 'user' | 'base'; // Word source: 'user' - from user vocabulary, 'base' - from BaseWord by groups
    includeAllGroups?: boolean; // Include all user available groups (works only with source='base')
    selectedGroupName?: string; // Selected group name for display
    returnUrl?: string; // URL to return after closing (pathname + search + hash)
    readOnly?: boolean; // Guest mode: no DB writes
}

export type CardAction = 'know' | 'dont-know' | 'delete' | 'skip';

export interface FlashCardsReviewStats {
    total: number;
    known: number;
    dontKnow: number;
    deleted: number;
}

export interface FlashCardState {
    isFlipped: boolean;
    isAnimating: boolean;
    swipeOffset: {
        x: number;
        y: number;
    };
}

export type SwipeDirection = 'left' | 'right' | 'down' | null;

export type FlashCardWord = import('@/types/training.types').Word & {
    belongsToUser?: boolean;
};
