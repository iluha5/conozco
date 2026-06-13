'use client';

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    type CSSProperties,
    type ElementType,
} from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AutoScrollTextProps {
    children: string;
    className?: string;
    maxLines?: number;
    maxLinesMobile?: number;
    maxLinesDesktop?: number;
    as?: 'div' | 'h3' | 'p';
}

type ScrollAxis = 'x' | 'y';

interface ScrollState {
    overflowing: boolean;
    axis: ScrollAxis | null;
    distance: number;
    duration: number;
    clipHeight?: number;
}

const INITIAL_SCROLL_STATE: ScrollState = {
    overflowing: false,
    axis: null,
    distance: 0,
    duration: 4,
};

const SCROLL_SPEED_PX_PER_SEC = 30;
const MIN_CYCLE_DURATION_SEC = 4;
const OVERFLOW_THRESHOLD_PX = 4;
const MD_BREAKPOINT_QUERY = '(min-width: 768px)';

function measureVerticalScrollDistance(
    container: HTMLElement,
    content: HTMLElement,
    clipHeight: number,
): number {
    const savedMaxHeight = container.style.maxHeight;
    container.style.maxHeight = `${clipHeight}px`;
    void container.offsetHeight;

    const distance = Math.ceil(content.scrollHeight) - container.clientHeight;

    container.style.maxHeight = savedMaxHeight;

    return distance;
}

function getScrollDuration(distance: number): number {
    return Math.max(
        MIN_CYCLE_DURATION_SEC,
        distance / SCROLL_SPEED_PX_PER_SEC + 3,
    );
}

function getEffectiveMaxLines(
    maxLines: number,
    maxLinesMobile?: number,
    maxLinesDesktop?: number,
): number {
    if (maxLinesMobile !== undefined && maxLinesDesktop !== undefined) {
        return window.matchMedia(MD_BREAKPOINT_QUERY).matches
            ? maxLinesDesktop
            : maxLinesMobile;
    }

    return maxLines;
}

function getLineHeightPx(content: HTMLElement): number {
    const lineHeight = parseFloat(getComputedStyle(content).lineHeight);

    if (!Number.isNaN(lineHeight) && lineHeight > 0) {
        return lineHeight;
    }

    return content.offsetHeight || content.scrollHeight;
}

export function AutoScrollText({
    children,
    className = '',
    maxLines = 1,
    maxLinesMobile,
    maxLinesDesktop,
    as: Component = 'div',
}: AutoScrollTextProps) {
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLSpanElement>(null);
    const [scrollState, setScrollState] =
        useState<ScrollState>(INITIAL_SCROLL_STATE);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const measureOverflow = useCallback(() => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) {
            return;
        }

        const effectiveMaxLines = getEffectiveMaxLines(
            maxLines,
            maxLinesMobile,
            maxLinesDesktop,
        );
        const lineHeight = getLineHeightPx(content);
        const clipHeight = Math.ceil(lineHeight * effectiveMaxLines);
        const containerWidth = Math.floor(container.clientWidth);
        const contentWidth = Math.ceil(content.scrollWidth);

        const verticalDistance = measureVerticalScrollDistance(
            container,
            content,
            clipHeight,
        );

        if (verticalDistance > OVERFLOW_THRESHOLD_PX) {
            setScrollState({
                overflowing: true,
                axis: 'y',
                distance: verticalDistance,
                duration: getScrollDuration(verticalDistance),
                clipHeight,
            });
            return;
        }

        const horizontalDistance = contentWidth - containerWidth;

        if (horizontalDistance > OVERFLOW_THRESHOLD_PX) {
            setScrollState({
                overflowing: true,
                axis: 'x',
                distance: horizontalDistance,
                duration: getScrollDuration(horizontalDistance),
            });
            return;
        }

        setScrollState(INITIAL_SCROLL_STATE);
    }, [maxLines, maxLinesMobile, maxLinesDesktop]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        setPrefersReducedMotion(mediaQuery.matches);

        function handleMotionPreferenceChange(event: MediaQueryListEvent) {
            setPrefersReducedMotion(event.matches);
        }

        mediaQuery.addEventListener('change', handleMotionPreferenceChange);

        return () => {
            mediaQuery.removeEventListener(
                'change',
                handleMotionPreferenceChange,
            );
        };
    }, []);

    useEffect(() => {
        measureOverflow();

        const container = containerRef.current;
        const content = contentRef.current;

        if (!container) {
            return;
        }

        const resizeObserver = new ResizeObserver(measureOverflow);
        resizeObserver.observe(container);

        if (content) {
            resizeObserver.observe(content);
        }

        window.addEventListener('resize', measureOverflow);

        const mdMediaQuery = window.matchMedia(MD_BREAKPOINT_QUERY);
        mdMediaQuery.addEventListener('change', measureOverflow);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', measureOverflow);
            mdMediaQuery.removeEventListener('change', measureOverflow);
        };
    }, [children, measureOverflow]);

    const shouldAnimate = scrollState.overflowing && !prefersReducedMotion;
    const showTooltip = scrollState.overflowing && prefersReducedMotion;

    const scrollStyle = shouldAnimate
        ? ({
              '--scroll-distance': `${scrollState.distance}px`,
              '--scroll-duration': `${scrollState.duration}s`,
          } as CSSProperties)
        : undefined;

    const scrollAnimationClass =
        shouldAnimate && scrollState.axis === 'y'
            ? 'animate-auto-scroll-y'
            : shouldAnimate && scrollState.axis === 'x'
              ? 'animate-auto-scroll-x'
              : undefined;

    const TypedComponent = Component as ElementType;

    const containerStyle: CSSProperties | undefined =
        scrollState.overflowing &&
        scrollState.axis === 'y' &&
        scrollState.clipHeight
            ? { maxHeight: `${scrollState.clipHeight}px` }
            : undefined;

    const content = (
        <TypedComponent
            ref={containerRef}
            style={containerStyle}
            className={cn(
                scrollState.overflowing && 'overflow-hidden',
                shouldAnimate && 'hover:[&>span]:[animation-play-state:paused]',
                className,
            )}
        >
            <span
                ref={contentRef}
                style={scrollStyle}
                className={cn('block', scrollAnimationClass)}
            >
                {children}
            </span>
        </TypedComponent>
    );

    if (!showTooltip) {
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
