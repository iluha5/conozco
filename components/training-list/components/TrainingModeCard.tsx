import { TrainingModeConfig } from '../types/typing';
import { TrainingModeTooltip } from './TrainingModeTooltip';
import { AutoScrollText } from '@/components/ui/auto-scroll-text';
import {
    getBorderColorClass,
    getTextColorClass,
    getBackgroundColorClass,
} from '../helpers/gradient-utils';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'learned';

interface TrainingModeCardProps {
    mode: TrainingModeConfig;
    onClick: () => void;
    disabled?: boolean;
    locked?: boolean;
    lockedDimmed?: boolean;
    variant?: CardVariant;
}

export function TrainingModeCard({
    mode,
    onClick,
    disabled = false,
    locked = false,
    lockedDimmed = true,
    variant = 'default',
}: TrainingModeCardProps) {
    const Icon = mode.icon;

    const handleClick = () => {
        if (!disabled && !locked) {
            onClick();
        }
    };

    if (variant === 'learned') {
        const borderColor = getBorderColorClass(mode.gradient);
        const iconColor = getTextColorClass(mode.gradient);
        const iconBgColor = getBackgroundColorClass(mode.gradient);

        const card = (
            <div
                onClick={handleClick}
                className={cn(
                    'relative aspect-square rounded-2xl p-4 sm:p-6',
                    'bg-white border-2',
                    borderColor,
                    'shadow-md hover:shadow-xl',
                    'hover:border-opacity-100',
                    'transition-all duration-300',
                    'flex flex-col overflow-hidden group',
                    locked ? 'cursor-not-allowed' : 'cursor-pointer',
                    disabled && !locked && 'opacity-50 cursor-not-allowed',
                )}
            >
                <div
                    className={cn(
                        'relative z-10 flex flex-col h-full',
                        locked && lockedDimmed && 'opacity-80 saturate-[0.85]',
                    )}
                >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div
                            className={cn(
                                'p-2 sm:p-3 rounded-xl transition-all duration-300',
                                'group-hover:scale-105 origin-center',
                                iconBgColor,
                            )}
                        >
                            <Icon
                                className={cn(
                                    'w-5 h-5 md:w-8 md:h-8',
                                    iconColor,
                                )}
                            />
                        </div>

                        <TrainingModeTooltip
                            content={mode.detailedDescription}
                            variant={variant}
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-center min-h-0">
                        <AutoScrollText
                            className={cn(
                                'text-lg sm:text-xl font-bold mb-1 sm:mb-2',
                                'text-gray-900 transition-all duration-300',
                                'group-hover:scale-105 origin-center',
                            )}
                        >
                            {mode.title}
                        </AutoScrollText>
                        <AutoScrollText
                            className={cn(
                                'text-sm text-gray-600 transition-all duration-300',
                                'group-hover:scale-105 origin-center',
                            )}
                            maxLinesMobile={3}
                            maxLinesDesktop={2}
                        >
                            {mode.shortDescription}
                        </AutoScrollText>
                    </div>
                </div>
            </div>
        );

        return card;
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                'relative aspect-square rounded-2xl p-4 sm:p-6',
                'bg-gradient-to-br',
                mode.gradient,
                'shadow-lg hover:shadow-2xl',
                'transition-all duration-300',
                'flex flex-col overflow-hidden group',
                locked ? 'cursor-not-allowed' : 'cursor-pointer',
                disabled && !locked && 'opacity-50 cursor-not-allowed',
            )}
        >
            {mode.backgroundPattern && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.15]"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${mode.backgroundPattern})`,
                        backgroundSize: '40%',
                        backgroundPosition: '0 0',
                        backgroundRepeat: 'repeat',
                    }}
                />
            )}

            <div
                className={cn(
                    'relative z-10 flex flex-col h-full',
                    locked && lockedDimmed && 'opacity-80 saturate-[0.85]',
                )}
            >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-105 origin-center">
                        <Icon className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>

                    <TrainingModeTooltip content={mode.detailedDescription} />
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-0 text-white">
                    <AutoScrollText className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 transition-all duration-300 group-hover:scale-105 origin-center">
                        {mode.title}
                    </AutoScrollText>
                    <AutoScrollText
                        className="text-sm text-white/90 transition-all duration-300 group-hover:scale-105 origin-center"
                        maxLinesMobile={3}
                        maxLinesDesktop={2}
                    >
                        {mode.shortDescription}
                    </AutoScrollText>
                </div>
            </div>
        </div>
    );
}
