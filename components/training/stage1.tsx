'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, ChevronRight } from 'lucide-react'

type Language = {
  id: string
  code: string
  name: string
}

type Word = {
  id: string
  userId: string
  baseWordId?: string
  customWord?: string
  customTranslation?: string
  languageId: string
  language: Language
  status: 'NOT_LEARNED' | 'LEARNED'
  createdAt: string
  updatedAt: string
  baseWord?: {
    id: string
    word: string
    partOfSpeech: {
      id: string
      name: string
      displayName: string
    }
    languageId: string
    translations: Array<{
      translation: string
      priority: number
    }>
    examples: Array<{
      example: string
      translation: string
      pronoun: {
        pronoun: string
      }
    }>
  }
}

type Stage1Props = {
  words: Word[]
  onComplete: () => void
}

export function Stage1Training({ words, onComplete }: Stage1Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)

  const currentWord = words[currentIndex]

  useEffect(() => {
    // Автоматическая озвучка при появлении нового слова
    if (currentWord) {
      speakWord()
    }
  }, [currentIndex])

  const speakWord = () => {
    if ('speechSynthesis' in window && currentWord) {
      const word = currentWord.baseWord?.word || currentWord.customWord || ''
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = currentWord.language.code === 'en' ? 'en-US' : 'es-ES'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleNext = async () => {
    // Записываем результат тренировки
    await fetch('/api/training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wordId: currentWord.id,
        stage: 1,
        isCorrect: true, // На 1 этапе всегда true, так как это просто просмотр
      }),
    })

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowTranslation(false)
    } else {
      onComplete()
      setCurrentIndex(0)
      setShowTranslation(false)
    }
  }

  if (!currentWord) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Этап 1: Просмотр и запоминание
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Слово {currentIndex + 1} из {words.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-5xl font-bold text-gray-900">
                {currentWord.baseWord?.word || currentWord.customWord}
              </h2>
              <Button
                size="icon"
                variant="outline"
                onClick={speakWord}
                className="rounded-full w-12 h-12"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>

            <div className="min-h-[120px] flex items-center justify-center">
              {showTranslation ? (
                <div className="space-y-4">
                  <p className="text-3xl text-purple-600 font-semibold">
                    {currentWord.customTranslation ||
                     (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                       ? currentWord.baseWord.translations[0].translation
                       : 'Нет перевода')}
                  </p>
                  {currentWord.baseWord?.examples && currentWord.baseWord.examples.length > 0 && (
                    <div className="text-gray-600 space-y-2">
                      <p className="font-medium text-sm">Примеры:</p>
                      {currentWord.baseWord.examples.slice(0, 2).map((example, idx) => (
                        <p key={idx} className="text-sm italic">
                          • {example.example} - {example.translation}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setShowTranslation(true)}
                  className="text-lg"
                >
                  Показать перевод
                </Button>
              )}
            </div>
          </div>

          {showTranslation && (
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleNext} className="gap-2">
                {currentIndex < words.length - 1 ? 'Следующее слово' : 'Завершить'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

