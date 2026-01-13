// Define PartOfSpeech locally, as import from Prisma may not work during seed execution
/* eslint-disable no-unused-vars */
export enum PartOfSpeech {
    NOUN = 'NOUN',
    VERB = 'VERB',
    ADJECTIVE = 'ADJECTIVE',
    ADVERB = 'ADVERB',
    PRONOUN = 'PRONOUN',
    PREPOSITION = 'PREPOSITION',
    CONJUNCTION = 'CONJUNCTION',
    INTERJECTION = 'INTERJECTION',
}

export enum SentenceTypeCode {
    AFFIRMATIVE = 'AFFIRMATIVE',
    NEGATIVE = 'NEGATIVE',
    QUESTION = 'QUESTION',
    NEGATIVE_QUESTION = 'NEGATIVE_QUESTION',
}
/* eslint-enable no-unused-vars */

export interface WordData {
    word: string;
    partOfSpeech: PartOfSpeech;
    languageCode: string;
    translations: {
        languageCode: string;
        translations: string[]; // up to 3 translations
    }[];
    examples: {
        pronoun: string;
        example: string;
        translation: string;
        sentenceTypeCode?: SentenceTypeCode;
        isNegative?: boolean;
        isQuestion?: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translation: string;
            sentenceTypeCode?: SentenceTypeCode;
            isNegative?: boolean;
            isQuestion?: boolean;
        }[];
    }[];
}

