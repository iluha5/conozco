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

// Данные слов для английского языка
export const ENGLISH_WORDS_DATA: WordData[] = [
  // Здесь будут данные для английских слов
]

