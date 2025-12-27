import { useState, useEffect, useRef } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingModeTooltipProps {
    content: string;
    variant?: 'default' | 'learned';
}

export function TrainingModeTooltip({
    content,
    variant = 'default',
}: TrainingModeTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkIfDesktop();
        window.addEventListener('resize', checkIfDesktop);

        return () => {
            window.removeEventListener('resize', checkIfDesktop);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleTooltipClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsOpen(false);
    };

    const handleMouseEnter = () => {
        if (isDesktop) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (isDesktop) {
            setIsOpen(false);
        }
    };

    return (
        <div ref={tooltipRef}>
            <TooltipProvider delayDuration={0}>
                <Tooltip open={isOpen}>
                    <TooltipTrigger asChild>
                        <button
                            className={cn(
                                'p-1 rounded-full transition-colors',
                                variant === 'learned'
                                    ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                    : 'hover:bg-white/20 text-white',
                            )}
                            onClick={handleClick}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent
                        className="max-w-xs whitespace-pre-line"
                        onClick={handleTooltipClick}
                    >
                        <p>{content}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
