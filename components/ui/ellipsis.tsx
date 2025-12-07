'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface EllipsisProps {
    children: string;
    className?: string;
    maxLines?: number;
    maxLinesMobile?: number;
    maxLinesDesktop?: number;
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

    const getResponsiveLineClampClass = (
        mobile: number,
        desktop: number,
    ): string => {
        if (mobile !== desktop) {
            return `line-clamp-${mobile} md:line-clamp-${desktop}`;
        }

        return `line-clamp-${mobile}`;
    };

    const getSingleLineClampClass = (lines: number): string => {
        return `line-clamp-${lines}`;
    };

    let lineClampClass = '';

    if (maxLinesMobile !== undefined && maxLinesDesktop !== undefined) {
        lineClampClass = getResponsiveLineClampClass(
            maxLinesMobile,
            maxLinesDesktop,
        );
    } else {
        lineClampClass = getSingleLineClampClass(maxLines);
    }

    const content = (
        <div ref={textRef} className={`${lineClampClass} ${className}`}>
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
