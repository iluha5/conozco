import type { Metadata } from 'next';
import { Inter, Ubuntu } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TrainingWordsProvider } from '@/contexts/training-words-context';
import { TranslationProvider } from '@/lib/i18n';
import { getStaticResources } from '@/lib/i18n/utils/getStaticResources';
import { getUserInterfaceLanguage } from '@/lib/i18n/utils/getUserInterfaceLanguage';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const ubuntu = Ubuntu({
    weight: ['400', '500', '700'],
    subsets: ['latin', 'cyrillic'],
    variable: '--font-ubuntu',
});

export const metadata: Metadata = {
    title: 'Conozco - Изучение иностранных слов',
    description: 'Приложение для изучения английского и испанского языков',
};

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
                            </TrainingWordsProvider>
                        </QueryProvider>
                    </TranslationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
