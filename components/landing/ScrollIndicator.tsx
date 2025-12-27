'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // Проверяем, прокрутил ли пользователь страницу достаточно далеко
            // Скрываем стрелку когда прокрутили больше 300px или когда следующий блок начинает появляться
            const scrollY = window.scrollY || window.pageYOffset;
            const windowHeight = window.innerHeight;

            // Скрываем если прокрутили больше половины экрана или если следующий блок виден
            if (scrollY > windowHeight * 0.3) {
                setIsVisible(false);
            }
        };

        // Также проверяем видимость следующего блока через IntersectionObserver
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(false);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '-100px 0px',
            },
        );

        // Находим следующий блок (Workflow Section)
        const nextSection = document.querySelector('[data-section="workflow"]');
        if (nextSection) {
            observer.observe(nextSection);
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Проверяем сразу

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (nextSection) {
                observer.unobserve(nextSection);
            }
        };
    }, []);

    return (
        <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-full pointer-events-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center"
                    >
                        <motion.div
                            animate={{
                                y: [0, 8, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="text-purple-600"
                        >
                            <ChevronDown className="w-8 h-8" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
