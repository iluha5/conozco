import { useQuery } from '@tanstack/react-query';

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

/**
 * Хук для загрузки частей речи с кэшированием через React Query
 * Данные кэшируются глобально и переиспользуются между компонентами
 */
export function usePartsOfSpeech(languageCode: string = 'ru') {
    const {
        data: partsOfSpeech = [],
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['parts-of-speech', languageCode],
        queryFn: () => fetchPartsOfSpeech(languageCode),
        staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
        gcTime: 30 * 60 * 1000, // 30 минут - хранить в кэше
    });

    return {
        partsOfSpeech,
        loading,
        error: error as Error | null,
    };
}
