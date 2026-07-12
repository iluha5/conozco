'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/shared';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type ExtensionConnectPanelProps = {
    userEmail: string;
};

type ConnectStatus = 'idle' | 'connecting' | 'success' | 'error';

const EXTENSION_AUTH_MESSAGE_TYPE = 'AUTH_TOKEN';

function getExtensionId(): string | null {
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID?.trim();
    return extensionId || null;
}

function sendTokenToExtension(
    extensionId: string,
    token: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const chromeRuntime = (
            globalThis as typeof globalThis & {
                chrome?: {
                    runtime?: {
                        sendMessage: (
                            _targetExtensionId: string,
                            _message: { type: string; token: string },
                            _callback?: (_response: unknown) => void,
                        ) => void;
                        lastError?: { message?: string };
                    };
                };
            }
        ).chrome?.runtime;

        if (!chromeRuntime?.sendMessage) {
            reject(
                new Error(
                    'Chrome extension API is not available. Open this page in Google Chrome with the Conozco extension installed.',
                ),
            );
            return;
        }

        chromeRuntime.sendMessage(
            extensionId,
            { type: EXTENSION_AUTH_MESSAGE_TYPE, token },
            () => {
                const lastError = chromeRuntime.lastError;
                if (lastError?.message) {
                    reject(new Error(lastError.message));
                    return;
                }

                resolve();
            },
        );
    });
}

export function ExtensionConnectPanel({
    userEmail,
}: ExtensionConnectPanelProps) {
    const [status, setStatus] = useState<ConnectStatus>('idle');
    const { toast } = useToast();
    const { t } = useTranslation();
    const extensionId = getExtensionId();

    const handleConnectExtension = async () => {
        if (!extensionId) {
            toast({
                title: t('Error'),
                description: t('Extension is not configured on the server yet'),
                variant: 'destructive',
            });
            return;
        }

        setStatus('connecting');

        try {
            const response = await fetch('/api/extension/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: 'Chrome Extension' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('Failed to connect extension'));
            }

            await sendTokenToExtension(extensionId, data.token);

            setStatus('success');
            toast({
                title: t('Success'),
                description: t('Chrome extension connected successfully'),
            });
        } catch (error) {
            console.error('Extension connect error:', error);
            setStatus('error');
            toast({
                title: t('Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('Failed to connect extension'),
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto max-w-lg px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Connect Chrome extension')}</CardTitle>
                        <CardDescription>
                            {t(
                                'Link the Conozco extension to your account {{email}}',
                                { email: userEmail },
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {status === 'success' ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>
                                    {t(
                                        'Extension connected. You can close this tab and start adding words.',
                                    )}
                                </span>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleConnectExtension}
                                disabled={
                                    status === 'connecting' || !extensionId
                                }
                                className="w-full"
                            >
                                {status === 'connecting' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('Connecting...')}
                                    </>
                                ) : (
                                    t('Allow extension access')
                                )}
                            </Button>
                        )}

                        {!extensionId && (
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Extension ID is not configured. Set NEXT_PUBLIC_EXTENSION_ID in server environment.',
                                )}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
