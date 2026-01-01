import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

type ShowTranslationButtonProps = {
    onShowTranslation: () => void;
    showTranslation: boolean;
};

export function ShowTranslationButton({
    onShowTranslation,
    showTranslation,
}: ShowTranslationButtonProps) {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center pt-4">
            <Button
                size="lg"
                onClick={onShowTranslation}
                className={`text-lg transition-opacity duration-300 ${
                    showTranslation
                        ? 'opacity-0 pointer-events-none'
                        : 'opacity-100'
                }`}
                data-testid="stage1-show-translation-button"
            >
                {t('Show translation')}
            </Button>
        </div>
    );
}
