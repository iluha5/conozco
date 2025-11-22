import type { Metadata } from 'next';
import { Inter, Ubuntu } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/SessionProvider';
import { TrainingWordsProvider } from '@/contexts/training-words-context';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const ubuntu = Ubuntu({
    weight: ['400', '500', '700'],
    subsets: ['latin', 'cyrillic'],
    variable: '--font-ubuntu',
});

export const metadata: Metadata = {
    title: 'Flash Cards - Изучение иностранных слов',
    description: 'Приложение для изучения английского и испанского языков',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body
                className={`${inter.className} ${ubuntu.variable}`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <TrainingWordsProvider>
                        {children}
                        <Toaster />
                    </TrainingWordsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
