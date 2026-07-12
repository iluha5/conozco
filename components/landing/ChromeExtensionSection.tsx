'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { getExtensionStoreUrl } from '@/config/extension';
import { ExternalLink, Puzzle } from 'lucide-react';

export function ChromeExtensionSection() {
    const { t } = useTranslation();
    const storeUrl = getExtensionStoreUrl();

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-3xl rounded-2xl border border-purple-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                    <Puzzle className="h-8 w-8 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('Chrome Extension')}
                    </h2>
                </div>
                <p className="mb-6 text-gray-700">
                    {t(
                        'Save words from any webpage. Highlight text on any site and add it to your dictionary instantly.',
                    )}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    {storeUrl && (
                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="w-full sm:w-auto">
                                {t('Add to Chrome')}
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                    )}
                    <Link href="/extension">
                        <Button
                            variant={storeUrl ? 'outline' : 'default'}
                            className="w-full sm:w-auto"
                        >
                            {t('Learn more')}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
