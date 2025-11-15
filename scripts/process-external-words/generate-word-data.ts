import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enums matching the seed data structure
enum PartOfSpeech {
    NOUN = 'NOUN',
    VERB = 'VERB',
    ADJECTIVE = 'ADJECTIVE',
    ADVERB = 'ADVERB',
    PRONOUN = 'PRONOUN',
    PREPOSITION = 'PREPOSITION',
    CONJUNCTION = 'CONJUNCTION',
    INTERJECTION = 'INTERJECTION',
}

enum SentenceTypeCode {
    AFFIRMATIVE = 'AFFIRMATIVE',
    NEGATIVE = 'NEGATIVE',
    QUESTION = 'QUESTION',
    NEGATIVE_QUESTION = 'NEGATIVE_QUESTION',
}

interface WordData {
    word: string;
    partOfSpeech: PartOfSpeech;
    languageCode: string;
    translations: {
        languageCode: string;
        translations: string[];
    }[];
    examples: {
        pronoun: string;
        example: string;
        translations: {
            languageCode: string;
            translation: string;
        }[];
        sentenceTypeCode?: SentenceTypeCode;
        isNegative?: boolean;
        isQuestion?: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translations: {
                languageCode: string;
                translation: string;
            }[];
            sentenceTypeCode?: SentenceTypeCode;
            isNegative?: boolean;
            isQuestion?: boolean;
        }[];
    }[];
}

// Helper function to map Prisma PartOfSpeech name to enum
function mapPartOfSpeech(posName: string): PartOfSpeech {
    const upperName = posName.toUpperCase();
    if (upperName in PartOfSpeech) {
        return PartOfSpeech[upperName as keyof typeof PartOfSpeech];
    }
    return PartOfSpeech.NOUN; // Default fallback
}

// Helper function to get target languages for translations
function getTargetLanguages(sourceLang: string): string[] {
    if (sourceLang === 'es') {
        return ['ru', 'en'];
    } else if (sourceLang === 'en') {
        return ['ru', 'es'];
    }
    return ['ru']; // Default to Russian
}

