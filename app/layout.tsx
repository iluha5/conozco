import type { Metadata, Viewport } from 'next';
import { Inter, Ubuntu } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TrainingWordsProvider } from '@/contexts/training-words-context';
import { TranslationProvider } from '@/lib/i18n';
import { getStaticResources } from '@/lib/i18n/utils/getStaticResources';
import { getUserInterfaceLanguage } from '@/lib/i18n/utils/getUserInterfaceLanguage';
import { tServerSync } from '@/lib/i18n';
import { CookieConsent } from '@/components/cookie-consent/CookieConsent';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const ubuntu = Ubuntu({
    weight: ['400', '500', '700'],
    subsets: ['latin', 'cyrillic'],
    variable: '--font-ubuntu',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
    const userLanguage = await getUserInterfaceLanguage();
    const defaultLanguage = userLanguage || 'en';

    const title = tServerSync(
        'Conozco - Learning foreign words',
        defaultLanguage,
    );
    const description = tServerSync(
        'Application for learning English and Spanish',
        defaultLanguage,
    );

    return {
        title,
        description,
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const userLanguage = await getUserInterfaceLanguage();
    const defaultLanguage = userLanguage || 'en';

    return (
        <html lang={defaultLanguage} suppressHydrationWarning>
            <body
                className={`${inter.className} ${ubuntu.variable}`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <TranslationProvider
                        dictionary={getStaticResources()}
                        lang={defaultLanguage}
                    >
                        <QueryProvider>
                            <TrainingWordsProvider>
                                {children}
                                <Toaster />
                                <CookieConsent />
                                <GoogleAnalytics />
                            </TrainingWordsProvider>
                        </QueryProvider>
                    </TranslationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
