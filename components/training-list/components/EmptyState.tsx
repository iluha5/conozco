import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    message: string;
    icon?: LucideIcon;
    className?: string;
}

export function EmptyState({
    message,
    icon: Icon,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('text-center py-8 text-gray-500', className)}>
            {Icon && <Icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />}
            <p>{message}</p>
        </div>
    );
}
