import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrainingModeConfig } from '../types/typing';
import { I18n } from '@/lib/i18n';
import {
    getTestConfigsForLanguage,
    TestConfig,
} from '../constants/test-config';
import { ListChecks } from 'lucide-react';

interface WordGroup {
    id: number;
    name: string;
    isActive: boolean;
}

/**
 * Хук для загрузки тестов с названиями групп из БД
 * Фильтрует тесты по языку обучения пользователя
 */
export function useTestModes(
    languageCode: string | null | undefined,
    t: I18n['t'],
): {
    testModes: TrainingModeConfig[];
    isLoading: boolean;
    error: Error | null;
} {
    // Загружаем все доступные группы для получения названий
    const { data: groups = [], isLoading: groupsLoading } = useQuery<
        WordGroup[]
    >({
        queryKey: ['allAccessibleWordGroups'],
        queryFn: async () => {
            const res = await fetch('/api/user/word-groups/all-accessible');
            if (!res.ok) throw new Error('Failed to fetch groups');
            return res.json();
        },
    });

    // Создаем Map для быстрого поиска названий групп
    const groupNameMap = useMemo(() => {
        const map = new Map<number, string>();
        groups.forEach(group => {
            map.set(group.id, group.name);
        });
        return map;
    }, [groups]);

    // Загружаем названия групп, которые не найдены в списке доступных
    const testConfigs = useMemo(() => {
        if (!languageCode) return [];
        return getTestConfigsForLanguage(languageCode);
    }, [languageCode]);

    const missingGroupIds = useMemo(() => {
        return testConfigs
            .map(config => config.groupId)
            .filter(groupId => !groupNameMap.has(groupId));
    }, [testConfigs, groupNameMap]);

    // Загружаем недостающие группы одним запросом (если есть недостающие)
    const { data: missingGroups = [], isLoading: isLoadingMissingGroups } =
        useQuery<WordGroup[]>({
            queryKey: ['wordGroups', missingGroupIds],
            queryFn: async () => {
                if (missingGroupIds.length === 0) return [];
                // Загружаем все недостающие группы параллельно
                const promises = missingGroupIds.map(async groupId => {
                    const res = await fetch(`/api/user/word-groups/${groupId}`);
                    if (!res.ok) {
                        console.warn(`Failed to fetch group ${groupId}`);
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

    // Объединяем все группы в один Map
    const allGroupNames = useMemo(() => {
        const map = new Map(groupNameMap);
        missingGroups.forEach(group => {
            map.set(group.id, group.name);
        });
        return map;
    }, [groupNameMap, missingGroups]);

    // Преобразуем конфигурации тестов в TrainingModeConfig
    const testModes = useMemo(() => {
        if (!languageCode) return [];

        const configs = getTestConfigsForLanguage(languageCode);
        const modes: TrainingModeConfig[] = [
            // Всегда добавляем "Group check" в начало
            {
                id: 'learned-group-check',
                title: t('Group check'),
                shortDescription: t('Select a group to check'),
                detailedDescription: t(
                    'Check words from selected group through flashcards',
                ),
                icon: ListChecks,
                gradient: 'from-blue-400 to-cyan-500',
                enabledStages: [],
                wordCount: 20,
                settings: {},
                wordSource: 'group',
                modeType: 'flashCards',
            },
        ];

        // Добавляем тесты с названиями групп из БД
        configs.forEach(config => {
            // Определяем уровень теста из ID
            const isA2 = config.id.includes('-a2-');
            const isB1 = config.id.includes('-b1-');
            const isB2 = config.id.includes('-b2-');
            
            let level: string;
            let fallbackName: string;
            if (isB2) {
                level = 'B2';
                fallbackName = 'B2';
            } else if (isB1) {
                level = 'B1';
                fallbackName = 'B1';
            } else if (isA2) {
                level = 'A2';
                fallbackName = 'A2';
            } else {
                level = 'A1';
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
    }, [languageCode, testConfigs, allGroupNames, t]);

    return {
        testModes,
        isLoading: groupsLoading || isLoadingMissingGroups,
        error: null,
    };
}
