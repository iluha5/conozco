import { WordsListResponse, WordsListStatus } from '@/types/words.types';

export interface FetchWordsListParams {
    languageCode: string;
    status: WordsListStatus;
    groupIds?: number[];
    limit?: number;
    offset?: number;
}

export const wordsApi = {
    fetchWordsList: async (
        params: FetchWordsListParams,
    ): Promise<WordsListResponse> => {
        const searchParams = new URLSearchParams();
        searchParams.set('languageCode', params.languageCode);

        if (params.status !== 'ALL') {
            searchParams.set('status', params.status);
        }

        if (params.groupIds && params.groupIds.length > 0) {
            searchParams.set('groupIds', params.groupIds.join(','));
        }

        if (params.limit !== undefined) {
            searchParams.set('limit', String(params.limit));
        }

        if (params.offset !== undefined) {
            searchParams.set('offset', String(params.offset));
        }

        const response = await fetch(
            `/api/words/list?${searchParams.toString()}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch words list');
        }

        return response.json();
    },
};

export function getWordsListQueryKey(params: {
    languageCode: string;
    status: WordsListStatus;
    groupIds: number[];
}) {
    return [
        'words-list',
        {
            languageCode: params.languageCode,
            status: params.status,
            groupIds: params.groupIds,
        },
    ] as const;
}

export const WORDS_LIST_PAGE_SIZE = 20;

export async function fetchWordsListPage({
    languageCode,
    status,
    groupIds,
    pageParam = 0,
}: {
    languageCode: string;
    status: WordsListStatus;
    groupIds: number[];
    pageParam?: number;
}) {
    return wordsApi.fetchWordsList({
        languageCode,
        status,
        groupIds: groupIds.length > 0 ? groupIds : undefined,
        limit: WORDS_LIST_PAGE_SIZE,
        offset: pageParam,
    });
}
