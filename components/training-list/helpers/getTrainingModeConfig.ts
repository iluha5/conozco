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
            // Создаем базовую конфигурацию (название группы будет загружено позже)
            found = {
                id: modeId as TrainingModeId,
                title: t('Test A1'),
                shortDescription: t('20 random words from A1'),
                detailedDescription: t(
                    'Check {{count}} random words from group "{{name}}" and add unknown words to your collection',
                    {
                        count: testConfig.wordCount,
                        name: 'A1',
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
                groupName: 'A1', // Fallback, будет заменено при загрузке из БД
            };
        }
    }

    return found;
}
