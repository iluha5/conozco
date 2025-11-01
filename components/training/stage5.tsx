'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

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
    grammaticalExamples: Array<{
      example: string
      translation: string
      pronoun: {
        pronoun: string
      }
      tense: {
        name: string
      }
    }>
  }
}

type Stage5Props = {
  words: Word[]
  onComplete: () => void
}

// Тип для фразы
type Phrase = {
  example: string
  translation: string
  pronoun: string
  words: string[]
}

export function Stage5Training({ words, onComplete }: Stage5Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null)
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [userSentence, setUserSentence] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  // Фильтруем слова, у которых есть фразы
  const wordsWithPhrases = words.filter(word => {
    const baseWord = word.baseWord
    if (!baseWord) return false

    const hasExamples = baseWord.examples && baseWord.examples.length > 0
    const hasGrammaticalExamples = baseWord.grammaticalExamples && baseWord.grammaticalExamples.length > 0

    return hasExamples || hasGrammaticalExamples
  })

  const currentWord = wordsWithPhrases[currentIndex]

  useEffect(() => {
    if (currentWord) {
      initializePhrase()
      setUserSentence([])
      setIsComplete(false)
      setIsCorrect(null)
    }
  }, [currentIndex])

  const initializePhrase = () => {
    if (!currentWord?.baseWord) return

    // Собираем все фразы
    const allPhrases: Phrase[] = []

    // Добавляем простые примеры
    if (currentWord.baseWord.examples) {
      currentWord.baseWord.examples.forEach(example => {
        allPhrases.push({
          example: example.example,
          translation: example.translation,
          pronoun: example.pronoun.pronoun,
          words: example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''))
        })
      })
    }

    // Добавляем грамматические примеры
    if (currentWord.baseWord.grammaticalExamples) {
      currentWord.baseWord.grammaticalExamples.forEach(example => {
        allPhrases.push({
          example: example.example,
          translation: example.translation,
          pronoun: example.pronoun.pronoun,
          words: example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''))
        })
      })
    }

    if (allPhrases.length === 0) return

    // Выбираем случайную фразу
    const randomPhrase = allPhrases[Math.floor(Math.random() * allPhrases.length)]
    setCurrentPhrase(randomPhrase)

    // Получаем дополнительные слова
    const extraWords = getExtraWords(randomPhrase.pronoun, currentWord.language.code)
    const allWords = [...randomPhrase.words, ...extraWords]

    // Перемешиваем слова
    const shuffledWords = allWords.sort(() => Math.random() - 0.5)
    setAvailableWords(shuffledWords)
  }

  const getExtraWords = (currentPronoun: string, languageCode: string): string[] => {
    const extraWords: string[] = []

    // Собираем все слова из всех фраз всех слов
    const allWordsFromPhrases: string[] = []
    const allPronouns: string[] = []

    words.forEach(word => {
      if (!word.baseWord) return

      // Собираем слова из примеров
      if (word.baseWord.examples) {
        word.baseWord.examples.forEach(example => {
          allWordsFromPhrases.push(...example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, '')))
          allPronouns.push(example.pronoun.pronoun)
        })
      }

      // Собираем слова из грамматических примеров
      if (word.baseWord.grammaticalExamples) {
        word.baseWord.grammaticalExamples.forEach(example => {
          allWordsFromPhrases.push(...example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, '')))
          allPronouns.push(example.pronoun.pronoun)
        })
      }
    })

    // Убираем дубликаты и пустые строки
    const uniqueWordsSet = new Set(allWordsFromPhrases.filter(w => w && w.length > 0))
    const uniqueWords = Array.from(uniqueWordsSet)
    const uniquePronounsSet = new Set(allPronouns.filter(p => p !== currentPronoun))
    const uniquePronouns = Array.from(uniquePronounsSet)

    // Выбираем 1 местоимение (не совпадающее с текущим)
    if (uniquePronouns.length > 0) {
      const randomPronoun = uniquePronouns[Math.floor(Math.random() * uniquePronouns.length)]
      extraWords.push(randomPronoun)
    }

    // Выбираем 2 случайных слова (не местоимения и не из текущей фразы)
    const currentPhraseWords = currentPhrase?.words || []
    const nonPronounWords = uniqueWords.filter(word =>
      !uniquePronouns.includes(word) &&
      !currentPhraseWords.includes(word)
    )

    if (nonPronounWords.length >= 2) {
      const shuffled = [...nonPronounWords].sort(() => Math.random() - 0.5)
      extraWords.push(...shuffled.slice(0, 2))
    } else if (nonPronounWords.length === 1) {
      extraWords.push(nonPronounWords[0])
    }

    return extraWords
  }

  const handleWordClick = (word: string, index: number) => {
    if (isComplete) return

    setUserSentence([...userSentence, word])
    setAvailableWords(availableWords.filter((_, i) => i !== index))
  }

  const handleRemoveFromSentence = (index: number) => {
    if (isComplete) return

    const word = userSentence[index]
    setUserSentence(userSentence.filter((_, i) => i !== index))
    setAvailableWords([...availableWords, word])
  }

  const handleCheck = async () => {
    if (!currentPhrase) return

    const constructed = userSentence.join(' ').toLowerCase()
    const correct = constructed === currentPhrase.example.toLowerCase().replace(/[¿?¡!.,;:]/g, '')

    setIsCorrect(correct)
    setIsComplete(true)

    // Записываем результат
    await fetch('/api/training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wordId: currentWord.id,
        stage: 5,
        isCorrect: correct,
      }),
    })

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleReset = () => {
    initializePhrase()
    setUserSentence([])
    setIsComplete(false)
    setIsCorrect(null)
  }

  const handleNext = () => {
    if (currentIndex < wordsWithPhrases.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete()
      setCurrentIndex(0)
      setStats({ correct: 0, total: 0 })
    }
  }

  if (!currentWord || !currentPhrase) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            {wordsWithPhrases.length === 0
              ? 'Нет слов с примерами для тренировки на этом этапе'
              : 'Загрузка...'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Этап 5: Составление предложения
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Слово {currentIndex + 1} из {wordsWithPhrases.length}
          </p>
          <p className="text-center text-sm text-green-600 font-medium">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Русский перевод фразы */}
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {currentPhrase.translation}
            </p>
            <p className="text-gray-600">Составьте предложение из слов</p>
          </div>

          {/* Составленное предложение */}
          <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-wrap gap-2 justify-center">
              {userSentence.length === 0 ? (
                <p className="text-gray-400">Выберите слова ниже</p>
              ) : (
                userSentence.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => !isComplete && handleRemoveFromSentence(index)}
                    disabled={isComplete}
                    className="px-3 py-2 bg-white border-2 border-purple-500 rounded-lg text-gray-900 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed font-medium"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Доступные слова */}
          <div className="flex flex-wrap gap-2 justify-center">
            {availableWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word, index)}
                disabled={isComplete}
                className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {word}
              </button>
            ))}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 justify-center">
            {!isComplete ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={userSentence.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Сброс
                </Button>
                <Button
                  onClick={handleCheck}
                  disabled={userSentence.length === 0}
                  size="lg"
                >
                  Проверить
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 text-lg font-medium">
                    <CheckCircle className="w-6 h-6" />
                    Правильно!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-red-600 text-lg font-medium">
                      <XCircle className="w-6 h-6" />
                      Неправильно
                    </div>
                    <p className="text-center text-gray-600">
                      Правильный ответ: <span className="font-bold">{currentPhrase.example}</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button size="lg" onClick={handleNext} className="gap-2">
                    {currentIndex < wordsWithPhrases.length - 1 ? 'Следующее слово' : 'Завершить'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / wordsWithPhrases.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
