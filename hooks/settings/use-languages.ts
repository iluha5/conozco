import { useState, useEffect } from 'react';

export interface Language {
    id: number;
    code: string;
    name: string;
}

export function useLanguages() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get languages via Prisma query
                // In real app can create separate API endpoint
                // For now use static data, as in existing components
                const staticLanguages: Language[] = [
                    { id: 1, code: 'en', name: 'English' },
                    { id: 2, code: 'es', name: 'Spanish' },
                    { id: 3, code: 'ru', name: 'Russian' },
                ];

                setLanguages(staticLanguages);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    return {
        languages,
        loading,
        error,
    };
}
