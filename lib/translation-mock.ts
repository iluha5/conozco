// Моки для переводов с Google Translate API
// В будущем это будет заменено на реальный API

export type TranslationVariant = {
  translation: string
  examples: string[]
  frequency?: string // как часто используется это значение
}

type MockTranslations = {
  [key: string]: {
    english?: TranslationVariant[]
    spanish?: TranslationVariant[]
  }
}

// Моки данных для различных слов
const mockTranslations: MockTranslations = {
  "hello": {
    english: [
      {
        translation: "привет",
        examples: ["Hello, how are you?", "Hello world!"],
        frequency: "very_high"
      },
      {
        translation: "здравствуйте",
        examples: ["Hello, Mr. Smith"],
        frequency: "high"
      },
      {
        translation: "алло",
        examples: ["Hello? Is anyone there?"],
        frequency: "medium"
      }
    ]
  },
  "book": {
    english: [
      {
        translation: "книга",
        examples: ["I'm reading a book", "This is an interesting book"],
        frequency: "very_high"
      },
      {
        translation: "бронировать",
        examples: ["Book a hotel room", "I need to book a flight"],
        frequency: "high"
      },
      {
        translation: "записывать",
        examples: ["Book an appointment"],
        frequency: "medium"
      }
    ]
  },
  "run": {
    english: [
      {
        translation: "бежать",
        examples: ["I run every morning", "Run as fast as you can"],
        frequency: "very_high"
      },
      {
        translation: "запускать",
        examples: ["Run the program", "Run the application"],
        frequency: "high"
      },
      {
        translation: "управлять",
        examples: ["Run a business", "He runs the company"],
        frequency: "high"
      },
      {
        translation: "течь",
        examples: ["Water runs from the tap"],
        frequency: "medium"
      }
    ]
  },
  "casa": {
    spanish: [
      {
        translation: "дом",
        examples: ["Mi casa es tu casa", "Voy a casa"],
        frequency: "very_high"
      },
      {
        translation: "жилище",
        examples: ["Una casa grande"],
        frequency: "medium"
      }
    ]
  },
  "hola": {
    spanish: [
      {
        translation: "привет",
        examples: ["¡Hola! ¿Cómo estás?", "Hola amigo"],
        frequency: "very_high"
      },
      {
        translation: "здравствуйте",
        examples: ["Hola, señor García"],
        frequency: "high"
      }
    ]
  },
  "tiempo": {
    spanish: [
      {
        translation: "время",
        examples: ["No tengo tiempo", "¿Qué tiempo hace?"],
        frequency: "very_high"
      },
      {
        translation: "погода",
        examples: ["El tiempo es bueno hoy"],
        frequency: "high"
      },
      {
        translation: "период",
        examples: ["En aquel tiempo"],
        frequency: "medium"
      }
    ]
  },
  "amor": {
    spanish: [
      {
        translation: "любовь",
        examples: ["El amor es importante", "Te amo con todo mi amor"],
        frequency: "very_high"
      },
      {
        translation: "милый",
        examples: ["Mi amor, ven aquí"],
        frequency: "high"
      }
    ]
  },
  "water": {
    english: [
      {
        translation: "вода",
        examples: ["Drink some water", "Water is essential for life"],
        frequency: "very_high"
      },
      {
        translation: "поливать",
        examples: ["Water the plants"],
        frequency: "high"
      }
    ]
  },
  "light": {
    english: [
      {
        translation: "свет",
        examples: ["Turn on the light", "There is not enough light"],
        frequency: "very_high"
      },
      {
        translation: "легкий",
        examples: ["This bag is very light"],
        frequency: "high"
      },
      {
        translation: "светлый",
        examples: ["Light colors"],
        frequency: "high"
      },
      {
        translation: "зажигать",
        examples: ["Light a candle"],
        frequency: "medium"
      }
    ]
  }
}

export type Language = 'ENGLISH' | 'SPANISH'

export async function getMockTranslations(
  word: string, 
  language: Language
): Promise<TranslationVariant[]> {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const normalizedWord = word.toLowerCase().trim()
  const translations = mockTranslations[normalizedWord]
  
  if (!translations) {
    // Если слова нет в моках, возвращаем базовый перевод
    return [{
      translation: `перевод_${normalizedWord}`,
      examples: [`Example with ${word}`, `Another example with ${word}`],
      frequency: "unknown"
    }]
  }
  
  const langKey = language.toLowerCase() as 'english' | 'spanish'
  return translations[langKey] || [{
    translation: `перевод_${normalizedWord}`,
    examples: [`Example with ${word}`, `Another example with ${word}`],
    frequency: "unknown"
  }]
}

