'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SCROLL_THRESHOLD = 300;

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > SCROLL_THRESHOLD) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-6 w-6 text-white" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

