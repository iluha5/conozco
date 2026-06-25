'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const TrainingList = dynamic(
    () =>
        import('@/components/training-list/TrainingList').then(module => ({
            default: module.TrainingList,
        })),
    {
        loading: function TrainingListLoading() {
            return (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            );
        },
    },
);

export default function TrainingListPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('To home')}
                            </Button>
                        </Link>
                    </div>

                    <TrainingList />
                </div>
            </div>
        </div>
    );
}
