'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
    getBorderColorClass,
    getTextColorClass,
    getBackgroundColorClass,
} from '@/components/training-list/helpers/gradient-utils';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
    title: string;
    description: string;
    link?: string;
    links?: {
        tests?: string;
        words?: string;
    };
}

interface WorkflowDiagramProps {
    title: string;
    step1: WorkflowStep;
    step2: WorkflowStep;
    step3: WorkflowStep;
}

const gradients = [
    'from-blue-400 to-cyan-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-emerald-500',
];

export function WorkflowDiagram({
    title,
    step1,
    step2,
    step3,
}: WorkflowDiagramProps) {
    const steps = [step1, step2, step3];

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {steps.map((step, index) => {
                    const gradient = gradients[index];
                    const _borderColor = getBorderColorClass(gradient);
                    const _iconColor = getTextColorClass(gradient);
                    const _iconBgColor = getBackgroundColorClass(gradient);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.2 + index * 0.2,
                            }}
                        >
                            <div
                                className={cn(
                                    'relative rounded-2xl p-8',
                                    'bg-gradient-to-br',
                                    gradient,
                                    'shadow-lg hover:shadow-2xl',
                                    'transition-all duration-300',
                                    'flex flex-col h-full min-h-[280px]',
                                )}
                            >
                                <div className="relative z-10 flex items-start justify-between mb-4">
                                    <div
                                        className={cn(
                                            'p-3 rounded-xl transition-all duration-300',
                                            'bg-white/20 backdrop-blur-sm',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xl',
                                            )}
                                        >
                                            {index + 1}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col justify-between text-white">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-white/90 mb-6">
                                            {step.description}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {step.links ? (
                                            <>
                                                {step.links.tests && (
                                                    <Link
                                                        href="/training/list#tests"
                                                        className="block"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white"
                                                        >
                                                            {step.links.tests}
                                                        </Button>
                                                    </Link>
                                                )}
                                                {step.links.words && (
                                                    <Link
                                                        href="/words"
                                                        className="block"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white"
                                                        >
                                                            {step.links.words}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </>
                                        ) : (
                                            step.link && (
                                                <Link
                                                    href={
                                                        index === 1
                                                            ? '/training/list#new'
                                                            : '/training/list#learned'
                                                    }
                                                    className="block"
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                                    >
                                                        {step.link}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
