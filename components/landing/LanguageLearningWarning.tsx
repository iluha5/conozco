'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LanguageLearningWarningProps {
    content: {
        title: string;
        text: string;
    };
}

export function LanguageLearningWarning({
    content,
}: LanguageLearningWarningProps) {
    return (
        <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-2">
                            {content.title}
                        </h3>
                        <p className="text-sm text-amber-800">{content.text}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
