import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';
import { SavedTrainingState } from '@/types/training.types';

interface ContinueTrainingCardProps {
    savedState: SavedTrainingState;
    onContinue: () => void;
}

export function ContinueTrainingCard({
    savedState,
    onContinue,
}: ContinueTrainingCardProps) {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} ч. назад`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} дн. назад`;
    };

    const completedStages = savedState.stagesProgress.filter(
        sp => sp.status === 'completed',
    ).length;
    const totalStages = savedState.enabledStages.length;
    const progress = Math.round((completedStages / totalStages) * 100);

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <PlayCircle className="w-5 h-5" />У вас есть незаконченная
                    тренировка
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                                Последнее обновление:{' '}
                                {formatDate(savedState.lastUpdatedAt)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{savedState.totalWords} слов</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Прогресс:</span>
                            <span className="font-medium text-purple-700">
                                {completedStages} из {totalStages} этапов
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onContinue}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Продолжить тренировку
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
