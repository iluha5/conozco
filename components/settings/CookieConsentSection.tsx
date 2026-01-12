'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function CookieConsentSection() {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Privacy & Cookies')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Link href="/privacy-policy">
                    <Button variant="outline" className="w-full sm:w-auto">
                        {t('View Privacy Policy')}
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
