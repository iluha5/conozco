'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
    LogOut,
    User,
    X,
    Layers,
    BookOpen,
    Settings,
    Activity,
    LogIn,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useTrainingStorage } from '@/hooks/training';

type AppSidebarMode = 'guest' | 'authenticated';

interface AppSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    mode: AppSidebarMode;
    session?: Session;
}

export function AppSidebar({
    isOpen,
    onClose,
    mode,
    session,
}: AppSidebarProps) {
    const { t } = useTranslation();
    const { hasUnfinishedTraining } = useTrainingStorage();

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('app-sidebar');
            if (sidebar && !sidebar.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const showTrainingIndicator =
        mode === 'authenticated' && hasUnfinishedTraining;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />

            <div
                id="app-sidebar"
                className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">{t('Menu')}</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex-1 p-4">
                        <div className="space-y-6">
                            {mode === 'authenticated' && session ? (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {session.user?.name ||
                                                    t('User')}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {session.user?.email}
                                            </div>
                                        </div>
                                    </div>

                                    {session.user?.role === 'ADMIN' && (
                                        <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                            {t('Admin')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <p className="text-sm text-gray-600">
                                        {t(
                                            'Create an account to save your progress and manage your vocabulary',
                                        )}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href="/auth/register-public"
                                            onClick={onClose}
                                        >
                                            <Button className="w-full">
                                                {t('Register')}
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/auth/login"
                                            onClick={onClose}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <LogIn className="w-4 h-4 mr-2" />
                                                {t('Login')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Link
                                    href="/training/list"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 relative pb-1.5 group"
                                >
                                    <Activity className="w-4 h-4" />
                                    <span className="flex items-center gap-1.5">
                                        {t('Training')}
                                        {showTrainingIndicator && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        )}
                                    </span>
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                                </Link>

                                <Link
                                    href="/words"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 relative pb-1.5 group"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    {t('Words')}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                                </Link>

                                <Link
                                    href="/word-groups"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 relative pb-1.5 group"
                                >
                                    <Layers className="w-4 h-4" />
                                    {t('Word groups')}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 relative pb-1.5 group"
                                >
                                    <Settings className="w-4 h-4" />
                                    {t('Settings')}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-200 group-hover:w-full" />
                                </Link>
                            </div>

                            {mode === 'authenticated' && (
                                <div className="space-y-2 mt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            signOut({
                                                callbackUrl: '/auth/login',
                                            })
                                        }
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        {t('Sign out')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
