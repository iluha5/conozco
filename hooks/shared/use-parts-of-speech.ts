import { useState, useEffect } from 'react';

export type PartOfSpeech = {
    id: number;
    name: string;
    displayName: string;
};

/**
 * Хук для загрузки частей речи
 */
export function usePartsOfSpeech(languageCode: string = 'ru') {
    const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPartsOfSpeech = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/parts-of-speech?languageCode=${languageCode}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setPartsOfSpeech(data);
                } else {
                    throw new Error('Failed to fetch parts of speech');
                }
            } catch (err) {
                console.error('Error fetching parts of speech:', err);
                setError(
                    err instanceof Error
                        ? err
                        : new Error('Unknown error occurred'),
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPartsOfSpeech();
    }, [languageCode]);

    return { partsOfSpeech, loading, error };
}
