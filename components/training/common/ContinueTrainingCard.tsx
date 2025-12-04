import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';
import { SavedTrainingState } from '@/types/training.types';
import { formatDate } from './helpers/formatDate';

interface ContinueTrainingCardProps {
    savedState: SavedTrainingState;
    onContinue: () => void;
    loading?: boolean;
}

export function ContinueTrainingCard({
    savedState,
    onContinue,
    loading = false,
}: ContinueTrainingCardProps) {
    const completedStages = savedState.stagesProgress.filter(
        sp => sp.status === 'completed',
    ).length;
    const totalStages = savedState.enabledStages.length;
    const progress = Math.round((completedStages / totalStages) * 100);

    const circumference = 2 * Math.PI * 36;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card className="border-purple-300 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-6">
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-24 h-24 md:w-28 md:h-28">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="36"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="36"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out"
                            />
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl font-bold text-purple-700">
                                {progress}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-purple-700 text-lg md:text-xl mb-2">
                            <PlayCircle className="w-5 h-5 flex-shrink-0" />
                            <span>Незаконченная тренировка</span>
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs md:text-sm text-gray-700 border border-purple-200">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                    {formatDate(savedState.lastUpdatedAt)}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs md:text-sm text-gray-700 border border-purple-200">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{savedState.totalWords} слов</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs md:text-sm text-purple-700 border border-purple-300 font-medium">
                                <span>
                                    {completedStages} из {totalStages} этапов
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onContinue}
                        className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                        loading={loading}
                        size="lg"
                    >
                        {!loading && <PlayCircle className="w-4 h-4 mr-2" />}
                        Продолжить тренировку
                    </Button>
                </div>
            </div>
        </Card>
    );
}
