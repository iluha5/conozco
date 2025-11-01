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
    isNegative?: boolean
    isQuestion?: boolean
  }[]
  grammaticalExamples: {
    tenseName: string
    examples: {
      pronoun: string
      example: string
      translation: string
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
  }
]
