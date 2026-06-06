'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EllipsisProps {
    children: string;
    className?: string;
    maxLines?: number;
    maxLinesMobile?: number;
    maxLinesDesktop?: number;
}

const LINE_CLAMP: Record<number, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
};

const LINE_CLAMP_MD: Record<number, string> = {
    1: 'md:line-clamp-1',
    2: 'md:line-clamp-2',
    3: 'md:line-clamp-3',
};

function getLineClampClass(lines: number): string {
    return LINE_CLAMP[lines] ?? LINE_CLAMP[1];
}

function getResponsiveLineClampClass(mobile: number, desktop: number): string {
    if (mobile !== desktop) {
        return cn(
            getLineClampClass(mobile),
            LINE_CLAMP_MD[desktop] ?? LINE_CLAMP_MD[1],
        );
    }

    return getLineClampClass(mobile);
}

export function Ellipsis({
    children,
    className = '',
    maxLines = 1,
    maxLinesMobile,
    maxLinesDesktop,
}: EllipsisProps) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                const element = textRef.current;
                const isTextOverflowing =
                    element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth;
                setIsOverflowing(isTextOverflowing);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => window.removeEventListener('resize', checkOverflow);
    }, [children]);

    let lineClampClass = '';

    if (maxLinesMobile !== undefined && maxLinesDesktop !== undefined) {
        lineClampClass = getResponsiveLineClampClass(
            maxLinesMobile,
            maxLinesDesktop,
        );
    } else {
        lineClampClass = getLineClampClass(maxLines);
    }

    const content = (
        <div ref={textRef} className={cn(lineClampClass, className)}>
            {children}
        </div>
    );

    if (!isOverflowing) {
        return content;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="whitespace-pre-wrap">{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
