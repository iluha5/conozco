'use client';

import { motion } from 'framer-motion';
import {
    Target,
    BookCheck,
    Layers,
    TrendingUp,
    Settings,
    Gift,
    LucideIcon,
} from 'lucide-react';
import {
    getBorderColorClass,
    getTextColorClass,
    getBackgroundColorClass,
} from '@/components/training-list/helpers/gradient-utils';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
    title: string;
    gradient: string;
    index: number;
}

const gradients = [
    'from-blue-400 to-cyan-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-gray-400 to-slate-500',
    'from-pink-400 to-rose-500',
];

const icons: LucideIcon[] = [
    Target, // 6 интерактивных этапов тренировки
    BookCheck, // Классические флеш-карточки
    Layers, // Организация слов по тематическим группам
    TrendingUp, // Сохранение прогресса обучения
    Settings, // Полная свобода в управлении словами
    Gift, // Весь функционал сервиса бесплатен
];

export function FeatureCard({
    title,
    gradient: _gradient,
    index,
}: FeatureCardProps) {
    const cardGradient = gradients[index % gradients.length];
    const borderColor = getBorderColorClass(cardGradient);
    const iconColor = getTextColorClass(cardGradient);
    const iconBgColor = getBackgroundColorClass(cardGradient);
    const Icon = icons[index % icons.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.1,
            }}
        >
            <div
                className={cn(
                    'relative rounded-2xl p-6',
                    'bg-white border-2',
                    borderColor,
                    'shadow-md hover:shadow-xl',
                    'hover:border-opacity-100',
                    'transition-all duration-300',
                    'flex flex-col h-full min-h-[180px]',
                )}
            >
                <div className="relative z-10 flex items-start justify-between mb-3">
                    <div
                        className={cn(
                            'p-2 sm:p-3 rounded-xl transition-all duration-300',
                            'group-hover:scale-105 origin-center',
                            iconBgColor,
                        )}
                    >
                        <Icon
                            className={cn('w-5 h-5 md:w-6 md:h-6', iconColor)}
                        />
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold mb-1 text-gray-900">
                        {title}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}
