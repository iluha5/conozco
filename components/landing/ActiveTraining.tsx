'use client';

import { PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActiveTrainingProps {
    content: {
        title: string;
        placeholder: string;
    };
}

export function ActiveTraining({ content }: ActiveTrainingProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-green-600" />
                    {content.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500">{content.placeholder}</p>
            </CardContent>
        </Card>
    );
}

