import { useQuery } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

export type PartOfSpeech = {
    id: number;
    name: string;
    displayName: string;
};

async function fetchPartsOfSpeech(
    languageCode: string,
): Promise<PartOfSpeech[]> {
    const response = await fetch(
        `/api/parts-of-speech?languageCode=${languageCode}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch parts of speech');
    }

    return response.json();
}

export function usePartsOfSpeech(languageCode: string = 'ru') {
    const {
        data: partsOfSpeech = [],
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['parts-of-speech', languageCode],
        queryFn: () => fetchPartsOfSpeech(languageCode),
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    return {
        partsOfSpeech,
        loading,
        error: error as Error | null,
    };
}
