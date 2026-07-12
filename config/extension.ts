export const EXTENSION_GITHUB_URL =
    'https://github.com/iluha5/conozco-chrome-extension';

export function isExtensionEnabled(): boolean {
    return process.env.NEXT_PUBLIC_EXTENSION_ENABLED === 'true';
}

export function getExtensionStoreUrl(): string | null {
    const storeUrl = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim();
    return storeUrl || null;
}

export function getExtensionId(): string | null {
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID?.trim();
    return extensionId || null;
}
