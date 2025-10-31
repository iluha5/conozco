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
  }
]

// Функция для импорта данных слов в базу данных
export async function importWordsData(prisma: any) {
  for (const wordData of WORDS_DATA) {
    // Найти или создать язык
    let language = await prisma.language.findUnique({
      where: { code: wordData.languageCode }
    })

    if (!language) {
      const languageNames: Record<string, string> = {
        'es': 'Spanish',
        'en': 'English',
        'ru': 'Russian'
      }

      language = await prisma.language.create({
        data: {
          code: wordData.languageCode,
          name: languageNames[wordData.languageCode] || wordData.languageCode
        }
      })
    }

    // Создать базовое слово
    const baseWord = await prisma.baseWord.create({
      data: {
        word: wordData.word,
        partOfSpeech: wordData.partOfSpeech,
        languageId: language.id
      }
    })

    // Добавить переводы
    for (const translationGroup of wordData.translations) {
      const translationLanguage = await prisma.language.findUnique({
        where: { code: translationGroup.languageCode }
      })

      if (translationLanguage) {
        for (let i = 0; i < translationGroup.translations.length; i++) {
          await prisma.wordTranslation.create({
            data: {
              baseWordId: baseWord.id,
              languageId: translationLanguage.id,
              translation: translationGroup.translations[i],
              priority: i + 1
            }
          })
        }
      }
    }

    // Добавить местоимения если они еще не существуют
    const pronouns = ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas']
    const pronounRecords: Record<string, any> = {}

    for (const pronoun of pronouns) {
      let pronounRecord = await prisma.pronoun.findUnique({
        where: {
          pronoun_languageId: {
            pronoun,
            languageId: language.id
          }
        }
      })

      if (!pronounRecord) {
        pronounRecord = await prisma.pronoun.create({
          data: {
            pronoun,
            languageId: language.id
          }
        })
      }

      pronounRecords[pronoun] = pronounRecord
    }

    // Добавить простые примеры
    for (const example of wordData.examples) {
      if (pronounRecords[example.pronoun]) {
        await prisma.wordExample.create({
          data: {
            baseWordId: baseWord.id,
            pronounId: pronounRecords[example.pronoun].id,
            example: example.example,
            translation: example.translation,
            isNegative: example.isNegative || false,
            isQuestion: example.isQuestion || false
          }
        })
      }
    }

    // Добавить времена если они еще не существуют и это глагол
    if (wordData.partOfSpeech === PartOfSpeech.VERB) {
      const tenseRecords: Record<string, any> = {}

      for (const tenseGroup of wordData.grammaticalExamples) {
        let tense = await prisma.tense.findUnique({
          where: {
            name_languageId: {
              name: tenseGroup.tenseName,
              languageId: language.id
            }
          }
        })

        if (!tense) {
          tense = await prisma.tense.create({
            data: {
              name: tenseGroup.tenseName,
              languageId: language.id
            }
          })
        }

        tenseRecords[tenseGroup.tenseName] = tense

        // Добавить грамматические примеры
        for (const example of tenseGroup.examples) {
          if (pronounRecords[example.pronoun]) {
            await prisma.grammaticalExample.create({
              data: {
                baseWordId: baseWord.id,
                tenseId: tense.id,
                pronounId: pronounRecords[example.pronoun].id,
                example: example.example,
                translation: example.translation,
                isNegative: example.isNegative || false,
                isQuestion: example.isQuestion || false
              }
            })
          }
        }
      }
    }
  }
}
