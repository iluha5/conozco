'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentTrainingsProps {
    content: {
        title: string;
        emptyState: string;
    };
}

export function RecentTrainings({ content }: RecentTrainingsProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    {content.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500">{content.emptyState}</p>
            </CardContent>
        </Card>
    );
}
