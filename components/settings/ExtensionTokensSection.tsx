'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast, useHashDialog } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import type { ExtensionTokenListItem } from '@/lib/extension/serializeExtensionToken';
import { RevokeExtensionTokenDialog } from './RevokeExtensionTokenDialog';
import { Loader2 } from 'lucide-react';

function formatTokenDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function ExtensionTokensSection() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { open: isRevokeDialogOpen, setOpen: setRevokeDialogOpen } =
        useHashDialog('settings-extension-revoke-token');

    const [tokens, setTokens] = useState<ExtensionTokenListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const [tokenToRevoke, setTokenToRevoke] =
        useState<ExtensionTokenListItem | null>(null);

    const loadTokens = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/extension/auth/tokens');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || t('Failed to load extension tokens'),
                );
            }

            setTokens(data.items ?? []);
        } catch (error) {
            toast({
                title: t('Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('Failed to load extension tokens'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        loadTokens();
    }, [loadTokens]);

    const handleOpenRevokeDialog = (token: ExtensionTokenListItem) => {
        setTokenToRevoke(token);
        setRevokeDialogOpen(true);
    };

    const handleRevokeToken = async () => {
        if (!tokenToRevoke) {
            return;
        }

        setRevoking(true);

        try {
            const response = await fetch('/api/extension/auth/token', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId: tokenToRevoke.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('Failed to revoke token'));
            }

            setRevokeDialogOpen(false);
            setTokenToRevoke(null);
            await loadTokens();

            toast({
                title: t('Success'),
                description: t('Extension token revoked'),
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: t('Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('Failed to revoke token'),
                variant: 'destructive',
            });
        } finally {
            setRevoking(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('Browser extension')}</CardTitle>
                    <CardDescription>
                        {t(
                            'Manage API tokens used by the Conozco Chrome extension. Revoked tokens stop working immediately.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('Loading...')}
                        </div>
                    ) : tokens.length === 0 ? (
                        <p className="text-sm text-gray-600">
                            {t('No extension tokens yet.')}{' '}
                            <Link
                                href="/auth/extension-connect"
                                className="underline"
                            >
                                {t('Connect extension')}
                            </Link>
                        </p>
                    ) : (
                        <div className="max-h-[260px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50/60 p-2">
                            <ul className="space-y-2">
                                {tokens.map(token => (
                                    <li
                                        key={token.id}
                                        className="rounded-md border border-gray-200 bg-white p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {token.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {t('Prefix')}:{' '}
                                                    {token.tokenPrefix}…{' · '}
                                                    {t('Created')}:{' '}
                                                    {formatTokenDate(
                                                        token.createdAt,
                                                    )}
                                                    {token.lastUsedAt && (
                                                        <>
                                                            {' · '}
                                                            {t(
                                                                'Last used',
                                                            )}:{' '}
                                                            {formatTokenDate(
                                                                token.lastUsedAt,
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                                <p className="text-xs">
                                                    {token.isActive ? (
                                                        <span className="text-green-700">
                                                            {t('Active')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            {t('Revoked')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {token.isActive && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="shrink-0"
                                                    onClick={() =>
                                                        handleOpenRevokeDialog(
                                                            token,
                                                        )
                                                    }
                                                >
                                                    {t('Revoke')}
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        <Link href="/auth/extension-connect">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                {t('Connect extension')}
                            </Button>
                        </Link>
                        <Link href="/extension">
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto"
                            >
                                {t('About Chrome extension')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <RevokeExtensionTokenDialog
                open={isRevokeDialogOpen}
                onOpenChange={setRevokeDialogOpen}
                onConfirm={handleRevokeToken}
                tokenName={tokenToRevoke?.name ?? ''}
                revoking={revoking}
            />
        </>
    );
}
