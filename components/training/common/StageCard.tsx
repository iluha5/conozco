import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STAGE_NAMES, TrainingStage } from '@/types/training.types';

interface StageCardProps {
    stage: TrainingStage;
    index: number;
    isActive: boolean;
    status: 'completed' | 'current' | 'pending';
    onClick: () => void;
    disabled?: boolean;
}

export function StageCard({
    stage,
    index,
    isActive,
    status,
    onClick,
    disabled = false,
}: StageCardProps) {
    const getCardStyles = () => {
        if (disabled) {
            return 'ring-2 ring-green-500 bg-green-50 cursor-not-allowed opacity-75';
        }
        if (status === 'completed') {
            return 'ring-2 ring-green-500 bg-green-50 cursor-not-allowed';
        }
        if (isActive) {
            return 'ring-2 ring-purple-600 bg-purple-50';
        }
        return 'hover:bg-gray-50';
    };

    const handleClick = () => {
        if (!disabled && status !== 'completed') {
            onClick();
        }
    };

    return (
        <Card
            className={cn(
                'transition-all aspect-square flex flex-col justify-center relative',
                'w-[50px] md:w-[120px] flex-shrink-0',
                getCardStyles(),
                status !== 'completed' && !disabled && 'cursor-pointer',
            )}
            onClick={handleClick}
        >
            <CardHeader className="flex-1 flex items-center justify-center p-1 md:p-6">
                <CardTitle className="text-center">
                    <span className="md:hidden text-xl font-bold">
                        {index + 1}
                    </span>
                    <span className="hidden md:inline text-sm">
                        Этап {index + 1}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 hidden md:block">
                <p
                    className={cn(
                        'text-xs text-center',
                        status === 'completed'
                            ? 'text-green-700'
                            : 'text-gray-600',
                    )}
                >
                    {STAGE_NAMES[stage]}
                </p>
            </CardContent>
        </Card>
    );
}
