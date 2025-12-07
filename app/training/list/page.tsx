'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { TrainingList } from '@/components/training-list/TrainingList';

export default function TrainingListPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                На главную
                            </Button>
                        </Link>
                    </div>

                    <TrainingList />
                </div>
            </div>
        </div>
    );
}