// Translation dictionary - common word translations
// This is a simplified approach - in production, you'd use a more comprehensive dictionary or AI
const translationDictionary: Record<string, Record<string, string[]>> = {
    // Spanish words
    hablar: {
        ru: ['говорить', 'разговаривать', 'общаться'],
        en: ['speak', 'talk', 'communicate'],
    },
    comer: {
        ru: ['есть', 'кушать', 'потреблять'],
        en: ['eat', 'consume', 'have'],
    },
    vivir: {
        ru: ['жить', 'проживать', 'обитать'],
        en: ['live', 'reside', 'dwell'],
    },
    trabajar: { ru: ['работать', 'трудиться'], en: ['work', 'labor'] },
    estudiar: { ru: ['учиться', 'изучать'], en: ['study', 'learn'] },
    leer: { ru: ['читать', 'прочитывать'], en: ['read', 'peruse'] },
    escribir: {
        ru: ['писать', 'написать', 'записывать'],
        en: ['write', 'to write', 'record'],
    },
    perro: { ru: ['собака', 'пес', 'щенок'], en: ['dog', 'puppy', 'hound'] },
    gato: { ru: ['кот', 'кошка'], en: ['cat', 'kitten'] },
    casa: { ru: ['дом', 'жилище'], en: ['house', 'home'] },
    cuando: { ru: ['когда', 'в то время как'], en: ['when', 'while'] },
    dónde: { ru: ['где', 'куда'], en: ['where', 'where to'] },
    qué: { ru: ['что', 'какой'], en: ['what', 'which'] },
    cómo: { ru: ['как', 'каким образом'], en: ['how', 'in what way'] },
    y: { ru: ['и', 'а также'], en: ['and', 'also'] },
    pero: { ru: ['но', 'однако'], en: ['but', 'however'] },
    porque: { ru: ['потому что', 'так как'], en: ['because', 'since'] },
    en: { ru: ['в', 'на'], en: ['in', 'on', 'at'] },
    a: { ru: ['к', 'в'], en: ['to', 'at'] },
    de: { ru: ['из', 'от', 'о'], en: ['of', 'from', 'about'] },
    con: { ru: ['с', 'вместе с'], en: ['with', 'together with'] },

    // English words
    be: {
        ru: ['быть', 'являться', 'находиться'],
        es: ['ser', 'estar', 'encontrarse'],
    },
    have: { ru: ['иметь', 'обладать'], es: ['tener', 'poseer'] },
    do: { ru: ['делать', 'выполнять'], es: ['hacer', 'realizar'] },
    say: { ru: ['говорить', 'сказать'], es: ['decir', 'expresar'] },
    go: { ru: ['идти', 'ехать'], es: ['ir', 'marcharse'] },
    get: { ru: ['получать', 'доставать'], es: ['obtener', 'conseguir'] },
    make: { ru: ['делать', 'создавать'], es: ['hacer', 'crear'] },
    know: { ru: ['знать', 'понимать'], es: ['saber', 'conocer'] },
    think: { ru: ['думать', 'размышлять'], es: ['pensar', 'reflexionar'] },
    see: { ru: ['видеть', 'смотреть'], es: ['ver', 'observar'] },
    come: { ru: ['приходить', 'приезжать'], es: ['venir', 'llegar'] },
    want: { ru: ['хотеть', 'желать'], es: ['querer', 'desear'] },
    use: { ru: ['использовать', 'применять'], es: ['usar', 'utilizar'] },
    find: { ru: ['находить', 'обнаруживать'], es: ['encontrar', 'hallar'] },
    give: { ru: ['давать', 'подавать'], es: ['dar', 'entregar'] },
    tell: { ru: ['рассказывать', 'говорить'], es: ['decir', 'contar'] },
    work: { ru: ['работать', 'трудиться'], es: ['trabajar', 'laborar'] },
    call: { ru: ['звонить', 'называть'], es: ['llamar', 'denominar'] },
    try: { ru: ['пытаться', 'пробовать'], es: ['intentar', 'probar'] },
    ask: { ru: ['спрашивать', 'просить'], es: ['preguntar', 'pedir'] },
    need: { ru: ['нуждаться', 'требоваться'], es: ['necesitar', 'requerir'] },
    feel: { ru: ['чувствовать', 'ощущать'], es: ['sentir', 'percibir'] },
    become: {
        ru: ['становиться', 'превращаться'],
        es: ['convertirse', 'llegar a ser'],
    },
    leave: { ru: ['уходить', 'покидать'], es: ['salir', 'dejar'] },
    put: { ru: ['класть', 'ставить'], es: ['poner', 'colocar'] },
    mean: { ru: ['значить', 'означать'], es: ['significar', 'querer decir'] },
    keep: { ru: ['держать', 'хранить'], es: ['mantener', 'conservar'] },
    let: { ru: ['позволять', 'разрешать'], es: ['dejar', 'permitir'] },
    begin: { ru: ['начинать', 'приступать'], es: ['empezar', 'comenzar'] },
    seem: { ru: ['казаться', 'выглядеть'], es: ['parecer', 'aparentar'] },
    help: { ru: ['помогать', 'содействовать'], es: ['ayudar', 'asistir'] },
    show: { ru: ['показывать', 'демонстрировать'], es: ['mostrar', 'enseñar'] },
    hear: { ru: ['слышать', 'слушать'], es: ['oír', 'escuchar'] },
    play: { ru: ['играть', 'разыгрывать'], es: ['jugar', 'tocar'] },
    run: { ru: ['бежать', 'бегать'], es: ['correr', 'ejecutar'] },
    move: { ru: ['двигаться', 'перемещаться'], es: ['mover', 'trasladar'] },
    like: { ru: ['нравиться', 'любить'], es: ['gustar', 'querer'] },
    live: { ru: ['жить', 'проживать'], es: ['vivir', 'residir'] },
    believe: { ru: ['верить', 'полагать'], es: ['creer', 'confiar'] },
    bring: { ru: ['приносить', 'привозить'], es: ['traer', 'llevar'] },
    happen: { ru: ['происходить', 'случаться'], es: ['pasar', 'ocurrir'] },
    write: { ru: ['писать', 'написать'], es: ['escribir', 'redactar'] },
    sit: { ru: ['сидеть', 'садиться'], es: ['sentar', 'sentarse'] },
    stand: { ru: ['стоять', 'вставать'], es: ['estar de pie', 'pararse'] },
    lose: { ru: ['терять', 'проигрывать'], es: ['perder', 'fracasar'] },
    pay: { ru: ['платить', 'оплачивать'], es: ['pagar', 'abonar'] },
    meet: { ru: ['встречать', 'знакомиться'], es: ['encontrar', 'conocer'] },
    include: { ru: ['включать', 'содержать'], es: ['incluir', 'contener'] },
    continue: {
        ru: ['продолжать', 'возобновлять'],
        es: ['continuar', 'seguir'],
    },
    set: { ru: ['устанавливать', 'ставить'], es: ['poner', 'establecer'] },
    learn: { ru: ['учиться', 'изучать'], es: ['aprender', 'estudiar'] },
    change: { ru: ['менять', 'изменять'], es: ['cambiar', 'modificar'] },
    lead: { ru: ['вести', 'руководить'], es: ['liderar', 'conducir'] },
    understand: {
        ru: ['понимать', 'осознавать'],
        es: ['entender', 'comprender'],
    },
    watch: { ru: ['смотреть', 'наблюдать'], es: ['ver', 'observar'] },
    follow: { ru: ['следовать', 'идти за'], es: ['seguir', 'perseguir'] },
    stop: { ru: ['останавливать', 'прекращать'], es: ['parar', 'detener'] },
    create: { ru: ['создавать', 'творить'], es: ['crear', 'hacer'] },
    speak: { ru: ['говорить', 'разговаривать'], es: ['hablar', 'conversar'] },
    read: { ru: ['читать', 'прочитывать'], es: ['leer', 'estudiar'] },
    allow: { ru: ['позволять', 'разрешать'], es: ['permitir', 'dejar'] },
    add: { ru: ['добавлять', 'прибавлять'], es: ['añadir', 'agregar'] },
    spend: { ru: ['тратить', 'проводить'], es: ['gastar', 'pasar'] },
    grow: { ru: ['расти', 'выращивать'], es: ['crecer', 'cultivar'] },
    open: { ru: ['открывать', 'раскрывать'], es: ['abrir', 'destapar'] },
    walk: { ru: ['ходить', 'гулять'], es: ['caminar', 'andar'] },
    win: { ru: ['выигрывать', 'побеждать'], es: ['ganar', 'vencer'] },
    offer: { ru: ['предлагать', 'предоставлять'], es: ['ofrecer', 'proponer'] },
    remember: { ru: ['помнить', 'вспоминать'], es: ['recordar', 'acordarse'] },
    love: { ru: ['любить', 'обожать'], es: ['amar', 'querer'] },
    consider: {
        ru: ['считать', 'рассматривать'],
        es: ['considerar', 'pensar'],
    },
    appear: { ru: ['появляться', 'казаться'], es: ['aparecer', 'parecer'] },
    buy: { ru: ['покупать', 'приобретать'], es: ['comprar', 'adquirir'] },
    wait: { ru: ['ждать', 'ожидать'], es: ['esperar', 'aguardar'] },
    serve: { ru: ['служить', 'обслуживать'], es: ['servir', 'atender'] },
    die: { ru: ['умирать', 'погибать'], es: ['morir', 'fallecer'] },
    send: { ru: ['отправлять', 'посылать'], es: ['enviar', 'mandar'] },
    build: { ru: ['строить', 'создавать'], es: ['construir', 'edificar'] },
    stay: {
        ru: ['оставаться', 'останавливаться'],
        es: ['quedarse', 'permanecer'],
    },
    fall: { ru: ['падать', 'снижаться'], es: ['caer', 'bajar'] },
    cut: { ru: ['резать', 'отрезать'], es: ['cortar', 'tajar'] },
    reach: { ru: ['достигать', 'дотягиваться'], es: ['alcanzar', 'llegar'] },
    kill: { ru: ['убивать', 'уничтожать'], es: ['matar', 'asesinar'] },
    raise: { ru: ['поднимать', 'воспитывать'], es: ['levantar', 'criar'] },
};