// Spanish language word data
export const SPANISH_WORDS_DATA: WordData[] = [
    {
        word: 'hablar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['говорить', 'разговаривать', 'общаться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo hablo español',
                translation: 'Я говорю по-испански',
            },
            {
                pronoun: 'tú',
                example: 'Tú hablas inglés',
                translation: 'Ты говоришь по-английски',
            },
            {
                pronoun: 'él',
                example: 'Él habla francés',
                translation: 'Он говорит по-французски',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros hablamos mucho',
                translation: 'Мы много говорим',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos hablan de política',
                translation: 'Они говорят о политике',
            },
            {
                pronoun: 'yo',
                example: 'No hablo alemán',
                translation: 'Я не говорю по-немецки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Hablas italiano?',
                translation: 'Ты говоришь по-итальянски?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hablo',
                        translation: 'Я говорю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú hablas',
                        translation: 'Ты говоришь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él habla',
                        translation: 'Он говорит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella habla',
                        translation: 'Она говорит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hablamos',
                        translation: 'Мы говорим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros habláis',
                        translation: 'Вы говорите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hablan',
                        translation: 'Они говорят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hablo',
                        translation: 'Я не говорю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Hablas?',
                        translation: 'Ты говоришь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he hablado',
                        translation: 'Я говорил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has hablado',
                        translation: 'Ты говорил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha hablado',
                        translation: 'Он говорил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha hablado',
                        translation: 'Она говорила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos hablado',
                        translation: 'Мы говорили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han hablado',
                        translation: 'Они говорили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he hablado',
                        translation: 'Я не говорил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has hablado?',
                        translation: 'Ты говорил?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hablé',
                        translation: 'Я сказал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú hablaste',
                        translation: 'Ты сказал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él habló',
                        translation: 'Он сказал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella habló',
                        translation: 'Она сказала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hablamos',
                        translation: 'Мы сказали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hablaron',
                        translation: 'Они сказали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hablé',
                        translation: 'Я не сказал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Hablaste?',
                        translation: 'Ты сказал?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a hablar',
                        translation: 'Я буду говорить',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a hablar',
                        translation: 'Ты будешь говорить',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a hablar',
                        translation: 'Он будет говорить',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a hablar',
                        translation: 'Она будет говорить',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a hablar',
                        translation: 'Мы будем говорить',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a hablar',
                        translation: 'Они будут говорить',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a hablar',
                        translation: 'Я не буду говорить',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a hablar?',
                        translation: 'Ты будешь говорить?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy hablando',
                        translation: 'Я говорю (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás hablando',
                        translation: 'Ты говоришь (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está hablando',
                        translation: 'Он говорит (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está hablando',
                        translation: 'Она говорит (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos hablando',
                        translation: 'Мы говорим (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están hablando',
                        translation: 'Они говорят (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy hablando',
                        translation: 'Я не говорю (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás hablando?',
                        translation: 'Ты говоришь (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'casa',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['дом', 'жилище', 'здание'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi casa es grande',
                translation: 'Мой дом большой',
            },
            {
                pronoun: 'tú',
                example: 'Tu casa está lejos',
                translation: 'Твой дом далеко',
            },
            {
                pronoun: 'él',
                example: 'Su casa es bonita',
                translation: 'Его дом красивый',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestra casa es nueva',
                translation: 'Наш дом новый',
            },
            {
                pronoun: 'ellos',
                example: 'Sus casas son pequeñas',
                translation: 'Их дома маленькие',
            },
            {
                pronoun: 'yo',
                example: 'No tengo casa',
                translation: 'У меня нет дома',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Dónde está tu casa?',
                translation: 'Где твой дом?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            // Nouns don't need grammatical tenses, but will leave empty
        ],
    },
    {
        word: 'dibujar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['рисовать', 'чертить', 'изображать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo dibujo bien',
                translation: 'Я хорошо рисую',
            },
            {
                pronoun: 'tú',
                example: 'Tú dibujas caricaturas',
                translation: 'Ты рисуешь карикатуры',
            },
            {
                pronoun: 'él',
                example: 'Él dibuja paisajes',
                translation: 'Он рисует пейзажи',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros dibujamos en clase',
                translation: 'Мы рисуем на уроке',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos dibujan cómics',
                translation: 'Они рисуют комиксы',
            },
            {
                pronoun: 'yo',
                example: 'No dibujo mal',
                translation: 'Я не рисую плохо',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Dibujas con lápiz?',
                translation: 'Ты рисуешь карандашом?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo dibujo',
                        translation: 'Я рисую',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú dibujas',
                        translation: 'Ты рисуешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él dibuja',
                        translation: 'Он рисует',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella dibuja',
                        translation: 'Она рисует',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros dibujamos',
                        translation: 'Мы рисуем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros dibujáis',
                        translation: 'Вы рисуете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dibujan',
                        translation: 'Они рисуют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No dibujo',
                        translation: 'Я не рисую',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Dibujas?',
                        translation: 'Ты рисуешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo dibujé',
                        translation: 'Я нарисовал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú dibujaste',
                        translation: 'Ты нарисовал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él dibujó',
                        translation: 'Он нарисовал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella dibujó',
                        translation: 'Она нарисовала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros dibujamos',
                        translation: 'Мы нарисовали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dibujaron',
                        translation: 'Они нарисовали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No dibujé',
                        translation: 'Я не нарисовал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Dibujaste?',
                        translation: 'Ты нарисовал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'teñido',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['окрашенный', 'покрашенный', 'подкрашенный'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi pelo está teñido',
                translation: 'Мои волосы окрашены',
            },
            {
                pronoun: 'tú',
                example: 'Tu cabello teñido es bonito',
                translation: 'Твои окрашенные волосы красивые',
            },
            {
                pronoun: 'él',
                example: 'Su barba está teñida',
                translation: 'Его борода окрашена',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestros muebles están teñidos',
                translation: 'Наша мебель окрашена',
            },
            {
                pronoun: 'ellos',
                example: 'Sus paredes están teñidas',
                translation: 'Их стены окрашены',
            },
            {
                pronoun: 'yo',
                example: 'Mi pelo no está teñido',
                translation: 'Мои волосы не окрашены',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Está teñido tu pelo?',
                translation: 'Твои волосы окрашены?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'canoso',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['седой', 'с проседью', 'поседевший'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi abuelo es canoso',
                translation: 'Мой дедушка седой',
            },
            {
                pronoun: 'tú',
                example: 'Tu pelo está canoso',
                translation: 'Твои волосы седые',
            },
            {
                pronoun: 'él',
                example: 'Su barba es canosa',
                translation: 'Его борода седая',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestros padres están canosos',
                translation: 'Наши родители седые',
            },
            {
                pronoun: 'ellos',
                example: 'Sus cabezas son canosas',
                translation: 'Их головы седые',
            },
            {
                pronoun: 'yo',
                example: 'No soy canoso aún',
                translation: 'Я еще не седой',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Eres canoso?',
                translation: 'Ты седой?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'suelto',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['свободный', 'растрепанный', 'распущенный'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi pelo está suelto',
                translation: 'Мои волосы распущены',
            },
            {
                pronoun: 'tú',
                example: 'Tu cabello suelto es hermoso',
                translation: 'Твои распущенные волосы прекрасны',
            },
            {
                pronoun: 'él',
                example: 'Su chaqueta está suelta',
                translation: 'Его куртка свободная',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestros perros están sueltos',
                translation: 'Наши собаки на свободе',
            },
            {
                pronoun: 'ellos',
                example: 'Sus cabellos están sueltos',
                translation: 'Их волосы распущены',
            },
            {
                pronoun: 'yo',
                example: 'Mi pelo no está suelto',
                translation: 'Мои волосы не распущены',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Está suelto tu pelo?',
                translation: 'Твои волосы распущены?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'recogido',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['собранный', 'убранный', 'прибранный'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi pelo está recogido',
                translation: 'Мои волосы собраны',
            },
            {
                pronoun: 'tú',
                example: 'Tu cabello recogido te queda bien',
                translation: 'Тебе идет собранные волосы',
            },
            {
                pronoun: 'él',
                example: 'Su habitación está recogida',
                translation: 'Его комната убрана',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestras cosas están recogidas',
                translation: 'Наши вещи собраны',
            },
            {
                pronoun: 'ellos',
                example: 'Sus libros están recogidos',
                translation: 'Их книги собраны',
            },
            {
                pronoun: 'yo',
                example: 'Mi pelo no está recogido',
                translation: 'Мои волосы не собраны',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Está recogido tu pelo?',
                translation: 'Твои волосы собраны?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'liso',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['гладкий', 'прямой', 'ровный'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Mi pelo es liso',
                translation: 'Мои волосы прямые',
            },
            {
                pronoun: 'tú',
                example: 'Tu piel es lisa',
                translation: 'Твоя кожа гладкая',
            },
            {
                pronoun: 'él',
                example: 'Su camino es liso',
                translation: 'Его путь ровный',
            },
            {
                pronoun: 'nosotros',
                example: 'Nuestros zapatos son lisos',
                translation: 'Наши ботинки гладкие',
            },
            {
                pronoun: 'ellos',
                example: 'Sus superficies son lisas',
                translation: 'Их поверхности гладкие',
            },
            {
                pronoun: 'yo',
                example: 'Mi pelo no es liso',
                translation: 'Мои волосы не прямые',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Es liso tu pelo?',
                translation: 'Твои волосы прямые?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'volver',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['возвращаться', 'вернуться', 'вернуть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vuelvo a casa',
                translation: 'Я возвращаюсь домой',
            },
            {
                pronoun: 'tú',
                example: 'Tú vuelves pronto',
                translation: 'Ты возвращаешься скоро',
            },
            {
                pronoun: 'él',
                example: 'Él vuelve del trabajo',
                translation: 'Он возвращается с работы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros volvemos juntos',
                translation: 'Мы возвращаемся вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos vuelven tarde',
                translation: 'Они возвращаются поздно',
            },
            {
                pronoun: 'yo',
                example: 'No vuelvo aún',
                translation: 'Я еще не возвращаюсь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Vuelves mañana?',
                translation: 'Ты возвращаешься завтра?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vuelvo',
                        translation: 'Я возвращаюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vuelves',
                        translation: 'Ты возвращаешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vuelve',
                        translation: 'Он возвращается',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vuelve',
                        translation: 'Она возвращается',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros volvemos',
                        translation: 'Мы возвращаемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros volvéis',
                        translation: 'Вы возвращаетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vuelven',
                        translation: 'Они возвращаются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vuelvo',
                        translation: 'Я не возвращаюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vuelves?',
                        translation: 'Ты возвращаешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo volví',
                        translation: 'Я вернулся',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú volviste',
                        translation: 'Ты вернулся',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él volvió',
                        translation: 'Он вернулся',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella volvió',
                        translation: 'Она вернулась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros volvimos',
                        translation: 'Мы вернулись',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos volvieron',
                        translation: 'Они вернулись',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No volví',
                        translation: 'Я не вернулся',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Volviste?',
                        translation: 'Ты вернулся?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'recordar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['помнить', 'вспоминать', 'напоминать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo recuerdo tu nombre',
                translation: 'Я помню твое имя',
            },
            {
                pronoun: 'tú',
                example: 'Tú recuerdas los detalles',
                translation: 'Ты помнишь детали',
            },
            {
                pronoun: 'él',
                example: 'Él recuerda el pasado',
                translation: 'Он вспоминает прошлое',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros recordamos juntos',
                translation: 'Мы вспоминаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos recuerdan la fiesta',
                translation: 'Они помнят вечеринку',
            },
            {
                pronoun: 'yo',
                example: 'No recuerdo nada',
                translation: 'Я ничего не помню',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Recuerdas mi número?',
                translation: 'Ты помнишь мой номер?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recuerdo',
                        translation: 'Я помню',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recuerdas',
                        translation: 'Ты помнишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recuerda',
                        translation: 'Он помнит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recuerda',
                        translation: 'Она помнит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recordamos',
                        translation: 'Мы помним',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros recordáis',
                        translation: 'Вы помните',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos recuerdan',
                        translation: 'Они помнят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recuerdo',
                        translation: 'Я не помню',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recuerdas?',
                        translation: 'Ты помнишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recordé',
                        translation: 'Я вспомнил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recordaste',
                        translation: 'Ты вспомнил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recordó',
                        translation: 'Он вспомнил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recordó',
                        translation: 'Она вспомнила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recordamos',
                        translation: 'Мы вспомнили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos recordaron',
                        translation: 'Они вспомнили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recordé',
                        translation: 'Я не вспомнил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recordaste?',
                        translation: 'Ты вспомнил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'deber',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['быть должным', 'долженствовать', 'обязан'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo debo estudiar',
                translation: 'Я должен учиться',
            },
            {
                pronoun: 'tú',
                example: 'Tú debes trabajar',
                translation: 'Ты должен работать',
            },
            {
                pronoun: 'él',
                example: 'Él debe pagar',
                translation: 'Он должен платить',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros debemos ayudar',
                translation: 'Мы должны помогать',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos deben esperar',
                translation: 'Они должны ждать',
            },
            {
                pronoun: 'yo',
                example: 'No debo fumar',
                translation: 'Я не должен курить',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Debes irte?',
                translation: 'Ты должен уходить?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo debo',
                        translation: 'Я должен',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú debes',
                        translation: 'Ты должен',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él debe',
                        translation: 'Он должен',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella debe',
                        translation: 'Она должна',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros debemos',
                        translation: 'Мы должны',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros debéis',
                        translation: 'Вы должны',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos deben',
                        translation: 'Они должны',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No debo',
                        translation: 'Я не должен',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Debes?',
                        translation: 'Ты должен?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo debí',
                        translation: 'Я должен был',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú debiste',
                        translation: 'Ты должен был',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él debió',
                        translation: 'Он должен был',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella debió',
                        translation: 'Она должна была',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros debimos',
                        translation: 'Мы должны были',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos debieron',
                        translation: 'Они должны были',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No debí',
                        translation: 'Я не должен был',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Debiste?',
                        translation: 'Ты должен был?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'pecas',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['веснушки', 'конопушки', 'крапинки'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tengo pecas',
                translation: 'У меня есть веснушки',
            },
            {
                pronoun: 'tú',
                example: 'Tú tienes muchas pecas',
                translation: 'У тебя много веснушек',
            },
            {
                pronoun: 'él',
                example: 'Él tiene pecas en la cara',
                translation: 'У него веснушки на лице',
            },
            {
                pronoun: 'ella',
                example: 'Ella tiene pecas bonitas',
                translation: 'У нее красивые веснушки',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tenemos pecas',
                translation: 'У нас есть веснушки',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos tienen pecas',
                translation: 'У них есть веснушки',
            },
            {
                pronoun: 'yo',
                example: 'No tengo pecas',
                translation: 'У меня нет веснушек',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes pecas?',
                translation: 'У тебя есть веснушки?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'lleva coleta',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'носит хвост',
                    'с хвостиком',
                    'с конским хвостом',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo llevo coleta',
                translation: 'Я ношу хвост',
            },
            {
                pronoun: 'tú',
                example: 'Tú llevas coleta hoy',
                translation: 'Ты носишь хвост сегодня',
            },
            {
                pronoun: 'él',
                example: 'Él lleva coleta larga',
                translation: 'Он носит длинный хвост',
            },
            {
                pronoun: 'ella',
                example: 'Ella lleva coleta alta',
                translation: 'Она носит высокий хвост',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros llevamos coleta',
                translation: 'Мы носим хвост',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llevan coleta',
                translation: 'Они носят хвост',
            },
            {
                pronoun: 'yo',
                example: 'No llevo coleta',
                translation: 'Я не ношу хвост',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Llevas coleta?',
                translation: 'Ты носишь хвост?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llevo coleta',
                        translation: 'Я ношу хвост',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llevas coleta',
                        translation: 'Ты носишь хвост',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él lleva coleta',
                        translation: 'Он носит хвост',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella lleva coleta',
                        translation: 'Она носит хвост',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llevamos coleta',
                        translation: 'Мы носим хвост',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros lleváis coleta',
                        translation: 'Вы носите хвост',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llevan coleta',
                        translation: 'Они носят хвост',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llevo coleta',
                        translation: 'Я не ношу хвост',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llevas coleta?',
                        translation: 'Ты носишь хвост?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llevé coleta',
                        translation: 'Я носил хвост',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llevaste coleta',
                        translation: 'Ты носил хвост',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llevó coleta',
                        translation: 'Он носил хвост',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llevó coleta',
                        translation: 'Она носила хвост',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llevamos coleta',
                        translation: 'Мы носили хвост',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llevaron coleta',
                        translation: 'Они носили хвост',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llevé coleta',
                        translation: 'Я не носил хвост',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llevaste coleta?',
                        translation: 'Ты носил хвост?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'trenzas',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['косы', 'косички', 'плетенки'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tengo trenzas',
                translation: 'У меня косы',
            },
            {
                pronoun: 'tú',
                example: 'Tú llevas trenzas bonitas',
                translation: 'У тебя красивые косы',
            },
            {
                pronoun: 'ella',
                example: 'Ella tiene dos trenzas',
                translation: 'У нее две косы',
            },
            {
                pronoun: 'él',
                example: 'Él hace trenzas',
                translation: 'Он плетет косы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros hacemos trenzas',
                translation: 'Мы плетем косы',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llevan trenzas',
                translation: 'Они носят косы',
            },
            {
                pronoun: 'yo',
                example: 'No tengo trenzas',
                translation: 'У меня нет кос',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes trenzas?',
                translation: 'У тебя есть косы?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'camiseta',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['футболка', 'майка', 'тенниска'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo llevo una camiseta blanca',
                translation: 'Я ношу белую футболку',
            },
            {
                pronoun: 'tú',
                example: 'Tú tienes una camiseta nueva',
                translation: 'У тебя новая футболка',
            },
            {
                pronoun: 'él',
                example: 'Él compra una camiseta',
                translation: 'Он покупает футболку',
            },
            {
                pronoun: 'ella',
                example: 'Ella lleva camiseta azul',
                translation: 'Она носит синюю футболку',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros llevamos camisetas rojas',
                translation: 'Мы носим красные футболки',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos tienen camisetas',
                translation: 'У них есть футболки',
            },
            {
                pronoun: 'yo',
                example: 'No llevo camiseta',
                translation: 'Я не ношу футболку',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes una camiseta limpia?',
                translation: 'У тебя есть чистая футболка?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'bigote',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['усы', 'усики', 'усищи'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tengo bigote',
                translation: 'У меня есть усы',
            },
            {
                pronoun: 'tú',
                example: 'Tú llevas bigote largo',
                translation: 'Ты носишь длинные усы',
            },
            {
                pronoun: 'él',
                example: 'Él se afeita el bigote',
                translation: 'Он бреет усы',
            },
            {
                pronoun: 'ella',
                example: 'Ella pinta bigotes',
                translation: 'Она рисует усы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tenemos bigote',
                translation: 'У нас есть усы',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llevan bigote',
                translation: 'Они носят усы',
            },
            {
                pronoun: 'yo',
                example: 'No tengo bigote',
                translation: 'У меня нет усов',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes bigote?',
                translation: 'У тебя есть усы?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'perilla',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['козлиная бородка', 'эспаньолка', 'бородка'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tengo perilla',
                translation: 'У меня есть бородка',
            },
            {
                pronoun: 'tú',
                example: 'Tú llevas perilla elegante',
                translation: 'Ты носишь элегантную бородку',
            },
            {
                pronoun: 'él',
                example: 'Él se deja crecer la perilla',
                translation: 'Он отращивает бородку',
            },
            {
                pronoun: 'ella',
                example: 'Ella dibuja una perilla',
                translation: 'Она рисует бородку',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tenemos perilla',
                translation: 'У нас есть бородка',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llevan perilla',
                translation: 'Они носят бородку',
            },
            {
                pronoun: 'yo',
                example: 'No tengo perilla',
                translation: 'У меня нет бородки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes perilla?',
                translation: 'У тебя есть бородка?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'rubio',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['светлый', 'белокурый', 'блондин'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo soy rubio',
                translation: 'Я блондин',
            },
            {
                pronoun: 'tú',
                example: 'Tú tienes pelo rubio',
                translation: 'У тебя светлые волосы',
            },
            {
                pronoun: 'él',
                example: 'Él es rubio natural',
                translation: 'Он натуральный блондин',
            },
            {
                pronoun: 'ella',
                example: 'Ella es rubia hermosa',
                translation: 'Она красивая блондинка',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros somos rubios',
                translation: 'Мы блондины',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos son rubios',
                translation: 'Они блондины',
            },
            {
                pronoun: 'yo',
                example: 'No soy rubio',
                translation: 'Я не блондин',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Eres rubio?',
                translation: 'Ты блондин?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'delgado',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['худой', 'стройный', 'тонкий'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo soy delgado',
                translation: 'Я худой',
            },
            {
                pronoun: 'tú',
                example: 'Tú eres muy delgado',
                translation: 'Ты очень худой',
            },
            {
                pronoun: 'él',
                example: 'Él es delgado y alto',
                translation: 'Он худой и высокий',
            },
            {
                pronoun: 'ella',
                example: 'Ella es delgada',
                translation: 'Она стройная',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros somos delgados',
                translation: 'Мы худые',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos son delgados',
                translation: 'Они худые',
            },
            {
                pronoun: 'yo',
                example: 'No soy delgado',
                translation: 'Я не худой',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Eres delgado?',
                translation: 'Ты худой?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'me equivoco',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['я ошибаюсь', 'я неправ', 'я допускаю ошибку'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me equivoco a menudo',
                translation: 'Я часто ошибаюсь',
            },
            {
                pronoun: 'tú',
                example: 'Te equivocas en eso',
                translation: 'Ты ошибаешься в этом',
            },
            {
                pronoun: 'él',
                example: 'Se equivoca mucho',
                translation: 'Он много ошибается',
            },
            {
                pronoun: 'ella',
                example: 'Se equivoca poco',
                translation: 'Она мало ошибается',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos equivocamos juntos',
                translation: 'Мы ошибаемся вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Se equivocan siempre',
                translation: 'Они всегда ошибаются',
            },
            {
                pronoun: 'yo',
                example: 'No me equivoco nunca',
                translation: 'Я никогда не ошибаюсь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te equivocas?',
                translation: 'Ты ошибаешься?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me equivoco',
                        translation: 'Я ошибаюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te equivocas',
                        translation: 'Ты ошибаешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Se equivoca',
                        translation: 'Он ошибается',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Se equivoca',
                        translation: 'Она ошибается',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos equivocamos',
                        translation: 'Мы ошибаемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os equivocáis',
                        translation: 'Вы ошибаетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Se equivocan',
                        translation: 'Они ошибаются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me equivoco',
                        translation: 'Я не ошибаюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te equivocas?',
                        translation: 'Ты ошибаешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me equiroqué',
                        translation: 'Я ошибся',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te equivocaste',
                        translation: 'Ты ошибся',
                    },
                    {
                        pronoun: 'él',
                        example: 'Se equivocó',
                        translation: 'Он ошибся',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Se equivocó',
                        translation: 'Она ошиблась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos equivocamos',
                        translation: 'Мы ошиблись',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Se equivocaron',
                        translation: 'Они ошиблись',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me equiroqué',
                        translation: 'Я не ошибся',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te equivocaste?',
                        translation: 'Ты ошибся?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'ganar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['выигрывать', 'зарабатывать', 'побеждать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo gano dinero',
                translation: 'Я зарабатываю деньги',
            },
            {
                pronoun: 'tú',
                example: 'Tú ganas partidos',
                translation: 'Ты выигрываешь матчи',
            },
            {
                pronoun: 'él',
                example: 'Él gana premios',
                translation: 'Он выигрывает призы',
            },
            {
                pronoun: 'ella',
                example: 'Ella gana concursos',
                translation: 'Она выигрывает конкурсы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros ganamos juntos',
                translation: 'Мы выигрываем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos ganan mucho',
                translation: 'Они много зарабатывают',
            },
            {
                pronoun: 'yo',
                example: 'No gano suficiente',
                translation: 'Я не зарабатываю достаточно',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Ganas bien?',
                translation: 'Ты хорошо зарабатываешь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo gano',
                        translation: 'Я выигрываю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú ganas',
                        translation: 'Ты выигрываешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él gana',
                        translation: 'Он выигрывает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella gana',
                        translation: 'Она выигрывает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros ganamos',
                        translation: 'Мы выигрываем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros ganáis',
                        translation: 'Вы выигрываете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos ganan',
                        translation: 'Они выигрывают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No gano',
                        translation: 'Я не выигрываю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Ganas?',
                        translation: 'Ты выигрываешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo gané',
                        translation: 'Я выиграл',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú ganaste',
                        translation: 'Ты выиграл',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ganó',
                        translation: 'Он выиграл',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ganó',
                        translation: 'Она выиграла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros ganamos',
                        translation: 'Мы выиграли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos ganaron',
                        translation: 'Они выиграли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No gané',
                        translation: 'Я не выиграл',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Ganaste?',
                        translation: 'Ты выиграл?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'el barrio',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['район', 'квартал', 'округ'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vivo en el barrio antiguo',
                translation: 'Я живу в старом районе',
            },
            {
                pronoun: 'tú',
                example: 'Tú conoces mi barrio',
                translation: 'Ты знаешь мой район',
            },
            {
                pronoun: 'él',
                example: 'Él nació en este barrio',
                translation: 'Он родился в этом районе',
            },
            {
                pronoun: 'ella',
                example: 'Ella ama su barrio',
                translation: 'Она любит свой район',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros paseamos por el barrio',
                translation: 'Мы гуляем по району',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos juegan en el barrio',
                translation: 'Они играют в районе',
            },
            {
                pronoun: 'yo',
                example: 'No conozco este barrio',
                translation: 'Я не знаю этот район',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿De qué barrio eres?',
                translation: 'Из какого ты района?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'el pueblo',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['народ', 'деревня', 'городок'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vivo en el pueblo pequeño',
                translation: 'Я живу в маленьком городке',
            },
            {
                pronoun: 'tú',
                example: 'Tú vienes del pueblo',
                translation: 'Ты приехал из деревни',
            },
            {
                pronoun: 'él',
                example: 'Él ama su pueblo',
                translation: 'Он любит свой народ',
            },
            {
                pronoun: 'ella',
                example: 'Ella nació en este pueblo',
                translation: 'Она родилась в этом городке',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros somos del pueblo',
                translation: 'Мы из деревни',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos representan al pueblo',
                translation: 'Они представляют народ',
            },
            {
                pronoun: 'yo',
                example: 'No conozco este pueblo',
                translation: 'Я не знаю этот городок',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿De qué pueblo eres?',
                translation: 'Из какого ты городка?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'invierno',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['зима', 'зимний сезон'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo odio el invierno frío',
                translation: 'Я ненавижу холодную зиму',
            },
            {
                pronoun: 'tú',
                example: 'Tú esquías en invierno',
                translation: 'Ты катаешься на лыжах зимой',
            },
            {
                pronoun: 'él',
                example: 'Él viaja en invierno',
                translation: 'Он путешествует зимой',
            },
            {
                pronoun: 'ella',
                example: 'Ella ama el invierno',
                translation: 'Она любит зиму',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros esperamos el invierno',
                translation: 'Мы ждем зиму',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos pasan el invierno aquí',
                translation: 'Они проводят зиму здесь',
            },
            {
                pronoun: 'yo',
                example: 'No me gusta el invierno',
                translation: 'Мне не нравится зима',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Qué haces en invierno?',
                translation: 'Что ты делаешь зимой?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'verano',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['лето', 'летний сезон'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo amo el verano caluroso',
                translation: 'Я люблю жаркое лето',
            },
            {
                pronoun: 'tú',
                example: 'Tú nadas en verano',
                translation: 'Ты плаваешь летом',
            },
            {
                pronoun: 'él',
                example: 'Él viaja en verano',
                translation: 'Он путешествует летом',
            },
            {
                pronoun: 'ella',
                example: 'Ella descansa en verano',
                translation: 'Она отдыхает летом',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros esperamos el verano',
                translation: 'Мы ждем лета',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos pasan el verano en la playa',
                translation: 'Они проводят лето на пляже',
            },
            {
                pronoun: 'yo',
                example: 'No me gusta el verano húmedo',
                translation: 'Мне не нравится влажное лето',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Qué haces en verano?',
                translation: 'Что ты делаешь летом?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'doler',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['болеть', 'причинять боль', 'ныть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me duele la cabeza',
                translation: 'У меня болит голова',
            },
            {
                pronoun: 'tú',
                example: 'Te duele el estómago',
                translation: 'У тебя болит живот',
            },
            {
                pronoun: 'él',
                example: 'Le duele la pierna',
                translation: 'У него болит нога',
            },
            {
                pronoun: 'ella',
                example: 'Le duele el brazo',
                translation: 'У нее болит рука',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos duelen los pies',
                translation: 'У нас болят ноги',
            },
            {
                pronoun: 'ellos',
                example: 'Les duele la espalda',
                translation: 'У них болит спина',
            },
            {
                pronoun: 'yo',
                example: 'No me duele nada',
                translation: 'У меня ничего не болит',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te duele algo?',
                translation: 'У тебя что-то болит?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me duele',
                        translation: 'Мне больно',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te duele',
                        translation: 'Тебе больно',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le duele',
                        translation: 'Ему больно',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le duele',
                        translation: 'Ей больно',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos duele',
                        translation: 'Нам больно',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os duele',
                        translation: 'Вам больно',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les duele',
                        translation: 'Им больно',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me duele',
                        translation: 'Мне не больно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te duele?',
                        translation: 'Тебе больно?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me dolió',
                        translation: 'Мне заболело',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te dolió',
                        translation: 'Тебе заболело',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le dolió',
                        translation: 'Ему заболело',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le dolió',
                        translation: 'Ей заболело',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos dolió',
                        translation: 'Нам заболело',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les dolió',
                        translation: 'Им заболело',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me dolió',
                        translation: 'Мне не заболело',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te dolió?',
                        translation: 'Тебе заболело?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'aceite',
        partOfSpeech: PartOfSpeech.NOUN,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['масло', 'нефть', 'масляная краска'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo uso aceite de oliva',
                translation: 'Я использую оливковое масло',
            },
            {
                pronoun: 'tú',
                example: 'Tú cocinas con aceite',
                translation: 'Ты готовишь на масле',
            },
            {
                pronoun: 'él',
                example: 'Él vende aceite',
                translation: 'Он продает масло',
            },
            {
                pronoun: 'ella',
                example: 'Ella compra aceite',
                translation: 'Она покупает масло',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros necesitamos aceite',
                translation: 'Нам нужно масло',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos producen aceite',
                translation: 'Они производят масло',
            },
            {
                pronoun: 'yo',
                example: 'No tengo aceite',
                translation: 'У меня нет масла',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Quieres aceite?',
                translation: 'Хочешь масло?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'entendido',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['понятно', 'договорились', 'ясно'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo estoy entendido',
                translation: 'Я понял',
            },
            {
                pronoun: 'tú',
                example: 'Tú estás entendido',
                translation: 'Ты понял',
            },
            {
                pronoun: 'él',
                example: 'Él está entendido',
                translation: 'Он понял',
            },
            {
                pronoun: 'ella',
                example: 'Ella está entendida',
                translation: 'Она поняла',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros estamos entendidos',
                translation: 'Мы поняли',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos están entendidos',
                translation: 'Они поняли',
            },
            {
                pronoun: 'yo',
                example: 'No estoy entendido',
                translation: 'Я не понял',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Estás entendido?',
                translation: 'Ты понял?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [],
    },
    {
        word: 'pillar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['поймать', 'схватить', 'понять'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo pillo el autobús',
                translation: 'Я ловлю автобус',
            },
            {
                pronoun: 'tú',
                example: 'Tú pillas el sentido',
                translation: 'Ты понимаешь смысл',
            },
            {
                pronoun: 'él',
                example: 'Él pilla resfriados',
                translation: 'Он простужается',
            },
            {
                pronoun: 'ella',
                example: 'Ella pilla flores',
                translation: 'Она рвет цветы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros pillamos el tren',
                translation: 'Мы ловим поезд',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos pillan el chiste',
                translation: 'Они понимают шутку',
            },
            {
                pronoun: 'yo',
                example: 'No pillo nada',
                translation: 'Я ничего не понимаю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pillaste el tren?',
                translation: 'Ты поймал поезд?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pillo',
                        translation: 'Я ловлю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pillas',
                        translation: 'Ты ловишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pilla',
                        translation: 'Он ловит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pilla',
                        translation: 'Она ловит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pillamos',
                        translation: 'Мы ловим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros pilláis',
                        translation: 'Вы ловите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pillan',
                        translation: 'Они ловят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pillo',
                        translation: 'Я не ловлю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pillas?',
                        translation: 'Ты ловишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pillé',
                        translation: 'Я поймал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pillaste',
                        translation: 'Ты поймал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pilló',
                        translation: 'Он поймал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pilló',
                        translation: 'Она поймала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pillamos',
                        translation: 'Мы поймали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pillaron',
                        translation: 'Они поймали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pillé',
                        translation: 'Я не поймал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pillaste?',
                        translation: 'Ты поймал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'ser',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['быть', 'являться', 'существовать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo soy estudiante',
                translation: 'Я студент',
            },
            {
                pronoun: 'tú',
                example: 'Tú eres inteligente',
                translation: 'Ты умный',
            },
            {
                pronoun: 'él',
                example: 'Él es profesor',
                translation: 'Он преподаватель',
            },
            {
                pronoun: 'ella',
                example: 'Ella es hermosa',
                translation: 'Она красивая',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros somos amigos',
                translation: 'Мы друзья',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos son españoles',
                translation: 'Они испанцы',
            },
            {
                pronoun: 'yo',
                example: 'No soy rico',
                translation: 'Я не богатый',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Eres feliz?',
                translation: 'Ты счастлив?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    { pronoun: 'yo', example: 'Yo soy', translation: 'Я есть' },
                    {
                        pronoun: 'tú',
                        example: 'Tú eres',
                        translation: 'Ты есть',
                    },
                    { pronoun: 'él', example: 'Él es', translation: 'Он есть' },
                    {
                        pronoun: 'ella',
                        example: 'Ella es',
                        translation: 'Она есть',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros somos',
                        translation: 'Мы есть',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros sois',
                        translation: 'Вы есть',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos son',
                        translation: 'Они есть',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No soy',
                        translation: 'Я не есть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Eres?',
                        translation: 'Ты есть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he sido',
                        translation: 'Я был',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has sido',
                        translation: 'Ты был',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha sido',
                        translation: 'Он был',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha sido',
                        translation: 'Она была',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos sido',
                        translation: 'Мы были',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han sido',
                        translation: 'Они были',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he sido',
                        translation: 'Я не был',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has sido?',
                        translation: 'Ты был?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    { pronoun: 'yo', example: 'Yo fui', translation: 'Я был' },
                    {
                        pronoun: 'tú',
                        example: 'Tú fuiste',
                        translation: 'Ты был',
                    },
                    { pronoun: 'él', example: 'Él fue', translation: 'Он был' },
                    {
                        pronoun: 'ella',
                        example: 'Ella fue',
                        translation: 'Она была',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros fuimos',
                        translation: 'Мы были',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos fueron',
                        translation: 'Они были',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No fui',
                        translation: 'Я не был',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Fuiste?',
                        translation: 'Ты был?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a ser',
                        translation: 'Я буду быть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a ser',
                        translation: 'Ты будешь быть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a ser',
                        translation: 'Он будет быть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a ser',
                        translation: 'Она будет быть',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a ser',
                        translation: 'Мы будем быть',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a ser',
                        translation: 'Они будут быть',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a ser',
                        translation: 'Я не буду быть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a ser?',
                        translation: 'Ты будешь быть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy siendo',
                        translation: 'Я есть (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás siendo',
                        translation: 'Ты есть (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está siendo',
                        translation: 'Он есть (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está siendo',
                        translation: 'Она есть (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos siendo',
                        translation: 'Мы есть (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están siendo',
                        translation: 'Они есть (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy siendo',
                        translation: 'Я не есть (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás siendo?',
                        translation: 'Ты есть (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'estar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['быть', 'находиться', 'чувствовать себя'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo estoy en casa',
                translation: 'Я дома',
            },
            {
                pronoun: 'tú',
                example: 'Tú estás cansado',
                translation: 'Ты усталый',
            },
            {
                pronoun: 'él',
                example: 'Él está trabajando',
                translation: 'Он работает',
            },
            {
                pronoun: 'ella',
                example: 'Ella está feliz',
                translation: 'Она счастлива',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros estamos juntos',
                translation: 'Мы вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos están comiendo',
                translation: 'Они едят',
            },
            {
                pronoun: 'yo',
                example: 'No estoy listo',
                translation: 'Я не готов',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Estás bien?',
                translation: 'Ты в порядке?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy',
                        translation: 'Я есть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás',
                        translation: 'Ты есть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está',
                        translation: 'Он есть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está',
                        translation: 'Она есть',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos',
                        translation: 'Мы есть',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros estáis',
                        translation: 'Вы есть',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están',
                        translation: 'Они есть',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy',
                        translation: 'Я не есть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás?',
                        translation: 'Ты есть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he estado',
                        translation: 'Я был',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has estado',
                        translation: 'Ты был',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha estado',
                        translation: 'Он был',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha estado',
                        translation: 'Она была',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos estado',
                        translation: 'Мы были',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han estado',
                        translation: 'Они были',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he estado',
                        translation: 'Я не был',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has estado?',
                        translation: 'Ты был?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estuve',
                        translation: 'Я был',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estuviste',
                        translation: 'Ты был',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él estuvo',
                        translation: 'Он был',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella estuvo',
                        translation: 'Она была',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estuvimos',
                        translation: 'Мы были',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos estuvieron',
                        translation: 'Они были',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estuve',
                        translation: 'Я не был',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estuviste?',
                        translation: 'Ты был?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a estar',
                        translation: 'Я буду быть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a estar',
                        translation: 'Ты будешь быть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a estar',
                        translation: 'Он будет быть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a estar',
                        translation: 'Она будет быть',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a estar',
                        translation: 'Мы будем быть',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a estar',
                        translation: 'Они будут быть',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a estar',
                        translation: 'Я не буду быть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a estar?',
                        translation: 'Ты будешь быть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy estando',
                        translation: 'Я есть (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás estando',
                        translation: 'Ты есть (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está estando',
                        translation: 'Он есть (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está estando',
                        translation: 'Она есть (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos estando',
                        translation: 'Мы есть (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están estando',
                        translation: 'Они есть (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy estando',
                        translation: 'Я не есть (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás estando?',
                        translation: 'Ты есть (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'tener',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['иметь', 'обладать', 'держать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tengo un perro',
                translation: 'У меня есть собака',
            },
            {
                pronoun: 'tú',
                example: 'Tú tienes hambre',
                translation: 'Ты голодный',
            },
            {
                pronoun: 'él',
                example: 'Él tiene razón',
                translation: 'Он прав',
            },
            {
                pronoun: 'ella',
                example: 'Ella tiene sueño',
                translation: 'Она хочет спать',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tenemos tiempo',
                translation: 'У нас есть время',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos tienen dinero',
                translation: 'У них есть деньги',
            },
            {
                pronoun: 'yo',
                example: 'No tengo miedo',
                translation: 'Я не боюсь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tienes frío?',
                translation: 'Тебе холодно?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo tengo',
                        translation: 'Я имею',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú tienes',
                        translation: 'Ты имеешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él tiene',
                        translation: 'Он имеет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella tiene',
                        translation: 'Она имеет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tenemos',
                        translation: 'Мы имеем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros tenéis',
                        translation: 'Вы имеете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos tienen',
                        translation: 'Они имеют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No tengo',
                        translation: 'Я не имею',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Tienes?',
                        translation: 'Ты имеешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he tenido',
                        translation: 'Я имел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has tenido',
                        translation: 'Ты имел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha tenido',
                        translation: 'Он имел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha tenido',
                        translation: 'Она имела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos tenido',
                        translation: 'Мы имели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han tenido',
                        translation: 'Они имели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he tenido',
                        translation: 'Я не имел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has tenido?',
                        translation: 'Ты имел?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo tuve',
                        translation: 'Я имел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú tuviste',
                        translation: 'Ты имел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él tuvo',
                        translation: 'Он имел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella tuvo',
                        translation: 'Она имела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tuvimos',
                        translation: 'Мы имели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos tuvieron',
                        translation: 'Они имели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No tuve',
                        translation: 'Я не имел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Tuviste?',
                        translation: 'Ты имел?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a tener',
                        translation: 'Я буду иметь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a tener',
                        translation: 'Ты будешь иметь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a tener',
                        translation: 'Он будет иметь',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a tener',
                        translation: 'Она будет иметь',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a tener',
                        translation: 'Мы будем иметь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a tener',
                        translation: 'Они будут иметь',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a tener',
                        translation: 'Я не буду иметь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a tener?',
                        translation: 'Ты будешь иметь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy teniendo',
                        translation: 'Я имею (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás teniendo',
                        translation: 'Ты имеешь (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está teniendo',
                        translation: 'Он имеет (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está teniendo',
                        translation: 'Она имеет (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos teniendo',
                        translation: 'Мы имеем (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están teniendo',
                        translation: 'Они имеют (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy teniendo',
                        translation: 'Я не имею (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás teniendo?',
                        translation: 'Ты имеешь (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'hacer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['делать', 'изготавливать', 'выполнять'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo hago ejercicio',
                translation: 'Я занимаюсь спортом',
            },
            {
                pronoun: 'tú',
                example: 'Tú haces la comida',
                translation: 'Ты готовишь еду',
            },
            {
                pronoun: 'él',
                example: 'Él hace ruido',
                translation: 'Он шумит',
            },
            {
                pronoun: 'ella',
                example: 'Ella hace preguntas',
                translation: 'Она задает вопросы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros hacemos fiestas',
                translation: 'Мы устраиваем вечеринки',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos hacen arte',
                translation: 'Они создают искусство',
            },
            {
                pronoun: 'yo',
                example: 'No hago nada',
                translation: 'Я ничего не делаю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Haces yoga?',
                translation: 'Ты занимаешься йогой?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hago',
                        translation: 'Я делаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú haces',
                        translation: 'Ты делаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él hace',
                        translation: 'Он делает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella hace',
                        translation: 'Она делает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hacemos',
                        translation: 'Мы делаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros hacéis',
                        translation: 'Вы делаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hacen',
                        translation: 'Они делают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hago',
                        translation: 'Я не делаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Haces?',
                        translation: 'Ты делаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he hecho',
                        translation: 'Я сделал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has hecho',
                        translation: 'Ты сделал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha hecho',
                        translation: 'Он сделал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha hecho',
                        translation: 'Она сделала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos hecho',
                        translation: 'Мы сделали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han hecho',
                        translation: 'Они сделали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he hecho',
                        translation: 'Я не сделал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has hecho?',
                        translation: 'Ты сделал?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hice',
                        translation: 'Я сделал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú hiciste',
                        translation: 'Ты сделал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él hizo',
                        translation: 'Он сделал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella hizo',
                        translation: 'Она сделала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hicimos',
                        translation: 'Мы сделали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hicieron',
                        translation: 'Они сделали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hice',
                        translation: 'Я не сделал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Hiciste?',
                        translation: 'Ты сделал?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a hacer',
                        translation: 'Я буду делать',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a hacer',
                        translation: 'Ты будешь делать',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a hacer',
                        translation: 'Он будет делать',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a hacer',
                        translation: 'Она будет делать',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a hacer',
                        translation: 'Мы будем делать',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a hacer',
                        translation: 'Они будут делать',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a hacer',
                        translation: 'Я не буду делать',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a hacer?',
                        translation: 'Ты будешь делать?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy haciendo',
                        translation: 'Я делаю (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás haciendo',
                        translation: 'Ты делаешь (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está haciendo',
                        translation: 'Он делает (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está haciendo',
                        translation: 'Она делает (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos haciendo',
                        translation: 'Мы делаем (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están haciendo',
                        translation: 'Они делают (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy haciendo',
                        translation: 'Я не делаю (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás haciendo?',
                        translation: 'Ты делаешь (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'ir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['идти', 'ехать', 'уходить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo voy al trabajo',
                translation: 'Я иду на работу',
            },
            {
                pronoun: 'tú',
                example: 'Tú vas a la escuela',
                translation: 'Ты идешь в школу',
            },
            {
                pronoun: 'él',
                example: 'Él va al cine',
                translation: 'Он идет в кино',
            },
            {
                pronoun: 'ella',
                example: 'Ella va de compras',
                translation: 'Она идет за покупками',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros vamos juntos',
                translation: 'Мы идем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos van al parque',
                translation: 'Они идут в парк',
            },
            {
                pronoun: 'yo',
                example: 'No voy solo',
                translation: 'Я не иду один',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Vas conmigo?',
                translation: 'Ты идешь со мной?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    { pronoun: 'yo', example: 'Yo voy', translation: 'Я иду' },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas',
                        translation: 'Ты идешь',
                    },
                    { pronoun: 'él', example: 'Él va', translation: 'Он идет' },
                    {
                        pronoun: 'ella',
                        example: 'Ella va',
                        translation: 'Она идет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos',
                        translation: 'Мы идем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros vais',
                        translation: 'Вы идете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van',
                        translation: 'Они идут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy',
                        translation: 'Я не иду',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas?',
                        translation: 'Ты идешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he ido',
                        translation: 'Я ходил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has ido',
                        translation: 'Ты ходил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha ido',
                        translation: 'Он ходил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha ido',
                        translation: 'Она ходила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos ido',
                        translation: 'Мы ходили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han ido',
                        translation: 'Они ходили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he ido',
                        translation: 'Я не ходил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has ido?',
                        translation: 'Ты ходил?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo fui',
                        translation: 'Я пошел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú fuiste',
                        translation: 'Ты пошел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él fue',
                        translation: 'Он пошел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella fue',
                        translation: 'Она пошла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros fuimos',
                        translation: 'Мы пошли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos fueron',
                        translation: 'Они пошли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No fui',
                        translation: 'Я не пошел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Fuiste?',
                        translation: 'Ты пошел?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a ir',
                        translation: 'Я буду идти',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a ir',
                        translation: 'Ты будешь идти',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a ir',
                        translation: 'Он будет идти',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a ir',
                        translation: 'Она будет идти',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a ir',
                        translation: 'Мы будем идти',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a ir',
                        translation: 'Они будут идти',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a ir',
                        translation: 'Я не буду идти',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a ir?',
                        translation: 'Ты будешь идти?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy yendo',
                        translation: 'Я иду (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás yendo',
                        translation: 'Ты идешь (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está yendo',
                        translation: 'Он идет (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está yendo',
                        translation: 'Она идет (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos yendo',
                        translation: 'Мы идем (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están yendo',
                        translation: 'Они идут (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy yendo',
                        translation: 'Я не иду (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás yendo?',
                        translation: 'Ты идешь (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'ver',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['видеть', 'смотреть', 'встречать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo veo la televisión',
                translation: 'Я смотрю телевизор',
            },
            {
                pronoun: 'tú',
                example: 'Tú ves películas',
                translation: 'Ты смотришь фильмы',
            },
            {
                pronoun: 'él',
                example: 'Él ve el mar',
                translation: 'Он видит море',
            },
            {
                pronoun: 'ella',
                example: 'Ella ve a sus amigos',
                translation: 'Она встречает своих друзей',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros vemos el futuro',
                translation: 'Мы видим будущее',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos ven fantasmas',
                translation: 'Они видят призраков',
            },
            {
                pronoun: 'yo',
                example: 'No veo nada',
                translation: 'Я ничего не вижу',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Ves ese edificio?',
                translation: 'Ты видишь то здание?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    { pronoun: 'yo', example: 'Yo veo', translation: 'Я вижу' },
                    {
                        pronoun: 'tú',
                        example: 'Tú ves',
                        translation: 'Ты видишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ve',
                        translation: 'Он видит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ve',
                        translation: 'Она видит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vemos',
                        translation: 'Мы видим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros veis',
                        translation: 'Вы видите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos ven',
                        translation: 'Они видят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No veo',
                        translation: 'Я не вижу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Ves?',
                        translation: 'Ты видишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he visto',
                        translation: 'Я видел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has visto',
                        translation: 'Ты видел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha visto',
                        translation: 'Он видел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha visto',
                        translation: 'Она видела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos visto',
                        translation: 'Мы видели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han visto',
                        translation: 'Они видели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he visto',
                        translation: 'Я не видел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has visto?',
                        translation: 'Ты видел?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vi',
                        translation: 'Я увидел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú viste',
                        translation: 'Ты увидел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vio',
                        translation: 'Он увидел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vio',
                        translation: 'Она увидела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vimos',
                        translation: 'Мы увидели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vieron',
                        translation: 'Они увидели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vi',
                        translation: 'Я не увидел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Viste?',
                        translation: 'Ты увидел?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a ver',
                        translation: 'Я буду видеть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a ver',
                        translation: 'Ты будешь видеть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a ver',
                        translation: 'Он будет видеть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a ver',
                        translation: 'Она будет видеть',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a ver',
                        translation: 'Мы будем видеть',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a ver',
                        translation: 'Они будут видеть',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a ver',
                        translation: 'Я не буду видеть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a ver?',
                        translation: 'Ты будешь видеть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy viendo',
                        translation: 'Я вижу (сейчас)',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás viendo',
                        translation: 'Ты видишь (сейчас)',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está viendo',
                        translation: 'Он видит (сейчас)',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está viendo',
                        translation: 'Она видит (сейчас)',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos viendo',
                        translation: 'Мы видим (сейчас)',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están viendo',
                        translation: 'Они видят (сейчас)',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy viendo',
                        translation: 'Я не вижу (сейчас)',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás viendo?',
                        translation: 'Ты видишь (сейчас)?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'dar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['давать', 'дарить', 'предоставлять'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo doy regalos',
                translation: 'Я дарю подарки',
            },
            {
                pronoun: 'tú',
                example: 'Tú das consejos',
                translation: 'Ты даешь советы',
            },
            {
                pronoun: 'él',
                example: 'Él da clases',
                translation: 'Он дает уроки',
            },
            {
                pronoun: 'ella',
                example: 'Ella da besos',
                translation: 'Она дает поцелуи',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros damos fiestas',
                translation: 'Мы устраиваем вечеринки',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos dan conciertos',
                translation: 'Они дают концерты',
            },
            {
                pronoun: 'yo',
                example: 'No doy excusas',
                translation: 'Я не даю отговорки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Das propina?',
                translation: 'Ты даешь чаевые?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo doy clases de español',
                        translation: 'Я даю уроки испанского',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú das consejos útiles',
                        translation: 'Ты даешь полезные советы',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él da conciertos en Madrid',
                        translation: 'Он дает концерты в Мадриде',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella da besos a su perro',
                        translation: 'Она дает поцелуи своей собаке',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros damos fiestas inolvidables',
                        translation: 'Мы устраиваем незабываемые вечеринки',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dan regalos caros',
                        translation: 'Они дарят дорогие подарки',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No doy excusas tontas',
                        translation: 'Я не даю глупые отговорки',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Das propina en restaurantes?',
                        translation: 'Ты даешь чаевые в ресторанах?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he dado mi palabra',
                        translation: 'Я дал свое слово',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has dado consejos sabios',
                        translation: 'Ты дал мудрые советы',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha dado un concierto magnífico',
                        translation: 'Он дал великолепный концерт',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha dado besos dulces',
                        translation: 'Она дала сладкие поцелуи',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos dado fiestas épicas',
                        translation: 'Мы дали эпические вечеринки',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han dado regalos generosos',
                        translation: 'Они дали щедрые подарки',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he dado falsas esperanzas',
                        translation: 'Я не дал ложных надежд',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has dado tu opinión?',
                        translation: 'Ты дал свое мнение?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo di un regalo especial',
                        translation: 'Я дал особый подарок',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú diste consejos valiosos',
                        translation: 'Ты дал ценные советы',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él dio un concierto memorable',
                        translation: 'Он дал незабываемый концерт',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella dio besos apasionados',
                        translation: 'Она дала страстные поцелуи',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros dimos fiestas legendarias',
                        translation: 'Мы дали легендарные вечеринки',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dieron regalos sorprendentes',
                        translation: 'Они дали удивительные подарки',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No di excusas débiles',
                        translation: 'Я не дал слабые отговорки',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Diste propina generosa?',
                        translation: 'Ты дал щедрые чаевые?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a dar clases mañana',
                        translation: 'Я буду давать уроки завтра',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a dar consejos importantes',
                        translation: 'Ты будешь давать важные советы',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a dar un concierto increíble',
                        translation: 'Он будет давать невероятный концерт',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a dar besos tiernos',
                        translation: 'Она будет давать нежные поцелуи',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a dar fiestas divertidas',
                        translation: 'Мы будем устраивать веселые вечеринки',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a dar regalos únicos',
                        translation: 'Они будут дарить уникальные подарки',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a dar falsas promesas',
                        translation: 'Я не буду давать ложных обещаний',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a dar tu opinión?',
                        translation: 'Ты будешь давать свое мнение?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy dando clases ahora',
                        translation: 'Я даю уроки сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás dando consejos útiles',
                        translation: 'Ты даешь полезные советы сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está dando un concierto',
                        translation: 'Он дает концерт сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está dando besos',
                        translation: 'Она дает поцелуи сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos dando fiestas',
                        translation: 'Мы устраиваем вечеринки сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están dando regalos',
                        translation: 'Они дарят подарки сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy dando excusas',
                        translation: 'Я не даю отговорки сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás dando propina?',
                        translation: 'Ты даешь чаевые сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'saber',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['знать', 'уметь', 'ведать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo sé nadar',
                translation: 'Я умею плавать',
            },
            {
                pronoun: 'tú',
                example: 'Tú sabes cocinar',
                translation: 'Ты умеешь готовить',
            },
            {
                pronoun: 'él',
                example: 'Él sabe la respuesta',
                translation: 'Он знает ответ',
            },
            {
                pronoun: 'ella',
                example: 'Ella sabe tocar piano',
                translation: 'Она умеет играть на пианино',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros sabemos bailar',
                translation: 'Мы умеем танцевать',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos saben hablar español',
                translation: 'Они умеют говорить по-испански',
            },
            {
                pronoun: 'yo',
                example: 'No sé nada',
                translation: 'Я ничего не знаю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Sabes conducir?',
                translation: 'Ты умеешь водить?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo sé tocar la guitarra',
                        translation: 'Я умею играть на гитаре',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú sabes cocinar platos deliciosos',
                        translation: 'Ты умеешь готовить вкусные блюда',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él sabe resolver problemas complejos',
                        translation: 'Он умеет решать сложные проблемы',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella sabe bailar salsa perfectamente',
                        translation: 'Она умеет танцевать сальсу идеально',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros sabemos hablar varios idiomas',
                        translation: 'Мы умеем говорить на нескольких языках',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos saben programar aplicaciones',
                        translation: 'Они умеют программировать приложения',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No sé nada de matemáticas',
                        translation: 'Я ничего не знаю о математике',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Sabes conducir un coche?',
                        translation: 'Ты умеешь водить машину?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he sabido la verdad',
                        translation: 'Я узнал правду',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has sabido cocinar sushi',
                        translation: 'Ты научился готовить суши',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha sabido resolver el enigma',
                        translation: 'Он сумел разгадать загадку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha sabido bailar tango',
                        translation: 'Она научилась танцевать танго',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos sabido hablar portugués',
                        translation: 'Мы научились говорить по-португальски',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han sabido programar en Python',
                        translation: 'Они научились программировать на Python',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he sabido la respuesta',
                        translation: 'Я не узнал ответ',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has sabido nadar?',
                        translation: 'Ты научился плавать?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo supe la noticia ayer',
                        translation: 'Я узнал новость вчера',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú supiste cocinar cuando eras niño',
                        translation: 'Ты научился готовить, когда был ребенком',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él supo resolver el puzzle',
                        translation: 'Он сумел решить пазл',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella supo bailar flamenco',
                        translation: 'Она научилась танцевать фламенко',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros supimos hablar francés',
                        translation: 'Мы научились говорить по-французски',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos supieron programar robots',
                        translation: 'Они научились программировать роботов',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No supe la solución',
                        translation: 'Я не узнал решение',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Supiste montar en bici?',
                        translation: 'Ты научился кататься на велосипеде?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a saber la respuesta pronto',
                        translation: 'Я скоро узнаю ответ',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a saber cocinar pasta italiana',
                        translation: 'Ты научишься готовить итальянскую пасту',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a saber resolver ecuaciones',
                        translation: 'Он научится решать уравнения',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a saber bailar merengue',
                        translation: 'Она научится танцевать меренге',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a saber hablar chino',
                        translation: 'Мы научимся говорить по-китайски',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a saber programar videojuegos',
                        translation: 'Они научатся программировать видеоигры',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a saber la verdad nunca',
                        translation: 'Я никогда не узнаю правду',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a saber tocar el piano?',
                        translation: 'Ты научишься играть на пианино?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy sabiendo nuevas cosas',
                        translation: 'Я узнаю новые вещи сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás sabiendo cocinar mejor',
                        translation: 'Ты учишься готовить лучше сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está sabiendo resolver misterios',
                        translation: 'Он учится разгадывать тайны сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está sabiendo bailar ritmos latinos',
                        translation:
                            'Она учится танцевать латиноамериканские ритмы сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos sabiendo hablar japonés',
                        translation: 'Мы учимся говорить по-японски сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example:
                            'Ellos están sabiendo programar inteligencia artificial',
                        translation: 'Они учатся программировать ИИ сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy sabiendo nada nuevo',
                        translation: 'Я не узнаю ничего нового сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás sabiendo tocar instrumentos?',
                        translation:
                            'Ты учишься играть на инструментах сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'querer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['хотеть', 'любить', 'желать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo quiero viajar',
                translation: 'Я хочу путешествовать',
            },
            {
                pronoun: 'tú',
                example: 'Tú quieres estudiar',
                translation: 'Ты хочешь учиться',
            },
            {
                pronoun: 'él',
                example: 'Él quiere comer',
                translation: 'Он хочет есть',
            },
            {
                pronoun: 'ella',
                example: 'Ella quiere dormir',
                translation: 'Она хочет спать',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros queremos ganar',
                translation: 'Мы хотим выиграть',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos quieren vivir aquí',
                translation: 'Они хотят жить здесь',
            },
            {
                pronoun: 'yo',
                example: 'No quiero ir',
                translation: 'Я не хочу идти',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Quieres café?',
                translation: 'Хочешь кофе?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo quiero comer pizza italiana',
                        translation: 'Я хочу есть итальянскую пиццу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú quieres viajar por Europa',
                        translation: 'Ты хочешь путешествовать по Европе',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él quiere ser astronauta',
                        translation: 'Он хочет быть астронавтом',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella quiere aprender a bailar',
                        translation: 'Она хочет научиться танцевать',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros queremos ganar el torneo',
                        translation: 'Мы хотим выиграть турнир',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos quieren vivir en la playa',
                        translation: 'Они хотят жить на пляже',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No quiero comer verduras',
                        translation: 'Я не хочу есть овощи',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Quieres ver una película?',
                        translation: 'Хочешь посмотреть фильм?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he querido estudiar medicina',
                        translation: 'Я хотел изучать медицину',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has querido viajar al espacio',
                        translation: 'Ты хотел путешествовать в космос',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha querido ser artista famoso',
                        translation: 'Он хотел быть знаменитым артистом',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha querido aprender idiomas',
                        translation: 'Она хотела изучать языки',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos querido ganar el premio',
                        translation: 'Мы хотели выиграть приз',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han querido vivir en el campo',
                        translation: 'Они хотели жить в деревне',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he querido cambiar de trabajo',
                        translation: 'Я не хотел менять работу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has querido ser profesor?',
                        translation: 'Ты хотел быть учителем?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo quise comprar una casa nueva',
                        translation: 'Я хотел купить новый дом',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú quisiste viajar a Japón',
                        translation: 'Ты хотел путешествовать в Японию',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él quiso ser piloto de carreras',
                        translation: 'Он хотел быть гонщиком',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella quiso aprender a surfear',
                        translation: 'Она хотела научиться серфингу',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros quisimos ganar la lotería',
                        translation: 'Мы хотели выиграть в лотерею',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos quisieron vivir en las montañas',
                        translation: 'Они хотели жить в горах',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No quise aceptar la oferta',
                        translation: 'Я не хотел принимать предложение',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Quisiste estudiar arte?',
                        translation: 'Ты хотел изучать искусство?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a querer comer sushi mañana',
                        translation: 'Я захочу есть суши завтра',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a querer viajar a América',
                        translation: 'Ты захочешь путешествовать в Америку',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a querer ser ingeniero',
                        translation: 'Он захочет быть инженером',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a querer aprender a pintar',
                        translation: 'Она захочет научиться рисовать',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a querer ganar el partido',
                        translation: 'Мы захотим выиграть матч',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a querer vivir en la ciudad',
                        translation: 'Они захотят жить в городе',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a querer comer carne',
                        translation: 'Я не захочу есть мясо',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a querer ver el concierto?',
                        translation: 'Ты захочешь посмотреть концерт?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy queriendo aprender música',
                        translation: 'Я хочу учиться музыке сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás queriendo viajar más',
                        translation: 'Ты хочешь путешествовать больше сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está queriendo ser chef',
                        translation: 'Он хочет быть шеф-поваром сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está queriendo aprender fotografía',
                        translation: 'Она хочет учиться фотографии сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos queriendo ganar experiencia',
                        translation: 'Мы хотим набираться опыта сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están queriendo vivir aventuras',
                        translation: 'Они хотят жить приключениями сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy queriendo trabajar hoy',
                        translation: 'Я не хочу работать сегодня',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás queriendo estudiar inglés?',
                        translation: 'Ты хочешь учить английский сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'llegar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['прибывать', 'приходить', 'достигать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo llego tarde',
                translation: 'Я прихожу поздно',
            },
            {
                pronoun: 'tú',
                example: 'Tú llegas temprano',
                translation: 'Ты приходишь рано',
            },
            {
                pronoun: 'él',
                example: 'Él llega a casa',
                translation: 'Он приходит домой',
            },
            {
                pronoun: 'ella',
                example: 'Ella llega al trabajo',
                translation: 'Она приходит на работу',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros llegamos juntos',
                translation: 'Мы приходим вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llegan en tren',
                translation: 'Они приезжают на поезде',
            },
            {
                pronoun: 'yo',
                example: 'No llego a tiempo',
                translation: 'Я не прихожу вовремя',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Llegas pronto?',
                translation: 'Ты приходишь скоро?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llego al aeropuerto a tiempo',
                        translation: 'Я прихожу в аэропорт вовремя',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llegas a la reunión temprano',
                        translation: 'Ты приходишь на встречу рано',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llega a casa después del trabajo',
                        translation: 'Он приходит домой после работы',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llega al concierto con amigos',
                        translation: 'Она приходит на концерт с друзьями',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llegamos a la playa juntos',
                        translation: 'Мы приходим на пляж вместе',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llegan al partido en autobús',
                        translation: 'Они приходят на матч на автобусе',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llego tarde nunca',
                        translation: 'Я никогда не прихожу поздно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llegas pronto al trabajo?',
                        translation: 'Ты приходишь рано на работу?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he llegado a Madrid ayer',
                        translation: 'Я приехал в Мадрид вчера',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has llegado a la fiesta a tiempo',
                        translation: 'Ты пришел на вечеринку вовремя',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha llegado al hotel tarde',
                        translation: 'Он пришел в отель поздно',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha llegado a la universidad temprano',
                        translation: 'Она пришла в университет рано',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos llegado a casa sanos',
                        translation: 'Мы пришли домой целыми',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han llegado al museo juntos',
                        translation: 'Они пришли в музей вместе',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he llegado tarde esta vez',
                        translation: 'Я не пришел поздно на этот раз',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has llegado bien al viaje?',
                        translation: 'Ты хорошо добрался в путешествие?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llegué a Barcelona en tren',
                        translation: 'Я приехал в Барселону на поезде',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llegaste al cine tarde',
                        translation: 'Ты пришел в кино поздно',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llegó a la oficina temprano',
                        translation: 'Он пришел в офис рано',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llegó a casa después de medianoche',
                        translation: 'Она пришла домой после полуночи',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llegamos al restaurante juntos',
                        translation: 'Мы пришли в ресторан вместе',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llegaron al aeropuerto con tiempo',
                        translation: 'Они пришли в аэропорт с запасом времени',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llegué a la reunión',
                        translation: 'Я не пришел на встречу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llegaste bien a casa?',
                        translation: 'Ты хорошо добрался домой?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a llegar al trabajo mañana',
                        translation: 'Я приду на работу завтра',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a llegar a la estación pronto',
                        translation: 'Ты придешь на станцию скоро',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a llegar a casa tarde',
                        translation: 'Он придет домой поздно',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a llegar al concierto a tiempo',
                        translation: 'Она придет на концерт вовремя',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a llegar al parque juntos',
                        translation: 'Мы придем в парк вместе',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a llegar al hotel mañana',
                        translation: 'Они придут в отель завтра',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a llegar tarde esta vez',
                        translation: 'Я не приду поздно на этот раз',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a llegar pronto?',
                        translation: 'Ты придешь скоро?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy llegando al aeropuerto ahora',
                        translation: 'Я прихожу в аэропорт сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás llegando a casa en este momento',
                        translation: 'Ты приходишь домой в этот момент',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está llegando al trabajo',
                        translation: 'Он приходит на работу сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está llegando a la reunión',
                        translation: 'Она приходит на встречу сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos llegando al restaurante',
                        translation: 'Мы приходим в ресторан сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están llegando al estadio',
                        translation: 'Они приходят на стадион сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy llegando tarde',
                        translation: 'Я не прихожу поздно сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás llegando pronto?',
                        translation: 'Ты приходишь скоро сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'pasar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['проходить', 'происходить', 'проводить время'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo paso tiempo con amigos',
                translation: 'Я провожу время с друзьями',
            },
            {
                pronoun: 'tú',
                example: 'Tú pasas por aquí',
                translation: 'Ты проходишь здесь',
            },
            {
                pronoun: 'él',
                example: 'Él pasa hambre',
                translation: 'Он голодает',
            },
            {
                pronoun: 'ella',
                example: 'Ella pasa el día estudiando',
                translation: 'Она проводит день за учебой',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros pasamos vacaciones',
                translation: 'Мы проводим каникулы',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos pasan por el parque',
                translation: 'Они проходят через парк',
            },
            {
                pronoun: 'yo',
                example: 'No paso frío',
                translation: 'Мне не холодно',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pasa algo?',
                translation: 'Что-то происходит?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo paso las vacaciones en la playa',
                        translation: 'Я провожу каникулы на пляже',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pasas mucho tiempo estudiando',
                        translation: 'Ты проводишь много времени за учебой',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pasa por el centro de la ciudad',
                        translation: 'Он проходит через центр города',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pasa hambre cuando hace dieta',
                        translation: 'Она голодает, когда сидит на диете',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pasamos frío en invierno',
                        translation: 'Мы мерзнем зимой',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pasan por la tienda cada día',
                        translation: 'Они проходят мимо магазина каждый день',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No paso calor en verano',
                        translation: 'Мне не жарко летом',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pasa algo malo?',
                        translation: 'Что-то плохое происходит?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he pasado las vacaciones en España',
                        translation: 'Я провел каникулы в Испании',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has pasado mucho tiempo trabajando',
                        translation: 'Ты провел много времени работая',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha pasado por situaciones difíciles',
                        translation: 'Он прошел через трудные ситуации',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha pasado hambre durante la guerra',
                        translation: 'Она голодала во время войны',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos pasado frío en las montañas',
                        translation: 'Мы замерзли в горах',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han pasado por el parque corriendo',
                        translation: 'Они прошли через парк бегом',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he pasado calor nunca',
                        translation: 'Мне никогда не было жарко',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has pasado por aquí antes?',
                        translation: 'Ты проходил здесь раньше?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pasé las vacaciones en México',
                        translation: 'Я провел каникулы в Мексике',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pasaste el examen con buena nota',
                        translation: 'Ты прошел экзамен с хорошей оценкой',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pasó por una crisis económica',
                        translation: 'Он прошел через экономический кризис',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pasó hambre en su juventud',
                        translation: 'Она голодала в своей молодости',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pasamos frío en la expedición',
                        translation: 'Мы замерзли в экспедиции',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pasaron por el túnel oscuro',
                        translation: 'Они прошли через темный туннель',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pasé el test de conducir',
                        translation: 'Я не прошел тест на вождение',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pasaste calor ayer?',
                        translation: 'Тебе было жарко вчера?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a pasar las vacaciones en Italia',
                        translation: 'Я буду проводить каникулы в Италии',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a pasar mucho tiempo leyendo',
                        translation: 'Ты будешь проводить много времени читая',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a pasar por el supermercado',
                        translation: 'Он будет проходить мимо супермаркета',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a pasar hambre si no come',
                        translation: 'Она будет голодать, если не поест',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a pasar frío en el viaje',
                        translation: 'Мы будем мерзнуть в путешествии',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a pasar por el museo mañana',
                        translation: 'Они будут проходить мимо музея завтра',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a pasar calor en la sombra',
                        translation: 'Я не буду страдать от жары в тени',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a pasar por casa?',
                        translation: 'Ты будешь проходить мимо дома?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy pasando las vacaciones ahora',
                        translation: 'Я провожу каникулы сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás pasando mucho tiempo estudiando',
                        translation:
                            'Ты проводишь много времени за учебой сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está pasando por una mala racha',
                        translation: 'Он проходит через полосу неудач сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está pasando hambre en este momento',
                        translation: 'Она голодает в этот момент',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos pasando frío aquí',
                        translation: 'Мы мерзнем здесь сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están pasando por el puente',
                        translation: 'Они проходят через мост сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy pasando calor ahora',
                        translation: 'Мне не жарко сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás pasando por dificultades?',
                        translation: 'Ты проходишь через трудности сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'deber',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['быть должным', 'долженствовать', 'обязан'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo debo estudiar',
                translation: 'Я должен учиться',
            },
            {
                pronoun: 'tú',
                example: 'Tú debes trabajar',
                translation: 'Ты должен работать',
            },
            {
                pronoun: 'él',
                example: 'Él debe dinero',
                translation: 'Он должен деньги',
            },
            {
                pronoun: 'ella',
                example: 'Ella debe llegar temprano',
                translation: 'Она должна прийти рано',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros debemos ayudar',
                translation: 'Мы должны помогать',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos deben esperar',
                translation: 'Они должны ждать',
            },
            {
                pronoun: 'yo',
                example: 'No debo fumar',
                translation: 'Я не должен курить',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Debes irte?',
                translation: 'Ты должен уходить?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo debo estudiar para el examen',
                        translation: 'Я должен учиться для экзамена',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú debes trabajar más duro',
                        translation: 'Ты должен работать усерднее',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él debe dinero al banco',
                        translation: 'Он должен деньги банку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella debe llegar a tiempo',
                        translation: 'Она должна прийти вовремя',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros debemos ayudar a los pobres',
                        translation: 'Мы должны помогать бедным',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos deben respetar las reglas',
                        translation: 'Они должны уважать правила',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No debo comer tantos dulces',
                        translation: 'Я не должен есть столько сладостей',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Debes ir al médico?',
                        translation: 'Ты должен пойти к врачу?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he debido estudiar más',
                        translation: 'Я должен был учиться больше',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has debido trabajar ayer',
                        translation: 'Ты должен был работать вчера',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha debido dinero toda la vida',
                        translation: 'Он должен деньги всю жизнь',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha debido llegar antes',
                        translation: 'Она должна была прийти раньше',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos debido ayudar más',
                        translation: 'Мы должны были помогать больше',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han debido respetar la ley',
                        translation: 'Они должны были уважать закон',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he debido gastar tanto',
                        translation: 'Я не должен был тратить столько',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has debido esperar mucho?',
                        translation: 'Ты должен был ждать долго?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo debí estudiar medicina',
                        translation: 'Я должен был изучать медицину',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú debiste trabajar en verano',
                        translation: 'Ты должен был работать летом',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él debió dinero a sus amigos',
                        translation: 'Он должен был деньги своим друзьям',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella debió llegar puntual',
                        translation: 'Она должна была прийти пунктуально',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros debimos ayudar en la emergencia',
                        translation:
                            'Мы должны были помочь в чрезвычайной ситуации',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos debieron respetar la tradición',
                        translation: 'Они должны были уважать традицию',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No debí comer tanta comida',
                        translation: 'Я не должен был есть столько еды',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Debiste ir a la reunión?',
                        translation: 'Ты должен был пойти на встречу?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a deber estudiar mañana',
                        translation: 'Я буду должен учиться завтра',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a deber trabajar horas extras',
                        translation: 'Ты будешь должен работать сверхурочно',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a deber dinero al prestamista',
                        translation: 'Он будет должен деньги ростовщику',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a deber llegar temprano',
                        translation: 'Она будет должна прийти рано',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a deber ayudar en casa',
                        translation: 'Мы будем должны помогать дома',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a deber respetar las normas',
                        translation: 'Они будут должны уважать нормы',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a deber nada a nadie',
                        translation: 'Я не буду должен ничего никому',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a deber ir al banco?',
                        translation: 'Ты будешь должен пойти в банк?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy debiendo estudiar ahora',
                        translation: 'Я должен учиться сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás debiendo trabajar más',
                        translation: 'Ты должен работать больше сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está debiendo dinero constantemente',
                        translation: 'Он должен деньги постоянно',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está debiendo llegar a tiempo',
                        translation: 'Она должна приходить вовремя сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos debiendo ayudar siempre',
                        translation: 'Мы должны помогать всегда',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están debiendo respetar las reglas',
                        translation: 'Они должны уважать правила сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy debiendo nada',
                        translation: 'Я ничего не должен сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás debiendo ir al dentista?',
                        translation: 'Ты должен пойти к стоматологу сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'poner',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['класть', 'ставить', 'помещать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo pongo la mesa',
                translation: 'Я накрываю на стол',
            },
            {
                pronoun: 'tú',
                example: 'Tú pones atención',
                translation: 'Ты обращаешь внимание',
            },
            {
                pronoun: 'él',
                example: 'Él pone música',
                translation: 'Он включает музыку',
            },
            {
                pronoun: 'ella',
                example: 'Ella pone excusas',
                translation: 'Она находит отговорки',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros ponemos esfuerzo',
                translation: 'Мы прилагаем усилия',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos ponen dinero',
                translation: 'Они вкладывают деньги',
            },
            {
                pronoun: 'yo',
                example: 'No pongo límites',
                translation: 'Я не устанавливаю границы',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pones azúcar?',
                translation: 'Ты добавляешь сахар?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pongo la mesa para cenar',
                        translation: 'Я накрываю стол для ужина',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pones atención en clase',
                        translation: 'Ты обращаешь внимание на уроке',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pone música clásica',
                        translation: 'Он включает классическую музыку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pone excusas ridículas',
                        translation: 'Она находит смешные отговорки',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros ponemos esfuerzo máximo',
                        translation: 'Мы прилагаем максимум усилий',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos ponen dinero en el banco',
                        translation: 'Они кладут деньги в банк',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pongo límites a mi imaginación',
                        translation:
                            'Я не устанавливаю границы своему воображению',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pones azúcar en el café?',
                        translation: 'Ты добавляешь сахар в кофе?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he puesto la mesa perfectamente',
                        translation: 'Я отлично накрыл стол',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has puesto atención especial',
                        translation: 'Ты уделил особое внимание',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha puesto música relajante',
                        translation: 'Он включил расслабляющую музыку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha puesto excusas convincentes',
                        translation: 'Она привела убедительные отговорки',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos puesto esfuerzo constante',
                        translation: 'Мы приложили постоянные усилия',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos han puesto dinero suficiente',
                        translation: 'Они положили достаточно денег',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he puesto obstáculos',
                        translation: 'Я не создал препятствий',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has puesto sal en la comida?',
                        translation: 'Ты добавил соль в еду?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo puse la mesa ayer',
                        translation: 'Я накрыл стол вчера',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pusiste atención inmediata',
                        translation: 'Ты сразу обратил внимание',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él puso música alta',
                        translation: 'Он включил громкую музыку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella puso excusas absurdas',
                        translation: 'Она привела абсурдные отговорки',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pusimos esfuerzo extra',
                        translation: 'Мы приложили дополнительные усилия',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pusieron dinero ahorrado',
                        translation: 'Они положили сбережения',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No puse límites claros',
                        translation: 'Я не установил четкие границы',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pusiste azúcar suficiente?',
                        translation: 'Ты добавил достаточно сахара?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a poner la mesa elegantemente',
                        translation: 'Я буду элегантно накрывать стол',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a poner atención completa',
                        translation: 'Ты будешь уделять полное внимание',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a poner música romántica',
                        translation: 'Он будет включать романтическую музыку',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a poner excusas creativas',
                        translation:
                            'Она будет придумывать креативные отговорки',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a poner esfuerzo adicional',
                        translation: 'Мы будем прилагать дополнительные усилия',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a poner dinero semanalmente',
                        translation: 'Они будут класть деньги еженедельно',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a poner obstáculos innecesarios',
                        translation: 'Я не буду создавать ненужные препятствия',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a poner leche en el té?',
                        translation: 'Ты будешь добавлять молоко в чай?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy poniendo la mesa ahora',
                        translation: 'Я накрываю стол сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás poniendo atención ahora',
                        translation: 'Ты уделяешь внимание сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está poniendo música ahora',
                        translation: 'Он включает музыку сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está poniendo excusas ahora',
                        translation: 'Она находит отговорки сейчас',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos poniendo esfuerzo ahora',
                        translation: 'Мы прилагаем усилия сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están poniendo dinero ahora',
                        translation: 'Они кладут деньги сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy poniendo límites ahora',
                        translation: 'Я не устанавливаю границы сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás poniendo azúcar ahora?',
                        translation: 'Ты добавляешь сахар сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'parecer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['казаться', 'походить', 'выглядеть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo parezco cansado',
                translation: 'Я кажусь уставшим',
            },
            {
                pronoun: 'tú',
                example: 'Tú pareces inteligente',
                translation: 'Ты кажешься умным',
            },
            {
                pronoun: 'él',
                example: 'Él parece simpático',
                translation: 'Он кажется симпатичным',
            },
            {
                pronoun: 'ella',
                example: 'Ella parece feliz',
                translation: 'Она кажется счастливой',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros parecemos amigos',
                translation: 'Мы кажемся друзьями',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos parecen cansados',
                translation: 'Они кажутся уставшими',
            },
            {
                pronoun: 'yo',
                example: 'No parezco enfermo',
                translation: 'Я не кажусь больным',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pareces preocupado?',
                translation: 'Ты кажешься обеспокоенным?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo parezco un profesor estricto',
                        translation: 'Я кажусь строгим учителем',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pareces una persona amable',
                        translation: 'Ты кажешься добрым человеком',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él parece un experto en tecnología',
                        translation: 'Он кажется экспертом в технологиях',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella parece una artista talentosa',
                        translation: 'Она кажется талантливой художницей',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros parecemos estudiantes aplicados',
                        translation: 'Мы кажемся прилежными студентами',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos parecen hermanos gemelos',
                        translation: 'Они кажутся близнецами',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No parezco un atleta profesional',
                        translation: 'Я не кажусь профессиональным спортсменом',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pareces un científico famoso?',
                        translation: 'Ты кажешься знаменитым ученым?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo he parecido más joven últimamente',
                        translation: 'Я казался моложе в последнее время',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú has parecido muy inteligente hoy',
                        translation: 'Ты казался очень умным сегодня',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él ha parecido preocupado por algo',
                        translation: 'Он казался обеспокоенным чем-то',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella ha parecido feliz con su regalo',
                        translation:
                            'Она казалась счастливой со своим подарком',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hemos parecido muy unidos',
                        translation: 'Мы казались очень сплоченными',
                    },
                    {
                        pronoun: 'ellos',
                        example:
                            'Ellos han parecido cansados después del viaje',
                        translation: 'Они казались уставшими после путешествия',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No he parecido interesado en el tema',
                        translation: 'Я не казался заинтересованным в теме',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Has parecido sorprendido por la noticia?',
                        translation: 'Ты казался удивленным новостью?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo parecí nervioso antes del examen',
                        translation: 'Я показался нервным перед экзаменом',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pareciste sorprendida por el regalo',
                        translation: 'Ты показалась удивленной подарком',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pareció muy seguro de sí mismo',
                        translation: 'Он показался очень уверенным в себе',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pareció contenta con los resultados',
                        translation: 'Она показалась довольной результатами',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros parecimos perdidos en la ciudad',
                        translation: 'Мы показались потерянными в городе',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos parecieron muy emocionados',
                        translation: 'Они показались очень взволнованными',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No parecí convencido con su explicación',
                        translation:
                            'Я не показался убежденным его объяснением',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pareciste preocupado por el problema?',
                        translation: 'Ты показался обеспокоенным проблемой?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo voy a parecer más maduro con el tiempo',
                        translation: 'Я буду казаться более зрелым со временем',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vas a parecer una estrella de cine',
                        translation: 'Ты будешь казаться звездой кино',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él va a parecer un director experimentado',
                        translation: 'Он будет казаться опытным режиссером',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella va a parecer una reina en el baile',
                        translation: 'Она будет казаться королевой на бале',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vamos a parecer muy profesionales',
                        translation:
                            'Мы будем казаться очень профессиональными',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos van a parecer amigos inseparables',
                        translation: 'Они будут казаться неразлучными друзьями',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No voy a parecer un turista despistado',
                        translation:
                            'Я не буду казаться заблудившимся туристом',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vas a parecer sorprendido por la sorpresa?',
                        translation: 'Ты будешь казаться удивленным сюрпризом?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo estoy pareciendo más relajado últimamente',
                        translation:
                            'Я кажусь более расслабленным в последнее время',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú estás pareciendo muy concentrada ahora',
                        translation: 'Ты кажешься очень сосредоточенной сейчас',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él está pareciendo un poco cansado',
                        translation: 'Он кажется немного уставшим сейчас',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella está pareciendo muy elegante hoy',
                        translation: 'Она кажется очень элегантной сегодня',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros estamos pareciendo muy emocionados',
                        translation: 'Мы кажемся очень взволнованными сейчас',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos están pareciendo muy contentos',
                        translation: 'Они кажутся очень довольными сейчас',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No estoy pareciendo interesado en absoluto',
                        translation:
                            'Я не кажусь заинтересованным вообще сейчас',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Estás pareciendo preocupado por algo?',
                        translation: 'Ты кажешься обеспокоенным чем-то сейчас?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'quedar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'оставаться',
                    'договариваться',
                    'быть расположенным',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo quedo en casa',
                translation: 'Я остаюсь дома',
            },
            {
                pronoun: 'tú',
                example: 'Tú quedas con amigos',
                translation: 'Ты договариваешься с друзьями',
            },
            {
                pronoun: 'él',
                example: 'Él queda lejos',
                translation: 'Он находится далеко',
            },
            {
                pronoun: 'ella',
                example: 'Ella queda bien con ese vestido',
                translation: 'Ей идет это платье',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros quedamos para mañana',
                translation: 'Мы договариваемся на завтра',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos quedan contentos',
                translation: 'Они остаются довольными',
            },
            {
                pronoun: 'yo',
                example: 'No quedo satisfecho',
                translation: 'Я не остаюсь удовлетворенным',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Quedas para cenar?',
                translation: 'Ты договариваешься поужинать?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo quedo',
                        translation: 'Я остаюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú quedas',
                        translation: 'Ты остаешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él queda',
                        translation: 'Он остается',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella queda',
                        translation: 'Она остается',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros quedamos',
                        translation: 'Мы остаемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros quedáis',
                        translation: 'Вы остаетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos quedan',
                        translation: 'Они остаются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No quedo',
                        translation: 'Я не остаюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Quedas?',
                        translation: 'Ты остаешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo quedé',
                        translation: 'Я остался',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú quedaste',
                        translation: 'Ты остался',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él quedó',
                        translation: 'Он остался',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella quedó',
                        translation: 'Она осталась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros quedamos',
                        translation: 'Мы остались',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos quedaron',
                        translation: 'Они остались',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No quedé',
                        translation: 'Я не остался',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Quedaste?',
                        translation: 'Ты остался?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'creer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['верить', 'думать', 'считать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo creo en Dios',
                translation: 'Я верю в Бога',
            },
            {
                pronoun: 'tú',
                example: 'Tú crees en fantasmas',
                translation: 'Ты веришь в призраков',
            },
            {
                pronoun: 'él',
                example: 'Él cree que es inteligente',
                translation: 'Он думает, что умный',
            },
            {
                pronoun: 'ella',
                example: 'Ella cree en el amor',
                translation: 'Она верит в любовь',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros creemos en ti',
                translation: 'Мы верим в тебя',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos creen historias',
                translation: 'Они верят историям',
            },
            {
                pronoun: 'yo',
                example: 'No creo en mentiras',
                translation: 'Я не верю во лжи',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Crees en el destino?',
                translation: 'Ты веришь в судьбу?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo creo',
                        translation: 'Я верю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú crees',
                        translation: 'Ты веришь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él cree',
                        translation: 'Он верит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella cree',
                        translation: 'Она верит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros creemos',
                        translation: 'Мы верим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros creéis',
                        translation: 'Вы верите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos creen',
                        translation: 'Они верят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No creo',
                        translation: 'Я не верю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Crees?',
                        translation: 'Ты веришь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo creí',
                        translation: 'Я поверил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú creíste',
                        translation: 'Ты поверил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él creyó',
                        translation: 'Он поверил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella creyó',
                        translation: 'Она поверила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros creímos',
                        translation: 'Мы поверили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos creyeron',
                        translation: 'Они поверили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No creí',
                        translation: 'Я не поверил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Creíste?',
                        translation: 'Ты поверил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'hablar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['говорить', 'разговаривать', 'общаться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo hablo español',
                translation: 'Я говорю по-испански',
            },
            {
                pronoun: 'tú',
                example: 'Tú hablas inglés',
                translation: 'Ты говоришь по-английски',
            },
            {
                pronoun: 'él',
                example: 'Él habla de política',
                translation: 'Он говорит о политике',
            },
            {
                pronoun: 'ella',
                example: 'Ella habla por teléfono',
                translation: 'Она разговаривает по телефону',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros hablamos mucho',
                translation: 'Мы много разговариваем',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos hablan de viajes',
                translation: 'Они говорят о путешествиях',
            },
            {
                pronoun: 'yo',
                example: 'No hablo alemán',
                translation: 'Я не говорю по-немецки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Hablas italiano?',
                translation: 'Ты говоришь по-итальянски?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hablo',
                        translation: 'Я говорю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú hablas',
                        translation: 'Ты говоришь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él habla',
                        translation: 'Он говорит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella habla',
                        translation: 'Она говорит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hablamos',
                        translation: 'Мы говорим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros habláis',
                        translation: 'Вы говорите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hablan',
                        translation: 'Они говорят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hablo',
                        translation: 'Я не говорю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Hablas?',
                        translation: 'Ты говоришь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo hablé',
                        translation: 'Я поговорил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú hablaste',
                        translation: 'Ты поговорил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él habló',
                        translation: 'Он поговорил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella habló',
                        translation: 'Она поговорила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros hablamos',
                        translation: 'Мы поговорили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos hablaron',
                        translation: 'Они поговорили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No hablé',
                        translation: 'Я не поговорил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Hablaste?',
                        translation: 'Ты поговорил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'llevar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['носить', 'нести', 'возить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo llevo gafas',
                translation: 'Я ношу очки',
            },
            {
                pronoun: 'tú',
                example: 'Tú llevas abrigo',
                translation: 'Ты носишь пальто',
            },
            {
                pronoun: 'él',
                example: 'Él lleva el coche',
                translation: 'Он ведет машину',
            },
            {
                pronoun: 'ella',
                example: 'Ella lleva flores',
                translation: 'Она несет цветы',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros llevamos equipaje',
                translation: 'Мы несем багаж',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llevan niños',
                translation: 'Они несут детей',
            },
            {
                pronoun: 'yo',
                example: 'No llevo sombrero',
                translation: 'Я не ношу шляпу',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Llevas reloj?',
                translation: 'Ты носишь часы?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llevo',
                        translation: 'Я ношу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llevas',
                        translation: 'Ты носишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él lleva',
                        translation: 'Он носит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella lleva',
                        translation: 'Она носит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llevamos',
                        translation: 'Мы носим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros lleváis',
                        translation: 'Вы носите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llevan',
                        translation: 'Они носят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llevo',
                        translation: 'Я не ношу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llevas?',
                        translation: 'Ты носишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llevé',
                        translation: 'Я понес',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llevaste',
                        translation: 'Ты понес',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llevó',
                        translation: 'Он понес',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llevó',
                        translation: 'Она понесла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llevamos',
                        translation: 'Мы понесли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llevaron',
                        translation: 'Они понесли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llevé',
                        translation: 'Я не понес',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llevaste?',
                        translation: 'Ты понес?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'dejar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['оставлять', 'позволять', 'бросать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo dejo mis libros aquí',
                translation: 'Я оставляю свои книги здесь',
            },
            {
                pronoun: 'tú',
                example: 'Tú dejas el trabajo',
                translation: 'Ты бросаешь работу',
            },
            {
                pronoun: 'él',
                example: 'Él deja fumar',
                translation: 'Он бросает курить',
            },
            {
                pronoun: 'ella',
                example: 'Ella deja entrar',
                translation: 'Она позволяет войти',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros dejamos pasar',
                translation: 'Мы позволяем пройти',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos dejan dinero',
                translation: 'Они оставляют деньги',
            },
            {
                pronoun: 'yo',
                example: 'No dejo fumar',
                translation: 'Я не позволяю курить',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Dejas el coche aquí?',
                translation: 'Ты оставляешь машину здесь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo dejo',
                        translation: 'Я оставляю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú dejas',
                        translation: 'Ты оставляешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él deja',
                        translation: 'Он оставляет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella deja',
                        translation: 'Она оставляет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros dejamos',
                        translation: 'Мы оставляем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros dejáis',
                        translation: 'Вы оставляете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dejan',
                        translation: 'Они оставляют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No dejo',
                        translation: 'Я не оставляю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Dejas?',
                        translation: 'Ты оставляешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo dejé',
                        translation: 'Я оставил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú dejaste',
                        translation: 'Ты оставил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él dejó',
                        translation: 'Он оставил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella dejó',
                        translation: 'Она оставила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros dejamos',
                        translation: 'Мы оставили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos dejaron',
                        translation: 'Они оставили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No dejé',
                        translation: 'Я не оставил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Dejaste?',
                        translation: 'Ты оставил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'seguir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['следовать', 'продолжать', 'идти за'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo sigo estudiando',
                translation: 'Я продолжаю учиться',
            },
            {
                pronoun: 'tú',
                example: 'Tú sigues el camino',
                translation: 'Ты следуешь по пути',
            },
            {
                pronoun: 'él',
                example: 'Él sigue trabajando',
                translation: 'Он продолжает работать',
            },
            {
                pronoun: 'ella',
                example: 'Ella sigue las instrucciones',
                translation: 'Она следует инструкциям',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros seguimos juntos',
                translation: 'Мы продолжаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos siguen el río',
                translation: 'Они идут вдоль реки',
            },
            {
                pronoun: 'yo',
                example: 'No sigo fumando',
                translation: 'Я не продолжаю курить',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Sigues estudiando?',
                translation: 'Ты продолжаешь учиться?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo sigo',
                        translation: 'Я следую',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú sigues',
                        translation: 'Ты следуешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él sigue',
                        translation: 'Он следует',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella sigue',
                        translation: 'Она следует',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros seguimos',
                        translation: 'Мы следуем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros seguís',
                        translation: 'Вы следуете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos siguen',
                        translation: 'Они следуют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No sigo',
                        translation: 'Я не следую',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Sigues?',
                        translation: 'Ты следуешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo seguí',
                        translation: 'Я последовал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú seguiste',
                        translation: 'Ты последовал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él siguió',
                        translation: 'Он последовал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella siguió',
                        translation: 'Она последовала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros seguimos',
                        translation: 'Мы последовали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos siguieron',
                        translation: 'Они последовали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No seguí',
                        translation: 'Я не последовал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Seguiste?',
                        translation: 'Ты последовал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'encontrar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['находить', 'встречать', 'считать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo encuentro mis llaves',
                translation: 'Я нахожу свои ключи',
            },
            {
                pronoun: 'tú',
                example: 'Tú encuentras trabajo',
                translation: 'Ты находишь работу',
            },
            {
                pronoun: 'él',
                example: 'Él encuentra interesante',
                translation: 'Он считает интересным',
            },
            {
                pronoun: 'ella',
                example: 'Ella encuentra amigos',
                translation: 'Она находит друзей',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros encontramos la casa',
                translation: 'Мы находим дом',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos se encuentran',
                translation: 'Они встречаются',
            },
            {
                pronoun: 'yo',
                example: 'No encuentro tiempo',
                translation: 'Я не нахожу времени',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Encuentras bonito?',
                translation: 'Ты считаешь красивым?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo encuentro',
                        translation: 'Я нахожу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú encuentras',
                        translation: 'Ты находишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él encuentra',
                        translation: 'Он находит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella encuentra',
                        translation: 'Она находит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros encontramos',
                        translation: 'Мы находим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros encontráis',
                        translation: 'Вы находите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos encuentran',
                        translation: 'Они находят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No encuentro',
                        translation: 'Я не нахожу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Encuentras?',
                        translation: 'Ты находишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo encontré',
                        translation: 'Я нашел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú encontraste',
                        translation: 'Ты нашел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él encontró',
                        translation: 'Он нашел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella encontró',
                        translation: 'Она нашла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros encontramos',
                        translation: 'Мы нашли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos encontraron',
                        translation: 'Они нашли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No encontré',
                        translation: 'Я не нашел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Encontraste?',
                        translation: 'Ты нашел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'llamar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['звать', 'называть', 'звонить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo llamo a mi amigo',
                translation: 'Я звоню своему другу',
            },
            {
                pronoun: 'tú',
                example: 'Tú llamas María',
                translation: 'Тебя зовут Мария',
            },
            {
                pronoun: 'él',
                example: 'Él llama la atención',
                translation: 'Он привлекает внимание',
            },
            {
                pronoun: 'ella',
                example: 'Ella llama a la puerta',
                translation: 'Она стучит в дверь',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros llamamos taxi',
                translation: 'Мы вызываем такси',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos llaman Juan',
                translation: 'Их зовут Хуан',
            },
            {
                pronoun: 'yo',
                example: 'No llamo tarde',
                translation: 'Я не звоню поздно',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Llamas por teléfono?',
                translation: 'Ты звонишь по телефону?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llamo',
                        translation: 'Я зову',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llamas',
                        translation: 'Ты зовешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llama',
                        translation: 'Он зовет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llama',
                        translation: 'Она зовет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llamamos',
                        translation: 'Мы зовем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros llamáis',
                        translation: 'Вы зовете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llaman',
                        translation: 'Они зовут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llamo',
                        translation: 'Я не зову',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llamas?',
                        translation: 'Ты зовешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo llamé',
                        translation: 'Я позвал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú llamaste',
                        translation: 'Ты позвал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él llamó',
                        translation: 'Он позвал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella llamó',
                        translation: 'Она позвала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros llamamos',
                        translation: 'Мы позвали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos llamaron',
                        translation: 'Они позвали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No llamé',
                        translation: 'Я не позвал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Llamaste?',
                        translation: 'Ты позвал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'venir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['приходить', 'приезжать', 'происходить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vengo de España',
                translation: 'Я приехал из Испании',
            },
            {
                pronoun: 'tú',
                example: 'Tú vienes conmigo',
                translation: 'Ты приходишь со мной',
            },
            {
                pronoun: 'él',
                example: 'Él viene mañana',
                translation: 'Он приходит завтра',
            },
            {
                pronoun: 'ella',
                example: 'Ella viene corriendo',
                translation: 'Она приходит бегом',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros venimos juntos',
                translation: 'Мы приходим вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos vienen tarde',
                translation: 'Они приходят поздно',
            },
            {
                pronoun: 'yo',
                example: 'No vengo solo',
                translation: 'Я не прихожу один',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Vienes a la fiesta?',
                translation: 'Ты приходишь на вечеринку?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vengo',
                        translation: 'Я прихожу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vienes',
                        translation: 'Ты приходишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él viene',
                        translation: 'Он приходит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella viene',
                        translation: 'Она приходит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros venimos',
                        translation: 'Мы приходим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros venís',
                        translation: 'Вы приходите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vienen',
                        translation: 'Они приходят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vengo',
                        translation: 'Я не прихожу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vienes?',
                        translation: 'Ты приходишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vine',
                        translation: 'Я пришел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú viniste',
                        translation: 'Ты пришел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vino',
                        translation: 'Он пришел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vino',
                        translation: 'Она пришла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vinimos',
                        translation: 'Мы пришли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vinieron',
                        translation: 'Они пришли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vine',
                        translation: 'Я не пришел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Viniste?',
                        translation: 'Ты пришел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'pensar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['думать', 'собираться', 'помнить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo pienso en ti',
                translation: 'Я думаю о тебе',
            },
            {
                pronoun: 'tú',
                example: 'Tú piensas viajar',
                translation: 'Ты думаешь путешествовать',
            },
            {
                pronoun: 'él',
                example: 'Él piensa mucho',
                translation: 'Он много думает',
            },
            {
                pronoun: 'ella',
                example: 'Ella piensa estudiar',
                translation: 'Она собирается учиться',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros pensamos igual',
                translation: 'Мы думаем одинаково',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos piensan en el futuro',
                translation: 'Они думают о будущем',
            },
            {
                pronoun: 'yo',
                example: 'No pienso así',
                translation: 'Я не думаю так',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Piensas ir?',
                translation: 'Ты собираешься идти?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pienso',
                        translation: 'Я думаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú piensas',
                        translation: 'Ты думаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él piensa',
                        translation: 'Он думает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella piensa',
                        translation: 'Она думает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pensamos',
                        translation: 'Мы думаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros pensáis',
                        translation: 'Вы думаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos piensan',
                        translation: 'Они думают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pienso',
                        translation: 'Я не думаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Piensas?',
                        translation: 'Ты думаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pensé',
                        translation: 'Я подумал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pensaste',
                        translation: 'Ты подумал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pensó',
                        translation: 'Он подумал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pensó',
                        translation: 'Она подумала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pensamos',
                        translation: 'Мы подумали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pensaron',
                        translation: 'Они подумали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pensé',
                        translation: 'Я не подумал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pensaste?',
                        translation: 'Ты подумал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'salir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'выходить',
                    'уходить',
                    'выходить замуж/жениться',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo salgo de casa',
                translation: 'Я выхожу из дома',
            },
            {
                pronoun: 'tú',
                example: 'Tú sales con amigos',
                translation: 'Ты выходишь с друзьями',
            },
            {
                pronoun: 'él',
                example: 'Él sale del trabajo',
                translation: 'Он уходит с работы',
            },
            {
                pronoun: 'ella',
                example: 'Ella sale a correr',
                translation: 'Она выходит побегать',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros salimos juntos',
                translation: 'Мы выходим вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos salen tarde',
                translation: 'Они выходят поздно',
            },
            {
                pronoun: 'yo',
                example: 'No salgo solo',
                translation: 'Я не выхожу один',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Sales esta noche?',
                translation: 'Ты выходишь сегодня вечером?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo salgo',
                        translation: 'Я выхожу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú sales',
                        translation: 'Ты выходишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él sale',
                        translation: 'Он выходит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella sale',
                        translation: 'Она выходит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros salimos',
                        translation: 'Мы выходим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros salís',
                        translation: 'Вы выходите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos salen',
                        translation: 'Они выходят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No salgo',
                        translation: 'Я не выхожу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Sales?',
                        translation: 'Ты выходишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo salí',
                        translation: 'Я вышел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú saliste',
                        translation: 'Ты вышел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él salió',
                        translation: 'Он вышел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella salió',
                        translation: 'Она вышла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros salimos',
                        translation: 'Мы вышли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos salieron',
                        translation: 'Они вышли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No salí',
                        translation: 'Я не вышел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Saliste?',
                        translation: 'Ты вышел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'volver',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['возвращаться', 'вернуться', 'вернуть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vuelvo a casa',
                translation: 'Я возвращаюсь домой',
            },
            {
                pronoun: 'tú',
                example: 'Tú vuelves pronto',
                translation: 'Ты возвращаешься скоро',
            },
            {
                pronoun: 'él',
                example: 'Él vuelve del trabajo',
                translation: 'Он возвращается с работы',
            },
            {
                pronoun: 'ella',
                example: 'Ella vuelve a Madrid',
                translation: 'Она возвращается в Мадрид',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros volvemos juntos',
                translation: 'Мы возвращаемся вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos vuelven tarde',
                translation: 'Они возвращаются поздно',
            },
            {
                pronoun: 'yo',
                example: 'No vuelvo aún',
                translation: 'Я еще не возвращаюсь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Vuelves mañana?',
                translation: 'Ты возвращаешься завтра?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vuelvo',
                        translation: 'Я возвращаюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vuelves',
                        translation: 'Ты возвращаешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vuelve',
                        translation: 'Он возвращается',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vuelve',
                        translation: 'Она возвращается',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros volvemos',
                        translation: 'Мы возвращаемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros volvéis',
                        translation: 'Вы возвращаетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vuelven',
                        translation: 'Они возвращаются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vuelvo',
                        translation: 'Я не возвращаюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vuelves?',
                        translation: 'Ты возвращаешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo volví',
                        translation: 'Я вернулся',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú volviste',
                        translation: 'Ты вернулся',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él volvió',
                        translation: 'Он вернулся',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella volvió',
                        translation: 'Она вернулась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros volvimos',
                        translation: 'Мы вернулись',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos volvieron',
                        translation: 'Они вернулись',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No volví',
                        translation: 'Я не вернулся',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Volviste?',
                        translation: 'Ты вернулся?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'tomar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['брать', 'пить', 'принимать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo tomo café',
                translation: 'Я пью кофе',
            },
            {
                pronoun: 'tú',
                example: 'Tú tomas el autobús',
                translation: 'Ты садишься в автобус',
            },
            {
                pronoun: 'él',
                example: 'Él toma decisiones',
                translation: 'Он принимает решения',
            },
            {
                pronoun: 'ella',
                example: 'Ella toma notas',
                translation: 'Она записывает',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tomamos el sol',
                translation: 'Мы загораем',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos toman clases',
                translation: 'Они берут уроки',
            },
            {
                pronoun: 'yo',
                example: 'No tomo alcohol',
                translation: 'Я не пью алкоголь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tomas leche?',
                translation: 'Ты пьешь молоко?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo tomo',
                        translation: 'Я беру',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú tomas',
                        translation: 'Ты берешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él toma',
                        translation: 'Он берет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella toma',
                        translation: 'Она берет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tomamos',
                        translation: 'Мы берем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros tomáis',
                        translation: 'Вы берете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos toman',
                        translation: 'Они берут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No tomo',
                        translation: 'Я не беру',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Tomas?',
                        translation: 'Ты берешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo tomé',
                        translation: 'Я взял',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú tomaste',
                        translation: 'Ты взял',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él tomó',
                        translation: 'Он взял',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella tomó',
                        translation: 'Она взяла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tomamos',
                        translation: 'Мы взяли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos tomaron',
                        translation: 'Они взяли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No tomé',
                        translation: 'Я не взял',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Tomaste?',
                        translation: 'Ты взял?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'conocer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['знать', 'быть знакомым', 'встречать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo conozco Madrid',
                translation: 'Я знаю Мадрид',
            },
            {
                pronoun: 'tú',
                example: 'Tú conoces a mi hermana',
                translation: 'Ты знаешь мою сестру',
            },
            {
                pronoun: 'él',
                example: 'Él conoce la verdad',
                translation: 'Он знает правду',
            },
            {
                pronoun: 'ella',
                example: 'Ella conoce bien el español',
                translation: 'Она хорошо знает испанский',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros conocemos París',
                translation: 'Мы знаем Париж',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos se conocen desde niños',
                translation: 'Они знают друг друга с детства',
            },
            {
                pronoun: 'yo',
                example: 'No conozco esa ciudad',
                translation: 'Я не знаю этот город',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Conoces al profesor?',
                translation: 'Ты знаешь преподавателя?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo conozco',
                        translation: 'Я знаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú conoces',
                        translation: 'Ты знаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él conoce',
                        translation: 'Он знает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella conoce',
                        translation: 'Она знает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros conocemos',
                        translation: 'Мы знаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros conocéis',
                        translation: 'Вы знаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos conocen',
                        translation: 'Они знают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No conozco',
                        translation: 'Я не знаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Conoces?',
                        translation: 'Ты знаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo conocí',
                        translation: 'Я узнал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú conociste',
                        translation: 'Ты узнал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él conoció',
                        translation: 'Он узнал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella conoció',
                        translation: 'Она узнала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros conocimos',
                        translation: 'Мы узнали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos conocieron',
                        translation: 'Они узнали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No conocí',
                        translation: 'Я не узнал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Conociste?',
                        translation: 'Ты узнал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'vivir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['жить', 'проживать', 'существовать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo vivo en Barcelona',
                translation: 'Я живу в Барселоне',
            },
            {
                pronoun: 'tú',
                example: 'Tú vives con tus padres',
                translation: 'Ты живешь с родителями',
            },
            {
                pronoun: 'él',
                example: 'Él vive una aventura',
                translation: 'Он переживает приключение',
            },
            {
                pronoun: 'ella',
                example: 'Ella vive feliz',
                translation: 'Она живет счастливо',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros vivimos juntos',
                translation: 'Мы живем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos viven en el centro',
                translation: 'Они живут в центре',
            },
            {
                pronoun: 'yo',
                example: 'No vivo aquí',
                translation: 'Я не живу здесь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Vives cerca?',
                translation: 'Ты живешь рядом?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo vivo',
                        translation: 'Я живу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú vives',
                        translation: 'Ты живешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vive',
                        translation: 'Он живет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vive',
                        translation: 'Она живет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vivimos',
                        translation: 'Мы живем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros vivís',
                        translation: 'Вы живете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos viven',
                        translation: 'Они живут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No vivo',
                        translation: 'Я не живу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Vives?',
                        translation: 'Ты живешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    { pronoun: 'yo', example: 'Yo viví', translation: 'Я жил' },
                    {
                        pronoun: 'tú',
                        example: 'Tú viviste',
                        translation: 'Ты жил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él vivió',
                        translation: 'Он жил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella vivió',
                        translation: 'Она жила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros vivimos',
                        translation: 'Мы жили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos vivieron',
                        translation: 'Они жили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No viví',
                        translation: 'Я не жил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Viviste?',
                        translation: 'Ты жил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'sentir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['чувствовать', 'ощущать', 'жалеть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo siento frío',
                translation: 'Мне холодно',
            },
            {
                pronoun: 'tú',
                example: 'Tú sientes dolor',
                translation: 'Ты чувствуешь боль',
            },
            {
                pronoun: 'él',
                example: 'Él siente amor',
                translation: 'Он чувствует любовь',
            },
            {
                pronoun: 'ella',
                example: 'Ella siente miedo',
                translation: 'Она чувствует страх',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros sentimos pena',
                translation: 'Нам жаль',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos sienten alegría',
                translation: 'Они чувствуют радость',
            },
            {
                pronoun: 'yo',
                example: 'No siento nada',
                translation: 'Я ничего не чувствую',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Sientes calor?',
                translation: 'Тебе жарко?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo siento',
                        translation: 'Я чувствую',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú sientes',
                        translation: 'Ты чувствуешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él siente',
                        translation: 'Он чувствует',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella siente',
                        translation: 'Она чувствует',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros sentimos',
                        translation: 'Мы чувствуем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros sentís',
                        translation: 'Вы чувствуете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos sienten',
                        translation: 'Они чувствуют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No siento',
                        translation: 'Я не чувствую',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Sientes?',
                        translation: 'Ты чувствуешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo sentí',
                        translation: 'Я почувствовал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú sentiste',
                        translation: 'Ты почувствовал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él sintió',
                        translation: 'Он почувствовал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella sintió',
                        translation: 'Она почувствовала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros sentimos',
                        translation: 'Мы почувствовали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos sintieron',
                        translation: 'Они почувствовали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No sentí',
                        translation: 'Я не почувствовал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Sentiste?',
                        translation: 'Ты почувствовал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'tratar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['пытаться', 'стараться', 'лечить'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo trato de ayudar',
                translation: 'Я стараюсь помочь',
            },
            {
                pronoun: 'tú',
                example: 'Tú tratas bien a todos',
                translation: 'Ты хорошо относишься ко всем',
            },
            {
                pronoun: 'él',
                example: 'Él trata de entender',
                translation: 'Он пытается понять',
            },
            {
                pronoun: 'ella',
                example: 'Ella trata a sus pacientes',
                translation: 'Она лечит своих пациентов',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros tratamos de ganar',
                translation: 'Мы стараемся выиграть',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos tratan con respeto',
                translation: 'Они относятся с уважением',
            },
            {
                pronoun: 'yo',
                example: 'No trato de convencerte',
                translation: 'Я не стараюсь убедить тебя',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Tratas de estudiar?',
                translation: 'Ты стараешься учиться?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo trato',
                        translation: 'Я стараюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú tratas',
                        translation: 'Ты стараешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él trata',
                        translation: 'Он старается',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella trata',
                        translation: 'Она старается',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tratamos',
                        translation: 'Мы стараемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros tratáis',
                        translation: 'Вы стараетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos tratan',
                        translation: 'Они стараются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No trato',
                        translation: 'Я не стараюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Tratas?',
                        translation: 'Ты стараешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo traté',
                        translation: 'Я постарался',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú trataste',
                        translation: 'Ты постарался',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él trató',
                        translation: 'Он постарался',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella trató',
                        translation: 'Она постаралась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros tratamos',
                        translation: 'Мы постарались',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos trataron',
                        translation: 'Они постарались',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No traté',
                        translation: 'Я не постарался',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Trataste?',
                        translation: 'Ты постарался?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'mirar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['смотреть', 'глядеть', 'осматривать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo miro la televisión',
                translation: 'Я смотрю телевизор',
            },
            {
                pronoun: 'tú',
                example: 'Tú miras las estrellas',
                translation: 'Ты смотришь на звезды',
            },
            {
                pronoun: 'él',
                example: 'Él mira el reloj',
                translation: 'Он смотрит на часы',
            },
            {
                pronoun: 'ella',
                example: 'Ella mira por la ventana',
                translation: 'Она смотрит в окно',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros miramos fotos',
                translation: 'Мы смотрим фотографии',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos miran el mapa',
                translation: 'Они смотрят на карту',
            },
            {
                pronoun: 'yo',
                example: 'No miro esa película',
                translation: 'Я не смотрю этот фильм',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Miras el partido?',
                translation: 'Ты смотришь матч?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo miro',
                        translation: 'Я смотрю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú miras',
                        translation: 'Ты смотришь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él mira',
                        translation: 'Он смотрит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella mira',
                        translation: 'Она смотрит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros miramos',
                        translation: 'Мы смотрим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros miráis',
                        translation: 'Вы смотрите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos miran',
                        translation: 'Они смотрят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No miro',
                        translation: 'Я не смотрю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Miras?',
                        translation: 'Ты смотришь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo miré',
                        translation: 'Я посмотрел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú miraste',
                        translation: 'Ты посмотрел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él miró',
                        translation: 'Он посмотрел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella miró',
                        translation: 'Она посмотрела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros miramos',
                        translation: 'Мы посмотрели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos miraron',
                        translation: 'Они посмотрели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No miré',
                        translation: 'Я не посмотрел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Miraste?',
                        translation: 'Ты посмотрел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'contar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['считать', 'рассказывать', 'полагаться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo cuento hasta diez',
                translation: 'Я считаю до десяти',
            },
            {
                pronoun: 'tú',
                example: 'Tú cuentas historias',
                translation: 'Ты рассказываешь истории',
            },
            {
                pronoun: 'él',
                example: 'Él cuenta con mi ayuda',
                translation: 'Он полагается на мою помощь',
            },
            {
                pronoun: 'ella',
                example: 'Ella cuenta dinero',
                translation: 'Она считает деньги',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros contamos chistes',
                translation: 'Мы рассказываем шутки',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos cuentan los días',
                translation: 'Они считают дни',
            },
            {
                pronoun: 'yo',
                example: 'No cuento con él',
                translation: 'Я не полагаюсь на него',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Cuentas conmigo?',
                translation: 'Ты полагаешься на меня?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo cuento',
                        translation: 'Я считаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú cuentas',
                        translation: 'Ты считаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él cuenta',
                        translation: 'Он считает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella cuenta',
                        translation: 'Она считает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros contamos',
                        translation: 'Мы считаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros contáis',
                        translation: 'Вы считаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos cuentan',
                        translation: 'Они считают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No cuento',
                        translation: 'Я не считаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Cuentas?',
                        translation: 'Ты считаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo conté',
                        translation: 'Я сосчитал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú contaste',
                        translation: 'Ты сосчитал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él contó',
                        translation: 'Он сосчитал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella contó',
                        translation: 'Она сосчитала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros contamos',
                        translation: 'Мы сосчитали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos contaron',
                        translation: 'Они сосчитали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No conté',
                        translation: 'Я не сосчитал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Contaste?',
                        translation: 'Ты сосчитал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'empezar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['начинать', 'начинаться', 'приступать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo empiezo el trabajo',
                translation: 'Я начинаю работу',
            },
            {
                pronoun: 'tú',
                example: 'Tú empiezas a estudiar',
                translation: 'Ты начинаешь учиться',
            },
            {
                pronoun: 'él',
                example: 'Él empieza la carrera',
                translation: 'Он начинает карьеру',
            },
            {
                pronoun: 'ella',
                example: 'Ella empieza a llover',
                translation: 'Начинается дождь',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros empezamos juntos',
                translation: 'Мы начинаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos empiezan el proyecto',
                translation: 'Они начинают проект',
            },
            {
                pronoun: 'yo',
                example: 'No empiezo aún',
                translation: 'Я еще не начинаю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Empiezas hoy?',
                translation: 'Ты начинаешь сегодня?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo empiezo',
                        translation: 'Я начинаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú empiezas',
                        translation: 'Ты начинаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él empieza',
                        translation: 'Он начинает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella empieza',
                        translation: 'Она начинает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros empezamos',
                        translation: 'Мы начинаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros empezáis',
                        translation: 'Вы начинаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos empiezan',
                        translation: 'Они начинают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No empiezo',
                        translation: 'Я не начинаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Empiezas?',
                        translation: 'Ты начинаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo empecé',
                        translation: 'Я начал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú empezaste',
                        translation: 'Ты начал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él empezó',
                        translation: 'Он начал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella empezó',
                        translation: 'Она начала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros empezamos',
                        translation: 'Мы начали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos empezaron',
                        translation: 'Они начали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No empecé',
                        translation: 'Я не начал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Empezaste?',
                        translation: 'Ты начал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'esperar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['ждать', 'ожидать', 'надеяться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo espero el autobús',
                translation: 'Я жду автобус',
            },
            {
                pronoun: 'tú',
                example: 'Tú esperas resultados',
                translation: 'Ты ждешь результатов',
            },
            {
                pronoun: 'él',
                example: 'Él espera una llamada',
                translation: 'Он ждет звонка',
            },
            {
                pronoun: 'ella',
                example: 'Ella espera un hijo',
                translation: 'Она ждет ребенка',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros esperamos ayuda',
                translation: 'Мы ждем помощи',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos esperan el tren',
                translation: 'Они ждут поезд',
            },
            {
                pronoun: 'yo',
                example: 'No espero mucho tiempo',
                translation: 'Я не жду долго',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Esperas visitas?',
                translation: 'Ты ждешь гостей?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo espero',
                        translation: 'Я жду',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú esperas',
                        translation: 'Ты ждешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él espera',
                        translation: 'Он ждет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella espera',
                        translation: 'Она ждет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros esperamos',
                        translation: 'Мы ждем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros esperáis',
                        translation: 'Вы ждете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos esperan',
                        translation: 'Они ждут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No espero',
                        translation: 'Я не жду',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Esperas?',
                        translation: 'Ты ждешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo esperé',
                        translation: 'Я подождал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú esperaste',
                        translation: 'Ты подождал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él esperó',
                        translation: 'Он подождал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella esperó',
                        translation: 'Она подождала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros esperamos',
                        translation: 'Мы подождали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos esperaron',
                        translation: 'Они подождали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No esperé',
                        translation: 'Я не подождал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Esperaste?',
                        translation: 'Ты подождал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'buscar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['искать', 'находить', 'заходить за'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo busco mis llaves',
                translation: 'Я ищу свои ключи',
            },
            {
                pronoun: 'tú',
                example: 'Tú buscas trabajo',
                translation: 'Ты ищешь работу',
            },
            {
                pronoun: 'él',
                example: 'Él busca información',
                translation: 'Он ищет информацию',
            },
            {
                pronoun: 'ella',
                example: 'Ella busca su bolso',
                translation: 'Она ищет свою сумку',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros buscamos casa',
                translation: 'Мы ищем дом',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos buscan soluciones',
                translation: 'Они ищут решения',
            },
            {
                pronoun: 'yo',
                example: 'No busco problemas',
                translation: 'Я не ищу проблемы',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Buscas algo?',
                translation: 'Ты ищешь что-то?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo busco',
                        translation: 'Я ищу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú buscas',
                        translation: 'Ты ищешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él busca',
                        translation: 'Он ищет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella busca',
                        translation: 'Она ищет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros buscamos',
                        translation: 'Мы ищем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros buscáis',
                        translation: 'Вы ищете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos buscan',
                        translation: 'Они ищут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No busco',
                        translation: 'Я не ищу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Buscas?',
                        translation: 'Ты ищешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo busqué',
                        translation: 'Я поискал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú buscaste',
                        translation: 'Ты поискал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él buscó',
                        translation: 'Он поискал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella buscó',
                        translation: 'Она поискала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros buscamos',
                        translation: 'Мы поискали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos buscaron',
                        translation: 'Они поискали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No busqué',
                        translation: 'Я не поискал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Buscaste?',
                        translation: 'Ты поискал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'existir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['существовать', 'быть', 'иметься'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo existo para ayudar',
                translation: 'Я существую, чтобы помогать',
            },
            {
                pronoun: 'tú',
                example: 'Tú existes en mi corazón',
                translation: 'Ты существуешь в моем сердце',
            },
            {
                pronoun: 'él',
                example: 'Él existe desde hace años',
                translation: 'Он существует уже много лет',
            },
            {
                pronoun: 'ella',
                example: 'Ella existe solo en sueños',
                translation: 'Она существует только во снах',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros existimos para cambiar',
                translation: 'Мы существуем, чтобы изменять',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos existen en la historia',
                translation: 'Они существуют в истории',
            },
            {
                pronoun: 'yo',
                example: 'No existo para ti',
                translation: 'Я не существую для тебя',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Existes realmente?',
                translation: 'Ты действительно существуешь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo existo',
                        translation: 'Я существую',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú existes',
                        translation: 'Ты существуешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él existe',
                        translation: 'Он существует',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella existe',
                        translation: 'Она существует',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros existimos',
                        translation: 'Мы существуем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros existís',
                        translation: 'Вы существуете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos existen',
                        translation: 'Они существуют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No existo',
                        translation: 'Я не существую',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Existes?',
                        translation: 'Ты существуешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo existí',
                        translation: 'Я существовал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú exististe',
                        translation: 'Ты существовал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él existió',
                        translation: 'Он существовал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella existió',
                        translation: 'Она существовала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros existimos',
                        translation: 'Мы существовали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos existieron',
                        translation: 'Они существовали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No existí',
                        translation: 'Я не существовал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Exististe?',
                        translation: 'Ты существовал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'entrar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['входить', 'заходить', 'вступать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo entro en la habitación',
                translation: 'Я вхожу в комнату',
            },
            {
                pronoun: 'tú',
                example: 'Tú entras al baño',
                translation: 'Ты заходишь в ванную',
            },
            {
                pronoun: 'él',
                example: 'Él entra en el edificio',
                translation: 'Он входит в здание',
            },
            {
                pronoun: 'ella',
                example: 'Ella entra en la universidad',
                translation: 'Она поступает в университет',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros entramos juntos',
                translation: 'Мы входим вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos entran en el juego',
                translation: 'Они вступают в игру',
            },
            {
                pronoun: 'yo',
                example: 'No entro sin permiso',
                translation: 'Я не вхожу без разрешения',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Entras conmigo?',
                translation: 'Ты входишь со мной?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo entro',
                        translation: 'Я вхожу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú entras',
                        translation: 'Ты входишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él entra',
                        translation: 'Он входит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella entra',
                        translation: 'Она входит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros entramos',
                        translation: 'Мы входим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros entráis',
                        translation: 'Вы входите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos entran',
                        translation: 'Они входят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No entro',
                        translation: 'Я не вхожу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Entras?',
                        translation: 'Ты входишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo entré',
                        translation: 'Я вошел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú entraste',
                        translation: 'Ты вошел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él entró',
                        translation: 'Он вошел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella entró',
                        translation: 'Она вошла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros entramos',
                        translation: 'Мы вошли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos entraron',
                        translation: 'Они вошли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No entré',
                        translation: 'Я не вошел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Entraste?',
                        translation: 'Ты вошел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'trabajar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['работать', 'трудиться', 'обрабатывать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo trabajo en una oficina',
                translation: 'Я работаю в офисе',
            },
            {
                pronoun: 'tú',
                example: 'Tú trabajas muy duro',
                translation: 'Ты работаешь очень усердно',
            },
            {
                pronoun: 'él',
                example: 'Él trabaja de profesor',
                translation: 'Он работает преподавателем',
            },
            {
                pronoun: 'ella',
                example: 'Ella trabaja en casa',
                translation: 'Она работает дома',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros trabajamos juntos',
                translation: 'Мы работаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos trabajan por la paz',
                translation: 'Они работают над миром',
            },
            {
                pronoun: 'yo',
                example: 'No trabajo los fines de semana',
                translation: 'Я не работаю по выходным',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Trabajas aquí?',
                translation: 'Ты работаешь здесь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo trabajo',
                        translation: 'Я работаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú trabajas',
                        translation: 'Ты работаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él trabaja',
                        translation: 'Он работает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella trabaja',
                        translation: 'Она работает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros trabajamos',
                        translation: 'Мы работаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros trabajáis',
                        translation: 'Вы работаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos trabajan',
                        translation: 'Они работают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No trabajo',
                        translation: 'Я не работаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Trabajas?',
                        translation: 'Ты работаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo trabajé',
                        translation: 'Я поработал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú trabajaste',
                        translation: 'Ты поработал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él trabajó',
                        translation: 'Он поработал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella trabajó',
                        translation: 'Она поработала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros trabajamos',
                        translation: 'Мы поработали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos trabajaron',
                        translation: 'Они поработали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No trabajé',
                        translation: 'Я не поработал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Trabajaste?',
                        translation: 'Ты поработал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'escribir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['писать', 'написать', 'записывать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo escribo cartas',
                translation: 'Я пишу письма',
            },
            {
                pronoun: 'tú',
                example: 'Tú escribes poesías',
                translation: 'Ты пишешь стихи',
            },
            {
                pronoun: 'él',
                example: 'Él escribe libros',
                translation: 'Он пишет книги',
            },
            {
                pronoun: 'ella',
                example: 'Ella escribe en el diario',
                translation: 'Она пишет в дневник',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros escribimos juntos',
                translation: 'Мы пишем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos escriben artículos',
                translation: 'Они пишут статьи',
            },
            {
                pronoun: 'yo',
                example: 'No escribo con lápiz',
                translation: 'Я не пишу карандашом',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Escribes bien?',
                translation: 'Ты хорошо пишешь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo escribo',
                        translation: 'Я пишу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú escribes',
                        translation: 'Ты пишешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él escribe',
                        translation: 'Он пишет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella escribe',
                        translation: 'Она пишет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros escribimos',
                        translation: 'Мы пишем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros escribís',
                        translation: 'Вы пишете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos escriben',
                        translation: 'Они пишут',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No escribo',
                        translation: 'Я не пишу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Escribes?',
                        translation: 'Ты пишешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo escribí',
                        translation: 'Я написал',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú escribiste',
                        translation: 'Ты написал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él escribió',
                        translation: 'Он написал',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella escribió',
                        translation: 'Она написала',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros escribimos',
                        translation: 'Мы написали',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos escribieron',
                        translation: 'Они написали',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No escribí',
                        translation: 'Я не написал',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Escribiste?',
                        translation: 'Ты написал?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'perder',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['терять', 'проигрывать', 'упускать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo pierdo mis llaves',
                translation: 'Я теряю свои ключи',
            },
            {
                pronoun: 'tú',
                example: 'Tú pierdes el tiempo',
                translation: 'Ты теряешь время',
            },
            {
                pronoun: 'él',
                example: 'Él pierde el partido',
                translation: 'Он проигрывает матч',
            },
            {
                pronoun: 'ella',
                example: 'Ella pierde el autobús',
                translation: 'Она упускает автобус',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros perdemos dinero',
                translation: 'Мы теряем деньги',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos pierden la paciencia',
                translation: 'Они теряют терпение',
            },
            {
                pronoun: 'yo',
                example: 'No pierdo la esperanza',
                translation: 'Я не теряю надежду',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pierdes siempre?',
                translation: 'Ты всегда проигрываешь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pierdo',
                        translation: 'Я теряю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pierdes',
                        translation: 'Ты теряешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pierde',
                        translation: 'Он теряет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pierde',
                        translation: 'Она теряет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros perdemos',
                        translation: 'Мы теряем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros perdéis',
                        translation: 'Вы теряете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pierden',
                        translation: 'Они теряют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pierdo',
                        translation: 'Я не теряю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pierdes?',
                        translation: 'Ты теряешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo perdí',
                        translation: 'Я потерял',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú perdiste',
                        translation: 'Ты потерял',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él perdió',
                        translation: 'Он потерял',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella perdió',
                        translation: 'Она потеряла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros perdimos',
                        translation: 'Мы потеряли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos perdieron',
                        translation: 'Они потеряли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No perdí',
                        translation: 'Я не потерял',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Perdiste?',
                        translation: 'Ты потерял?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'producir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['производить', 'создавать', 'вызывать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo produzco alimentos',
                translation: 'Я произвожу продукты питания',
            },
            {
                pronoun: 'tú',
                example: 'Tú produces arte',
                translation: 'Ты создаешь искусство',
            },
            {
                pronoun: 'él',
                example: 'Él produce electricidad',
                translation: 'Он производит электричество',
            },
            {
                pronoun: 'ella',
                example: 'Ella produce música',
                translation: 'Она создает музыку',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros producimos energía',
                translation: 'Мы производим энергию',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos producen cambios',
                translation: 'Они вызывают изменения',
            },
            {
                pronoun: 'yo',
                example: 'No produzco basura',
                translation: 'Я не произвожу мусор',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Producen ustedes vino?',
                translation: 'Вы производите вино?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo produzco',
                        translation: 'Я произвожу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú produces',
                        translation: 'Ты производишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él produce',
                        translation: 'Он производит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella produce',
                        translation: 'Она производит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros producimos',
                        translation: 'Мы производим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros producís',
                        translation: 'Вы производите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos producen',
                        translation: 'Они производят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No produzco',
                        translation: 'Я не произвожу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Produces?',
                        translation: 'Ты производишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo produje',
                        translation: 'Я произвел',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú produjiste',
                        translation: 'Ты произвел',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él produjo',
                        translation: 'Он произвел',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella produjo',
                        translation: 'Она произвела',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros produjimos',
                        translation: 'Мы произвели',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos produjeron',
                        translation: 'Они произвели',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No produje',
                        translation: 'Я не произвел',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Produjiste?',
                        translation: 'Ты произвел?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'ocurrir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'происходить',
                    'случаться',
                    'приходить в голову',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me ocurre una idea',
                translation: 'Мне приходит в голову идея',
            },
            {
                pronoun: 'tú',
                example: 'Te ocurre algo extraño',
                translation: 'С тобой происходит что-то странное',
            },
            {
                pronoun: 'él',
                example: 'Le ocurre un accidente',
                translation: 'С ним происходит несчастный случай',
            },
            {
                pronoun: 'ella',
                example: 'Le ocurre lo mismo',
                translation: 'С ней происходит то же самое',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos ocurre a menudo',
                translation: 'С нами происходит часто',
            },
            {
                pronoun: 'ellos',
                example: 'Les ocurre en verano',
                translation: 'С ними происходит летом',
            },
            {
                pronoun: 'yo',
                example: 'No me ocurre nada',
                translation: 'Со мной ничего не происходит',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te ocurre algo?',
                translation: 'С тобой что-то происходит?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ocurre',
                        translation: 'Мне происходит',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ocurre',
                        translation: 'Тебе происходит',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ocurre',
                        translation: 'Ему происходит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ocurre',
                        translation: 'Ей происходит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ocurre',
                        translation: 'Нам происходит',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os ocurre',
                        translation: 'Вам происходит',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ocurre',
                        translation: 'Им происходит',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ocurre',
                        translation: 'Мне не происходит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ocurre?',
                        translation: 'Тебе происходит?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ocurrió',
                        translation: 'Мне произошло',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ocurrió',
                        translation: 'Тебе произошло',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ocurrió',
                        translation: 'Ему произошло',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ocurrió',
                        translation: 'Ей произошло',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ocurrió',
                        translation: 'Нам произошло',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ocurrió',
                        translation: 'Им произошло',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ocurrió',
                        translation: 'Мне не произошло',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ocurrió?',
                        translation: 'Тебе произошло?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'entender',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['понимать', 'разбираться', 'осознавать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo entiendo español',
                translation: 'Я понимаю испанский',
            },
            {
                pronoun: 'tú',
                example: 'Tú entiendes matemáticas',
                translation: 'Ты разбираешься в математике',
            },
            {
                pronoun: 'él',
                example: 'Él entiende el problema',
                translation: 'Он понимает проблему',
            },
            {
                pronoun: 'ella',
                example: 'Ella entiende bien',
                translation: 'Она хорошо понимает',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros entendemos juntos',
                translation: 'Мы понимаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos entienden el mensaje',
                translation: 'Они понимают сообщение',
            },
            {
                pronoun: 'yo',
                example: 'No entiendo nada',
                translation: 'Я ничего не понимаю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Entiendes lo que digo?',
                translation: 'Ты понимаешь, что я говорю?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo entiendo',
                        translation: 'Я понимаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú entiendes',
                        translation: 'Ты понимаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él entiende',
                        translation: 'Он понимает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella entiende',
                        translation: 'Она понимает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros entendemos',
                        translation: 'Мы понимаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros entendéis',
                        translation: 'Вы понимаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos entienden',
                        translation: 'Они понимают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No entiendo',
                        translation: 'Я не понимаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Entiendes?',
                        translation: 'Ты понимаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo entendí',
                        translation: 'Я понял',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú entendiste',
                        translation: 'Ты понял',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él entendió',
                        translation: 'Он понял',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella entendió',
                        translation: 'Она поняла',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros entendimos',
                        translation: 'Мы поняли',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos entendieron',
                        translation: 'Они поняли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No entendí',
                        translation: 'Я не понял',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Entendiste?',
                        translation: 'Ты понял?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'pedir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['просить', 'заказывать', 'запрашивать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo pido ayuda',
                translation: 'Я прошу помощи',
            },
            {
                pronoun: 'tú',
                example: 'Tú pides permiso',
                translation: 'Ты просишь разрешения',
            },
            {
                pronoun: 'él',
                example: 'Él pide comida',
                translation: 'Он заказывает еду',
            },
            {
                pronoun: 'ella',
                example: 'Ella pide disculpas',
                translation: 'Она просит прощения',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros pedimos información',
                translation: 'Мы запрашиваем информацию',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos piden consejo',
                translation: 'Они просят совета',
            },
            {
                pronoun: 'yo',
                example: 'No pido mucho',
                translation: 'Я не прошу много',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Pides algo más?',
                translation: 'Ты просишь что-то еще?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pido',
                        translation: 'Я прошу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pides',
                        translation: 'Ты просишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pide',
                        translation: 'Он просит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pide',
                        translation: 'Она просит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pedimos',
                        translation: 'Мы просим',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros pedís',
                        translation: 'Вы просите',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos piden',
                        translation: 'Они просят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pido',
                        translation: 'Я не прошу',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pides?',
                        translation: 'Ты просишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo pedí',
                        translation: 'Я попросил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú pediste',
                        translation: 'Ты попросил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él pidió',
                        translation: 'Он попросил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella pidió',
                        translation: 'Она попросила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros pedimos',
                        translation: 'Мы попросили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos pidieron',
                        translation: 'Они попросили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No pedí',
                        translation: 'Я не попросил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Pediste?',
                        translation: 'Ты попросил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'recibir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['получать', 'принимать', 'встречать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo recibo cartas',
                translation: 'Я получаю письма',
            },
            {
                pronoun: 'tú',
                example: 'Tú recibes regalos',
                translation: 'Ты получаешь подарки',
            },
            {
                pronoun: 'él',
                example: 'Él recibe visitas',
                translation: 'Он принимает гостей',
            },
            {
                pronoun: 'ella',
                example: 'Ella recibe educación',
                translation: 'Она получает образование',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros recibimos ayuda',
                translation: 'Мы получаем помощь',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos reciben premios',
                translation: 'Они получают награды',
            },
            {
                pronoun: 'yo',
                example: 'No recibo llamadas',
                translation: 'Я не получаю звонки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Recibes el periódico?',
                translation: 'Ты получаешь газету?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recibo',
                        translation: 'Я получаю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recibes',
                        translation: 'Ты получаешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recibe',
                        translation: 'Он получает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recibe',
                        translation: 'Она получает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recibimos',
                        translation: 'Мы получаем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros recibís',
                        translation: 'Вы получаете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos reciben',
                        translation: 'Они получают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recibo',
                        translation: 'Я не получаю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recibes?',
                        translation: 'Ты получаешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recibí',
                        translation: 'Я получил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recibiste',
                        translation: 'Ты получил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recibió',
                        translation: 'Он получил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recibió',
                        translation: 'Она получила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recibimos',
                        translation: 'Мы получили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos recibieron',
                        translation: 'Они получили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recibí',
                        translation: 'Я не получил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recibiste?',
                        translation: 'Ты получил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'recordar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['помнить', 'вспоминать', 'напоминать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo recuerdo tu nombre',
                translation: 'Я помню твое имя',
            },
            {
                pronoun: 'tú',
                example: 'Tú recuerdas los detalles',
                translation: 'Ты помнишь детали',
            },
            {
                pronoun: 'él',
                example: 'Él recuerda el pasado',
                translation: 'Он вспоминает прошлое',
            },
            {
                pronoun: 'ella',
                example: 'Ella recuerda fiestas',
                translation: 'Она вспоминает вечеринки',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros recordamos juntos',
                translation: 'Мы вспоминаем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos recuerdan la historia',
                translation: 'Они помнят историю',
            },
            {
                pronoun: 'yo',
                example: 'No recuerdo nada',
                translation: 'Я ничего не помню',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Recuerdas mi dirección?',
                translation: 'Ты помнишь мой адрес?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recuerdo',
                        translation: 'Я помню',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recuerdas',
                        translation: 'Ты помнишь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recuerda',
                        translation: 'Он помнит',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recuerda',
                        translation: 'Она помнит',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recordamos',
                        translation: 'Мы помним',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros recordáis',
                        translation: 'Вы помните',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos recuerdan',
                        translation: 'Они помнят',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recuerdo',
                        translation: 'Я не помню',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recuerdas?',
                        translation: 'Ты помнишь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo recordé',
                        translation: 'Я вспомнил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú recordaste',
                        translation: 'Ты вспомнил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él recordó',
                        translation: 'Он вспомнил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella recordó',
                        translation: 'Она вспомнила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros recordamos',
                        translation: 'Мы вспомнили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos recordaron',
                        translation: 'Они вспомнили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No recordé',
                        translation: 'Я не вспомнил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Recordaste?',
                        translation: 'Ты вспомнил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'terminar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['заканчивать', 'завершать', 'кончать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo termino el trabajo',
                translation: 'Я заканчиваю работу',
            },
            {
                pronoun: 'tú',
                example: 'Tú terminas la universidad',
                translation: 'Ты заканчиваешь университет',
            },
            {
                pronoun: 'él',
                example: 'Él termina el libro',
                translation: 'Он заканчивает книгу',
            },
            {
                pronoun: 'ella',
                example: 'Ella termina pronto',
                translation: 'Она заканчивает скоро',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros terminamos juntos',
                translation: 'Мы заканчиваем вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos terminan el proyecto',
                translation: 'Они завершают проект',
            },
            {
                pronoun: 'yo',
                example: 'No termino nunca',
                translation: 'Я никогда не заканчиваю',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Terminas ya?',
                translation: 'Ты уже заканчиваешь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo termino',
                        translation: 'Я заканчиваю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú terminas',
                        translation: 'Ты заканчиваешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él termina',
                        translation: 'Он заканчивает',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella termina',
                        translation: 'Она заканчивает',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros terminamos',
                        translation: 'Мы заканчиваем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros termináis',
                        translation: 'Вы заканчиваете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos terminan',
                        translation: 'Они заканчивают',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No termino',
                        translation: 'Я не заканчиваю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Terminas?',
                        translation: 'Ты заканчиваешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo terminé',
                        translation: 'Я закончил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú terminaste',
                        translation: 'Ты закончил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él terminó',
                        translation: 'Он закончил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella terminó',
                        translation: 'Она закончила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros terminamos',
                        translation: 'Мы закончили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos terminaron',
                        translation: 'Они закончили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No terminé',
                        translation: 'Я не закончил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Terminaste?',
                        translation: 'Ты закончил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'permitir',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['позволять', 'разрешать', 'допускать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo permito fumar',
                translation: 'Я позволяю курить',
            },
            {
                pronoun: 'tú',
                example: 'Tú permites entrar',
                translation: 'Ты позволяешь войти',
            },
            {
                pronoun: 'él',
                example: 'Él permite preguntas',
                translation: 'Он разрешает вопросы',
            },
            {
                pronoun: 'ella',
                example: 'Ella permite excepciones',
                translation: 'Она допускает исключения',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros permitimos cambios',
                translation: 'Мы допускаем изменения',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos permiten visitas',
                translation: 'Они разрешают визиты',
            },
            {
                pronoun: 'yo',
                example: 'No permito mentiras',
                translation: 'Я не позволяю лжи',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Permites que vaya?',
                translation: 'Ты позволяешь мне пойти?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo permito',
                        translation: 'Я позволяю',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú permites',
                        translation: 'Ты позволяешь',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él permite',
                        translation: 'Он позволяет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella permite',
                        translation: 'Она позволяет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros permitimos',
                        translation: 'Мы позволяем',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros permitís',
                        translation: 'Вы позволяете',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos permiten',
                        translation: 'Они позволяют',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No permito',
                        translation: 'Я не позволяю',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Permites?',
                        translation: 'Ты позволяешь?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo permití',
                        translation: 'Я позволил',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú permitiste',
                        translation: 'Ты позволил',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él permitió',
                        translation: 'Он позволил',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella permitió',
                        translation: 'Она позволила',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros permitimos',
                        translation: 'Мы позволили',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos permitieron',
                        translation: 'Они позволили',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No permití',
                        translation: 'Я не позволил',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Permitiste?',
                        translation: 'Ты позволил?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
    {
        word: 'aparecer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['появляться', 'казаться', 'выглядеть'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Yo aparezco en la foto',
                translation: 'Я появляюсь на фото',
            },
            {
                pronoun: 'tú',
                example: 'Tú apareces cansado',
                translation: 'Ты кажешься уставшим',
            },
            {
                pronoun: 'él',
                example: 'Él aparece de repente',
                translation: 'Он появляется внезапно',
            },
            {
                pronoun: 'ella',
                example: 'Ella aparece hermosa',
                translation: 'Она выглядит прекрасной',
            },
            {
                pronoun: 'nosotros',
                example: 'Nosotros aparecemos juntos',
                translation: 'Мы появляемся вместе',
            },
            {
                pronoun: 'ellos',
                example: 'Ellos aparecen en televisión',
                translation: 'Они появляются на телевидении',
            },
            {
                pronoun: 'yo',
                example: 'No aparezco nunca',
                translation: 'Я никогда не появляюсь',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Apareces en el sueño?',
                translation: 'Ты появляешься во сне?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo aparezco',
                        translation: 'Я появляюсь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú apareces',
                        translation: 'Ты появляешься',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él aparece',
                        translation: 'Он появляется',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella aparece',
                        translation: 'Она появляется',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros aparecemos',
                        translation: 'Мы появляемся',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Vosotros aparecéis',
                        translation: 'Вы появляетесь',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos aparecen',
                        translation: 'Они появляются',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No aparezco',
                        translation: 'Я не появляюсь',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Apareces?',
                        translation: 'Ты появляешься?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Yo aparecí',
                        translation: 'Я появился',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Tú apareciste',
                        translation: 'Ты появился',
                    },
                    {
                        pronoun: 'él',
                        example: 'Él apareció',
                        translation: 'Он появился',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Ella apareció',
                        translation: 'Она появилась',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nosotros aparecimos',
                        translation: 'Мы появились',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Ellos aparecieron',
                        translation: 'Они появились',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No aparecí',
                        translation: 'Я не появился',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Apareciste?',
                        translation: 'Ты появился?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // MOLESTAR
    {
        word: 'molestar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['беспокоить', 'раздражать', 'надоедать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me molesta el ruido de la calle',
                translation: 'Меня раздражает шум с улицы',
            },
            {
                pronoun: 'tú',
                example: 'Te molestan las interrupciones constantes',
                translation: 'Тебя раздражают постоянные перерывы',
            },
            {
                pronoun: 'él',
                example: 'Le molesta levantarse temprano',
                translation: 'Его раздражает вставать рано',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos molesta la falta de respeto',
                translation: 'Нас раздражает неуважение',
            },
            {
                pronoun: 'ellos',
                example: 'Les molestan los malos modales',
                translation: 'Их раздражают плохие манеры',
            },
            {
                pronoun: 'yo',
                example: 'No me molesta esperar',
                translation: 'Меня не раздражает ждать',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te molesta que fume aquí?',
                translation: 'Тебя раздражает, что я курю здесь?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me molesta la música alta',
                        translation: 'Меня раздражает громкая музыка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te molesta el calor',
                        translation: 'Тебя раздражает жара',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le molesta el frío',
                        translation: 'Его раздражает холод',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le molesta la mentira',
                        translation: 'Ее раздражает ложь',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos molesta el humo',
                        translation: 'Нас раздражает дым',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os molesta el ruido',
                        translation: 'Вас раздражает шум',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les molesta la espera',
                        translation: 'Их раздражает ожидание',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me molesta nada',
                        translation: 'Меня ничего не раздражает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te molesta algo?',
                        translation: 'Тебя что-то раздражает?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha molestado su actitud',
                        translation: 'Меня раздражало его отношение',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha molestado el comentario',
                        translation: 'Тебя раздражал комментарий',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha molestado la situación',
                        translation: 'Его раздражала ситуация',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha molestado el retraso',
                        translation: 'Ее раздражала задержка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha molestado el error',
                        translation: 'Нас раздражала ошибка',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha molestado el cambio',
                        translation: 'Их раздражало изменение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha molestado',
                        translation: 'Меня это не раздражало',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha molestado?',
                        translation: 'Тебя это раздражало?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me molestó su respuesta',
                        translation: 'Меня раздражил его ответ',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te molestó la noticia',
                        translation: 'Тебя раздражила новость',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le molestó el problema',
                        translation: 'Его раздражила проблема',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le molestó la interrupción',
                        translation: 'Ее раздражило прерывание',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos molestó el incidente',
                        translation: 'Нас раздражил инцидент',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les molestó la decisión',
                        translation: 'Их раздражило решение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me molestó nada',
                        translation: 'Меня ничего не раздражало',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te molestó eso?',
                        translation: 'Тебя это раздражало?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a molestar el viaje largo',
                        translation: 'Меня будет раздражать долгая поездка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a molestar la espera',
                        translation: 'Тебя будет раздражать ожидание',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a molestar el cambio',
                        translation: 'Его будет раздражать изменение',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a molestar la demora',
                        translation: 'Ее будет раздражать задержка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a molestar el tráfico',
                        translation: 'Нас будет раздражать движение',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a molestar el ruido',
                        translation: 'Их будет раздражать шум',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a molestar',
                        translation: 'Меня это не будет раздражать',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a molestar?',
                        translation: 'Тебя это будет раздражать?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está molestando el dolor',
                        translation: 'Меня раздражает боль',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está molestando algo',
                        translation: 'Тебя что-то раздражает',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está molestando el calor',
                        translation: 'Его раздражает жара',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está molestando la luz',
                        translation: 'Ее раздражает свет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está molestando el olor',
                        translation: 'Нас раздражает запах',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está molestando el sonido',
                        translation: 'Их раздражает звук',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está molestando',
                        translation: 'Меня это не раздражает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está molestando?',
                        translation: 'Тебя это раздражает?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // ENCANTAR
    {
        word: 'encantar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['очаровывать', 'восхищать', 'нравиться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me encanta el chocolate suizo',
                translation: 'Мне нравится швейцарский шоколад',
            },
            {
                pronoun: 'tú',
                example: 'Te encantan las películas de acción',
                translation: 'Тебе нравятся боевики',
            },
            {
                pronoun: 'él',
                example: 'Le encanta viajar por el mundo',
                translation: 'Ему нравится путешествовать по миру',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos encanta la comida italiana',
                translation: 'Нам нравится итальянская кухня',
            },
            {
                pronoun: 'ellos',
                example: 'Les encantan los conciertos en vivo',
                translation: 'Им нравятся живые концерты',
            },
            {
                pronoun: 'yo',
                example: 'No me encantan los lunes',
                translation: 'Мне не нравятся понедельники',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te encanta el jazz?',
                translation: 'Тебе нравится джаз?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me encanta bailar salsa',
                        translation: 'Мне нравится танцевать сальсу',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te encanta leer novelas',
                        translation: 'Тебе нравится читать романы',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le encanta cocinar platos nuevos',
                        translation: 'Ему нравится готовить новые блюда',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le encanta pintar cuadros',
                        translation: 'Ей нравится рисовать картины',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos encanta ir al cine',
                        translation: 'Нам нравится ходить в кино',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os encanta el fútbol',
                        translation: 'Вам нравится футбол',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les encanta la música clásica',
                        translation: 'Им нравится классическая музыка',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me encanta madrugar',
                        translation: 'Мне не нравится рано вставать',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te encanta este lugar?',
                        translation: 'Тебе нравится это место?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha encantado tu regalo',
                        translation: 'Мне понравился твой подарок',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha encantado la película',
                        translation: 'Тебе понравился фильм',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha encantado la sorpresa',
                        translation: 'Ему понравился сюрприз',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha encantado el viaje',
                        translation: 'Ей понравилась поездка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha encantado la fiesta',
                        translation: 'Нам понравилась вечеринка',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha encantado el concierto',
                        translation: 'Им понравился концерт',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha encantado la idea',
                        translation: 'Мне не понравилась идея',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha encantado el restaurante?',
                        translation: 'Тебе понравился ресторан?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me encantó tu presentación',
                        translation: 'Мне понравилась твоя презентация',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te encantó el espectáculo',
                        translation: 'Тебе понравилось представление',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le encantó la conferencia',
                        translation: 'Ему понравилась конференция',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le encantó el museo',
                        translation: 'Ей понравился музей',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos encantó la ciudad',
                        translation: 'Нам понравился город',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les encantó la experiencia',
                        translation: 'Им понравился опыт',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me encantó el hotel',
                        translation: 'Мне не понравился отель',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te encantó el show?',
                        translation: 'Тебе понравилось шоу?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a encantar tu propuesta',
                        translation: 'Мне понравится твое предложение',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a encantar este lugar',
                        translation: 'Тебе понравится это место',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a encantar la noticia',
                        translation: 'Ему понравится новость',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a encantar el regalo',
                        translation: 'Ей понравится подарок',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a encantar el plan',
                        translation: 'Нам понравится план',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a encantar la idea',
                        translation: 'Им понравится идея',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a encantar',
                        translation: 'Мне это не понравится',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a encantar?',
                        translation: 'Тебе это понравится?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está encantando este libro',
                        translation: 'Мне нравится эта книга',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está encantando la serie',
                        translation: 'Тебе нравится сериал',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está encantando el curso',
                        translation: 'Ему нравится курс',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está encantando la clase',
                        translation: 'Ей нравится урок',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está encantando el viaje',
                        translation: 'Нам нравится поездка',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está encantando la ciudad',
                        translation: 'Им нравится город',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está encantando',
                        translation: 'Мне это не нравится',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está encantando?',
                        translation: 'Тебе это нравится?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // FASCINAR
    {
        word: 'fascinar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['восхищать', 'завораживать', 'очаровывать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me fascina la astronomía moderna',
                translation: 'Меня восхищает современная астрономия',
            },
            {
                pronoun: 'tú',
                example: 'Te fascinan las culturas antiguas',
                translation: 'Тебя восхищают древние культуры',
            },
            {
                pronoun: 'él',
                example: 'Le fascina el arte contemporáneo',
                translation: 'Его восхищает современное искусство',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos fascina la naturaleza salvaje',
                translation: 'Нас восхищает дикая природа',
            },
            {
                pronoun: 'ellos',
                example: 'Les fascinan los avances tecnológicos',
                translation: 'Их восхищают технологические достижения',
            },
            {
                pronoun: 'yo',
                example: 'No me fascina la política',
                translation: 'Меня не восхищает политика',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te fascina la historia?',
                translation: 'Тебя восхищает история?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me fascina la física cuántica',
                        translation: 'Меня восхищает квантовая физика',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te fascina el universo',
                        translation: 'Тебя восхищает вселенная',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le fascina la fotografía artística',
                        translation: 'Его восхищает художественная фотография',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le fascina la arquitectura gótica',
                        translation: 'Ее восхищает готическая архитектура',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos fascina el océano profundo',
                        translation: 'Нас восхищает глубокий океан',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os fascina la ciencia',
                        translation: 'Вас восхищает наука',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les fascina el espacio exterior',
                        translation: 'Их восхищает космос',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me fascina eso',
                        translation: 'Меня это не восхищает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te fascina el tema?',
                        translation: 'Тебя восхищает тема?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha fascinado tu trabajo',
                        translation: 'Меня восхитила твоя работа',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha fascinado el documental',
                        translation: 'Тебя восхитил документальный фильм',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha fascinado la exposición',
                        translation: 'Его восхитила выставка',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha fascinado el descubrimiento',
                        translation: 'Ее восхитило открытие',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha fascinado el proyecto',
                        translation: 'Нас восхитил проект',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha fascinado la investigación',
                        translation: 'Их восхитило исследование',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha fascinado',
                        translation: 'Меня это не восхитило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha fascinado?',
                        translation: 'Тебя это восхитило?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me fascinó la conferencia',
                        translation: 'Меня восхитила конференция',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te fascinó el experimento',
                        translation: 'Тебя восхитил эксперимент',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le fascinó el hallazgo',
                        translation: 'Его восхитила находка',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le fascinó la teoría',
                        translation: 'Ее восхитила теория',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos fascinó el fenómeno',
                        translation: 'Нас восхитило явление',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les fascinó el método',
                        translation: 'Их восхитил метод',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me fascinó nada',
                        translation: 'Меня ничего не восхитило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te fascinó el resultado?',
                        translation: 'Тебя восхитил результат?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a fascinar el viaje',
                        translation: 'Меня восхитит поездка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a fascinar la tecnología',
                        translation: 'Тебя восхитит технология',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a fascinar el descubrimiento',
                        translation: 'Его восхитит открытие',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a fascinar el estudio',
                        translation: 'Ее восхитит исследование',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a fascinar la experiencia',
                        translation: 'Нас восхитит опыт',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a fascinar el sistema',
                        translation: 'Их восхитит система',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a fascinar',
                        translation: 'Меня это не восхитит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a fascinar?',
                        translation: 'Тебя это восхитит?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está fascinando este tema',
                        translation: 'Меня восхищает эта тема',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está fascinando el proyecto',
                        translation: 'Тебя восхищает проект',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está fascinando la materia',
                        translation: 'Его восхищает предмет',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está fascinando el curso',
                        translation: 'Ее восхищает курс',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está fascinando la investigación',
                        translation: 'Нас восхищает исследование',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está fascinando el descubrimiento',
                        translation: 'Их восхищает открытие',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está fascinando',
                        translation: 'Меня это не восхищает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está fascinando?',
                        translation: 'Тебя это восхищает?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // APETECER
    {
        word: 'apetecer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['хотеться', 'иметь желание', 'желать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me apetece un café con leche',
                translation: 'Мне хочется кофе с молоком',
            },
            {
                pronoun: 'tú',
                example: 'Te apetece salir a pasear',
                translation: 'Тебе хочется пойти погулять',
            },
            {
                pronoun: 'él',
                example: 'Le apetece comer algo dulce',
                translation: 'Ему хочется съесть что-то сладкое',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos apetece ver una película',
                translation: 'Нам хочется посмотреть фильм',
            },
            {
                pronoun: 'ellos',
                example: 'Les apetece ir a la playa',
                translation: 'Им хочется пойти на пляж',
            },
            {
                pronoun: 'yo',
                example: 'No me apetece trabajar hoy',
                translation: 'Мне не хочется работать сегодня',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te apetece una cerveza?',
                translation: 'Тебе хочется пива?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me apetece descansar un poco',
                        translation: 'Мне хочется немного отдохнуть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te apetece bailar esta noche',
                        translation: 'Тебе хочется потанцевать сегодня вечером',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le apetece probar comida nueva',
                        translation: 'Ему хочется попробовать новую еду',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le apetece leer un buen libro',
                        translation: 'Ей хочется почитать хорошую книгу',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos apetece hacer un viaje',
                        translation: 'Нам хочется совершить поездку',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os apetece jugar al fútbol',
                        translation: 'Вам хочется поиграть в футбол',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les apetece cenar fuera',
                        translation: 'Им хочется поужинать вне дома',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me apetece salir',
                        translation: 'Мне не хочется выходить',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te apetece algo?',
                        translation: 'Тебе чего-нибудь хочется?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha apetecido un helado',
                        translation: 'Мне захотелось мороженого',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha apetecido cambiar de aires',
                        translation: 'Тебе захотелось сменить обстановку',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha apetecido tomar un café',
                        translation: 'Ему захотелось выпить кофе',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha apetecido dar un paseo',
                        translation: 'Ей захотелось прогуляться',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha apetecido ir al cine',
                        translation: 'Нам захотелось пойти в кино',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha apetecido viajar',
                        translation: 'Им захотелось попутешествовать',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha apetecido nada',
                        translation: 'Мне ничего не захотелось',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha apetecido?',
                        translation: 'Тебе захотелось?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me apeteció quedarme en casa',
                        translation: 'Мне захотелось остаться дома',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te apeteció probar algo diferente',
                        translation:
                            'Тебе захотелось попробовать что-то другое',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le apeteció descansar todo el día',
                        translation: 'Ему захотелось отдыхать весь день',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le apeteció cocinar algo especial',
                        translation:
                            'Ей захотелось приготовить что-то особенное',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos apeteció salir de fiesta',
                        translation: 'Нам захотелось пойти на вечеринку',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les apeteció ir de compras',
                        translation: 'Им захотелось пойти за покупками',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me apeteció nada especial',
                        translation: 'Мне не захотелось ничего особенного',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te apeteció la idea?',
                        translation: 'Тебе понравилась идея?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a apetecer dormir después',
                        translation: 'Мне захочется поспать потом',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a apetecer comer algo',
                        translation: 'Тебе захочется что-нибудь поесть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a apetecer descansar',
                        translation: 'Ему захочется отдохнуть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a apetecer salir',
                        translation: 'Ей захочется выйти',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a apetecer bailar',
                        translation: 'Нам захочется потанцевать',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a apetecer volver',
                        translation: 'Им захочется вернуться',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a apetecer',
                        translation: 'Мне не захочется',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a apetecer?',
                        translation: 'Тебе захочется?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está apeteciendo un té caliente',
                        translation: 'Мне хочется горячего чая',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está apeteciendo descansar',
                        translation: 'Тебе хочется отдохнуть',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está apeteciendo comer algo',
                        translation: 'Ему хочется что-нибудь поесть',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está apeteciendo dormir',
                        translation: 'Ей хочется спать',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está apeteciendo salir',
                        translation: 'Нам хочется выйти',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está apeteciendo viajar',
                        translation: 'Им хочется попутешествовать',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está apeteciendo nada',
                        translation: 'Мне ничего не хочется',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está apeteciendo algo?',
                        translation: 'Тебе чего-нибудь хочется?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // ASUSTAR
    {
        word: 'asustar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['пугать', 'страшить', 'испугать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me asustan las películas de terror',
                translation: 'Меня пугают фильмы ужасов',
            },
            {
                pronoun: 'tú',
                example: 'Te asustan los truenos y relámpagos',
                translation: 'Тебя пугают гром и молния',
            },
            {
                pronoun: 'él',
                example: 'Le asustan los perros grandes',
                translation: 'Его пугают большие собаки',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos asustan los cambios repentinos',
                translation: 'Нас пугают внезапные изменения',
            },
            {
                pronoun: 'ellos',
                example: 'Les asustan las alturas',
                translation: 'Их пугают высоты',
            },
            {
                pronoun: 'yo',
                example: 'No me asustan las arañas',
                translation: 'Меня не пугают пауки',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te asustan los fantasmas?',
                translation: 'Тебя пугают призраки?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me asustan los espacios cerrados',
                        translation: 'Меня пугают закрытые пространства',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te asustan las serpientes venenosas',
                        translation: 'Тебя пугают ядовитые змеи',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le asustan los ruidos extraños',
                        translation: 'Его пугают странные звуки',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le asustan las tormentas fuertes',
                        translation: 'Ее пугают сильные грозы',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos asustan los lugares oscuros',
                        translation: 'Нас пугают темные места',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os asustan los insectos',
                        translation: 'Вас пугают насекомые',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les asustan los aviones',
                        translation: 'Их пугают самолеты',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me asustan los retos',
                        translation: 'Меня не пугают вызовы',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te asustan los cambios?',
                        translation: 'Тебя пугают изменения?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha asustado ese ruido',
                        translation: 'Меня испугал этот звук',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha asustado la noticia',
                        translation: 'Тебя испугала новость',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha asustado el perro',
                        translation: 'Его испугала собака',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha asustado la situación',
                        translation: 'Ее испугала ситуация',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha asustado el accidente',
                        translation: 'Нас испугала авария',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha asustado la tormenta',
                        translation: 'Их испугала гроза',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha asustado nada',
                        translation: 'Меня ничего не испугало',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha asustado algo?',
                        translation: 'Тебя что-то испугало?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me asustó el trueno repentino',
                        translation: 'Меня испугал внезапный гром',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te asustó el grito fuerte',
                        translation: 'Тебя испугал громкий крик',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le asustó el movimiento brusco',
                        translation: 'Его испугало резкое движение',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le asustó la figura oscura',
                        translation: 'Ее испугала темная фигура',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos asustó el sonido extraño',
                        translation: 'Нас испугал странный звук',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les asustó la explosión',
                        translation: 'Их испугал взрыв',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me asustó para nada',
                        translation: 'Меня это совсем не испугало',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te asustó la película?',
                        translation: 'Тебя испугал фильм?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a asustar la película',
                        translation: 'Меня испугает фильм',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a asustar el examen',
                        translation: 'Тебя испугает экзамен',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a asustar la noticia',
                        translation: 'Его испугает новость',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a asustar la altura',
                        translation: 'Ее испугает высота',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a asustar el resultado',
                        translation: 'Нас испугает результат',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a asustar la tormenta',
                        translation: 'Их испугает гроза',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a asustar',
                        translation: 'Меня это не испугает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a asustar?',
                        translation: 'Тебя это испугает?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está asustando la oscuridad',
                        translation: 'Меня пугает темнота',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está asustando el ruido',
                        translation: 'Тебя пугает шум',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está asustando la situación',
                        translation: 'Его пугает ситуация',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está asustando el silencio',
                        translation: 'Ее пугает тишина',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está asustando el clima',
                        translation: 'Нас пугает погода',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está asustando el panorama',
                        translation: 'Их пугает панорама',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está asustando',
                        translation: 'Меня это не пугает',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está asustando?',
                        translation: 'Тебя это пугает?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // DOLER
    {
        word: 'doler',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['болеть', 'причинять боль', 'страдать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me duele mucho la cabeza',
                translation: 'У меня сильно болит голова',
            },
            {
                pronoun: 'tú',
                example: 'Te duelen las piernas',
                translation: 'У тебя болят ноги',
            },
            {
                pronoun: 'él',
                example: 'Le duele el estómago',
                translation: 'У него болит живот',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos duelen los músculos',
                translation: 'У нас болят мышцы',
            },
            {
                pronoun: 'ellos',
                example: 'Les duelen las muelas',
                translation: 'У них болят зубы',
            },
            {
                pronoun: 'yo',
                example: 'No me duele nada',
                translation: 'У меня ничего не болит',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te duele algo?',
                translation: 'У тебя что-то болит?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me duele la espalda baja',
                        translation: 'У меня болит поясница',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te duele el brazo derecho',
                        translation: 'У тебя болит правая рука',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le duele la rodilla izquierda',
                        translation: 'У него болит левое колено',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le duele el cuello',
                        translation: 'У нее болит шея',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos duele todo el cuerpo',
                        translation: 'У нас болит все тело',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os duelen los pies',
                        translation: 'У вас болят ноги',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les duelen los ojos',
                        translation: 'У них болят глаза',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me duele ahora',
                        translation: 'У меня сейчас не болит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te duele mucho?',
                        translation: 'У тебя сильно болит?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha dolido toda la noche',
                        translation: 'У меня болело всю ночь',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha dolido desde ayer',
                        translation: 'У тебя болит со вчерашнего дня',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha dolido después del ejercicio',
                        translation: 'У него болело после упражнений',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha dolido todo el día',
                        translation: 'У нее болело весь день',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha dolido mucho',
                        translation: 'У нас сильно болело',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha dolido la garganta',
                        translation: 'У них болело горло',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha dolido nada',
                        translation: 'У меня ничего не болело',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha dolido mucho?',
                        translation: 'У тебя сильно болело?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me dolió todo el día',
                        translation: 'У меня болело весь день',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te dolió después de correr',
                        translation: 'У тебя болело после бега',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le dolió durante horas',
                        translation: 'У него болело часами',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le dolió toda la semana',
                        translation: 'У нее болело всю неделю',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos dolió por días',
                        translation: 'У нас болело днями',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les dolió bastante',
                        translation: 'У них довольно сильно болело',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me dolió tanto',
                        translation: 'У меня не так сильно болело',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te dolió ayer?',
                        translation: 'У тебя вчера болело?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a doler mañana',
                        translation: 'У меня завтра будет болеть',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a doler después',
                        translation: 'У тебя будет болеть потом',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a doler la inyección',
                        translation: 'У него будет болеть от укола',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a doler la operación',
                        translation: 'У нее будет болеть после операции',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a doler el ejercicio',
                        translation: 'У нас будет болеть от упражнений',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a doler el tratamiento',
                        translation: 'У них будет болеть от лечения',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a doler',
                        translation: 'У меня не будет болеть',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a doler?',
                        translation: 'У тебя будет болеть?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está doliendo ahora mismo',
                        translation: 'У меня болит прямо сейчас',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está doliendo cada vez más',
                        translation: 'У тебя болит все больше',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está doliendo la herida',
                        translation: 'У него болит рана',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está doliendo la muela',
                        translation: 'У нее болит зуб',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está doliendo mucho',
                        translation: 'У нас сильно болит',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está doliendo la cabeza',
                        translation: 'У них болит голова',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está doliendo ya',
                        translation: 'У меня уже не болит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está doliendo todavía?',
                        translation: 'У тебя все еще болит?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // CAER BIEN/MAL
    {
        word: 'caer bien',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'нравиться',
                    'симпатичен',
                    'производить впечатление',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me cae bien tu hermano',
                translation: 'Мне нравится твой брат',
            },
            {
                pronoun: 'tú',
                example: 'Te caen bien mis amigos',
                translation: 'Тебе нравятся мои друзья',
            },
            {
                pronoun: 'él',
                example: 'Le cae muy bien su jefe',
                translation: 'Ему очень нравится его начальник',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos caen bien nuestros vecinos',
                translation: 'Нам нравятся наши соседи',
            },
            {
                pronoun: 'ellos',
                example: 'Les cae bien la profesora',
                translation: 'Им нравится учительница',
            },
            {
                pronoun: 'yo',
                example: 'No me cae bien esa persona',
                translation: 'Мне не нравится этот человек',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te cae bien mi primo?',
                translation: 'Тебе нравится мой двоюродный брат?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me cae muy bien mi compañero',
                        translation: 'Мне очень нравится мой коллега',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te cae bien la gente sincera',
                        translation: 'Тебе нравятся искренние люди',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le cae bien su nuevo vecino',
                        translation: 'Ему нравится его новый сосед',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le cae bien su compañera',
                        translation: 'Ей нравится ее коллега',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos cae bien el profesor',
                        translation: 'Нам нравится профессор',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os cae bien todo el mundo',
                        translation: 'Вам нравятся все',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les cae bien su médico',
                        translation: 'Им нравится их врач',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me cae bien',
                        translation: 'Он мне не нравится',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te cae bien?',
                        translation: 'Тебе он нравится?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha caído bien desde el principio',
                        translation: 'Он понравился мне с самого начала',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha caído bien mi familia',
                        translation: 'Тебе понравилась моя семья',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha caído bien el nuevo jefe',
                        translation: 'Ему понравился новый начальник',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha caído bien la chica',
                        translation: 'Ей понравилась девушка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha caído bien tu pareja',
                        translation: 'Нам понравился твой партнер',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha caído bien el guía',
                        translation: 'Им понравился гид',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha caído bien',
                        translation: 'Он мне не понравился',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha caído bien?',
                        translation: 'Он тебе понравился?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me cayó muy bien tu amigo',
                        translation: 'Мне очень понравился твой друг',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te cayó bien el entrevistador',
                        translation: 'Тебе понравился интервьюер',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le cayó bien la doctora',
                        translation: 'Ему понравилась доктор',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le cayó bien su suegra',
                        translation: 'Ей понравилась свекровь',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos cayó bien el mesero',
                        translation: 'Нам понравился официант',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les cayó bien el vendedor',
                        translation: 'Им понравился продавец',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me cayó bien al principio',
                        translation: 'Он мне не понравился сначала',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te cayó bien?',
                        translation: 'Он тебе понравился?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a caer bien seguro',
                        translation: 'Он мне точно понравится',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a caer bien mi hermana',
                        translation: 'Тебе понравится моя сестра',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a caer bien el instructor',
                        translation: 'Ему понравится инструктор',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a caer bien tu madre',
                        translation: 'Ей понравится твоя мама',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a caer bien',
                        translation: 'Он нам понравится',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a caer bien el equipo',
                        translation: 'Им понравится команда',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a caer bien',
                        translation: 'Он мне не понравится',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a caer bien?',
                        translation: 'Он тебе понравится?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está cayendo muy bien',
                        translation: 'Он мне начинает нравиться',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está cayendo bien poco a poco',
                        translation: 'Он тебе постепенно нравится',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está cayendo mejor ahora',
                        translation: 'Сейчас он ему нравится больше',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está cayendo bien últimamente',
                        translation: 'Он ей нравится в последнее время',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está cayendo mejor',
                        translation: 'Он нам нравится больше',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está cayendo bien',
                        translation: 'Он им начинает нравиться',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está cayendo bien',
                        translation: 'Он мне не нравится',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está cayendo bien?',
                        translation: 'Он тебе нравится?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // IMPORTAR
    {
        word: 'importar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['иметь значение', 'быть важным', 'заботиться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me importa mucho tu opinión',
                translation: 'Мне очень важно твое мнение',
            },
            {
                pronoun: 'tú',
                example: 'Te importa la felicidad de otros',
                translation: 'Тебе важно счастье других',
            },
            {
                pronoun: 'él',
                example: 'Le importa su familia ante todo',
                translation: 'Ему важна его семья прежде всего',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos importa el medio ambiente',
                translation: 'Нам важна окружающая среда',
            },
            {
                pronoun: 'ellos',
                example: 'Les importan los resultados',
                translation: 'Им важны результаты',
            },
            {
                pronoun: 'yo',
                example: 'No me importa lo que digan',
                translation: 'Мне не важно, что говорят',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te importa si fumo?',
                translation: 'Тебе не важно, если я покурю?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me importa la salud de todos',
                        translation: 'Мне важно здоровье всех',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te importa hacer bien las cosas',
                        translation: 'Тебе важно делать вещи хорошо',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le importa el futuro del país',
                        translation: 'Ему важно будущее страны',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le importa la educación de sus hijos',
                        translation: 'Ей важно образование ее детей',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos importa la calidad del trabajo',
                        translation: 'Нам важно качество работы',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os importa el bienestar común',
                        translation: 'Вам важно общее благополучие',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les importa el clima laboral',
                        translation: 'Им важен рабочий климат',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me importa el dinero',
                        translation: 'Мне не важны деньги',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te importa el tiempo?',
                        translation: 'Тебе важно время?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha importado siempre tu bienestar',
                        translation: 'Мне всегда было важно твое благополучие',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha importado mucho este proyecto',
                        translation: 'Тебе был очень важен этот проект',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha importado el resultado',
                        translation: 'Ему был важен результат',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha importado la opinión pública',
                        translation: 'Ей было важно общественное мнение',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha importado la decisión',
                        translation: 'Нам было важно решение',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha importado el proceso',
                        translation: 'Им был важен процесс',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha importado nunca',
                        translation: 'Мне это никогда не было важно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha importado?',
                        translation: 'Тебе это было важно?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me importó mucho ese tema',
                        translation: 'Мне была очень важна эта тема',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te importó su reacción',
                        translation: 'Тебе была важна его реакция',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le importó el detalle',
                        translation: 'Ему была важна деталь',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le importó la primera impresión',
                        translation: 'Ей было важно первое впечатление',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos importó el éxito',
                        translation: 'Нам был важен успех',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les importó la victoria',
                        translation: 'Им была важна победа',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me importó en absoluto',
                        translation: 'Мне было совсем не важно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te importó el comentario?',
                        translation: 'Тебе был важен комментарий?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a importar el resultado',
                        translation: 'Мне будет важен результат',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a importar la decisión',
                        translation: 'Тебе будет важно решение',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a importar tu respuesta',
                        translation: 'Ему будет важен твой ответ',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a importar la reunión',
                        translation: 'Ей будет важна встреча',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a importar el cambio',
                        translation: 'Нам будет важно изменение',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a importar el plan',
                        translation: 'Им будет важен план',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a importar',
                        translation: 'Мне это не будет важно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a importar?',
                        translation: 'Тебе это будет важно?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está importando cada vez más',
                        translation: 'Мне это становится все важнее',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está importando demasiado',
                        translation: 'Тебе это становится слишком важным',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está importando ahora',
                        translation: 'Ему это теперь важно',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está importando bastante',
                        translation: 'Ей это довольно важно',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está importando mucho',
                        translation: 'Нам это очень важно',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está importando poco',
                        translation: 'Им это мало важно',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está importando ya',
                        translation: 'Мне это уже не важно',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está importando?',
                        translation: 'Тебе это важно?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // IMPRESIONAR
    {
        word: 'impresionar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: [
                    'впечатлять',
                    'поражать',
                    'производить впечатление',
                ],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me impresionan los edificios antiguos',
                translation: 'Меня впечатляют старинные здания',
            },
            {
                pronoun: 'tú',
                example: 'Te impresiona la tecnología moderna',
                translation: 'Тебя впечатляет современная технология',
            },
            {
                pronoun: 'él',
                example: 'Le impresiona el talento de ella',
                translation: 'Его впечатляет ее талант',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos impresionan los logros científicos',
                translation: 'Нас впечатляют научные достижения',
            },
            {
                pronoun: 'ellos',
                example: 'Les impresiona la naturaleza salvaje',
                translation: 'Их впечатляет дикая природа',
            },
            {
                pronoun: 'yo',
                example: 'No me impresiona fácilmente',
                translation: 'Меня нелегко впечатлить',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te impresiona el arte moderno?',
                translation: 'Тебя впечатляет современное искусство?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me impresiona su conocimiento profundo',
                        translation: 'Меня впечатляют его глубокие знания',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te impresiona la velocidad del progreso',
                        translation: 'Тебя впечатляет скорость прогресса',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le impresiona la arquitectura moderna',
                        translation: 'Его впечатляет современная архитектура',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le impresiona la música clásica',
                        translation: 'Ее впечатляет классическая музыка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos impresiona el trabajo en equipo',
                        translation: 'Нас впечатляет командная работа',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os impresiona la dedicación',
                        translation: 'Вас впечатляет преданность',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les impresiona la creatividad',
                        translation: 'Их впечатляет креативность',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me impresiona eso',
                        translation: 'Меня это не впечатляет',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te impresiona el resultado?',
                        translation: 'Тебя впечатляет результат?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha impresionado tu presentación',
                        translation: 'Меня впечатлила твоя презентация',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha impresionado el espectáculo',
                        translation: 'Тебя впечатлило представление',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha impresionado el discurso',
                        translation: 'Его впечатлила речь',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha impresionado la actuación',
                        translation: 'Ее впечатлило выступление',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha impresionado el lugar',
                        translation: 'Нас впечатлило место',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha impresionado el evento',
                        translation: 'Их впечатлило мероприятие',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha impresionado tanto',
                        translation: 'Меня это не так впечатлило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha impresionado?',
                        translation: 'Тебя это впечатлило?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me impresionó mucho la ciudad',
                        translation: 'Меня очень впечатлил город',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te impresionó el concierto',
                        translation: 'Тебя впечатлил концерт',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le impresionó la obra de teatro',
                        translation: 'Его впечатлила пьеса',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le impresionó la exhibición',
                        translation: 'Ее впечатлила выставка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos impresionó la experiencia',
                        translation: 'Нас впечатлил опыт',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les impresionó el museo',
                        translation: 'Их впечатлил музей',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me impresionó nada',
                        translation: 'Меня ничего не впечатлило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te impresionó el show?',
                        translation: 'Тебя впечатлило шоу?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a impresionar el viaje',
                        translation: 'Меня впечатлит поездка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a impresionar el lugar',
                        translation: 'Тебя впечатлит место',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a impresionar la noticia',
                        translation: 'Его впечатлит новость',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a impresionar el proyecto',
                        translation: 'Ее впечатлит проект',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a impresionar el plan',
                        translation: 'Нас впечатлит план',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a impresionar la propuesta',
                        translation: 'Их впечатлит предложение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a impresionar',
                        translation: 'Меня это не впечатлит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a impresionar?',
                        translation: 'Тебя это впечатлит?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está impresionando su trabajo',
                        translation: 'Меня впечатляет его работа',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está impresionando el desarrollo',
                        translation: 'Тебя впечатляет развитие',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está impresionando el progreso',
                        translation: 'Его впечатляет прогресс',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está impresionando el avance',
                        translation: 'Ее впечатляет продвижение',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está impresionando el cambio',
                        translation: 'Нас впечатляет изменение',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está impresionando la mejora',
                        translation: 'Их впечатляет улучшение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está impresionando',
                        translation: 'Меня это не впечатляет',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está impresionando?',
                        translation: 'Тебя это впечатляет?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // PARECER
    {
        word: 'parecer',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['казаться', 'выглядеть', 'представляться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me parece una buena idea',
                translation: 'Мне кажется, это хорошая идея',
            },
            {
                pronoun: 'tú',
                example: 'Te parece difícil el examen',
                translation: 'Тебе кажется экзамен сложным',
            },
            {
                pronoun: 'él',
                example: 'Le parece interesante el proyecto',
                translation: 'Ему кажется проект интересным',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos parece justo el precio',
                translation: 'Нам кажется цена справедливой',
            },
            {
                pronoun: 'ellos',
                example: 'Les parece extraña la situación',
                translation: 'Им кажется ситуация странной',
            },
            {
                pronoun: 'yo',
                example: 'No me parece correcto',
                translation: 'Мне не кажется это правильным',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te parece bien el plan?',
                translation: 'Тебе кажется план хорошим?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me parece perfecto el lugar',
                        translation: 'Мне кажется место идеальным',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te parece complicada la situación',
                        translation: 'Тебе кажется ситуация сложной',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le parece muy importante el tema',
                        translation: 'Ему кажется тема очень важной',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le parece increíble la historia',
                        translation: 'Ей кажется история невероятной',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos parece razonable la propuesta',
                        translation: 'Нам кажется предложение разумным',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os parece lógico el argumento',
                        translation: 'Вам кажется аргумент логичным',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les parece necesario el cambio',
                        translation: 'Им кажется изменение необходимым',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me parece bien',
                        translation: 'Мне не кажется это хорошим',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te parece suficiente?',
                        translation: 'Тебе кажется достаточным?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha parecido excelente tu trabajo',
                        translation: 'Мне показалась твоя работа отличной',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha parecido interesante el libro',
                        translation: 'Тебе показалась книга интересной',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha parecido útil la información',
                        translation: 'Ему показалась информация полезной',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha parecido hermoso el paisaje',
                        translation: 'Ей показался пейзаж красивым',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha parecido justa la decisión',
                        translation: 'Нам показалось решение справедливым',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha parecido correcto el método',
                        translation: 'Им показался метод правильным',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha parecido mal',
                        translation: 'Мне не показалось плохим',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha parecido difícil?',
                        translation: 'Тебе показалось сложным?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me pareció muy raro el comentario',
                        translation: 'Мне показался комментарий очень странным',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te pareció apropiada la respuesta',
                        translation: 'Тебе показался ответ подходящим',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le pareció convincente el argumento',
                        translation: 'Ему показался аргумент убедительным',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le pareció fantástica la película',
                        translation: 'Ей показался фильм фантастическим',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos pareció adecuado el horario',
                        translation: 'Нам показался график подходящим',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les pareció acertada la elección',
                        translation: 'Им показался выбор удачным',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me pareció interesante',
                        translation: 'Мне не показалось интересным',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te pareció buena la idea?',
                        translation: 'Тебе показалась идея хорошей?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a parecer extraño',
                        translation: 'Мне это покажется странным',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a parecer increíble',
                        translation: 'Тебе это покажется невероятным',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a parecer interesante',
                        translation: 'Ему это покажется интересным',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a parecer perfecto',
                        translation: 'Ей это покажется идеальным',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a parecer lógico',
                        translation: 'Нам это покажется логичным',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a parecer correcto',
                        translation: 'Им это покажется правильным',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a parecer bien',
                        translation: 'Мне это не покажется хорошим',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a parecer justo?',
                        translation: 'Тебе это покажется справедливым?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está pareciendo complicado',
                        translation: 'Мне кажется это сложным',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está pareciendo difícil',
                        translation: 'Тебе кажется это трудным',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está pareciendo confuso',
                        translation: 'Ему кажется это запутанным',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está pareciendo claro',
                        translation: 'Ей кажется это ясным',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está pareciendo obvio',
                        translation: 'Нам кажется это очевидным',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está pareciendo simple',
                        translation: 'Им кажется это простым',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está pareciendo tan malo',
                        translation: 'Мне не кажется это таким плохим',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está pareciendo fácil?',
                        translation: 'Тебе кажется это легким?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // PREOCUPAR
    {
        word: 'preocupar',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['беспокоить', 'тревожить', 'волновать'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me preocupa tu salud',
                translation: 'Меня беспокоит твое здоровье',
            },
            {
                pronoun: 'tú',
                example: 'Te preocupan los exámenes finales',
                translation: 'Тебя беспокоят выпускные экзамены',
            },
            {
                pronoun: 'él',
                example: 'Le preocupa el futuro económico',
                translation: 'Его беспокоит экономическое будущее',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos preocupa el cambio climático',
                translation: 'Нас беспокоит изменение климата',
            },
            {
                pronoun: 'ellos',
                example: 'Les preocupan sus hijos',
                translation: 'Их беспокоят их дети',
            },
            {
                pronoun: 'yo',
                example: 'No me preocupa eso',
                translation: 'Меня это не беспокоит',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te preocupa la situación?',
                translation: 'Тебя беспокоит ситуация?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me preocupa el estado del mundo',
                        translation: 'Меня беспокоит состояние мира',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te preocupa llegar tarde siempre',
                        translation: 'Тебя беспокоит постоянно опаздывать',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le preocupa perder su trabajo',
                        translation: 'Его беспокоит потеря работы',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le preocupa la seguridad familiar',
                        translation: 'Ее беспокоит семейная безопасность',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos preocupa la crisis actual',
                        translation: 'Нас беспокоит текущий кризис',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os preocupa el medio ambiente',
                        translation: 'Вас беспокоит окружающая среда',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les preocupa el rendimiento escolar',
                        translation: 'Их беспокоит школьная успеваемость',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me preocupa nada',
                        translation: 'Меня ничего не беспокоит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te preocupa tu futuro?',
                        translation: 'Тебя беспокоит твое будущее?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha preocupado tu silencio',
                        translation: 'Меня беспокоило твое молчание',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha preocupado el problema',
                        translation: 'Тебя беспокоила проблема',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha preocupado la decisión',
                        translation: 'Его беспокоило решение',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha preocupado la noticia',
                        translation: 'Ее беспокоила новость',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha preocupado la situación',
                        translation: 'Нас беспокоила ситуация',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha preocupado el cambio',
                        translation: 'Их беспокоило изменение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha preocupado tanto',
                        translation: 'Меня это не так беспокоило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha preocupado algo?',
                        translation: 'Тебя что-то беспокоило?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me preocupó mucho tu ausencia',
                        translation: 'Меня очень беспокоило твое отсутствие',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te preocupó el resultado final',
                        translation: 'Тебя беспокоил итоговый результат',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le preocupó la reacción negativa',
                        translation: 'Его беспокоила негативная реакция',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le preocupó el diagnóstico médico',
                        translation: 'Ее беспокоил медицинский диагноз',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos preocupó la falta de información',
                        translation: 'Нас беспокоила нехватка информации',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les preocupó el incidente grave',
                        translation: 'Их беспокоил серьезный инцидент',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me preocupó en absoluto',
                        translation: 'Меня это совсем не беспокоило',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te preocupó la llamada?',
                        translation: 'Тебя беспокоил звонок?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a preocupar el examen',
                        translation: 'Меня будет беспокоить экзамен',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a preocupar la entrevista',
                        translation: 'Тебя будет беспокоить интервью',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a preocupar la reunión',
                        translation: 'Его будет беспокоить встреча',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a preocupar el viaje',
                        translation: 'Ее будет беспокоить поездка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a preocupar la decisión',
                        translation: 'Нас будет беспокоить решение',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a preocupar el cambio',
                        translation: 'Их будет беспокоить изменение',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a preocupar',
                        translation: 'Меня это не будет беспокоить',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a preocupar?',
                        translation: 'Тебя это будет беспокоить?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está preocupando la situación económica',
                        translation: 'Меня беспокоит экономическая ситуация',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está preocupando demasiado',
                        translation: 'Тебя это слишком беспокоит',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está preocupando el plazo',
                        translation: 'Его беспокоит срок',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está preocupando el tema',
                        translation: 'Ее беспокоит тема',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está preocupando el problema',
                        translation: 'Нас беспокоит проблема',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está preocupando el futuro',
                        translation: 'Их беспокоит будущее',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está preocupando',
                        translation: 'Меня это не беспокоит',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está preocupando mucho?',
                        translation: 'Тебя это сильно беспокоит?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },

    // QUEDAR BIEN/MAL
    {
        word: 'quedar bien',
        partOfSpeech: PartOfSpeech.VERB,
        languageCode: 'es',
        translations: [
            {
                languageCode: 'ru',
                translations: ['подходить', 'быть к лицу', 'хорошо смотреться'],
            },
        ],
        examples: [
            {
                pronoun: 'yo',
                example: 'Me queda bien este vestido',
                translation: 'Мне подходит это платье',
            },
            {
                pronoun: 'tú',
                example: 'Te quedan bien los pantalones',
                translation: 'Тебе подходят брюки',
            },
            {
                pronoun: 'él',
                example: 'Le queda muy bien el traje',
                translation: 'Ему очень идет костюм',
            },
            {
                pronoun: 'nosotros',
                example: 'Nos quedan bien estos zapatos',
                translation: 'Нам подходят эти туфли',
            },
            {
                pronoun: 'ellos',
                example: 'Les queda bien el uniforme',
                translation: 'Им подходит униформа',
            },
            {
                pronoun: 'yo',
                example: 'No me queda bien este color',
                translation: 'Мне не подходит этот цвет',
                isNegative: true,
            },
            {
                pronoun: 'tú',
                example: '¿Te queda bien la talla?',
                translation: 'Тебе подходит размер?',
                isQuestion: true,
            },
        ],
        grammaticalExamples: [
            {
                tenseName: 'Presente de indicativo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me queda perfecto el abrigo',
                        translation: 'Мне идеально подходит пальто',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te queda fenomenal ese peinado',
                        translation: 'Тебе отлично идет эта прическа',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le queda estupendo el sombrero',
                        translation: 'Ему прекрасно идет шляпа',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le queda divino ese vestido',
                        translation: 'Ей божественно идет это платье',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos quedan geniales las camisetas',
                        translation: 'Нам отлично подходят футболки',
                    },
                    {
                        pronoun: 'vosotros',
                        example: 'Os quedan bien las gafas',
                        translation: 'Вам идут очки',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les quedan perfectos los zapatos',
                        translation: 'Им идеально подходят туфли',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me queda bien este estilo',
                        translation: 'Мне не идет этот стиль',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te queda bien la chaqueta?',
                        translation: 'Тебе подходит куртка?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito perfecto compuesto',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me ha quedado bien el corte',
                        translation: 'Мне подошла стрижка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te ha quedado bien el cambio',
                        translation: 'Тебе подошло изменение',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le ha quedado bien el look',
                        translation: 'Ему подошел образ',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le ha quedado bien el maquillaje',
                        translation: 'Ей подошел макияж',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos ha quedado bien el conjunto',
                        translation: 'Нам подошел комплект',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les ha quedado bien la elección',
                        translation: 'Им подошел выбор',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me ha quedado bien',
                        translation: 'Мне не подошло',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te ha quedado bien?',
                        translation: 'Тебе подошло?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Pretérito indefinido',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me quedó muy bien el vestido',
                        translation: 'Мне очень подошло платье',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te quedó perfecto el traje',
                        translation: 'Тебе идеально подошел костюм',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le quedó estupenda la camisa',
                        translation: 'Ему отлично подошла рубашка',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le quedó hermoso el vestido',
                        translation: 'Ей прекрасно подошло платье',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos quedó bien el uniforme',
                        translation: 'Нам подошла униформа',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les quedó genial la ropa',
                        translation: 'Им отлично подошла одежда',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me quedó bien la talla',
                        translation: 'Мне не подошел размер',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te quedó bien el pantalón?',
                        translation: 'Тебе подошли брюки?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Futuro próximo (ir a + infinitivo)',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me va a quedar bien la blusa',
                        translation: 'Мне подойдет блузка',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te va a quedar bien el vestido',
                        translation: 'Тебе подойдет платье',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le va a quedar bien el traje',
                        translation: 'Ему подойдет костюм',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le va a quedar bien el color',
                        translation: 'Ей подойдет цвет',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos va a quedar bien el estilo',
                        translation: 'Нам подойдет стиль',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les va a quedar bien la ropa',
                        translation: 'Им подойдет одежда',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me va a quedar bien',
                        translation: 'Мне не подойдет',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te va a quedar bien?',
                        translation: 'Тебе подойдет?',
                        isQuestion: true,
                    },
                ],
            },
            {
                tenseName: 'Presente progresivo',
                examples: [
                    {
                        pronoun: 'yo',
                        example: 'Me está quedando bien el look',
                        translation: 'Мне идет этот образ',
                    },
                    {
                        pronoun: 'tú',
                        example: 'Te está quedando bien el cambio',
                        translation: 'Тебе идет изменение',
                    },
                    {
                        pronoun: 'él',
                        example: 'Le está quedando bien el estilo',
                        translation: 'Ему идет стиль',
                    },
                    {
                        pronoun: 'ella',
                        example: 'Le está quedando bien el corte',
                        translation: 'Ей идет стрижка',
                    },
                    {
                        pronoun: 'nosotros',
                        example: 'Nos está quedando bien todo',
                        translation: 'Нам все идет',
                    },
                    {
                        pronoun: 'ellos',
                        example: 'Les está quedando bien la imagen',
                        translation: 'Им идет образ',
                    },
                    {
                        pronoun: 'yo',
                        example: 'No me está quedando bien',
                        translation: 'Мне не идет',
                        isNegative: true,
                    },
                    {
                        pronoun: 'tú',
                        example: '¿Te está quedando bien?',
                        translation: 'Тебе идет?',
                        isQuestion: true,
                    },
                ],
            },
        ],
    },
];
