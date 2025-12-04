import { useCallback, useRef, useState } from 'react';
import { SwipeDirection } from '../typing';

interface SwipeState {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isSwiping: boolean;
}

const SWIPE_THRESHOLD = 50; // Минимальное смещение для активации свайпа
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Минимальная скорость для быстрого свайпа

/**
 * Хук для обработки свайпов на мобильных устройствах
 */
export function useSwipeGesture(
    onSwipe: (_direction: SwipeDirection) => void,
    options?: {
        threshold?: number;
        preventDefault?: boolean;
    },
) {
    const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
    const startTimeRef = useRef<number>(0);
    const threshold = options?.threshold || SWIPE_THRESHOLD;
    const preventDefault = options?.preventDefault ?? true;

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (preventDefault) {
                e.preventDefault();
            }

            const touch = e.touches[0];
            const startTime = Date.now();
            startTimeRef.current = startTime;

            setSwipeState({
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                isSwiping: false,
            });

            setSwipeOffset({ x: 0, y: 0 });
        },
        [preventDefault],
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!swipeState) return;

            if (preventDefault) {
                e.preventDefault();
            }

            const touch = e.touches[0];
            const deltaX = touch.clientX - swipeState.startX;
            const deltaY = touch.clientY - swipeState.startY;

            setSwipeState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    isSwiping: Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10,
                };
            });

            setSwipeOffset({ x: deltaX, y: deltaY });
        },
        [swipeState, preventDefault],
    );

    const handleTouchEnd = useCallback(() => {
        if (!swipeState) return;

        const deltaX = swipeState.currentX - swipeState.startX;
        const deltaY = swipeState.currentY - swipeState.startY;
        const deltaTime = Date.now() - startTimeRef.current;
        const velocityX = Math.abs(deltaX) / deltaTime;
        const velocityY = Math.abs(deltaY) / deltaTime;

        // Определяем направление свайпа
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Проверяем, достаточно ли смещение или скорости
        const isSwipeX =
            absX > threshold || velocityX > SWIPE_VELOCITY_THRESHOLD;
        const isSwipeY =
            absY > threshold || velocityY > SWIPE_VELOCITY_THRESHOLD;

        if (isSwipeX && absX > absY) {
            // Горизонтальный свайп
            if (deltaX > 0) {
                onSwipe('right');
            } else {
                onSwipe('left');
            }
        } else if (isSwipeY && absY > absX) {
            // Вертикальный свайп вниз
            if (deltaY > 0) {
                onSwipe('down');
            }
        }

        // Сбрасываем состояние
        setSwipeState(null);
        setSwipeOffset({ x: 0, y: 0 });
    }, [swipeState, threshold, onSwipe]);

    return {
        swipeOffset,
        isSwiping: swipeState?.isSwiping || false,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}
