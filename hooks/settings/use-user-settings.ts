import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

export interface Language {
    id: number;
    code: string;
    name: string;
}

export interface UserSettings {
    id: number;
    email: string;
    name: string | null;
    ownLanguageId: number | null;
    learnLanguageId: number | null;
    interfaceLanguageId: number | null;
    hasConfigured: boolean;
    ownLanguage: Language | null;
    learnLanguage: Language | null;
    interfaceLanguage: Language | null;
}

export interface UpdateUserSettings {
    name?: string | null;
    ownLanguageId?: number | null;
    learnLanguageId?: number | null;
    interfaceLanguageId?: number | null;
    hasConfigured?: boolean;
}

async function fetchUserSettings(): Promise<UserSettings> {
    const response = await fetch('/api/user/settings');

    if (!response.ok) {
        throw new Error('Failed to fetch settings');
    }

    return response.json();
}

async function patchUserSettings(
    updates: UpdateUserSettings,
): Promise<UserSettings> {
    const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
    }

    return response.json();
}

/**
 * Хук для работы с настройками пользователя с кэшированием через React Query
 * Данные кэшируются глобально и переиспользуются между компонентами
 */
export function useUserSettings() {
    const queryClient = useQueryClient();

    const {
        data: settings = null,
        isLoading: loading,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: ['user-settings'],
        queryFn: fetchUserSettings,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    const mutation = useMutation({
        mutationFn: patchUserSettings,
        onSuccess: updatedSettings => {
            // Update cache with new data
            queryClient.setQueryData(['user-settings'], updatedSettings);
        },
    });

    const updateSettings = async (updates: UpdateUserSettings) => {
        return mutation.mutateAsync(updates);
    };

    return {
        settings,
        loading,
        saving: mutation.isPending,
        error: queryError?.message || mutation.error?.message || null,
        refetch,
        updateSettings,
    };
}
