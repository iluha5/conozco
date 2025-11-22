'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User, X } from 'lucide-react';
import { Session } from 'next-auth';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session;
}

export function MobileSidebar({
    isOpen,
    onClose,
    session,
}: MobileSidebarProps) {
    // Close sidebar when clicking outside or pressing Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar && !sidebar.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />

            {/* Sidebar */}
            <div
                id="mobile-sidebar"
                className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">Меню</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {session.user?.name ||
                                                'Пользователь'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {session.user?.email}
                                        </div>
                                    </div>
                                </div>

                                {session.user?.role === 'ADMIN' && (
                                    <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                        Admin
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        signOut({ callbackUrl: '/auth/login' })
                                    }
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Выйти
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
