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
  },
  // 20 самых популярных испанских глаголов
  "ser": {
    spanish: [
      {
        translation: "быть",
        examples: ["Yo soy estudiante", "Ella es médica"],
        frequency: "very_high"
      }
    ]
  },
  "estar": {
    spanish: [
      {
        translation: "быть (состояние)",
        examples: ["Estoy cansado", "¿Cómo estás?"],
        frequency: "very_high"
      },
      {
        translation: "находиться",
        examples: ["Estoy en casa", "¿Dónde está el baño?"],
        frequency: "very_high"
      }
    ]
  },
  "haber": {
    spanish: [
      {
        translation: "иметь",
        examples: ["He comido", "Has trabajado mucho"],
        frequency: "very_high"
      },
      {
        translation: "быть (безличное)",
        examples: ["Hay muchas personas", "Había un problema"],
        frequency: "very_high"
      }
    ]
  },
  "tener": {
    spanish: [
      {
        translation: "иметь",
        examples: ["Tengo un coche", "Tienen tres hijos"],
        frequency: "very_high"
      },
      {
        translation: "держать",
        examples: ["Ten cuidado", "Tengo el libro en la mano"],
        frequency: "high"
      }
    ]
  },
  "hacer": {
    spanish: [
      {
        translation: "делать",
        examples: ["¿Qué haces?", "Hago ejercicio cada día"],
        frequency: "very_high"
      },
      {
        translation: "создавать",
        examples: ["Hacer una tarta", "Hacer amigos"],
        frequency: "high"
      }
    ]
  },
  "poder": {
    spanish: [
      {
        translation: "мочь",
        examples: ["¿Puedes ayudarme?", "No puedo ir"],
        frequency: "very_high"
      },
      {
        translation: "быть в состоянии",
        examples: ["Podemos hacerlo", "¿Se puede fumar aquí?"],
        frequency: "high"
      }
    ]
  },
  "decir": {
    spanish: [
      {
        translation: "говорить",
        examples: ["¿Qué dices?", "Dice que vendrá"],
        frequency: "very_high"
      },
      {
        translation: "сказать",
        examples: ["Te digo la verdad", "Me dijeron que no"],
        frequency: "very_high"
      }
    ]
  },
  "ir": {
    spanish: [
      {
        translation: "идти",
        examples: ["Voy al trabajo", "Vamos a la playa"],
        frequency: "very_high"
      },
      {
        translation: "ехать",
        examples: ["Ir en coche", "Fueron a España"],
        frequency: "very_high"
      }
    ]
  },
  "ver": {
    spanish: [
      {
        translation: "видеть",
        examples: ["Veo una estrella", "¿Ves ese edificio?"],
        frequency: "very_high"
      },
      {
        translation: "смотреть",
        examples: ["Ver la televisión", "Vamos a ver una película"],
        frequency: "high"
      }
    ]
  },
  "dar": {
    spanish: [
      {
        translation: "давать",
        examples: ["Dame el libro", "Te doy mi número"],
        frequency: "very_high"
      },
      {
        translation: "дарить",
        examples: ["Le di un regalo", "Dar flores"],
        frequency: "high"
      }
    ]
  },
  "saber": {
    spanish: [
      {
        translation: "знать",
        examples: ["Sé español", "¿Sabes cocinar?"],
        frequency: "very_high"
      },
      {
        translation: "уметь",
        examples: ["Sabe tocar el piano", "No sé nadar"],
        frequency: "high"
      }
    ]
  },
  "querer": {
    spanish: [
      {
        translation: "хотеть",
        examples: ["Quiero agua", "¿Qué quieres?"],
        frequency: "very_high"
      },
      {
        translation: "любить",
        examples: ["Te quiero mucho", "Quiero a mi familia"],
        frequency: "high"
      }
    ]
  },
  "llegar": {
    spanish: [
      {
        translation: "приходить",
        examples: ["Llegué tarde", "¿Cuándo llegas?"],
        frequency: "very_high"
      },
      {
        translation: "прибывать",
        examples: ["El tren llega a las tres", "Llegamos a Madrid"],
        frequency: "high"
      }
    ]
  },
  "pasar": {
    spanish: [
      {
        translation: "проходить",
        examples: ["Pasa por aquí", "El tiempo pasa rápido"],
        frequency: "very_high"
      },
      {
        translation: "происходить",
        examples: ["¿Qué pasa?", "Pasó algo malo"],
        frequency: "high"
      },
      {
        translation: "проводить (время)",
        examples: ["Pasamos el día en la playa", "Pasar las vacaciones"],
        frequency: "high"
      }
    ]
  },
  "deber": {
    spanish: [
      {
        translation: "долженствовать",
        examples: ["Debo ir al médico", "Debes estudiar más"],
        frequency: "very_high"
      },
      {
        translation: "быть должным",
        examples: ["Te debo dinero", "Me debe una explicación"],
        frequency: "high"
      }
    ]
  },
  "poner": {
    spanish: [
      {
        translation: "класть",
        examples: ["Pon el libro en la mesa", "Pongo la música"],
        frequency: "very_high"
      },
      {
        translation: "ставить",
        examples: ["Poner la televisión", "Me pongo los zapatos"],
        frequency: "high"
      }
    ]
  },
  "parecer": {
    spanish: [
      {
        translation: "казаться",
        examples: ["Parece difícil", "Me parece bien"],
        frequency: "very_high"
      },
      {
        translation: "выглядеть",
        examples: ["Pareces cansado", "Parece mentira"],
        frequency: "high"
      }
    ]
  },
  "quedar": {
    spanish: [
      {
        translation: "оставаться",
        examples: ["Me quedo en casa", "¿Cuánto dinero queda?"],
        frequency: "very_high"
      },
      {
        translation: "встречаться",
        examples: ["Quedamos a las cinco", "¿Quedamos mañana?"],
        frequency: "high"
      }
    ]
  },
  "creer": {
    spanish: [
      {
        translation: "верить",
        examples: ["No te creo", "Creo que sí"],
        frequency: "very_high"
      },
      {
        translation: "думать",
        examples: ["Creo que tienes razón", "¿Tú qué crees?"],
        frequency: "high"
      }
    ]
  },
  "hablar": {
    spanish: [
      {
        translation: "говорить",
        examples: ["Hablo español", "¿Hablas inglés?"],
        frequency: "very_high"
      },
      {
        translation: "разговаривать",
        examples: ["Hablar por teléfono", "Necesito hablar contigo"],
        frequency: "high"
      }
    ]
  }
}

export type LanguageCode = 'en' | 'es'

export async function getMockTranslations(
  word: string, 
  languageCode: LanguageCode
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
  
  // Преобразуем код языка в ключ для моков
  const langKey = languageCode === 'en' ? 'english' : 'spanish'
  return translations[langKey] || [{
    translation: `перевод_${normalizedWord}`,
    examples: [`Example with ${word}`, `Another example with ${word}`],
    frequency: "unknown"
  }]
}

