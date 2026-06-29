'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WordsList } from '@/components/WordList/WordList';
import { ArrowLeft } from 'lucide-react';
import { Word } from '@/types/training.types';
import type {
    WordRemoveCallback,
    WordUpdateCallback,
} from '@/components/WordList/typing';
import { useTranslation } from '@/lib/i18n';

interface TrainingResultsProps {
    completedWords: Word[];
    onWordsChange: () => Promise<void>;
    onWordUpdate: WordUpdateCallback;
    onWordRemove: WordRemoveCallback;
}

export function TrainingResults({
    completedWords,
    onWordsChange,
    onWordUpdate,
    onWordRemove,
}: TrainingResultsProps) {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('Home')}
                    </Button>
                </Link>
                <Link href="/training/list">
                    <Button>{t('New training')}</Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 {t('Training completed!')}
                </h1>
                <p className="text-md text-gray-600">
                    {t(
                        'All words are marked as learned. You can change their status below.',
                    )}
                </p>
            </div>

            <WordsList
                words={completedWords}
                onWordsChange={onWordsChange}
                onWordUpdate={onWordUpdate}
                onWordRemove={onWordRemove}
                showBulkActions={true}
                emptyMessage={t('No words found')}
            />
        </>
    );
}
