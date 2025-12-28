import type { Phrase } from '../typing';
import { useTranslation } from '@/lib/i18n';

type TranslationDisplayProps = {
    phrase: Phrase;
};

export function TranslationDisplay({ phrase }: TranslationDisplayProps) {
    const { t } = useTranslation();
    return (
        <div className="text-center" data-testid="stage5-translation-display">
            <p className="text-2xl font-bold text-purple-600 mb-2">
                {phrase.translation}
            </p>
            <p className="text-gray-600">{t('Build a sentence from words')}</p>
        </div>
    );
}
