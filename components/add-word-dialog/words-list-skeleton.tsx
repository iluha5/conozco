/**
 * Скелетон загрузки списка слов
 */

'use client';

import { Card, CardHeader } from '@/components/ui/card';

export function WordsListSkeleton() {
    return (
        <>
            {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gray-300 rounded shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </>
    );
}
