// Определяем PartOfSpeech локально, так как импорт из Prisma может не работать во время выполнения seed
export enum PartOfSpeech {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  ADVERB = 'ADVERB',
  PRONOUN = 'PRONOUN',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  INTERJECTION = 'INTERJECTION'
}

export enum SentenceTypeCode {
  AFFIRMATIVE = 'AFFIRMATIVE',
  NEGATIVE = 'NEGATIVE',
  QUESTION = 'QUESTION',
  NEGATIVE_QUESTION = 'NEGATIVE_QUESTION'
}

export interface WordData {
  word: string
  partOfSpeech: PartOfSpeech
  languageCode: string
  translations: {
    languageCode: string
    translations: string[] // до 3 переводов
  }[]
  examples: {
    pronoun: string
    example: string
    translation: string
    sentenceTypeCode?: SentenceTypeCode
    isNegative?: boolean
    isQuestion?: boolean
  }[]
  grammaticalExamples: {
    tenseName: string
    examples: {
      pronoun: string
      example: string
      translation: string
      sentenceTypeCode?: SentenceTypeCode
      isNegative?: boolean
      isQuestion?: boolean
    }[]
  }[]
}

// Данные слов для инициализации
export const WORDS_DATA: WordData[] = [
  {
    word: 'hablar',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['говорить', 'разговаривать', 'общаться']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo hablo español', translation: 'Я говорю по-испански' },
      { pronoun: 'tú', example: 'Tú hablas inglés', translation: 'Ты говоришь по-английски' },
      { pronoun: 'él', example: 'Él habla francés', translation: 'Он говорит по-французски' },
      { pronoun: 'nosotros', example: 'Nosotros hablamos mucho', translation: 'Мы много говорим' },
      { pronoun: 'ellos', example: 'Ellos hablan de política', translation: 'Они говорят о политике' },
      { pronoun: 'yo', example: 'No hablo alemán', translation: 'Я не говорю по-немецки', isNegative: true },
      { pronoun: 'tú', example: '¿Hablas italiano?', translation: 'Ты говоришь по-итальянски?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo hablo', translation: 'Я говорю' },
          { pronoun: 'tú', example: 'Tú hablas', translation: 'Ты говоришь' },
          { pronoun: 'él', example: 'Él habla', translation: 'Он говорит' },
          { pronoun: 'ella', example: 'Ella habla', translation: 'Она говорит' },
          { pronoun: 'nosotros', example: 'Nosotros hablamos', translation: 'Мы говорим' },
          { pronoun: 'vosotros', example: 'Vosotros habláis', translation: 'Вы говорите' },
          { pronoun: 'ellos', example: 'Ellos hablan', translation: 'Они говорят' },
          { pronoun: 'yo', example: 'No hablo', translation: 'Я не говорю', isNegative: true },
          { pronoun: 'tú', example: '¿Hablas?', translation: 'Ты говоришь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito perfecto compuesto',
        examples: [
          { pronoun: 'yo', example: 'Yo he hablado', translation: 'Я говорил' },
          { pronoun: 'tú', example: 'Tú has hablado', translation: 'Ты говорил' },
          { pronoun: 'él', example: 'Él ha hablado', translation: 'Он говорил' },
          { pronoun: 'ella', example: 'Ella ha hablado', translation: 'Она говорила' },
          { pronoun: 'nosotros', example: 'Nosotros hemos hablado', translation: 'Мы говорили' },
          { pronoun: 'ellos', example: 'Ellos han hablado', translation: 'Они говорили' },
          { pronoun: 'yo', example: 'No he hablado', translation: 'Я не говорил', isNegative: true },
          { pronoun: 'tú', example: '¿Has hablado?', translation: 'Ты говорил?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo hablé', translation: 'Я сказал' },
          { pronoun: 'tú', example: 'Tú hablaste', translation: 'Ты сказал' },
          { pronoun: 'él', example: 'Él habló', translation: 'Он сказал' },
          { pronoun: 'ella', example: 'Ella habló', translation: 'Она сказала' },
          { pronoun: 'nosotros', example: 'Nosotros hablamos', translation: 'Мы сказали' },
          { pronoun: 'ellos', example: 'Ellos hablaron', translation: 'Они сказали' },
          { pronoun: 'yo', example: 'No hablé', translation: 'Я не сказал', isNegative: true },
          { pronoun: 'tú', example: '¿Hablaste?', translation: 'Ты сказал?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Futuro próximo (ir a + infinitivo)',
        examples: [
          { pronoun: 'yo', example: 'Yo voy a hablar', translation: 'Я буду говорить' },
          { pronoun: 'tú', example: 'Tú vas a hablar', translation: 'Ты будешь говорить' },
          { pronoun: 'él', example: 'Él va a hablar', translation: 'Он будет говорить' },
          { pronoun: 'ella', example: 'Ella va a hablar', translation: 'Она будет говорить' },
          { pronoun: 'nosotros', example: 'Nosotros vamos a hablar', translation: 'Мы будем говорить' },
          { pronoun: 'ellos', example: 'Ellos van a hablar', translation: 'Они будут говорить' },
          { pronoun: 'yo', example: 'No voy a hablar', translation: 'Я не буду говорить', isNegative: true },
          { pronoun: 'tú', example: '¿Vas a hablar?', translation: 'Ты будешь говорить?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Presente progresivo',
        examples: [
          { pronoun: 'yo', example: 'Yo estoy hablando', translation: 'Я говорю (сейчас)' },
          { pronoun: 'tú', example: 'Tú estás hablando', translation: 'Ты говоришь (сейчас)' },
          { pronoun: 'él', example: 'Él está hablando', translation: 'Он говорит (сейчас)' },
          { pronoun: 'ella', example: 'Ella está hablando', translation: 'Она говорит (сейчас)' },
          { pronoun: 'nosotros', example: 'Nosotros estamos hablando', translation: 'Мы говорим (сейчас)' },
          { pronoun: 'ellos', example: 'Ellos están hablando', translation: 'Они говорят (сейчас)' },
          { pronoun: 'yo', example: 'No estoy hablando', translation: 'Я не говорю (сейчас)', isNegative: true },
          { pronoun: 'tú', example: '¿Estás hablando?', translation: 'Ты говоришь (сейчас)?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'casa',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['дом', 'жилище', 'здание']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi casa es grande', translation: 'Мой дом большой' },
      { pronoun: 'tú', example: 'Tu casa está lejos', translation: 'Твой дом далеко' },
      { pronoun: 'él', example: 'Su casa es bonita', translation: 'Его дом красивый' },
      { pronoun: 'nosotros', example: 'Nuestra casa es nueva', translation: 'Наш дом новый' },
      { pronoun: 'ellos', example: 'Sus casas son pequeñas', translation: 'Их дома маленькие' },
      { pronoun: 'yo', example: 'No tengo casa', translation: 'У меня нет дома', isNegative: true },
      { pronoun: 'tú', example: '¿Dónde está tu casa?', translation: 'Где твой дом?', isQuestion: true }
    ],
    grammaticalExamples: [
      // Для существительных не нужны грамматические времена, но оставлю пустым
    ]
  },
  {
    word: 'dibujar',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['рисовать', 'чертить', 'изображать']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo dibujo bien', translation: 'Я хорошо рисую' },
      { pronoun: 'tú', example: 'Tú dibujas caricaturas', translation: 'Ты рисуешь карикатуры' },
      { pronoun: 'él', example: 'Él dibuja paisajes', translation: 'Он рисует пейзажи' },
      { pronoun: 'nosotros', example: 'Nosotros dibujamos en clase', translation: 'Мы рисуем на уроке' },
      { pronoun: 'ellos', example: 'Ellos dibujan cómics', translation: 'Они рисуют комиксы' },
      { pronoun: 'yo', example: 'No dibujo mal', translation: 'Я не рисую плохо', isNegative: true },
      { pronoun: 'tú', example: '¿Dibujas con lápiz?', translation: 'Ты рисуешь карандашом?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo dibujo', translation: 'Я рисую' },
          { pronoun: 'tú', example: 'Tú dibujas', translation: 'Ты рисуешь' },
          { pronoun: 'él', example: 'Él dibuja', translation: 'Он рисует' },
          { pronoun: 'ella', example: 'Ella dibuja', translation: 'Она рисует' },
          { pronoun: 'nosotros', example: 'Nosotros dibujamos', translation: 'Мы рисуем' },
          { pronoun: 'vosotros', example: 'Vosotros dibujáis', translation: 'Вы рисуете' },
          { pronoun: 'ellos', example: 'Ellos dibujan', translation: 'Они рисуют' },
          { pronoun: 'yo', example: 'No dibujo', translation: 'Я не рисую', isNegative: true },
          { pronoun: 'tú', example: '¿Dibujas?', translation: 'Ты рисуешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo dibujé', translation: 'Я нарисовал' },
          { pronoun: 'tú', example: 'Tú dibujaste', translation: 'Ты нарисовал' },
          { pronoun: 'él', example: 'Él dibujó', translation: 'Он нарисовал' },
          { pronoun: 'ella', example: 'Ella dibujó', translation: 'Она нарисовала' },
          { pronoun: 'nosotros', example: 'Nosotros dibujamos', translation: 'Мы нарисовали' },
          { pronoun: 'ellos', example: 'Ellos dibujaron', translation: 'Они нарисовали' },
          { pronoun: 'yo', example: 'No dibujé', translation: 'Я не нарисовал', isNegative: true },
          { pronoun: 'tú', example: '¿Dibujaste?', translation: 'Ты нарисовал?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'teñido',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['окрашенный', 'покрашенный', 'подкрашенный']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi pelo está teñido', translation: 'Мои волосы окрашены' },
      { pronoun: 'tú', example: 'Tu cabello teñido es bonito', translation: 'Твои окрашенные волосы красивые' },
      { pronoun: 'él', example: 'Su barba está teñida', translation: 'Его борода окрашена' },
      { pronoun: 'nosotros', example: 'Nuestros muebles están teñidos', translation: 'Наша мебель окрашена' },
      { pronoun: 'ellos', example: 'Sus paredes están teñidas', translation: 'Их стены окрашены' },
      { pronoun: 'yo', example: 'Mi pelo no está teñido', translation: 'Мои волосы не окрашены', isNegative: true },
      { pronoun: 'tú', example: '¿Está teñido tu pelo?', translation: 'Твои волосы окрашены?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'canoso',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['седой', 'с проседью', 'поседевший']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi abuelo es canoso', translation: 'Мой дедушка седой' },
      { pronoun: 'tú', example: 'Tu pelo está canoso', translation: 'Твои волосы седые' },
      { pronoun: 'él', example: 'Su barba es canosa', translation: 'Его борода седая' },
      { pronoun: 'nosotros', example: 'Nuestros padres están canosos', translation: 'Наши родители седые' },
      { pronoun: 'ellos', example: 'Sus cabezas son canosas', translation: 'Их головы седые' },
      { pronoun: 'yo', example: 'No soy canoso aún', translation: 'Я еще не седой', isNegative: true },
      { pronoun: 'tú', example: '¿Eres canoso?', translation: 'Ты седой?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'suelto',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['свободный', 'растрепанный', 'распущенный']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi pelo está suelto', translation: 'Мои волосы распущены' },
      { pronoun: 'tú', example: 'Tu cabello suelto es hermoso', translation: 'Твои распущенные волосы прекрасны' },
      { pronoun: 'él', example: 'Su chaqueta está suelta', translation: 'Его куртка свободная' },
      { pronoun: 'nosotros', example: 'Nuestros perros están sueltos', translation: 'Наши собаки на свободе' },
      { pronoun: 'ellos', example: 'Sus cabellos están sueltos', translation: 'Их волосы распущены' },
      { pronoun: 'yo', example: 'Mi pelo no está suelto', translation: 'Мои волосы не распущены', isNegative: true },
      { pronoun: 'tú', example: '¿Está suelto tu pelo?', translation: 'Твои волосы распущены?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'recogido',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['собранный', 'убранный', 'прибранный']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi pelo está recogido', translation: 'Мои волосы собраны' },
      { pronoun: 'tú', example: 'Tu cabello recogido te queda bien', translation: 'Тебе идет собранные волосы' },
      { pronoun: 'él', example: 'Su habitación está recogida', translation: 'Его комната убрана' },
      { pronoun: 'nosotros', example: 'Nuestras cosas están recogidas', translation: 'Наши вещи собраны' },
      { pronoun: 'ellos', example: 'Sus libros están recogidos', translation: 'Их книги собраны' },
      { pronoun: 'yo', example: 'Mi pelo no está recogido', translation: 'Мои волосы не собраны', isNegative: true },
      { pronoun: 'tú', example: '¿Está recogido tu pelo?', translation: 'Твои волосы собраны?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'liso',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['гладкий', 'прямой', 'ровный']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Mi pelo es liso', translation: 'Мои волосы прямые' },
      { pronoun: 'tú', example: 'Tu piel es lisa', translation: 'Твоя кожа гладкая' },
      { pronoun: 'él', example: 'Su camino es liso', translation: 'Его путь ровный' },
      { pronoun: 'nosotros', example: 'Nuestros zapatos son lisos', translation: 'Наши ботинки гладкие' },
      { pronoun: 'ellos', example: 'Sus superficies son lisas', translation: 'Их поверхности гладкие' },
      { pronoun: 'yo', example: 'Mi pelo no es liso', translation: 'Мои волосы не прямые', isNegative: true },
      { pronoun: 'tú', example: '¿Es liso tu pelo?', translation: 'Твои волосы прямые?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'volver',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['возвращаться', 'вернуться', 'вернуть']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo vuelvo a casa', translation: 'Я возвращаюсь домой' },
      { pronoun: 'tú', example: 'Tú vuelves pronto', translation: 'Ты возвращаешься скоро' },
      { pronoun: 'él', example: 'Él vuelve del trabajo', translation: 'Он возвращается с работы' },
      { pronoun: 'nosotros', example: 'Nosotros volvemos juntos', translation: 'Мы возвращаемся вместе' },
      { pronoun: 'ellos', example: 'Ellos vuelven tarde', translation: 'Они возвращаются поздно' },
      { pronoun: 'yo', example: 'No vuelvo aún', translation: 'Я еще не возвращаюсь', isNegative: true },
      { pronoun: 'tú', example: '¿Vuelves mañana?', translation: 'Ты возвращаешься завтра?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo vuelvo', translation: 'Я возвращаюсь' },
          { pronoun: 'tú', example: 'Tú vuelves', translation: 'Ты возвращаешься' },
          { pronoun: 'él', example: 'Él vuelve', translation: 'Он возвращается' },
          { pronoun: 'ella', example: 'Ella vuelve', translation: 'Она возвращается' },
          { pronoun: 'nosotros', example: 'Nosotros volvemos', translation: 'Мы возвращаемся' },
          { pronoun: 'vosotros', example: 'Vosotros volvéis', translation: 'Вы возвращаетесь' },
          { pronoun: 'ellos', example: 'Ellos vuelven', translation: 'Они возвращаются' },
          { pronoun: 'yo', example: 'No vuelvo', translation: 'Я не возвращаюсь', isNegative: true },
          { pronoun: 'tú', example: '¿Vuelves?', translation: 'Ты возвращаешься?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo volví', translation: 'Я вернулся' },
          { pronoun: 'tú', example: 'Tú volviste', translation: 'Ты вернулся' },
          { pronoun: 'él', example: 'Él volvió', translation: 'Он вернулся' },
          { pronoun: 'ella', example: 'Ella volvió', translation: 'Она вернулась' },
          { pronoun: 'nosotros', example: 'Nosotros volvimos', translation: 'Мы вернулись' },
          { pronoun: 'ellos', example: 'Ellos volvieron', translation: 'Они вернулись' },
          { pronoun: 'yo', example: 'No volví', translation: 'Я не вернулся', isNegative: true },
          { pronoun: 'tú', example: '¿Volviste?', translation: 'Ты вернулся?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'recordar',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['помнить', 'вспоминать', 'напоминать']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo recuerdo tu nombre', translation: 'Я помню твое имя' },
      { pronoun: 'tú', example: 'Tú recuerdas los detalles', translation: 'Ты помнишь детали' },
      { pronoun: 'él', example: 'Él recuerda el pasado', translation: 'Он вспоминает прошлое' },
      { pronoun: 'nosotros', example: 'Nosotros recordamos juntos', translation: 'Мы вспоминаем вместе' },
      { pronoun: 'ellos', example: 'Ellos recuerdan la fiesta', translation: 'Они помнят вечеринку' },
      { pronoun: 'yo', example: 'No recuerdo nada', translation: 'Я ничего не помню', isNegative: true },
      { pronoun: 'tú', example: '¿Recuerdas mi número?', translation: 'Ты помнишь мой номер?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo recuerdo', translation: 'Я помню' },
          { pronoun: 'tú', example: 'Tú recuerdas', translation: 'Ты помнишь' },
          { pronoun: 'él', example: 'Él recuerda', translation: 'Он помнит' },
          { pronoun: 'ella', example: 'Ella recuerda', translation: 'Она помнит' },
          { pronoun: 'nosotros', example: 'Nosotros recordamos', translation: 'Мы помним' },
          { pronoun: 'vosotros', example: 'Vosotros recordáis', translation: 'Вы помните' },
          { pronoun: 'ellos', example: 'Ellos recuerdan', translation: 'Они помнят' },
          { pronoun: 'yo', example: 'No recuerdo', translation: 'Я не помню', isNegative: true },
          { pronoun: 'tú', example: '¿Recuerdas?', translation: 'Ты помнишь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo recordé', translation: 'Я вспомнил' },
          { pronoun: 'tú', example: 'Tú recordaste', translation: 'Ты вспомнил' },
          { pronoun: 'él', example: 'Él recordó', translation: 'Он вспомнил' },
          { pronoun: 'ella', example: 'Ella recordó', translation: 'Она вспомнила' },
          { pronoun: 'nosotros', example: 'Nosotros recordamos', translation: 'Мы вспомнили' },
          { pronoun: 'ellos', example: 'Ellos recordaron', translation: 'Они вспомнили' },
          { pronoun: 'yo', example: 'No recordé', translation: 'Я не вспомнил', isNegative: true },
          { pronoun: 'tú', example: '¿Recordaste?', translation: 'Ты вспомнил?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'deber',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['быть должным', 'долженствовать', 'обязан']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo debo estudiar', translation: 'Я должен учиться' },
      { pronoun: 'tú', example: 'Tú debes trabajar', translation: 'Ты должен работать' },
      { pronoun: 'él', example: 'Él debe pagar', translation: 'Он должен платить' },
      { pronoun: 'nosotros', example: 'Nosotros debemos ayudar', translation: 'Мы должны помогать' },
      { pronoun: 'ellos', example: 'Ellos deben esperar', translation: 'Они должны ждать' },
      { pronoun: 'yo', example: 'No debo fumar', translation: 'Я не должен курить', isNegative: true },
      { pronoun: 'tú', example: '¿Debes irte?', translation: 'Ты должен уходить?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo debo', translation: 'Я должен' },
          { pronoun: 'tú', example: 'Tú debes', translation: 'Ты должен' },
          { pronoun: 'él', example: 'Él debe', translation: 'Он должен' },
          { pronoun: 'ella', example: 'Ella debe', translation: 'Она должна' },
          { pronoun: 'nosotros', example: 'Nosotros debemos', translation: 'Мы должны' },
          { pronoun: 'vosotros', example: 'Vosotros debéis', translation: 'Вы должны' },
          { pronoun: 'ellos', example: 'Ellos deben', translation: 'Они должны' },
          { pronoun: 'yo', example: 'No debo', translation: 'Я не должен', isNegative: true },
          { pronoun: 'tú', example: '¿Debes?', translation: 'Ты должен?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo debí', translation: 'Я должен был' },
          { pronoun: 'tú', example: 'Tú debiste', translation: 'Ты должен был' },
          { pronoun: 'él', example: 'Él debió', translation: 'Он должен был' },
          { pronoun: 'ella', example: 'Ella debió', translation: 'Она должна была' },
          { pronoun: 'nosotros', example: 'Nosotros debimos', translation: 'Мы должны были' },
          { pronoun: 'ellos', example: 'Ellos debieron', translation: 'Они должны были' },
          { pronoun: 'yo', example: 'No debí', translation: 'Я не должен был', isNegative: true },
          { pronoun: 'tú', example: '¿Debiste?', translation: 'Ты должен был?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'pecas',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['веснушки', 'конопушки', 'крапинки']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo tengo pecas', translation: 'У меня есть веснушки' },
      { pronoun: 'tú', example: 'Tú tienes muchas pecas', translation: 'У тебя много веснушек' },
      { pronoun: 'él', example: 'Él tiene pecas en la cara', translation: 'У него веснушки на лице' },
      { pronoun: 'ella', example: 'Ella tiene pecas bonitas', translation: 'У нее красивые веснушки' },
      { pronoun: 'nosotros', example: 'Nosotros tenemos pecas', translation: 'У нас есть веснушки' },
      { pronoun: 'ellos', example: 'Ellos tienen pecas', translation: 'У них есть веснушки' },
      { pronoun: 'yo', example: 'No tengo pecas', translation: 'У меня нет веснушек', isNegative: true },
      { pronoun: 'tú', example: '¿Tienes pecas?', translation: 'У тебя есть веснушки?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'lleva coleta',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['носит хвост', 'с хвостиком', 'с конским хвостом']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo llevo coleta', translation: 'Я ношу хвост' },
      { pronoun: 'tú', example: 'Tú llevas coleta hoy', translation: 'Ты носишь хвост сегодня' },
      { pronoun: 'él', example: 'Él lleva coleta larga', translation: 'Он носит длинный хвост' },
      { pronoun: 'ella', example: 'Ella lleva coleta alta', translation: 'Она носит высокий хвост' },
      { pronoun: 'nosotros', example: 'Nosotros llevamos coleta', translation: 'Мы носим хвост' },
      { pronoun: 'ellos', example: 'Ellos llevan coleta', translation: 'Они носят хвост' },
      { pronoun: 'yo', example: 'No llevo coleta', translation: 'Я не ношу хвост', isNegative: true },
      { pronoun: 'tú', example: '¿Llevas coleta?', translation: 'Ты носишь хвост?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo llevo coleta', translation: 'Я ношу хвост' },
          { pronoun: 'tú', example: 'Tú llevas coleta', translation: 'Ты носишь хвост' },
          { pronoun: 'él', example: 'Él lleva coleta', translation: 'Он носит хвост' },
          { pronoun: 'ella', example: 'Ella lleva coleta', translation: 'Она носит хвост' },
          { pronoun: 'nosotros', example: 'Nosotros llevamos coleta', translation: 'Мы носим хвост' },
          { pronoun: 'vosotros', example: 'Vosotros lleváis coleta', translation: 'Вы носите хвост' },
          { pronoun: 'ellos', example: 'Ellos llevan coleta', translation: 'Они носят хвост' },
          { pronoun: 'yo', example: 'No llevo coleta', translation: 'Я не ношу хвост', isNegative: true },
          { pronoun: 'tú', example: '¿Llevas coleta?', translation: 'Ты носишь хвост?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo llevé coleta', translation: 'Я носил хвост' },
          { pronoun: 'tú', example: 'Tú llevaste coleta', translation: 'Ты носил хвост' },
          { pronoun: 'él', example: 'Él llevó coleta', translation: 'Он носил хвост' },
          { pronoun: 'ella', example: 'Ella llevó coleta', translation: 'Она носила хвост' },
          { pronoun: 'nosotros', example: 'Nosotros llevamos coleta', translation: 'Мы носили хвост' },
          { pronoun: 'ellos', example: 'Ellos llevaron coleta', translation: 'Они носили хвост' },
          { pronoun: 'yo', example: 'No llevé coleta', translation: 'Я не носил хвост', isNegative: true },
          { pronoun: 'tú', example: '¿Llevaste coleta?', translation: 'Ты носил хвост?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'trenzas',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['косы', 'косички', 'плетенки']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo tengo trenzas', translation: 'У меня косы' },
      { pronoun: 'tú', example: 'Tú llevas trenzas bonitas', translation: 'У тебя красивые косы' },
      { pronoun: 'ella', example: 'Ella tiene dos trenzas', translation: 'У нее две косы' },
      { pronoun: 'él', example: 'Él hace trenzas', translation: 'Он плетет косы' },
      { pronoun: 'nosotros', example: 'Nosotros hacemos trenzas', translation: 'Мы плетем косы' },
      { pronoun: 'ellos', example: 'Ellos llevan trenzas', translation: 'Они носят косы' },
      { pronoun: 'yo', example: 'No tengo trenzas', translation: 'У меня нет кос', isNegative: true },
      { pronoun: 'tú', example: '¿Tienes trenzas?', translation: 'У тебя есть косы?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'camiseta',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['футболка', 'майка', 'тенниска']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo llevo una camiseta blanca', translation: 'Я ношу белую футболку' },
      { pronoun: 'tú', example: 'Tú tienes una camiseta nueva', translation: 'У тебя новая футболка' },
      { pronoun: 'él', example: 'Él compra una camiseta', translation: 'Он покупает футболку' },
      { pronoun: 'ella', example: 'Ella lleva camiseta azul', translation: 'Она носит синюю футболку' },
      { pronoun: 'nosotros', example: 'Nosotros llevamos camisetas rojas', translation: 'Мы носим красные футболки' },
      { pronoun: 'ellos', example: 'Ellos tienen camisetas', translation: 'У них есть футболки' },
      { pronoun: 'yo', example: 'No llevo camiseta', translation: 'Я не ношу футболку', isNegative: true },
      { pronoun: 'tú', example: '¿Tienes una camiseta limpia?', translation: 'У тебя есть чистая футболка?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'bigote',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['усы', 'усики', 'усищи']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo tengo bigote', translation: 'У меня есть усы' },
      { pronoun: 'tú', example: 'Tú llevas bigote largo', translation: 'Ты носишь длинные усы' },
      { pronoun: 'él', example: 'Él se afeita el bigote', translation: 'Он бреет усы' },
      { pronoun: 'ella', example: 'Ella pinta bigotes', translation: 'Она рисует усы' },
      { pronoun: 'nosotros', example: 'Nosotros tenemos bigote', translation: 'У нас есть усы' },
      { pronoun: 'ellos', example: 'Ellos llevan bigote', translation: 'Они носят усы' },
      { pronoun: 'yo', example: 'No tengo bigote', translation: 'У меня нет усов', isNegative: true },
      { pronoun: 'tú', example: '¿Tienes bigote?', translation: 'У тебя есть усы?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'perilla',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['козлиная бородка', 'эспаньолка', 'бородка']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo tengo perilla', translation: 'У меня есть бородка' },
      { pronoun: 'tú', example: 'Tú llevas perilla elegante', translation: 'Ты носишь элегантную бородку' },
      { pronoun: 'él', example: 'Él se deja crecer la perilla', translation: 'Он отращивает бородку' },
      { pronoun: 'ella', example: 'Ella dibuja una perilla', translation: 'Она рисует бородку' },
      { pronoun: 'nosotros', example: 'Nosotros tenemos perilla', translation: 'У нас есть бородка' },
      { pronoun: 'ellos', example: 'Ellos llevan perilla', translation: 'Они носят бородку' },
      { pronoun: 'yo', example: 'No tengo perilla', translation: 'У меня нет бородки', isNegative: true },
      { pronoun: 'tú', example: '¿Tienes perilla?', translation: 'У тебя есть бородка?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'rubio',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['светлый', 'белокурый', 'блондин']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo soy rubio', translation: 'Я блондин' },
      { pronoun: 'tú', example: 'Tú tienes pelo rubio', translation: 'У тебя светлые волосы' },
      { pronoun: 'él', example: 'Él es rubio natural', translation: 'Он натуральный блондин' },
      { pronoun: 'ella', example: 'Ella es rubia hermosa', translation: 'Она красивая блондинка' },
      { pronoun: 'nosotros', example: 'Nosotros somos rubios', translation: 'Мы блондины' },
      { pronoun: 'ellos', example: 'Ellos son rubios', translation: 'Они блондины' },
      { pronoun: 'yo', example: 'No soy rubio', translation: 'Я не блондин', isNegative: true },
      { pronoun: 'tú', example: '¿Eres rubio?', translation: 'Ты блондин?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'delgado',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['худой', 'стройный', 'тонкий']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo soy delgado', translation: 'Я худой' },
      { pronoun: 'tú', example: 'Tú eres muy delgado', translation: 'Ты очень худой' },
      { pronoun: 'él', example: 'Él es delgado y alto', translation: 'Он худой и высокий' },
      { pronoun: 'ella', example: 'Ella es delgada', translation: 'Она стройная' },
      { pronoun: 'nosotros', example: 'Nosotros somos delgados', translation: 'Мы худые' },
      { pronoun: 'ellos', example: 'Ellos son delgados', translation: 'Они худые' },
      { pronoun: 'yo', example: 'No soy delgado', translation: 'Я не худой', isNegative: true },
      { pronoun: 'tú', example: '¿Eres delgado?', translation: 'Ты худой?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'me equivoco',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['я ошибаюсь', 'я неправ', 'я допускаю ошибку']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Me equivoco a menudo', translation: 'Я часто ошибаюсь' },
      { pronoun: 'tú', example: 'Te equivocas en eso', translation: 'Ты ошибаешься в этом' },
      { pronoun: 'él', example: 'Se equivoca mucho', translation: 'Он много ошибается' },
      { pronoun: 'ella', example: 'Se equivoca poco', translation: 'Она мало ошибается' },
      { pronoun: 'nosotros', example: 'Nos equivocamos juntos', translation: 'Мы ошибаемся вместе' },
      { pronoun: 'ellos', example: 'Se equivocan siempre', translation: 'Они всегда ошибаются' },
      { pronoun: 'yo', example: 'No me equivoco nunca', translation: 'Я никогда не ошибаюсь', isNegative: true },
      { pronoun: 'tú', example: '¿Te equivocas?', translation: 'Ты ошибаешься?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Me equivoco', translation: 'Я ошибаюсь' },
          { pronoun: 'tú', example: 'Te equivocas', translation: 'Ты ошибаешься' },
          { pronoun: 'él', example: 'Se equivoca', translation: 'Он ошибается' },
          { pronoun: 'ella', example: 'Se equivoca', translation: 'Она ошибается' },
          { pronoun: 'nosotros', example: 'Nos equivocamos', translation: 'Мы ошибаемся' },
          { pronoun: 'vosotros', example: 'Os equivocáis', translation: 'Вы ошибаетесь' },
          { pronoun: 'ellos', example: 'Se equivocan', translation: 'Они ошибаются' },
          { pronoun: 'yo', example: 'No me equivoco', translation: 'Я не ошибаюсь', isNegative: true },
          { pronoun: 'tú', example: '¿Te equivocas?', translation: 'Ты ошибаешься?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Me equiroqué', translation: 'Я ошибся' },
          { pronoun: 'tú', example: 'Te equivocaste', translation: 'Ты ошибся' },
          { pronoun: 'él', example: 'Se equivocó', translation: 'Он ошибся' },
          { pronoun: 'ella', example: 'Se equivocó', translation: 'Она ошиблась' },
          { pronoun: 'nosotros', example: 'Nos equivocamos', translation: 'Мы ошиблись' },
          { pronoun: 'ellos', example: 'Se equivocaron', translation: 'Они ошиблись' },
          { pronoun: 'yo', example: 'No me equiroqué', translation: 'Я не ошибся', isNegative: true },
          { pronoun: 'tú', example: '¿Te equivocaste?', translation: 'Ты ошибся?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'ganar',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['выигрывать', 'зарабатывать', 'побеждать']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo gano dinero', translation: 'Я зарабатываю деньги' },
      { pronoun: 'tú', example: 'Tú ganas partidos', translation: 'Ты выигрываешь матчи' },
      { pronoun: 'él', example: 'Él gana premios', translation: 'Он выигрывает призы' },
      { pronoun: 'ella', example: 'Ella gana concursos', translation: 'Она выигрывает конкурсы' },
      { pronoun: 'nosotros', example: 'Nosotros ganamos juntos', translation: 'Мы выигрываем вместе' },
      { pronoun: 'ellos', example: 'Ellos ganan mucho', translation: 'Они много зарабатывают' },
      { pronoun: 'yo', example: 'No gano suficiente', translation: 'Я не зарабатываю достаточно', isNegative: true },
      { pronoun: 'tú', example: '¿Ganas bien?', translation: 'Ты хорошо зарабатываешь?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo gano', translation: 'Я выигрываю' },
          { pronoun: 'tú', example: 'Tú ganas', translation: 'Ты выигрываешь' },
          { pronoun: 'él', example: 'Él gana', translation: 'Он выигрывает' },
          { pronoun: 'ella', example: 'Ella gana', translation: 'Она выигрывает' },
          { pronoun: 'nosotros', example: 'Nosotros ganamos', translation: 'Мы выигрываем' },
          { pronoun: 'vosotros', example: 'Vosotros ganáis', translation: 'Вы выигрываете' },
          { pronoun: 'ellos', example: 'Ellos ganan', translation: 'Они выигрывают' },
          { pronoun: 'yo', example: 'No gano', translation: 'Я не выигрываю', isNegative: true },
          { pronoun: 'tú', example: '¿Ganas?', translation: 'Ты выигрываешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo gané', translation: 'Я выиграл' },
          { pronoun: 'tú', example: 'Tú ganaste', translation: 'Ты выиграл' },
          { pronoun: 'él', example: 'Él ganó', translation: 'Он выиграл' },
          { pronoun: 'ella', example: 'Ella ganó', translation: 'Она выиграла' },
          { pronoun: 'nosotros', example: 'Nosotros ganamos', translation: 'Мы выиграли' },
          { pronoun: 'ellos', example: 'Ellos ganaron', translation: 'Они выиграли' },
          { pronoun: 'yo', example: 'No gané', translation: 'Я не выиграл', isNegative: true },
          { pronoun: 'tú', example: '¿Ganaste?', translation: 'Ты выиграл?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'el barrio',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['район', 'квартал', 'округ']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo vivo en el barrio antiguo', translation: 'Я живу в старом районе' },
      { pronoun: 'tú', example: 'Tú conoces mi barrio', translation: 'Ты знаешь мой район' },
      { pronoun: 'él', example: 'Él nació en este barrio', translation: 'Он родился в этом районе' },
      { pronoun: 'ella', example: 'Ella ama su barrio', translation: 'Она любит свой район' },
      { pronoun: 'nosotros', example: 'Nosotros paseamos por el barrio', translation: 'Мы гуляем по району' },
      { pronoun: 'ellos', example: 'Ellos juegan en el barrio', translation: 'Они играют в районе' },
      { pronoun: 'yo', example: 'No conozco este barrio', translation: 'Я не знаю этот район', isNegative: true },
      { pronoun: 'tú', example: '¿De qué barrio eres?', translation: 'Из какого ты района?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'el pueblo',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['народ', 'деревня', 'городок']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo vivo en el pueblo pequeño', translation: 'Я живу в маленьком городке' },
      { pronoun: 'tú', example: 'Tú vienes del pueblo', translation: 'Ты приехал из деревни' },
      { pronoun: 'él', example: 'Él ama su pueblo', translation: 'Он любит свой народ' },
      { pronoun: 'ella', example: 'Ella nació en este pueblo', translation: 'Она родилась в этом городке' },
      { pronoun: 'nosotros', example: 'Nosotros somos del pueblo', translation: 'Мы из деревни' },
      { pronoun: 'ellos', example: 'Ellos representan al pueblo', translation: 'Они представляют народ' },
      { pronoun: 'yo', example: 'No conozco este pueblo', translation: 'Я не знаю этот городок', isNegative: true },
      { pronoun: 'tú', example: '¿De qué pueblo eres?', translation: 'Из какого ты городка?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'invierno',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['зима', 'зимний сезон']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo odio el invierno frío', translation: 'Я ненавижу холодную зиму' },
      { pronoun: 'tú', example: 'Tú esquías en invierno', translation: 'Ты катаешься на лыжах зимой' },
      { pronoun: 'él', example: 'Él viaja en invierno', translation: 'Он путешествует зимой' },
      { pronoun: 'ella', example: 'Ella ama el invierno', translation: 'Она любит зиму' },
      { pronoun: 'nosotros', example: 'Nosotros esperamos el invierno', translation: 'Мы ждем зиму' },
      { pronoun: 'ellos', example: 'Ellos pasan el invierno aquí', translation: 'Они проводят зиму здесь' },
      { pronoun: 'yo', example: 'No me gusta el invierno', translation: 'Мне не нравится зима', isNegative: true },
      { pronoun: 'tú', example: '¿Qué haces en invierno?', translation: 'Что ты делаешь зимой?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'verano',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['лето', 'летний сезон']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo amo el verano caluroso', translation: 'Я люблю жаркое лето' },
      { pronoun: 'tú', example: 'Tú nadas en verano', translation: 'Ты плаваешь летом' },
      { pronoun: 'él', example: 'Él viaja en verano', translation: 'Он путешествует летом' },
      { pronoun: 'ella', example: 'Ella descansa en verano', translation: 'Она отдыхает летом' },
      { pronoun: 'nosotros', example: 'Nosotros esperamos el verano', translation: 'Мы ждем лета' },
      { pronoun: 'ellos', example: 'Ellos pasan el verano en la playa', translation: 'Они проводят лето на пляже' },
      { pronoun: 'yo', example: 'No me gusta el verano húmedo', translation: 'Мне не нравится влажное лето', isNegative: true },
      { pronoun: 'tú', example: '¿Qué haces en verano?', translation: 'Что ты делаешь летом?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'doler',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['болеть', 'причинять боль', 'ныть']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Me duele la cabeza', translation: 'У меня болит голова' },
      { pronoun: 'tú', example: 'Te duele el estómago', translation: 'У тебя болит живот' },
      { pronoun: 'él', example: 'Le duele la pierna', translation: 'У него болит нога' },
      { pronoun: 'ella', example: 'Le duele el brazo', translation: 'У нее болит рука' },
      { pronoun: 'nosotros', example: 'Nos duelen los pies', translation: 'У нас болят ноги' },
      { pronoun: 'ellos', example: 'Les duele la espalda', translation: 'У них болит спина' },
      { pronoun: 'yo', example: 'No me duele nada', translation: 'У меня ничего не болит', isNegative: true },
      { pronoun: 'tú', example: '¿Te duele algo?', translation: 'У тебя что-то болит?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Me duele', translation: 'Мне больно' },
          { pronoun: 'tú', example: 'Te duele', translation: 'Тебе больно' },
          { pronoun: 'él', example: 'Le duele', translation: 'Ему больно' },
          { pronoun: 'ella', example: 'Le duele', translation: 'Ей больно' },
          { pronoun: 'nosotros', example: 'Nos duele', translation: 'Нам больно' },
          { pronoun: 'vosotros', example: 'Os duele', translation: 'Вам больно' },
          { pronoun: 'ellos', example: 'Les duele', translation: 'Им больно' },
          { pronoun: 'yo', example: 'No me duele', translation: 'Мне не больно', isNegative: true },
          { pronoun: 'tú', example: '¿Te duele?', translation: 'Тебе больно?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Me dolió', translation: 'Мне заболело' },
          { pronoun: 'tú', example: 'Te dolió', translation: 'Тебе заболело' },
          { pronoun: 'él', example: 'Le dolió', translation: 'Ему заболело' },
          { pronoun: 'ella', example: 'Le dolió', translation: 'Ей заболело' },
          { pronoun: 'nosotros', example: 'Nos dolió', translation: 'Нам заболело' },
          { pronoun: 'ellos', example: 'Les dolió', translation: 'Им заболело' },
          { pronoun: 'yo', example: 'No me dolió', translation: 'Мне не заболело', isNegative: true },
          { pronoun: 'tú', example: '¿Te dolió?', translation: 'Тебе заболело?', isQuestion: true }
        ]
      }
    ]
  },
  {
    word: 'aceite',
    partOfSpeech: PartOfSpeech.NOUN,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['масло', 'нефть', 'масляная краска']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo uso aceite de oliva', translation: 'Я использую оливковое масло' },
      { pronoun: 'tú', example: 'Tú cocinas con aceite', translation: 'Ты готовишь на масле' },
      { pronoun: 'él', example: 'Él vende aceite', translation: 'Он продает масло' },
      { pronoun: 'ella', example: 'Ella compra aceite', translation: 'Она покупает масло' },
      { pronoun: 'nosotros', example: 'Nosotros necesitamos aceite', translation: 'Нам нужно масло' },
      { pronoun: 'ellos', example: 'Ellos producen aceite', translation: 'Они производят масло' },
      { pronoun: 'yo', example: 'No tengo aceite', translation: 'У меня нет масла', isNegative: true },
      { pronoun: 'tú', example: '¿Quieres aceite?', translation: 'Хочешь масло?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'entendido',
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['понятно', 'договорились', 'ясно']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo estoy entendido', translation: 'Я понял' },
      { pronoun: 'tú', example: 'Tú estás entendido', translation: 'Ты понял' },
      { pronoun: 'él', example: 'Él está entendido', translation: 'Он понял' },
      { pronoun: 'ella', example: 'Ella está entendida', translation: 'Она поняла' },
      { pronoun: 'nosotros', example: 'Nosotros estamos entendidos', translation: 'Мы поняли' },
      { pronoun: 'ellos', example: 'Ellos están entendidos', translation: 'Они поняли' },
      { pronoun: 'yo', example: 'No estoy entendido', translation: 'Я не понял', isNegative: true },
      { pronoun: 'tú', example: '¿Estás entendido?', translation: 'Ты понял?', isQuestion: true }
    ],
    grammaticalExamples: []
  },
  {
    word: 'pillar',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'es',
    translations: [
      {
        languageCode: 'ru',
        translations: ['поймать', 'схватить', 'понять']
      }
    ],
    examples: [
      { pronoun: 'yo', example: 'Yo pillo el autobús', translation: 'Я ловлю автобус' },
      { pronoun: 'tú', example: 'Tú pillas el sentido', translation: 'Ты понимаешь смысл' },
      { pronoun: 'él', example: 'Él pilla resfriados', translation: 'Он простужается' },
      { pronoun: 'ella', example: 'Ella pilla flores', translation: 'Она рвет цветы' },
      { pronoun: 'nosotros', example: 'Nosotros pillamos el tren', translation: 'Мы ловим поезд' },
      { pronoun: 'ellos', example: 'Ellos pillan el chiste', translation: 'Они понимают шутку' },
      { pronoun: 'yo', example: 'No pillo nada', translation: 'Я ничего не понимаю', isNegative: true },
      { pronoun: 'tú', example: '¿Pillaste el tren?', translation: 'Ты поймал поезд?', isQuestion: true }
    ],
    grammaticalExamples: [
      {
        tenseName: 'Presente de indicativo',
        examples: [
          { pronoun: 'yo', example: 'Yo pillo', translation: 'Я ловлю' },
          { pronoun: 'tú', example: 'Tú pillas', translation: 'Ты ловишь' },
          { pronoun: 'él', example: 'Él pilla', translation: 'Он ловит' },
          { pronoun: 'ella', example: 'Ella pilla', translation: 'Она ловит' },
          { pronoun: 'nosotros', example: 'Nosotros pillamos', translation: 'Мы ловим' },
          { pronoun: 'vosotros', example: 'Vosotros pilláis', translation: 'Вы ловите' },
          { pronoun: 'ellos', example: 'Ellos pillan', translation: 'Они ловят' },
          { pronoun: 'yo', example: 'No pillo', translation: 'Я не ловлю', isNegative: true },
          { pronoun: 'tú', example: '¿Pillas?', translation: 'Ты ловишь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Pretérito indefinido',
        examples: [
          { pronoun: 'yo', example: 'Yo pillé', translation: 'Я поймал' },
          { pronoun: 'tú', example: 'Tú pillaste', translation: 'Ты поймал' },
          { pronoun: 'él', example: 'Él pilló', translation: 'Он поймал' },
          { pronoun: 'ella', example: 'Ella pilló', translation: 'Она поймала' },
          { pronoun: 'nosotros', example: 'Nosotros pillamos', translation: 'Мы поймали' },
          { pronoun: 'ellos', example: 'Ellos pillaron', translation: 'Они поймали' },
          { pronoun: 'yo', example: 'No pillé', translation: 'Я не поймал', isNegative: true },
          { pronoun: 'tú', example: '¿Pillaste?', translation: 'Ты поймал?', isQuestion: true }
        ]
      }
    ]
  }
]
