/**
 * Маппинг градиентов к цветам для обводки и текста
 * Используется для генерации правильных классов Tailwind
 */
const GRADIENT_TO_COLOR_MAP: Record<
    string,
    {
        border: string;
        text: string;
        bg: string;
        bgLight: string;
        bgLightMedium: string;
    }
> = {
    'from-green-400 to-emerald-500': {
        border: 'border-green-400',
        text: 'text-green-600',
        bg: 'bg-green-400',
        bgLight: 'bg-green-400/10',
        bgLightMedium: 'bg-green-400/10',
    },
    'from-blue-400 to-cyan-500': {
        border: 'border-blue-400',
        text: 'text-blue-600',
        bg: 'bg-blue-400',
        bgLight: 'bg-blue-400/10',
        bgLightMedium: 'bg-blue-400/10',
    },
    'from-red-400 to-orange-500': {
        border: 'border-red-400',
        text: 'text-red-600',
        bg: 'bg-red-400',
        bgLight: 'bg-red-400/10',
        bgLightMedium: 'bg-red-400/10',
    },
    'from-purple-400 to-pink-500': {
        border: 'border-purple-400',
        text: 'text-purple-600',
        bg: 'bg-purple-400',
        bgLight: 'bg-purple-400/10',
        bgLightMedium: 'bg-purple-400/10',
    },
    'from-gray-400 to-slate-500': {
        border: 'border-gray-400',
        text: 'text-gray-600',
        bg: 'bg-gray-400',
        bgLight: 'bg-gray-400/10',
        bgLightMedium: 'bg-gray-400/10',
    },
    'from-orange-400 to-red-500': {
        border: 'border-orange-400',
        text: 'text-orange-600',
        bg: 'bg-orange-400',
        bgLight: 'bg-orange-400/10',
        bgLightMedium: 'bg-orange-400/10',
    },
    'from-red-400 to-rose-500': {
        border: 'border-red-400',
        text: 'text-red-600',
        bg: 'bg-red-400',
        bgLight: 'bg-red-400/10',
        bgLightMedium: 'bg-red-400/10',
    },
    // Green palette for A1, A2, B1, B2 level tests
    'from-green-300 to-green-400': {
        border: 'border-green-300',
        text: 'text-green-600',
        bg: 'bg-green-300',
        bgLight: 'bg-green-300/10',
        bgLightMedium: 'bg-green-300/10',
    },
    'from-green-400 to-green-500': {
        border: 'border-green-400',
        text: 'text-green-600',
        bg: 'bg-green-400',
        bgLight: 'bg-green-400/10',
        bgLightMedium: 'bg-green-400/10',
    },
    'from-green-500 to-green-600': {
        border: 'border-green-500',
        text: 'text-green-600',
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/10',
        bgLightMedium: 'bg-green-500/10',
    },
    'from-green-600 to-green-700': {
        border: 'border-green-600',
        text: 'text-green-700',
        bg: 'bg-green-600',
        bgLight: 'bg-green-600/10',
        bgLightMedium: 'bg-green-600/10',
    },
};

/**
 * Извлекает цвет из градиента для использования в обводке
 * Пример: "from-green-400 to-emerald-500" -> "green-400"
 */
export function extractColorFromGradient(gradient: string): string {
    // Extract first color from gradient (after "from-")
    const match = gradient.match(/from-([a-z]+-\d+)/);
    if (match && match[1]) {
        return match[1];
    }
    // Fallback: if extraction failed, return default color
    return 'gray-400';
}

/**
 * Получает класс для обводки на основе цвета градиента
 */
export function getBorderColorClass(gradient: string): string {
    const colorMap = GRADIENT_TO_COLOR_MAP[gradient];
    if (colorMap) {
        return colorMap.border;
    }
    // Fallback
    return 'border-gray-400';
}

/**
 * Получает класс для текста на основе цвета градиента
 */
export function getTextColorClass(gradient: string): string {
    const colorMap = GRADIENT_TO_COLOR_MAP[gradient];
    if (colorMap) {
        return colorMap.text;
    }
    // Fallback
    return 'text-gray-600';
}

/**
 * Получает класс для фона на основе цвета градиента (с прозрачностью 10%)
 */
export function getBackgroundColorClass(gradient: string): string {
    const colorMap = GRADIENT_TO_COLOR_MAP[gradient];
    if (colorMap) {
        return colorMap.bgLight;
    }
    // Fallback
    return 'bg-gray-400/10';
}

/**
 * Получает класс для засветленного фона на основе цвета градиента (с прозрачностью 10%)
 * Используется для фона карточки, чтобы цвет был заметен, но текст оставался читаемым
 */
export function getLightBackgroundColorClass(gradient: string): string {
    const colorMap = GRADIENT_TO_COLOR_MAP[gradient];
    if (colorMap) {
        return colorMap.bgLightMedium;
    }
    // Fallback
    return 'bg-gray-400/10';
}
