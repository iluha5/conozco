'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollAnimation } from './ScrollAnimation';
import { ScrollIndicator } from './ScrollIndicator';
import { WorkflowDiagram } from './WorkflowDiagram';
import { FeatureCard } from './FeatureCard';
import { RegistrationCallToAction } from './RegistrationCallToAction';
import { useTranslation } from '@/lib/i18n/commonTranslation/hooks/useTranslation';

export function LandingContent() {
    const { data: session } = useSession();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Hero Section */}
            <ScrollAnimation animation="fadeIn" delay={0.1}>
                <section className="container mx-auto px-4 py-20">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center"
                    >
                        {t('Learn words with Conozco')}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto mb-8"
                    >
                        <div className="border-l-4 border-purple-500 pl-4 md:pl-6 bg-purple-50/50 rounded-r-lg py-4 md:py-5">
                            <div className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                {t(
                                    'From the author:\n\nPlatform for learning foreign words through interactive training and flash cards. Expand your vocabulary and strengthen your language knowledge in practice.\n\nCurrently available: English and Spanish languages. The platform is completely free.',
                                )}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center"
                    >
                        <Link
                            href={session ? '/training/list' : '/auth/register'}
                        >
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg px-8 py-6"
                            >
                                {t('Start Learning')}
                            </Button>
                        </Link>
                    </motion.div>
                </section>
            </ScrollAnimation>

            {/* Scroll Indicator - абсолютно позиционирован между секциями */}
            <div className="absolute h-12 w-full flex justify-center">
                <ScrollIndicator />
            </div>

            {/* Workflow Section */}
            <ScrollAnimation animation="slideUp" delay={0.3}>
                <section
                    data-section="workflow"
                    className="container mx-auto px-4 py-16"
                >
                    <WorkflowDiagram
                        title={t('Learning Process')}
                        step1={{
                            title: t('Stage 1: Word Selection'),
                            description: t(
                                'Choose words to learn from ready groups or add your own',
                            ),
                            links: {
                                tests: t('Word Groups'),
                                words: t('My words'),
                            },
                        }}
                        step2={{
                            title: t('Stage 2: Training'),
                            description: t('Systematic training of new words'),
                            link: t('Train New Words'),
                        }}
                        step3={{
                            title: t('Stage 3: Review'),
                            description: t(
                                'Regular reinforcement of learned material',
                            ),
                            link: t('Reinforce Knowledge'),
                        }}
                    />
                </section>
            </ScrollAnimation>

            {/* Features Section */}
            <ScrollAnimation animation="slideUp" delay={0.4}>
                <section className="w-full">
                    <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 w-full">
                        <div className="container mx-auto px-4 py-32">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                                    {t('Functionality')}
                                </h2>
                                <p className="text-center text-gray-700 mb-8">
                                    {t(
                                        'Comprehensive set of word learning tools',
                                    )}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                    {[
                                        t('6 interactive training stages'),
                                        t('Classic flash cards'),
                                        t(
                                            'Word organization by thematic groups',
                                        ),
                                        t('Learning progress saving'),
                                        t('Full freedom in word management'),
                                        t('All service features are free'),
                                    ].map((item, index) => (
                                        <FeatureCard
                                            key={index}
                                            title={item}
                                            gradient="from-purple-400 to-pink-500"
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollAnimation>

            {/* Registration Section for non-authenticated users */}
            {!session && (
                <ScrollAnimation animation="slideUp" delay={0.5}>
                    <section className="container mx-auto px-4 py-12">
                        <div className="max-w-2xl mx-auto">
                            <RegistrationCallToAction
                                content={{
                                    title: t('Registration'),
                                    benefits: [
                                        t('Personal dictionary'),
                                        t('Progress saving'),
                                        t('Access to advanced features'),
                                    ],
                                    free: t('Free forever'),
                                    cta: t('Create Account'),
                                }}
                            />
                        </div>
                    </section>
                </ScrollAnimation>
            )}
        </div>
    );
}
