'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    LogOut,
    User,
    Menu,
    Layers,
    BookOpen,
    Settings,
    Activity,
    LogIn,
} from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { NavigationLink } from './Header/components/NavigationLink';
import { useTranslation } from '@/lib/i18n';
import { useTrainingStorage } from '@/hooks/training';

function HeaderSkeleton() {
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />

                <div className="hidden lg:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="lg:hidden">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </header>
    );
}

function handleCloseSidebar(setIsMobileSidebarOpen: (_open: boolean) => void) {
    setIsMobileSidebarOpen(false);
}

export function Header() {
    const { data: session, status } = useSession();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { t } = useTranslation();
    const { hasUnfinishedTraining } = useTrainingStorage();
    const isAuthenticated = !!session;

    if (status === 'loading') {
        return <HeaderSkeleton />;
    }

    const handleMobileMenuOpen = () => {
        setIsMobileSidebarOpen(true);
    };

    const handleMobileMenuClose = () => {
        handleCloseSidebar(setIsMobileSidebarOpen);
    };

    return (
        <>
            <header className="border-b bg-white">
                <div
                    data-test="header-wrapper"
                    className="container mx-auto px-4 py-3 flex items-center justify-between lg:justify-start lg:gap-10"
                >
                    <Link
                        href="/"
                        className="text-xl font-bold text-gray-900 min-w-32"
                    >
                        conozco
                    </Link>

                    {/* Desktop version */}
                    <nav className="hidden lg:flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-4">
                            <NavigationLink
                                href="/training/list"
                                icon={Activity}
                                className="mr-6"
                                showActiveIndicator={
                                    isAuthenticated && hasUnfinishedTraining
                                }
                            >
                                {t('Training')}
                            </NavigationLink>
                            <NavigationLink
                                href="/words"
                                icon={BookOpen}
                                className="mr-6"
                            >
                                {t('Words')}
                            </NavigationLink>
                            <NavigationLink
                                href="/word-groups"
                                icon={Layers}
                                className="mr-6"
                            >
                                {t('Word groups')}
                            </NavigationLink>
                            <NavigationLink href="/settings" icon={Settings}>
                                {t('Settings')}
                            </NavigationLink>
                        </div>

                        <div className="hidden lg:flex items-center justify-end gap-6">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-gray-600" />
                                        <span className="text-gray-700">
                                            {session.user?.email}
                                        </span>
                                        {session.user?.role === 'ADMIN' && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                                {t('Admin')}
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            signOut({
                                                callbackUrl: '/auth/login',
                                            })
                                        }
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {t('Logout')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <Button variant="ghost" size="sm">
                                            <LogIn className="w-4 h-4 mr-2" />
                                            {t('Login')}
                                        </Button>
                                    </Link>
                                    <Link href="/auth/register-public">
                                        <Button size="sm">
                                            {t('Register')}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMobileMenuOpen}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </header>

            <AppSidebar
                isOpen={isMobileSidebarOpen}
                onClose={handleMobileMenuClose}
                mode={isAuthenticated ? 'authenticated' : 'guest'}
                session={session ?? undefined}
            />
        </>
    );
}
