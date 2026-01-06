import { TrainingModeId, TrainingModeConfig } from '../types/typing';
import { getNewWordsTrainingModes } from '../constants/training-modes';
import { getLearnedTrainingModes } from '../constants/learned-training-modes';
import { getTestTrainingModes } from '../constants/test-training-modes';
import { getTestConfigById } from '../constants/test-config';
import { I18n } from '@/lib/i18n';

/**
 * Найти конфигурацию режима тренировки по ID
 * @param modeId - ID режима тренировки
 * @param t - функция перевода
 * @param testModes - опциональный массив тестов (если передан, используется вместо загрузки через getTestTrainingModes)
 */
export function getTrainingModeConfig(
    modeId: TrainingModeId,
    t: I18n['t'],
    testModes?: TrainingModeConfig[],
): TrainingModeConfig | undefined {
    const allTrainingModes: TrainingModeConfig[] = [
        ...getNewWordsTrainingModes(t),
        ...getLearnedTrainingModes(t),
        ...(testModes || getTestTrainingModes(t)),
    ];

    // Если режим не найден и это новый ID теста с префиксом языка, пытаемся найти через test-config
    let found = allTrainingModes.find(mode => mode.id === modeId);

    if (
        !found &&
        (modeId.startsWith('learned-test-es-') ||
            modeId.startsWith('learned-test-en-'))
    ) {
        const testConfig = getTestConfigById(modeId);
        if (testConfig) {
            // Определяем уровень теста из ID
            const isA2 = modeId.includes('-a2-');
            const isB1 = modeId.includes('-b1-');
            const isB2 = modeId.includes('-b2-');
            
            let level: string;
            let title: string;
            let shortDescription: string;
            
            if (isB2) {
                level = 'B2';
                title = t('Test B2');
                shortDescription = t('20 random words from B2');
            } else if (isB1) {
                level = 'B1';
                title = t('Test B1');
                shortDescription = t('20 random words from B1');
            } else if (isA2) {
                level = 'A2';
                title = t('Test A2');
                shortDescription = t('20 random words from A2');
            } else {
                level = 'A1';
                title = t('Test A1');
                shortDescription = t('20 random words from A1');
            }

            // Создаем базовую конфигурацию (название группы будет загружено позже)
            found = {
                id: modeId as TrainingModeId,
                title,
                shortDescription,
                detailedDescription: t(
                    'Check {{count}} random words from group "{{name}}" and add unknown words to your collection',
                    {
                        count: testConfig.wordCount,
                        name: level,
                    },
                ),
                icon: testConfig.icon,
                gradient: testConfig.gradient,
                enabledStages: [],
                wordCount: testConfig.wordCount,
                settings: {},
                wordSource: 'group',
                modeType: 'flashCards',
                groupId: testConfig.groupId,
                groupName: level, // Fallback, будет заменено при загрузке из БД
            };
        }
    }

    return found;
}
