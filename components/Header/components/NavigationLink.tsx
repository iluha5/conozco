import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface NavigationLinkProps {
    href: string;
    icon: LucideIcon;
    children: ReactNode;
    className?: string;
    showActiveIndicator?: boolean;
}

export function NavigationLink({
    href,
    icon: Icon,
    children,
    className,
    showActiveIndicator = false,
}: NavigationLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative group px-3 py-1.5',
                className,
            )}
        >
            <Icon className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:scale-105" />
            <span className="relative z-10 transition-transform duration-200 flex items-center gap-1.5">
                {children}
                {showActiveIndicator && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
            </span>
            <span className="absolute inset-0 rounded-lg border border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </Link>
    );
}
