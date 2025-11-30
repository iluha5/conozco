import type { ButtonStyleState } from '../typing';

/**
 * Determine button styles based on selection state
 */
export function getButtonStyles(
    option: string,
    selectedOption: string | null,
    isCorrect: boolean | null,
    correctTranslation: string,
): ButtonStyleState {
    const isSelected = selectedOption === option;
    const isCorrectOption = option === correctTranslation;

    let className = 'h-auto py-4 text-lg justify-start';
    let variant: 'default' | 'outline' | 'secondary' = 'outline';
    let showCheckIcon = false;
    let showXIcon = false;

    if (isSelected) {
        if (isCorrect) {
            className += ' bg-green-100 border-green-500 hover:bg-green-100';
            showCheckIcon = true;
        } else {
            className += ' bg-red-100 border-red-500 hover:bg-red-100';
            showXIcon = true;
        }
    } else if (selectedOption !== null && isCorrectOption) {
        className += ' bg-green-100 border-green-500';
        showCheckIcon = true;
    }

    return {
        className,
        variant,
        showCheckIcon,
        showXIcon,
    };
}
