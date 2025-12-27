'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollAnimationProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight';
}

const animations = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    },
    slideInLeft: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    slideInRight: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
};

export function ScrollAnimation({
    children,
    delay = 0,
    duration = 0.6,
    className = '',
    animation = 'fadeIn',
}: ScrollAnimationProps) {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    const animationConfig = animations[animation];

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={animationConfig}
            transition={{
                duration,
                delay,
                ease: 'easeOut',
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
