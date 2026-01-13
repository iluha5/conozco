'use client';

import { cn } from '@/lib/utils';
import circuitBoardPattern from '../images/patterns/circuit-board.svg';
import floatingCogsPattern from '../images/patterns/floating-cogs.svg';

interface CardSideProps {
    children: React.ReactNode;
    variant: 'front' | 'back';
}

/**
 * Вариант 1: Градиентные фоны
 */
export function GradientCardSide({ children, variant }: CardSideProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 flex items-center justify-center p-8 rounded-lg',
                variant === 'front'
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
                    : 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50',
            )}
        >
            {children}
        </div>
    );
}

/**
 * Вариант 2: Текстурированные фоны с узорами
 */
export function PatternCardSide({ children, variant }: CardSideProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 flex items-center justify-center p-8 rounded-lg relative overflow-hidden',
                variant === 'front' ? 'bg-blue-50' : 'bg-pink-50',
            )}
        >
            {/* Узор */}
            <div
                className={cn(
                    'absolute inset-0 opacity-10',
                    variant === 'front'
                        ? 'bg-[radial-gradient(circle_at_1px_1px,_rgb(59,130,246)_1px,_transparent_0)] [background-size:20px_20px]'
                        : 'bg-[radial-gradient(circle_at_1px_1px,_rgb(236,72,153)_1px,_transparent_0)] [background-size:20px_20px]',
                )}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/**
 * Фоны с паттернами из изображений
 * circuit-board для слова (front), floating-cogs для перевода (back)
 */
export function WatermarkCardSide({ children, variant }: CardSideProps) {
    // Select pattern based on card side
    const selectedPattern =
        variant === 'front' ? circuitBoardPattern : floatingCogsPattern;

    // Get pattern URL (Next.js may import SVG differently)
    const getPatternUrl = () => {
        if (typeof selectedPattern === 'string') {
            return selectedPattern;
        }
        // Check different SVG import options in Next.js
        const pattern = selectedPattern as any;
        return pattern?.src || pattern?.default || pattern;
    };

    const patternUrl = getPatternUrl();

    return (
        <div
            className={cn(
                'absolute inset-0 rounded-lg relative overflow-hidden',
                variant === 'front'
                    ? 'bg-gradient-to-br from-slate-50 to-blue-50'
                    : 'bg-gradient-to-br from-rose-50 to-pink-50',
            )}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Паттерн как фоновое изображение - уменьшен и повторяется */}
            {patternUrl && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${patternUrl})`,
                        backgroundSize: '20%',
                        backgroundPosition: '0 0',
                        backgroundRepeat: 'repeat',
                    }}
                />
            )}
            {/* Текст по центру */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                {children}
            </div>
        </div>
    );
}
