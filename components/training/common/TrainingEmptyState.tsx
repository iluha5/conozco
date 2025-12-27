'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export function TrainingEmptyState() {
    const { t } = useTranslation();

    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-gray-600">
                    {t('No words for training. Add words to dictionary!')}
                </p>
                <div className="flex justify-center mt-4">
                    <Link href="/words">
                        <Button>{t('Go to words')}</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
