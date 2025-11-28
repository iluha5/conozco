import { useState, useEffect } from 'react';

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

export function useUserSettings() {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: UpdateUserSettings) => {
        try {
            setSaving(true);
            setError(null);

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

            const updatedSettings = await response.json();
            setSettings(updatedSettings);
            return updatedSettings;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        saving,
        error,
        refetch: fetchSettings,
        updateSettings,
    };
}
