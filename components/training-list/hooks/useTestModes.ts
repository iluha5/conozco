import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrainingModeConfig } from '../types/typing';
import { I18n } from '@/lib/i18n';
import { getTestConfigsForLanguage } from '../constants/test-config';
import { getGroupCheckMode } from '../constants/group-check-mode';

interface WordGroup {
    id: number;
    name: string;
    isActive: boolean;
}

export function useTestModes(
    languageCode: string | null | undefined,
    t: I18n['t'],
    isGuest: boolean = false,
): {
    testModes: TrainingModeConfig[];
    isLoading: boolean;
    error: Error | null;
} {
    const groupsEndpoint = isGuest
        ? `/api/public/word-groups?languageCode=${languageCode || ''}`
        : '/api/user/word-groups/all-accessible';

    const { data: groups = [], isLoading: groupsLoading } = useQuery<
        WordGroup[]
    >({
        queryKey: ['allAccessibleWordGroups', isGuest, languageCode],
        queryFn: async () => {
            const res = await fetch(groupsEndpoint);
            if (!res.ok) throw new Error('Failed to fetch groups');
            return res.json();
        },
        enabled: !!languageCode,
    });

    const groupNameMap = useMemo(() => {
        const map = new Map<number, string>();
        groups.forEach(group => {
            map.set(group.id, group.name);
        });
        return map;
    }, [groups]);

    const testConfigs = useMemo(() => {
        if (!languageCode) return [];
        return getTestConfigsForLanguage(languageCode);
    }, [languageCode]);

    const missingGroupIds = useMemo(() => {
        if (isGuest) return [];
        return testConfigs
            .map(config => config.groupId)
            .filter(groupId => !groupNameMap.has(groupId));
    }, [testConfigs, groupNameMap, isGuest]);

    const { data: missingGroups = [], isLoading: isLoadingMissingGroups } =
        useQuery<WordGroup[]>({
            queryKey: ['wordGroups', missingGroupIds],
            queryFn: async () => {
                if (missingGroupIds.length === 0) return [];
                const promises = missingGroupIds.map(async groupId => {
                    const res = await fetch(`/api/user/word-groups/${groupId}`);
                    if (!res.ok) {
                        return null;
                    }
                    return res.json();
                });
                const results = await Promise.all(promises);
                return results.filter(
                    (group): group is WordGroup => group !== null,
                );
            },
            enabled: missingGroupIds.length > 0,
        });

    const allGroupNames = useMemo(() => {
        const map = new Map(groupNameMap);
        missingGroups.forEach(group => {
            map.set(group.id, group.name);
        });
        return map;
    }, [groupNameMap, missingGroups]);

    const testModes = useMemo(() => {
        if (!languageCode) return [];

        const configs = getTestConfigsForLanguage(languageCode);
        const modes: TrainingModeConfig[] = [getGroupCheckMode(t)];

        configs.forEach(config => {
            const isA2 = config.id.includes('-a2-');
            const isB1 = config.id.includes('-b1-');
            const isB2 = config.id.includes('-b2-');

            let fallbackName: string;
            if (isB2) {
                fallbackName = 'B2';
            } else if (isB1) {
                fallbackName = 'B1';
            } else if (isA2) {
                fallbackName = 'A2';
            } else {
                fallbackName = 'A1';
            }

            const groupName = allGroupNames.get(config.groupId) || fallbackName;

            let title: string;
            let shortDescription: string;

            if (isB2) {
                title = t('Test B2');
                shortDescription = t('20 random words from B2');
            } else if (isB1) {
                title = t('Test B1');
                shortDescription = t('20 random words from B1');
            } else if (isA2) {
                title = t('Test A2');
                shortDescription = t('20 random words from A2');
            } else {
                title = t('Test A1');
                shortDescription = t('20 random words from A1');
            }

            modes.push({
                id: config.id as TrainingModeConfig['id'],
                title,
                shortDescription,
                detailedDescription: t(
                    'Check {{count}} random words from group "{{name}}" and add unknown words to your collection',
                    {
                        count: config.wordCount,
                        name: groupName,
                    },
                ),
                icon: config.icon,
                gradient: config.gradient,
                enabledStages: [],
                wordCount: config.wordCount,
                settings: {},
                wordSource: 'group',
                modeType: 'flashCards',
                groupId: config.groupId,
                groupName: groupName,
            });
        });

        return modes;
    }, [languageCode, allGroupNames, t]);

    return {
        testModes,
        isLoading: groupsLoading || isLoadingMissingGroups,
        error: null,
    };
}
