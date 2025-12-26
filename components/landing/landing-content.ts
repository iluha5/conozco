export type LandingLanguage = 'ru' | 'en' | 'es';

export interface LandingContent {
    hero: {
        title: string;
        introduction: string;
        cta: string;
    };
    workflow: {
        title: string;
        step1: {
            title: string;
            description: string;
            links: {
                tests: string;
                words: string;
            };
        };
        step2: {
            title: string;
            description: string;
            link: string;
        };
        step3: {
            title: string;
            description: string;
            link: string;
        };
    };
    features: {
        title: string;
        description: string;
        items: string[];
    };
    registration: {
        title: string;
        benefits: string[];
        free: string;
        cta: string;
    };
}

export interface LandingContentData {
    variant2: Record<LandingLanguage, LandingContent>;
}

export const landingContent: LandingContentData = {
    variant2: {
        ru: {
            hero: {
                title: 'Изучай слова с Conozco',
                introduction:
                    'От автора:\n\nПлатформа для изучения иностранных слов через интерактивные тренировки и флеш-карточки. Расширяйте словарный запас и укрепляйте знания языка на практике.\n\nСейчас доступны английский и испанский языки. Платформа полностью бесплатная.',
                cta: 'Начать обучение',
            },
            workflow: {
                title: 'Процесс обучения',
                step1: {
                    title: 'Этап 1: Подбор слов',
                    description:
                        'Выберите слова для изучения из готовых групп или добавьте свои',
                    links: {
                        tests: 'Группы слов',
                        words: 'Мои слова',
                    },
                },
                step2: {
                    title: 'Этап 2: Обучение',
                    description: 'Систематическая тренировка новых слов',
                    link: 'Тренировка новых слов',
                },
                step3: {
                    title: 'Этап 3: Повторение',
                    description: 'Регулярное закрепление изученного материала',
                    link: 'Закрепление знаний',
                },
            },
            features: {
                title: 'Функциональность',
                description: 'Комплексный набор инструментов для изучения слов',
                items: [
                    '6 интерактивных этапов тренировки',
                    'Классические флеш-карточки',
                    'Организация слов по тематическим группам',
                    'Сохранение прогресса обучения',
                    'Полная свобода в управлении словами',
                    'Весь функционал сервиса бесплатен',
                ],
            },
            registration: {
                title: 'Регистрация',
                benefits: [
                    'Персональный словарь',
                    'Сохранение прогресса',
                    'Доступ к расширенным функциям',
                ],
                free: 'Бесплатно навсегда',
                cta: 'Создать аккаунт',
            },
        },
        en: {
            hero: {
                title: 'Learn words with Conozco',
                introduction:
                    'From the author:\n\nPlatform for learning foreign words through interactive training and flash cards. Expand your vocabulary and strengthen your language knowledge in practice.\n\nCurrently available: English and Spanish languages. The platform is completely free.',
                cta: 'Start Learning',
            },
            workflow: {
                title: 'Learning Process',
                step1: {
                    title: 'Stage 1: Word Selection',
                    description:
                        'Choose words to learn from ready groups or add your own',
                    links: {
                        tests: 'Word Groups',
                        words: 'My Words',
                    },
                },
                step2: {
                    title: 'Stage 2: Training',
                    description: 'Systematic training of new words',
                    link: 'Train New Words',
                },
                step3: {
                    title: 'Stage 3: Review',
                    description: 'Regular reinforcement of learned material',
                    link: 'Reinforce Knowledge',
                },
            },
            features: {
                title: 'Functionality',
                description: 'Comprehensive set of word learning tools',
                items: [
                    '6 interactive training stages',
                    'Classic flash cards',
                    'Word organization by thematic groups',
                    'Learning progress saving',
                    'Full freedom in word management',
                    'All service features are free',
                ],
            },
            registration: {
                title: 'Registration',
                benefits: [
                    'Personal dictionary',
                    'Progress saving',
                    'Access to advanced features',
                ],
                free: 'Free forever',
                cta: 'Create Account',
            },
        },
        es: {
            hero: {
                title: 'Aprende palabras con Conozco',
                introduction:
                    'Del autor:\n\nPlataforma para aprender palabras extranjeras a través de entrenamientos interactivos y tarjetas flash. Expande tu vocabulario y fortalece tus conocimientos del idioma en la práctica.\n\nActualmente disponibles: inglés y español. La plataforma es completamente gratuita.',
                cta: 'Comenzar a Aprender',
            },
            workflow: {
                title: 'Proceso de Aprendizaje',
                step1: {
                    title: 'Etapa 1: Selección de Palabras',
                    description:
                        'Elige palabras para aprender de grupos listos o añade las tuyas',
                    links: {
                        tests: 'Grupos de Palabras',
                        words: 'Mis Palabras',
                    },
                },
                step2: {
                    title: 'Etapa 2: Entrenamiento',
                    description: 'Entrenamiento sistemático de nuevas palabras',
                    link: 'Entrenar Nuevas Palabras',
                },
                step3: {
                    title: 'Etapa 3: Repaso',
                    description: 'Refuerzo regular del material aprendido',
                    link: 'Reforzar Conocimientos',
                },
            },
            features: {
                title: 'Funcionalidad',
                description:
                    'Conjunto integral de herramientas para aprender palabras',
                items: [
                    '6 etapas de entrenamiento interactivas',
                    'Tarjetas flash clásicas',
                    'Organización de palabras por grupos temáticos',
                    'Guardado del progreso de aprendizaje',
                    'Libertad total en la gestión de palabras',
                    'Todas las funciones del servicio son gratuitas',
                ],
            },
            registration: {
                title: 'Registro',
                benefits: [
                    'Diccionario personal',
                    'Guardado de progreso',
                    'Acceso a funciones avanzadas',
                ],
                free: 'Gratis para siempre',
                cta: 'Crear Cuenta',
            },
        },
    },
};
