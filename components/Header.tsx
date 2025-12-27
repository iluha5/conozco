'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
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
import { MobileSidebar } from './MobileSidebar';
import { NavigationLink } from './Header/components/NavigationLink';

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
    const pathname = usePathname();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const isHomePage = pathname === '/';

    if (status === 'loading') {
        return <HeaderSkeleton />;
    }

    // Показываем Header для незарегистрированных пользователей только на главной странице
    if (!session && !isHomePage) {
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
                        conozco
                    </Link>

                    {/* Desktop version */}
                    <nav className="hidden lg:flex items-center justify-between gap-4 w-full">
                        {session ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <NavigationLink
                                        href="/training/list"
                                        icon={Activity}
                                        className="mr-6"
                                    >
                                        Тренировка
                                    </NavigationLink>
                                    <NavigationLink
                                        href="/words"
                                        icon={BookOpen}
                                        className="mr-6"
                                    >
                                        Слова
                                    </NavigationLink>
                                    <NavigationLink
                                        href="/word-groups"
                                        icon={Layers}
                                        className="mr-6"
                                    >
                                        Группы слов
                                    </NavigationLink>
                                    <NavigationLink
                                        href="/settings"
                                        icon={Settings}
                                    >
                                        Настройки
                                    </NavigationLink>
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
                                            signOut({
                                                callbackUrl: '/auth/login',
                                            })
                                        }
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Выйти
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-end gap-4 w-full">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Войти
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Регистрация</Button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile hamburger menu */}
                    <div className="lg:hidden">
                        {session ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileSidebarOpen(true)}
                            >
                                <Menu className="w-6 h-6" />
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        Войти
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Регистрация</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {session && (
                <MobileSidebar
                    isOpen={isMobileSidebarOpen}
                    onClose={() => setIsMobileSidebarOpen(false)}
                    session={session}
                />
            )}
        </>
    );
}
