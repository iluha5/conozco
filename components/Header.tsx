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
} from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';

function HeaderSkeleton() {
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo skeleton */}
                <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />

                {/* Desktop version skeleton */}
                <div className="hidden lg:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Mobile hamburger skeleton */}
                <div className="lg:hidden">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </header>
    );
}

export function Header() {
    const { data: session, status } = useSession();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    if (status === 'loading') {
        return <HeaderSkeleton />;
    }

    if (!session) {
        return null;
    }

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
                        Flash Cards
                    </Link>

                    {/* Desktop version */}
                    <nav className="hidden lg:flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/training/list"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative group mr-6"
                            >
                                <Activity className="w-4 h-4" />
                                Тренировка
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                            </Link>
                            <Link
                                href="/words"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative group mr-6"
                            >
                                <BookOpen className="w-4 h-4" />
                                Слова
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                            </Link>
                            <Link
                                href="/word-groups"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative group mr-6"
                            >
                                <Layers className="w-4 h-4" />
                                Группы слов
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative group"
                            >
                                <Settings className="w-4 h-4" />
                                Настройки
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center justify-end gap-6">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700">
                                    {session.user?.email}
                                </span>
                                {session.user?.role === 'ADMIN' && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    signOut({ callbackUrl: '/auth/login' })
                                }
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Выйти
                            </Button>
                        </div>
                    </nav>

                    {/* Mobile hamburger menu */}
                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                session={session}
            />
        </>
    );
}
