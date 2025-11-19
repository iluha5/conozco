import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STAGE_NAMES, TrainingStage } from '@/types/training.types';

interface StageCardProps {
    stage: TrainingStage;
    index: number;
    isActive: boolean;
    onClick: () => void;
}

export function StageCard({ stage, index, isActive, onClick }: StageCardProps) {
    return (
        <Card
            className={cn(
                'cursor-pointer transition-all aspect-square flex flex-col justify-center',
                'w-[50px] md:w-[120px] flex-shrink-0',
                isActive
                    ? 'ring-2 ring-purple-600 bg-purple-50'
                    : 'hover:bg-gray-50',
            )}
            onClick={onClick}
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
                <p className="text-xs text-center text-gray-600">
                    {STAGE_NAMES[stage]}
                </p>
            </CardContent>
        </Card>
    );
}
