import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { getWordTranslation } from '@/lib/training-utils';
import { useI18n } from '@/lib/i18n';
import { getButtonStyles } from '../helpers/getButtonStyles';
import type { Word } from '@/types/training.types';

type TranslationOptionsProps = {
    options: string[];
    currentWord: Word;
    selectedOption: string | null;
    isCorrect: boolean | null;
    onSelectOption: (_option: string) => void;
};

export function TranslationOptions({
    options,
    currentWord,
    selectedOption,
    isCorrect,
    onSelectOption,
}: TranslationOptionsProps) {
    const i18n = useI18n();
    const correctTranslation = getWordTranslation(
        currentWord,
        i18n.language || 'en',
    );

    return (
        <div
            className="grid grid-cols-1 gap-3"
            data-testid="stage2-translation-options"
        >
            {options.map((translationOption, optionIndex) => {
                const styles = getButtonStyles(
                    translationOption,
                    selectedOption,
                    isCorrect,
                    correctTranslation,
                );

                return (
                    <Button
                        key={optionIndex}
                        variant={styles.variant}
                        className={styles.className}
                        onClick={() => onSelectOption(translationOption)}
                        disabled={selectedOption !== null}
                    >
                        <span className="flex-1 text-left">
                            {translationOption}
                        </span>
                        {styles.showCheckIcon && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {styles.showXIcon && (
                            <XCircle className="w-5 h-5 text-red-600" />
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
