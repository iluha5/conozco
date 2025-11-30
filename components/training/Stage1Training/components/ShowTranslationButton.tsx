import { Button } from '@/components/ui/button';

type ShowTranslationButtonProps = {
    onShowTranslation: () => void;
    showTranslation: boolean;
};

export function ShowTranslationButton({
    onShowTranslation,
    showTranslation,
}: ShowTranslationButtonProps) {
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
            >
                Показать перевод
            </Button>
        </div>
    );
}
