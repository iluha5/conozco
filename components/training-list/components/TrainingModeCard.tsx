import { TrainingModeConfig } from '../types/typing';
import { TrainingModeTooltip } from './TrainingModeTooltip';
import { Ellipsis } from '@/components/ui/ellipsis';

interface TrainingModeCardProps {
    mode: TrainingModeConfig;
    onClick: () => void;
    disabled?: boolean;
}

export function TrainingModeCard({
    mode,
    onClick,
    disabled = false,
}: TrainingModeCardProps) {
    const Icon = mode.icon;

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                relative aspect-square rounded-2xl p-6
                bg-gradient-to-br ${mode.gradient}
                shadow-lg hover:shadow-2xl
                transition-all duration-300
                cursor-pointer
                flex flex-col
                overflow-hidden
                group
                ${disabled && 'opacity-50 cursor-not-allowed'}
            `}
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

            <div className="relative z-10 flex items-start justify-between mb-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-105 origin-center">
                    <Icon className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>

                <TrainingModeTooltip content={mode.detailedDescription} />
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center text-white">
                <Ellipsis className="text-xl font-bold mb-1 sm:mb-2 transition-all duration-300 group-hover:scale-105 origin-center">
                    {mode.title}
                </Ellipsis>
                <Ellipsis
                    className="text-sm text-white/90 transition-all duration-300 group-hover:scale-105 origin-center"
                    maxLinesMobile={3}
                    maxLinesDesktop={2}
                >
                    {mode.shortDescription}
                </Ellipsis>
            </div>
        </div>
    );
}
