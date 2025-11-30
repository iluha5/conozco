import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WordsList } from '@/components/WordList/WordList';
import { ArrowLeft } from 'lucide-react';
import { Word } from '@/types/training.types';

interface TrainingResultsProps {
    completedWords: Word[];
    onReload: () => Promise<void>;
    onStartNew: () => void;
}

export function TrainingResults({
    completedWords,
    onReload,
    onStartNew,
}: TrainingResultsProps) {
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Главная
                    </Button>
                </Link>
                <Button onClick={onStartNew}>Новая тренировка</Button>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Тренировка завершена!
                </h1>
                <p className="text-md text-gray-600">
                    Все слова отмечены как выученные. Вы можете изменить их
                    статус ниже.
                </p>
            </div>

            <WordsList
                words={completedWords}
                onWordsChange={onReload}
                showBulkActions={true}
                emptyMessage="Слова не найдены"
            />
        </>
    );
}
