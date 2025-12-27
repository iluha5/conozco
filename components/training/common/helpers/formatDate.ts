import { tServerSync } from '@/lib/i18n';

export function formatDate(dateString: string, lang: string = 'en'): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return tServerSync('Just now', lang);
    if (diffMins < 60)
        return tServerSync('{{count}} min ago', lang, { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
        return tServerSync('{{count}} hours ago', lang, { count: diffHours });

    const diffDays = Math.floor(diffHours / 24);
    return tServerSync('{{count}} days ago', lang, { count: diffDays });
}
