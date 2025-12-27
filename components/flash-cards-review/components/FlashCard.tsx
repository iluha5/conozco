'use client';

import { useState, useEffect, useMemo } from 'react';
import { getWordText, getWordTranslation } from '../helpers/getWordTranslation';
import { getWordExamples } from '../helpers/getWordExamples';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { SwipeDirection, FlashCardWord } from '../typing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WatermarkCardSide } from './FlashCardBackgrounds';
import { useI18n } from '@/lib/i18n';

interface FlashCardProps {
    word: FlashCardWord;
    onAction: (_action: 'know' | 'dont-know' | 'delete' | 'skip') => void;
    learnLanguageCode: string;
    ownLanguageCode: string;
}

export function FlashCard({
    word,
    onAction,
    learnLanguageCode,
    ownLanguageCode,
}: FlashCardProps) {
    const { language } = useI18n();
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSwipe = (direction: SwipeDirection) => {
        if (isAnimating) return;

        if (direction === 'left') {
            onAction('dont-know');
        } else if (direction === 'right') {
            onAction('know');
        }
        // Свайп вниз убран - используем кнопку удаления
    };

    const { swipeOffset, isSwiping, handlers } = useSwipeGesture(handleSwipe, {
        threshold: 50,
        preventDefault: true,
    });

    const handleFlip = () => {
        if (isAnimating || isSwiping) return;
        setIsAnimating(true);
        setIsFlipped(!isFlipped);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const wordText = getWordText(word);
    const translation = getWordTranslation(word, language || 'en');

    // Получаем до 2 случайных примеров из базы данных
    const examples = useMemo(
        () => getWordExamples(word, ownLanguageCode),
        [word, ownLanguageCode],
    );

    // Автоматически переворачиваем карточку обратно при смене слова, если она была перевернута
    useEffect(() => {
        if (isFlipped && !isAnimating) {
            setIsAnimating(true);
            setIsFlipped(false);
            setTimeout(() => setIsAnimating(false), 600);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [word.id]);

    // Вычисляем transform для свайпа
    const swipeTransform = isSwiping
        ? `translate(${swipeOffset.x}px, ${swipeOffset.y}px) rotate(${
              swipeOffset.x * 0.1
          }deg)`
        : '';

    // Определяем цвет карточки в зависимости от направления свайпа
    const getCardColor = () => {
        if (!isSwiping) return '';
        if (swipeOffset.x < -20) return 'border-red-300 bg-red-50';
        if (swipeOffset.x > 20) return 'border-green-300 bg-green-50';
        return '';
    };

    return (
        <div
            className="w-full h-full relative"
            style={{ perspective: '1000px' }}
        >
            <Card
                className={cn(
                    'relative w-full h-full cursor-pointer',
                    'hover:shadow-lg',
                    getCardColor(),
                )}
                style={{
                    transform: `${swipeTransform} ${
                        isFlipped ? 'rotateY(180deg)' : ''
                    }`,
                    transformStyle: 'preserve-3d',
                    transition: isSwiping ? 'none' : 'transform 0.6s',
                }}
                onClick={handleFlip}
                {...handlers}
            >
                {/* Лицевая сторона - слово на изучаемом языке */}
                <div
                    className={cn('absolute inset-0', isFlipped && 'hidden')}
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}
                >
                    <WatermarkCardSide variant="front">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">
                                {learnLanguageCode.toUpperCase()}
                            </div>
                            <div className="text-4xl font-bold text-gray-900">
                                {wordText}
                            </div>
                            <div className="text-sm text-gray-400 mt-4">
                                Нажмите, чтобы перевернуть
                            </div>
                        </div>
                    </WatermarkCardSide>
                </div>

                {/* Обратная сторона - перевод на родном языке */}
                <div
                    className={cn('absolute inset-0', !isFlipped && 'hidden')}
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <WatermarkCardSide variant="back">
                        <div className="text-center flex flex-col h-full justify-center">
                            <div className="text-sm text-gray-500 mb-2">
                                {ownLanguageCode.toUpperCase()}
                            </div>
                            <div className="text-3xl font-semibold text-gray-900 mb-4">
                                {translation}
                            </div>

                            {/* Примеры предложений */}
                            {examples.length > 0 && (
                                <div className="mt-4 space-y-2.5 max-w-full px-4">
                                    {examples.map((example, exampleIndex) => (
                                        <div
                                            key={exampleIndex}
                                            className="border-l-4 border-gray-400 pl-3 text-left bg-white/50 rounded-r-lg py-2"
                                        >
                                            <p className="text-sm text-gray-700 mb-1 break-words">
                                                {example.example}
                                            </p>
                                            <p className="text-xs text-gray-500 italic break-words">
                                                {example.translation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-sm text-gray-400 mt-4">
                                Свайпните влево/вправо или используйте кнопки
                            </div>
                        </div>
                    </WatermarkCardSide>
                </div>
            </Card>

            {/* Индикаторы направления свайпа - вне карточки, чтобы не переворачивались */}
            {isSwiping && (
                <div className="absolute inset-x-0 bottom-8 flex items-center justify-center pointer-events-none z-10">
                    {swipeOffset.x < -20 && (
                        <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                            ← Не знаю
                        </Badge>
                    )}
                    {swipeOffset.x > 20 && (
                        <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                            Знаю →
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

interface FlashCardDeleteButtonProps {
    onAction: () => void;
    disabled?: boolean;
    belongsToUser?: boolean;
}

export function FlashCardDeleteButton({
    onAction,
    disabled = false,
    belongsToUser = true,
}: FlashCardDeleteButtonProps) {
    return (
        <div className="flex justify-center mt-4 md:hidden">
            <Button
                variant={belongsToUser ? 'destructive' : 'outline'}
                size="lg"
                onClick={onAction}
                disabled={disabled}
                className={
                    belongsToUser
                        ? 'flex items-center gap-2 bg-red-500 hover:bg-red-600'
                        : 'flex items-center gap-2'
                }
            >
                {belongsToUser ? (
                    <>
                        <Trash2 className="w-5 h-5" />
                        Удалить
                    </>
                ) : (
                    <>
                        <SkipForward className="w-5 h-5" />
                        Пропустить
                    </>
                )}
            </Button>
        </div>
    );
}
