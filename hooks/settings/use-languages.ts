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

                // Получаем языки через Prisma query
                // В реальном приложении можно создать отдельный API endpoint
                // Пока используем статические данные, как в существующих компонентах
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
