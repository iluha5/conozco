'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { EXTENSION_GITHUB_URL, getExtensionStoreUrl } from '@/config/extension';
import { ExternalLink, MousePointerClick, Link2 } from 'lucide-react';
import { ExtensionPlusIcon } from './ExtensionPlusIcon';

export function ExtensionPageContent() {
    const { data: session } = useSession();
    const { t } = useTranslation();
    const storeUrl = getExtensionStoreUrl();

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('Conozco Chrome Extension')}
                </h1>
                <p className="text-lg text-gray-700">
                    {t(
                        'Add words to your vocabulary while browsing any website. Select text, click ',
                    )}
                    <ExtensionPlusIcon />
                    {t(', and the word appears in your Conozco dictionary.')}
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('How it works')}</CardTitle>
                    <CardDescription>
                        {t('Three simple steps to save words from the web')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <MousePointerClick className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <p className="text-gray-700">
                            {t(
                                'Select a word or short phrase (up to 100 characters) on any webpage',
                            )}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ExtensionPlusIcon size="step" className="mt-0.5" />
                        <p className="text-gray-700">
                            {t(
                                'Click the floating button next to your selection',
                            )}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <p className="text-gray-700">
                            {t(
                                'The word is looked up, translated if needed, and added to your personal dictionary in Conozco',
                            )}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('Install')}</CardTitle>
                    <CardDescription>
                        {t('Available for Google Chrome')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                    {storeUrl ? (
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
                    ) : (
                        <p className="text-sm text-gray-600">
                            {t(
                                'Chrome Web Store listing is not available yet. Install from source using the GitHub repository.',
                            )}
                        </p>
                    )}
                    <a
                        href={EXTENSION_GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full sm:w-auto">
                            {t('View source on GitHub')}
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </a>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Connect your account')}</CardTitle>
                    <CardDescription>
                        {t(
                            'After installing the extension, authorize it with your Conozco account to start adding words.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {session ? (
                        <Link href="/auth/extension-connect">
                            <Button>{t('Connect extension')}</Button>
                        </Link>
                    ) : (
                        <p className="text-sm text-gray-700">
                            <Link href="/auth/login" className="underline">
                                {t('Log in')}
                            </Link>
                            {t(
                                ' or create an account, then return here to connect the extension.',
                            )}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