// Helper function to get translations from dictionary or generate fallback
function getTranslations(
    word: string,
    sourceLang: string,
    targetLangs: string[],
): { languageCode: string; translations: string[] }[] {
    const result: { languageCode: string; translations: string[] }[] = [];

    for (const targetLang of targetLangs) {
        const key = `${sourceLang}-${targetLang}`;
        const translations =
            translationDictionary[word.toLowerCase()]?.[targetLang] || [];

        // If no translations found, provide a placeholder
        if (translations.length === 0) {
            result.push({
                languageCode: targetLang,
                translations: [`[Translation needed for: ${word}]`],
            });
        } else {
            result.push({
                languageCode: targetLang,
                translations: translations.slice(0, 3), // Max 3 translations
            });
        }
    }

    return result;
}

// Helper function to generate examples for a word
function generateExamples(
    word: string,
    partOfSpeech: PartOfSpeech,
    sourceLang: string,
    targetLangs: string[],
): WordData['examples'] {
    const examples: WordData['examples'] = [];
    const usedExamples = new Set<string>();

    // Get pronouns based on language
    const pronouns =
        sourceLang === 'es'
            ? ['yo', 'tú', 'él', 'nosotros', 'ellos']
            : ['I', 'you', 'he', 'we', 'they'];

    // Generate 5 examples with specific requirements:
    // - 2 Present Simple (affirmative)
    // - 1 Past Simple (affirmative)
    // - 1 Future Simple (affirmative)
    // - 1 interrogative (random tense)
    // - 1 negative (random tense)

    // This is a simplified generator - in production, you'd use AI to generate natural examples
    // For now, we'll create basic examples based on part of speech

    // Common context words for natural sentences
    const contextWords: Record<string, string[]> = {
        hablar: ['español', 'inglés', 'mucho'],
        comer: ['pan', 'manzanas', 'carne'],
        vivir: ['aquí', 'allí', 'bien'],
        trabajar: ['mucho', 'aquí', 'bien'],
        estudiar: ['mucho', 'inglés', 'bien'],
        leer: ['libros', 'mucho', 'bien'],
        escribir: ['cartas', 'mucho', 'bien'],
        be: ['here', 'there', 'ready'],
        have: ['a dog', 'time', 'money'],
        do: ['it', 'this', 'that'],
        go: ['home', 'there', 'here'],
        get: ['it', 'there', 'ready'],
        make: ['it', 'this', 'that'],
        know: ['it', 'this', 'that'],
        think: ['so', 'about it', 'well'],
        see: ['it', 'this', 'that'],
        come: ['here', 'there', 'home'],
        want: ['it', 'this', 'that'],
        use: ['it', 'this', 'that'],
        find: ['it', 'this', 'that'],
        give: ['it', 'this', 'that'],
        tell: ['me', 'him', 'her'],
        work: ['here', 'there', 'hard'],
        call: ['me', 'him', 'her'],
        try: ['it', 'this', 'that'],
        ask: ['me', 'him', 'her'],
        need: ['it', 'this', 'that'],
        feel: ['good', 'bad', 'well'],
        become: ['better', 'worse', 'ready'],
        leave: ['here', 'there', 'now'],
        put: ['it', 'this', 'that'],
        mean: ['it', 'this', 'that'],
        keep: ['it', 'this', 'that'],
        let: ['me', 'him', 'her'],
        begin: ['now', 'here', 'there'],
        seem: ['good', 'bad', 'right'],
        help: ['me', 'him', 'her'],
        show: ['me', 'him', 'her'],
        hear: ['it', 'this', 'that'],
        play: ['here', 'there', 'well'],
        run: ['fast', 'here', 'there'],
        move: ['here', 'there', 'fast'],
        like: ['it', 'this', 'that'],
        live: ['here', 'there', 'well'],
        believe: ['it', 'this', 'that'],
        bring: ['it', 'this', 'that'],
        happen: ['here', 'there', 'now'],
        write: ['it', 'this', 'that'],
        sit: ['here', 'there', 'down'],
        stand: ['here', 'there', 'up'],
        lose: ['it', 'this', 'that'],
        pay: ['for it', 'now', 'here'],
        meet: ['me', 'him', 'her'],
        include: ['it', 'this', 'that'],
        continue: ['here', 'there', 'now'],
        set: ['it', 'this', 'that'],
        learn: ['it', 'this', 'that'],
        change: ['it', 'this', 'that'],
        lead: ['them', 'us', 'here'],
        understand: ['it', 'this', 'that'],
        watch: ['it', 'this', 'that'],
        follow: ['me', 'him', 'her'],
        stop: ['here', 'there', 'now'],
        create: ['it', 'this', 'that'],
        speak: ['English', 'Spanish', 'well'],
        read: ['books', 'it', 'this'],
        allow: ['me', 'him', 'her'],
        add: ['it', 'this', 'that'],
        spend: ['time', 'money', 'here'],
        grow: ['here', 'there', 'fast'],
        open: ['it', 'this', 'that'],
        walk: ['here', 'there', 'fast'],
        win: ['it', 'this', 'that'],
        offer: ['it', 'this', 'that'],
        remember: ['it', 'this', 'that'],
        love: ['it', 'this', 'that'],
        consider: ['it', 'this', 'that'],
        appear: ['here', 'there', 'now'],
        buy: ['it', 'this', 'that'],
        wait: ['here', 'there', 'now'],
        serve: ['them', 'us', 'here'],
        die: ['here', 'there', 'now'],
        send: ['it', 'this', 'that'],
        build: ['it', 'this', 'that'],
        stay: ['here', 'there', 'now'],
        fall: ['here', 'there', 'down'],
        cut: ['it', 'this', 'that'],
        reach: ['it', 'this', 'that'],
        kill: ['it', 'this', 'that'],
        raise: ['it', 'this', 'that'],
    };

    if (partOfSpeech === PartOfSpeech.VERB) {
        // Present Simple examples (2 affirmative)
        for (let i = 0; i < 2 && examples.length < 5; i++) {
            const pronoun = pronouns[i % pronouns.length];
            let example = '';
            let translations: { languageCode: string; translation: string }[] =
                [];

            const contextWord =
                contextWords[word.toLowerCase()]?.[
                    i % (contextWords[word.toLowerCase()]?.length || 1)
                ] || '';

            if (sourceLang === 'es') {
                // Spanish verb conjugation (simplified - would need proper conjugation in production)
                const conjugated = getSpanishConjugation(
                    word,
                    pronoun,
                    'present',
                );
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

                // Generate translations
                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'en') {
                        const enContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getEnglishPronoun(pronoun)} ${word}${enContext}`,
                        });
                    }
                }
            } else if (sourceLang === 'en') {
                // English verb
                const conjugated =
                    pronoun === 'I'
                        ? word
                        : pronoun === 'he' || pronoun === 'she'
                          ? `${word}s`
                          : word;
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

                // Generate translations
                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'es') {
                        const esVerb = getSpanishVerb(word, 'present');
                        const esContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getSpanishPronoun(pronoun)} ${esVerb}${esContext}`,
                        });
                    }
                }
            }

            if (example && !usedExamples.has(example.toLowerCase())) {
                examples.push({
                    pronoun,
                    example,
                    translations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                });
                usedExamples.add(example.toLowerCase());
            }
        }

        // Past Simple (1 affirmative)
        if (examples.length < 5) {
            const pronoun = pronouns[2];
            let example = '';
            let translations: { languageCode: string; translation: string }[] =
                [];

            const contextWord =
                contextWords[word.toLowerCase()]?.[
                    2 % (contextWords[word.toLowerCase()]?.length || 1)
                ] || '';

            if (sourceLang === 'es') {
                const conjugated = getSpanishConjugation(word, pronoun, 'past');
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'past');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'en') {
                        const enVerb = getEnglishVerb(word, 'past');
                        const enContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getEnglishPronoun(pronoun)} ${enVerb}${enContext}`,
                        });
                    }
                }
            } else if (sourceLang === 'en') {
                const conjugated = getEnglishVerb(word, 'past');
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'past');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'es') {
                        const esVerb = getSpanishVerb(word, 'past');
                        const esContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getSpanishPronoun(pronoun)} ${esVerb}${esContext}`,
                        });
                    }
                }
            }

            if (example && !usedExamples.has(example.toLowerCase())) {
                examples.push({
                    pronoun,
                    example,
                    translations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                });
                usedExamples.add(example.toLowerCase());
            }
        }

        // Future Simple (1 affirmative)
        if (examples.length < 5) {
            const pronoun = pronouns[3];
            let example = '';
            let translations: { languageCode: string; translation: string }[] =
                [];

            const contextWord =
                contextWords[word.toLowerCase()]?.[
                    3 % (contextWords[word.toLowerCase()]?.length || 1)
                ] || '';

            if (sourceLang === 'es') {
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} va a ${word} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} va a ${word}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'infinitive');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} будет ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'en') {
                        const enContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getEnglishPronoun(pronoun)} will ${word}${enContext}`,
                        });
                    }
                }
            } else if (sourceLang === 'en') {
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} will ${word} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} will ${word}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'infinitive');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} будет ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'es') {
                        const esVerb = getSpanishVerb(word, 'infinitive');
                        const esContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getSpanishPronoun(pronoun)} va a ${esVerb}${esContext}`,
                        });
                    }
                }
            }

            if (example && !usedExamples.has(example.toLowerCase())) {
                examples.push({
                    pronoun,
                    example,
                    translations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                });
                usedExamples.add(example.toLowerCase());
            }
        }

        // Interrogative (1 question)
        if (examples.length < 5) {
            const pronoun = pronouns[1];
            let example = '';
            let translations: { languageCode: string; translation: string }[] =
                [];

            const contextWord =
                contextWords[word.toLowerCase()]?.[
                    1 % (contextWords[word.toLowerCase()]?.length || 1)
                ] || '';

            if (sourceLang === 'es') {
                const conjugated = getSpanishConjugation(
                    word,
                    pronoun,
                    'present',
                );
                example = contextWord
                    ? `¿${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}?`
                    : `¿${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}?`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}?`,
                        });
                    } else if (lang === 'en') {
                        const enContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `Do ${getEnglishPronoun(pronoun)} ${word}${enContext}?`,
                        });
                    }
                }
            } else if (sourceLang === 'en') {
                const conjugated =
                    pronoun === 'I'
                        ? word
                        : pronoun === 'he' || pronoun === 'she'
                          ? `${word}s`
                          : word;
                example = contextWord
                    ? `Do ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated} ${contextWord}?`
                    : `Do ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}?`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} ${ruVerb}${ruContext}?`,
                        });
                    } else if (lang === 'es') {
                        const esVerb = getSpanishVerb(word, 'present');
                        const esContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `¿${getSpanishPronoun(pronoun)} ${esVerb}${esContext}?`,
                        });
                    }
                }
            }

            if (example && !usedExamples.has(example.toLowerCase())) {
                examples.push({
                    pronoun,
                    example,
                    translations,
                    sentenceTypeCode: SentenceTypeCode.QUESTION,
                    isNegative: false,
                    isQuestion: true,
                });
                usedExamples.add(example.toLowerCase());
            }
        }

        // Negative (1 negative)
        if (examples.length < 5) {
            const pronoun = pronouns[0];
            let example = '';
            let translations: { languageCode: string; translation: string }[] =
                [];

            const contextWord =
                contextWords[word.toLowerCase()]?.[
                    0 % (contextWords[word.toLowerCase()]?.length || 1)
                ] || '';

            if (sourceLang === 'es') {
                const conjugated = getSpanishConjugation(
                    word,
                    pronoun,
                    'present',
                );
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} no ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} no ${conjugated}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} не ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'en') {
                        const enContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getEnglishPronoun(pronoun)} do not ${word}${enContext}`,
                        });
                    }
                }
            } else if (sourceLang === 'en') {
                const conjugated =
                    pronoun === 'I'
                        ? word
                        : pronoun === 'he' || pronoun === 'she'
                          ? `${word}s`
                          : word;
                example = contextWord
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} do not ${conjugated} ${contextWord}`
                    : `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} do not ${conjugated}`;

                for (const lang of targetLangs) {
                    if (lang === 'ru') {
                        const ruVerb = getRussianVerb(word, 'present');
                        const ruContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getRussianPronoun(pronoun)} не ${ruVerb}${ruContext}`,
                        });
                    } else if (lang === 'es') {
                        const esVerb = getSpanishVerb(word, 'present');
                        const esContext = contextWord ? ` ${contextWord}` : '';
                        translations.push({
                            languageCode: lang,
                            translation: `${getSpanishPronoun(pronoun)} no ${esVerb}${esContext}`,
                        });
                    }
                }
            }

            if (example && !usedExamples.has(example.toLowerCase())) {
                examples.push({
                    pronoun,
                    example,
                    translations,
                    sentenceTypeCode: SentenceTypeCode.NEGATIVE,
                    isNegative: true,
                    isQuestion: false,
                });
                usedExamples.add(example.toLowerCase());
            }
        }
    } else {
        // For non-verbs, create natural examples based on part of speech
        const translations = getTranslations(word, sourceLang, targetLangs);

        if (partOfSpeech === PartOfSpeech.NOUN) {
            // Generate 5 examples for nouns
            const nounExamples = [
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'Tengo un {word}'
                            : 'I have a {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `У меня есть ${trans}`
                                    : lang === 'en'
                                      ? `I have a ${trans}`
                                      : `Tengo un ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'El {word} es grande'
                            : 'The {word} is big',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `${trans.charAt(0).toUpperCase() + trans.slice(1)} большой`
                                    : lang === 'en'
                                      ? `The ${trans} is big`
                                      : `El ${trans} es grande`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'Veo el {word}'
                            : 'I see the {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Я вижу ${trans}`
                                    : lang === 'en'
                                      ? `I see the ${trans}`
                                      : `Veo el ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'Compro un {word}'
                            : 'I buy a {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Я покупаю ${trans}`
                                    : lang === 'en'
                                      ? `I buy a ${trans}`
                                      : `Compro un ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? '¿Tienes un {word}?'
                            : 'Do you have a {word}?',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `У тебя есть ${trans}?`
                                    : lang === 'en'
                                      ? `Do you have a ${trans}?`
                                      : `¿Tienes un ${trans}?`,
                        };
                    }),
                },
            ];

            for (let i = 0; i < Math.min(5, nounExamples.length); i++) {
                const ex = nounExamples[i];
                const exampleText = ex.pattern.replace('{word}', word);
                if (!usedExamples.has(exampleText.toLowerCase())) {
                    examples.push({
                        pronoun: pronouns[i % pronouns.length],
                        example: exampleText,
                        translations: ex.translations,
                        sentenceTypeCode:
                            i === 4
                                ? SentenceTypeCode.QUESTION
                                : SentenceTypeCode.AFFIRMATIVE,
                        isNegative: false,
                        isQuestion: i === 4,
                    });
                    usedExamples.add(exampleText.toLowerCase());
                }
            }
        } else if (partOfSpeech === PartOfSpeech.ADJECTIVE) {
            // Generate examples for adjectives
            const adjExamples = [
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'Es muy {word}'
                            : 'It is very {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Это очень ${trans}`
                                    : lang === 'en'
                                      ? `It is very ${trans}`
                                      : `Es muy ${trans}`,
                        };
                    }),
                },
                {
                    pattern: sourceLang === 'es' ? 'Soy {word}' : 'I am {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Я ${trans}`
                                    : lang === 'en'
                                      ? `I am ${trans}`
                                      : `Soy ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es' ? 'Eres {word}' : 'You are {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Ты ${trans}`
                                    : lang === 'en'
                                      ? `You are ${trans}`
                                      : `Eres ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? 'No soy {word}'
                            : 'I am not {word}',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Я не ${trans}`
                                    : lang === 'en'
                                      ? `I am not ${trans}`
                                      : `No soy ${trans}`,
                        };
                    }),
                },
                {
                    pattern:
                        sourceLang === 'es'
                            ? '¿Eres {word}?'
                            : 'Are you {word}?',
                    translations: targetLangs.map(lang => {
                        const trans =
                            translations.find(t => t.languageCode === lang)
                                ?.translations[0] || word;
                        return {
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Ты ${trans}?`
                                    : lang === 'en'
                                      ? `Are you ${trans}?`
                                      : `¿Eres ${trans}?`,
                        };
                    }),
                },
            ];

            for (let i = 0; i < Math.min(5, adjExamples.length); i++) {
                const ex = adjExamples[i];
                const exampleText = ex.pattern.replace('{word}', word);
                if (!usedExamples.has(exampleText.toLowerCase())) {
                    examples.push({
                        pronoun: pronouns[i % pronouns.length],
                        example: exampleText,
                        translations: ex.translations,
                        sentenceTypeCode:
                            i === 3
                                ? SentenceTypeCode.NEGATIVE
                                : i === 4
                                  ? SentenceTypeCode.QUESTION
                                  : SentenceTypeCode.AFFIRMATIVE,
                        isNegative: i === 3,
                        isQuestion: i === 4,
                    });
                    usedExamples.add(exampleText.toLowerCase());
                }
            }
        } else {
            // For other parts of speech (conjunctions, prepositions, etc.), create basic examples
            for (let i = 0; i < 5; i++) {
                const exampleText =
                    sourceLang === 'es'
                        ? `Ejemplo con ${word}`
                        : `Example with ${word}`;

                if (!usedExamples.has(exampleText.toLowerCase())) {
                    examples.push({
                        pronoun: pronouns[i % pronouns.length],
                        example: exampleText,
                        translations: targetLangs.map(lang => ({
                            languageCode: lang,
                            translation:
                                lang === 'ru'
                                    ? `Пример с ${word}`
                                    : exampleText,
                        })),
                        sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                        isNegative: false,
                        isQuestion: false,
                    });
                    usedExamples.add(exampleText.toLowerCase());
                }
            }
        }
    }

    return examples;
}

// Helper functions for verb conjugation (simplified - would need proper conjugation tables in production)
function getSpanishConjugation(
    verb: string,
    pronoun: string,
    tense: string,
): string {
    // Simplified conjugation - in production, use a proper conjugation library
    const base = verb.replace(/ar$|er$|ir$/, '');
    const ending = verb.match(/(ar|er|ir)$/)?.[0] || 'ar';

    if (tense === 'present') {
        const conjugations: Record<string, Record<string, string>> = {
            ar: {
                yo: `${base}o`,
                tú: `${base}as`,
                él: `${base}a`,
                nosotros: `${base}amos`,
                ellos: `${base}an`,
            },
            er: {
                yo: `${base}o`,
                tú: `${base}es`,
                él: `${base}e`,
                nosotros: `${base}emos`,
                ellos: `${base}en`,
            },
            ir: {
                yo: `${base}o`,
                tú: `${base}es`,
                él: `${base}e`,
                nosotros: `${base}imos`,
                ellos: `${base}en`,
            },
        };
        return conjugations[ending]?.[pronoun] || verb;
    } else if (tense === 'past') {
        const conjugations: Record<string, Record<string, string>> = {
            ar: {
                yo: `${base}é`,
                tú: `${base}aste`,
                él: `${base}ó`,
                nosotros: `${base}amos`,
                ellos: `${base}aron`,
            },
            er: {
                yo: `${base}í`,
                tú: `${base}iste`,
                él: `${base}ió`,
                nosotros: `${base}imos`,
                ellos: `${base}ieron`,
            },
            ir: {
                yo: `${base}í`,
                tú: `${base}iste`,
                él: `${base}ió`,
                nosotros: `${base}imos`,
                ellos: `${base}ieron`,
            },
        };
        return conjugations[ending]?.[pronoun] || verb;
    }
    return verb;
}

function getEnglishVerb(verb: string, tense: string): string {
    // Simplified - in production, use proper irregular verb tables
    if (tense === 'past') {
        const irregular: Record<string, string> = {
            be: 'was',
            have: 'had',
            do: 'did',
            go: 'went',
            get: 'got',
            make: 'made',
            know: 'knew',
            think: 'thought',
            see: 'saw',
            come: 'came',
            want: 'wanted',
            use: 'used',
            find: 'found',
        };
        return irregular[verb.toLowerCase()] || `${verb}ed`;
    }
    return verb;
}

function getRussianVerb(verb: string, tense: string): string {
    // Simplified - would need proper Russian conjugation
    const translations: Record<string, Record<string, string>> = {
        hablar: { present: 'говорю', past: 'говорил', infinitive: 'говорить' },
        comer: { present: 'ем', past: 'ел', infinitive: 'есть' },
        vivir: { present: 'живу', past: 'жил', infinitive: 'жить' },
        trabajar: {
            present: 'работаю',
            past: 'работал',
            infinitive: 'работать',
        },
        estudiar: { present: 'учусь', past: 'учился', infinitive: 'учиться' },
        leer: { present: 'читаю', past: 'читал', infinitive: 'читать' },
        escribir: { present: 'пишу', past: 'писал', infinitive: 'писать' },
    };
    return translations[verb.toLowerCase()]?.[tense] || '[глагол]';
}

function getSpanishVerb(verb: string, tense: string): string {
    // Simplified - would need proper Spanish conjugation
    return verb; // Placeholder
}

function getRussianPronoun(pronoun: string): string {
    const map: Record<string, string> = {
        yo: 'Я',
        tú: 'Ты',
        él: 'Он',
        nosotros: 'Мы',
        ellos: 'Они',
        I: 'Я',
        you: 'Ты',
        he: 'Он',
        we: 'Мы',
        they: 'Они',
    };
    return map[pronoun.toLowerCase()] || pronoun;
}

function getEnglishPronoun(pronoun: string): string {
    const map: Record<string, string> = {
        yo: 'I',
        tú: 'you',
        él: 'he',
        nosotros: 'we',
        ellos: 'they',
    };
    return map[pronoun.toLowerCase()] || pronoun;
}

function getSpanishPronoun(pronoun: string): string {
    const map: Record<string, string> = {
        I: 'yo',
        you: 'tú',
        he: 'él',
        we: 'nosotros',
        they: 'ellos',
    };
    return map[pronoun.toLowerCase()] || pronoun;
}

// Helper function to generate grammatical examples for verbs
function generateGrammaticalExamples(
    word: string,
    sourceLang: string,
    targetLangs: string[],
): WordData['grammaticalExamples'] {
    const grammaticalExamples: WordData['grammaticalExamples'] = [];

    if (sourceLang === 'es') {
        // Presente de indicativo - all pronouns
        const presentPronouns = [
            'yo',
            'tú',
            'él',
            'nosotros',
            'vosotros',
            'ellos',
        ];
        const presentExamples: WordData['grammaticalExamples'][0]['examples'] =
            [];

        for (let i = 0; i < presentPronouns.length; i++) {
            const pronoun = presentPronouns[i];
            const conjugated = getSpanishConjugation(word, pronoun, 'present');
            const example = `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

            const translations: {
                languageCode: string;
                translation: string;
            }[] = [];
            for (const lang of targetLangs) {
                if (lang === 'ru') {
                    translations.push({
                        languageCode: lang,
                        translation: `${getRussianPronoun(pronoun)} ${getRussianVerb(word, 'present')}`,
                    });
                } else if (lang === 'en') {
                    translations.push({
                        languageCode: lang,
                        translation: `${getEnglishPronoun(pronoun)} ${word}`,
                    });
                }
            }

            // Randomly select one to be negative, one to be interrogative
            const isNegative = i === 2; // Random selection
            const isQuestion = i === 1; // Random selection

            presentExamples.push({
                pronoun,
                example: isNegative
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} no ${conjugated}`
                    : example,
                translations,
                sentenceTypeCode: isNegative
                    ? SentenceTypeCode.NEGATIVE
                    : isQuestion
                      ? SentenceTypeCode.QUESTION
                      : SentenceTypeCode.AFFIRMATIVE,
                isNegative,
                isQuestion,
            });
        }

        grammaticalExamples.push({
            tenseName: 'Presente de indicativo',
            examples: presentExamples,
        });

        // Pretérito indefinido - one pronoun
        const pastPronoun = 'yo';
        const pastConjugated = getSpanishConjugation(word, pastPronoun, 'past');
        const pastExample = `${pastPronoun.charAt(0).toUpperCase() + pastPronoun.slice(1)} ${pastConjugated}`;

        const pastTranslations: {
            languageCode: string;
            translation: string;
        }[] = [];
        for (const lang of targetLangs) {
            if (lang === 'ru') {
                pastTranslations.push({
                    languageCode: lang,
                    translation: `${getRussianPronoun(pastPronoun)} ${getRussianVerb(word, 'past')}`,
                });
            } else if (lang === 'en') {
                pastTranslations.push({
                    languageCode: lang,
                    translation: `${getEnglishPronoun(pastPronoun)} ${getEnglishVerb(word, 'past')}`,
                });
            }
        }

        grammaticalExamples.push({
            tenseName: 'Pretérito indefinido',
            examples: [
                {
                    pronoun: pastPronoun,
                    example: pastExample,
                    translations: pastTranslations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                },
            ],
        });

        // Futuro próximo - one pronoun
        const futurePronoun = 'tú';
        const futureExample = `${futurePronoun.charAt(0).toUpperCase() + futurePronoun.slice(1)} vas a ${word}`;

        const futureTranslations: {
            languageCode: string;
            translation: string;
        }[] = [];
        for (const lang of targetLangs) {
            if (lang === 'ru') {
                futureTranslations.push({
                    languageCode: lang,
                    translation: `${getRussianPronoun(futurePronoun)} будет ${getRussianVerb(word, 'infinitive')}`,
                });
            } else if (lang === 'en') {
                futureTranslations.push({
                    languageCode: lang,
                    translation: `${getEnglishPronoun(futurePronoun)} will ${word}`,
                });
            }
        }

        grammaticalExamples.push({
            tenseName: 'Futuro próximo',
            examples: [
                {
                    pronoun: futurePronoun,
                    example: futureExample,
                    translations: futureTranslations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                },
            ],
        });
    } else if (sourceLang === 'en') {
        // Present Simple - all pronouns
        const presentPronouns = ['I', 'you', 'we', 'they', 'he', 'she', 'it'];
        const presentExamples: WordData['grammaticalExamples'][0]['examples'] =
            [];

        for (let i = 0; i < presentPronouns.length; i++) {
            const pronoun = presentPronouns[i];
            const conjugated =
                pronoun === 'I'
                    ? word
                    : pronoun === 'he' || pronoun === 'she' || pronoun === 'it'
                      ? `${word}s`
                      : word;
            const example = `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${conjugated}`;

            const translations: {
                languageCode: string;
                translation: string;
            }[] = [];
            for (const lang of targetLangs) {
                if (lang === 'ru') {
                    translations.push({
                        languageCode: lang,
                        translation: `${getRussianPronoun(pronoun)} ${getRussianVerb(word, 'present')}`,
                    });
                } else if (lang === 'es') {
                    translations.push({
                        languageCode: lang,
                        translation: `${getSpanishPronoun(pronoun)} ${getSpanishVerb(word, 'present')}`,
                    });
                }
            }

            const isNegative = i === 2;
            const isQuestion = i === 1;

            presentExamples.push({
                pronoun,
                example: isNegative
                    ? `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} do not ${conjugated}`
                    : example,
                translations,
                sentenceTypeCode: isNegative
                    ? SentenceTypeCode.NEGATIVE
                    : isQuestion
                      ? SentenceTypeCode.QUESTION
                      : SentenceTypeCode.AFFIRMATIVE,
                isNegative,
                isQuestion,
            });
        }

        grammaticalExamples.push({
            tenseName: 'Present Simple',
            examples: presentExamples,
        });

        // Past Simple - one pronoun
        const pastPronoun = 'I';
        const pastConjugated = getEnglishVerb(word, 'past');
        const pastExample = `${pastPronoun} ${pastConjugated}`;

        const pastTranslations: {
            languageCode: string;
            translation: string;
        }[] = [];
        for (const lang of targetLangs) {
            if (lang === 'ru') {
                pastTranslations.push({
                    languageCode: lang,
                    translation: `${getRussianPronoun(pastPronoun)} ${getRussianVerb(word, 'past')}`,
                });
            } else if (lang === 'es') {
                pastTranslations.push({
                    languageCode: lang,
                    translation: `${getSpanishPronoun(pastPronoun)} ${getSpanishVerb(word, 'past')}`,
                });
            }
        }

        grammaticalExamples.push({
            tenseName: 'Past Simple',
            examples: [
                {
                    pronoun: pastPronoun,
                    example: pastExample,
                    translations: pastTranslations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                },
            ],
        });

        // Future Simple - one pronoun
        const futurePronoun = 'you';
        const futureExample = `${futurePronoun.charAt(0).toUpperCase() + futurePronoun.slice(1)} will ${word}`;

        const futureTranslations: {
            languageCode: string;
            translation: string;
        }[] = [];
        for (const lang of targetLangs) {
            if (lang === 'ru') {
                futureTranslations.push({
                    languageCode: lang,
                    translation: `${getRussianPronoun(futurePronoun)} будет ${getRussianVerb(word, 'infinitive')}`,
                });
            } else if (lang === 'es') {
                futureTranslations.push({
                    languageCode: lang,
                    translation: `${getSpanishPronoun(futurePronoun)} va a ${getSpanishVerb(word, 'infinitive')}`,
                });
            }
        }

        grammaticalExamples.push({
            tenseName: 'Future Simple',
            examples: [
                {
                    pronoun: futurePronoun,
                    example: futureExample,
                    translations: futureTranslations,
                    sentenceTypeCode: SentenceTypeCode.AFFIRMATIVE,
                    isNegative: false,
                    isQuestion: false,
                },
            ],
        });
    }

    return grammaticalExamples;
}

async function main() {
    try {
        console.log('🔍 Querying database for external words...');

        // Get native source ID
        const nativeSource = await prisma.wordSource.findUnique({
            where: { code: 'native' },
        });

        if (!nativeSource) {
            throw new Error("WordSource with code 'native' not found");
        }

        // Query BaseWord records where sourceId != native, limit to 10
        const externalWords = await prisma.baseWord.findMany({
            where: {
                sourceId: {
                    not: nativeSource.id,
                },
            },
            take: 10,
            include: {
                language: true,
                partOfSpeech: true,
            },
        });

        console.log(`✅ Found ${externalWords.length} external words`);

        if (externalWords.length === 0) {
            console.log('⚠️ No external words found. Exiting.');
            return;
        }

        // Generate WordData for each word
        const wordDataMap = new Map<string, WordData>();

        for (const wordRecord of externalWords) {
            const word = wordRecord.word;
            const languageCode = wordRecord.language.code;
            const partOfSpeech = mapPartOfSpeech(wordRecord.partOfSpeech.name);
            const targetLangs = getTargetLanguages(languageCode);

            console.log(
                `📝 Processing word: "${word}" (${languageCode}, ${partOfSpeech})`,
            );

            const wordData: WordData = {
                word,
                partOfSpeech,
                languageCode,
                translations: getTranslations(word, languageCode, targetLangs),
                examples: generateExamples(
                    word,
                    partOfSpeech,
                    languageCode,
                    targetLangs,
                ),
                grammaticalExamples:
                    partOfSpeech === PartOfSpeech.VERB
                        ? generateGrammaticalExamples(
                              word,
                              languageCode,
                              targetLangs,
                          )
                        : [],
            };

            wordDataMap.set(word, wordData);
        }

        // Generate TypeScript file content
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5);
        const fileName = `generated-word-data-${timestamp}.ts`;
        const outputDir = path.join(__dirname, 'temp');

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        const filePath = path.join(outputDir, fileName);

        // Generate file content
        let fileContent = `import { PartOfSpeech, SentenceTypeCode } from '../../lib/words-seed-data-en';\n\n`;
        fileContent += `interface WordData {\n`;
        fileContent += `    word: string;\n`;
        fileContent += `    partOfSpeech: PartOfSpeech;\n`;
        fileContent += `    languageCode: string;\n`;
        fileContent += `    translations: {\n`;
        fileContent += `        languageCode: string;\n`;
        fileContent += `        translations: string[];\n`;
        fileContent += `    }[];\n`;
        fileContent += `    examples: {\n`;
        fileContent += `        pronoun: string;\n`;
        fileContent += `        example: string;\n`;
        fileContent += `        translations: {\n`;
        fileContent += `            languageCode: string;\n`;
        fileContent += `            translation: string;\n`;
        fileContent += `        }[];\n`;
        fileContent += `        sentenceTypeCode?: SentenceTypeCode;\n`;
        fileContent += `        isNegative?: boolean;\n`;
        fileContent += `        isQuestion?: boolean;\n`;
        fileContent += `    }[];\n`;
        fileContent += `    grammaticalExamples: {\n`;
        fileContent += `        tenseName: string;\n`;
        fileContent += `        examples: {\n`;
        fileContent += `            pronoun: string;\n`;
        fileContent += `            example: string;\n`;
        fileContent += `            translations: {\n`;
        fileContent += `                languageCode: string;\n`;
        fileContent += `                translation: string;\n`;
        fileContent += `        }[];\n`;
        fileContent += `        sentenceTypeCode?: SentenceTypeCode;\n`;
        fileContent += `        isNegative?: boolean;\n`;
        fileContent += `        isQuestion?: boolean;\n`;
        fileContent += `    }[];\n`;
        fileContent += `    }[];\n`;
        fileContent += `}\n\n`;
        fileContent += `export const GENERATED_WORD_DATA: Map<string, WordData> = new Map([\n`;

        // Add each word to the map
        for (const word of Array.from(wordDataMap.keys())) {
            const wordData = wordDataMap.get(word)!;
            fileContent += `  ['${word}', {\n`;
            fileContent += `    word: '${word}',\n`;
            fileContent += `    partOfSpeech: PartOfSpeech.${wordData.partOfSpeech},\n`;
            fileContent += `    languageCode: '${wordData.languageCode}',\n`;
            fileContent += `    translations: [\n`;

            for (const transGroup of wordData.translations) {
                fileContent += `      {\n`;
                fileContent += `        languageCode: '${transGroup.languageCode}',\n`;
                fileContent += `        translations: [${transGroup.translations.map((t: string) => `'${t.replace(/'/g, "\\'")}'`).join(', ')}]\n`;
                fileContent += `      },\n`;
            }

            fileContent += `    ],\n`;
            fileContent += `    examples: [\n`;

            for (const example of wordData.examples) {
                fileContent += `      {\n`;
                fileContent += `        pronoun: '${example.pronoun}',\n`;
                fileContent += `        example: '${example.example.replace(/'/g, "\\'")}',\n`;
                fileContent += `        translations: [\n`;

                for (const trans of example.translations) {
                    fileContent += `          { languageCode: '${trans.languageCode}', translation: '${trans.translation.replace(/'/g, "\\'")}' },\n`;
                }

                fileContent += `        ],\n`;
                if (example.sentenceTypeCode) {
                    fileContent += `        sentenceTypeCode: SentenceTypeCode.${example.sentenceTypeCode},\n`;
                }
                if (example.isNegative !== undefined) {
                    fileContent += `        isNegative: ${example.isNegative},\n`;
                }
                if (example.isQuestion !== undefined) {
                    fileContent += `        isQuestion: ${example.isQuestion},\n`;
                }
                fileContent += `      },\n`;
            }

            fileContent += `    ],\n`;
            fileContent += `    grammaticalExamples: [\n`;

            for (const gramExample of wordData.grammaticalExamples) {
                fileContent += `      {\n`;
                fileContent += `        tenseName: '${gramExample.tenseName}',\n`;
                fileContent += `        examples: [\n`;

                for (const ex of gramExample.examples) {
                    fileContent += `          {\n`;
                    fileContent += `            pronoun: '${ex.pronoun}',\n`;
                    fileContent += `            example: '${ex.example.replace(/'/g, "\\'")}',\n`;
                    fileContent += `            translations: [\n`;

                    for (const trans of ex.translations) {
                        fileContent += `              { languageCode: '${trans.languageCode}', translation: '${trans.translation.replace(/'/g, "\\'")}' },\n`;
                    }

                    fileContent += `            ],\n`;
                    if (ex.sentenceTypeCode) {
                        fileContent += `            sentenceTypeCode: SentenceTypeCode.${ex.sentenceTypeCode},\n`;
                    }
                    if (ex.isNegative !== undefined) {
                        fileContent += `            isNegative: ${ex.isNegative},\n`;
                    }
                    if (ex.isQuestion !== undefined) {
                        fileContent += `            isQuestion: ${ex.isQuestion},\n`;
                    }
                    fileContent += `          },\n`;
                }

                fileContent += `        ]\n`;
                fileContent += `      },\n`;
            }

            fileContent += `    ]\n`;
            fileContent += `  }],\n`;
        }

        fileContent += `]);\n`;

        // Write file
        await fs.writeFile(filePath, fileContent, 'utf8');

        console.log(`✅ Generated TypeScript file: ${filePath}`);
        console.log(`📊 Processed ${wordDataMap.size} words`);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
