/**
 * Утилиты для работы с Google Analytics
 * Загружается только при согласии пользователя на аналитические куки
 */

declare global {
    interface Window {
        gtag?: (
            command: string,
            targetId: string,
            config?: Record<string, any>,
        ) => void;
        dataLayer?: any[];
    }
}

let isInitialized = false;
let measurementId: string | null = null;

/**
 * Инициализировать Google Analytics
 */
export function initGoogleAnalytics(gaMeasurementId: string): void {
    if (isInitialized || typeof window === 'undefined') {
        return;
    }

    measurementId = gaMeasurementId;

    // Создаем dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer?.push(args);
    }

    // Загружаем скрипт Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(script);

    // Инициализируем gtag
    window.gtag = gtag as typeof window.gtag;
    gtag('js', new Date());
    gtag('config', gaMeasurementId, {
        anonymize_ip: true, // Анонимизация IP адресов для GDPR
        cookie_flags: 'SameSite=None;Secure',
    });

    isInitialized = true;
}

/**
 * Отслеживать просмотр страницы
 */
export function trackPageView(path: string): void {
    if (!isInitialized || !measurementId || !window.gtag) {
        return;
    }

    window.gtag('config', measurementId, {
        page_path: path,
    });
}

/**
 * Отслеживать событие
 */
export function trackEvent(
    eventName: string,
    params?: Record<string, any>,
): void {
    if (!isInitialized || !measurementId || !window.gtag) {
        return;
    }

    window.gtag('event', eventName, params);
}

/**
 * Отключить Google Analytics
 */
export function disableGoogleAnalytics(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Удаляем скрипт GA
    const scripts = document.querySelectorAll(
        'script[src*="googletagmanager.com/gtag/js"]',
    );
    scripts.forEach((script) => script.remove());

    // Очищаем dataLayer
    if (window.dataLayer) {
        window.dataLayer = [];
    }

    // Удаляем gtag функцию
    delete window.gtag;

    // Удаляем куки Google Analytics
    const cookies = document.cookie.split(';');
    cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('_ga') || name.startsWith('_gid')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
    });

    isInitialized = false;
    measurementId = null;
}

/**
 * Проверить, включен ли Google Analytics
 */
export function isGoogleAnalyticsEnabled(): boolean {
    return isInitialized && measurementId !== null;
}

