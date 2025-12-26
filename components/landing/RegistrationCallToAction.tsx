'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RegistrationCallToActionProps {
    content: {
        title: string;
        benefits: string[];
        free: string;
        cta: string;
    };
}

export function RegistrationCallToAction({
    content,
}: RegistrationCallToActionProps) {
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    {content.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-2">
                    {content.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                                {benefit}
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="pt-2">
                    <p className="text-sm font-semibold text-purple-700 mb-4">
                        {content.free}
                    </p>
                    <Link href="/auth/register">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                            {content.cta}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

