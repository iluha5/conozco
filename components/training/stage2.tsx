'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'
import { ProgressDots } from './progress-dots'

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

type Stage2Props = {
  words: Word[]
  onComplete: () => void
}

export function Stage2Training({ words, onComplete }: Stage2Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([])
  const [fadeIn, setFadeIn] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [isRetryMode, setIsRetryMode] = useState(false)
  const [hasCompletedFirstRound, setHasCompletedFirstRound] = useState(false)

  const currentWord = words[currentIndex]

  // Инициализируем массив результатов упражнений
  useEffect(() => {
    setExerciseResults(new Array(words.length).fill(null))
  }, [words.length])

  // Запускаем анимацию при каждом монтировании компонента (при новом слове)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [animationKey])

  useEffect(() => {
    if (currentWord) {
      // Генерируем новый ключ для принудительного перемонтирования компонента
      setAnimationKey(prev => prev + 1)
      setFadeIn(false)

      // Сначала генерируем опции для нового слова
      generateOptions()

      // Сбрасываем состояние выбора
      setSelectedOption(null)
      setIsCorrect(null)
    }
  }, [currentIndex])

  // Автоматический переход к следующему слову: 1сек при правильном ответе, 2сек при неправильном
  useEffect(() => {
    if (selectedOption !== null) {
      const delay = isCorrect ? 800 : 2000
      const timer = setTimeout(() => {
        if (isRetryMode) {
          // В режиме исправления ошибок
          if (isCorrect) {
            // Исправил ошибку - ищем следующую ошибку
            const nextErrorIndex = findNextError(currentIndex)
            if (nextErrorIndex === -1) {
              // Все ошибки исправлены - завершаем этап
              onComplete()
              setCurrentIndex(0)
              setStats({ correct: 0, total: 0 })
              setIsRetryMode(false)
              setHasCompletedFirstRound(false)
            } else {
              // Переходим к следующей ошибке
              setCurrentIndex(nextErrorIndex)
            }
          } else {
            // Снова ошибся - переходим к следующей ошибке (или к этой же, если она одна)
            const nextErrorIndex = findNextError(currentIndex)
            if (nextErrorIndex === -1 || nextErrorIndex === currentIndex) {
              // Это единственная ошибка или других нет - остаемся на ней, но перезагружаем карточку
              setAnimationKey(prev => prev + 1)
              setFadeIn(false)
              generateOptions()
              setSelectedOption(null)
              setIsCorrect(null)
            } else {
              setCurrentIndex(nextErrorIndex)
            }
          }
        } else {
          // Обычный режим
          handleNext()
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [selectedOption, currentIndex, isCorrect, isRetryMode, exerciseResults])

  const generateOptions = () => {
    const correctTranslation = currentWord.customTranslation ||
                               (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                                 ? currentWord.baseWord.translations[0].translation
                                 : '')
    const otherWords = words.filter((w, idx) => idx !== currentIndex)

    // Выбираем 3 случайных неправильных ответа
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5)
    const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.customTranslation ||
                                                          (w.baseWord?.translations && w.baseWord.translations.length > 0
                                                            ? w.baseWord.translations[0].translation
                                                            : ''))

    // Комбинируем с правильным ответом и перемешиваем
    const allOptions = [...wrongOptions, correctTranslation].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }

  const handleSelectOption = async (option: string) => {
    if (selectedOption !== null) return // Уже выбрано

    setSelectedOption(option)
    const correctTranslation = currentWord.customTranslation ||
                               (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                                 ? currentWord.baseWord.translations[0].translation
                                 : '')
    const correct = option === correctTranslation
    setIsCorrect(correct)

    // Обновляем результаты упражнения
    setExerciseResults(prev => {
      const newResults = [...prev]
      newResults[currentIndex] = correct
      return newResults
    })

    // Записываем результат
    await fetch('/api/training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wordId: currentWord.id,
        stage: 2,
        isCorrect: correct,
      }),
    })

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Завершили все слова первый раз
      setHasCompletedFirstRound(true)
      
      // Проверяем, есть ли ошибки
      const errorIndices = exerciseResults
        .map((result, idx) => result === false ? idx : -1)
        .filter(idx => idx !== -1)
      
      if (errorIndices.length > 0) {
        // Есть ошибки - переходим в режим исправления
        setIsRetryMode(true)
        setCurrentIndex(errorIndices[0])
      } else {
        // Все правильно - завершаем этап
        onComplete()
        setCurrentIndex(0)
        setStats({ correct: 0, total: 0 })
        setIsRetryMode(false)
        setHasCompletedFirstRound(false)
      }
    }
  }
  
  // Функция для поиска следующей ошибки
  const findNextError = (startIndex: number) => {
    // Ищем следующую ошибку после текущего индекса
    for (let i = startIndex + 1; i < exerciseResults.length; i++) {
      if (exerciseResults[i] === false) {
        return i
      }
    }
    // Если не нашли, ищем с начала до текущего индекса
    for (let i = 0; i <= startIndex; i++) {
      if (exerciseResults[i] === false) {
        return i
      }
    }
    return -1 // Ошибок больше нет
  }

  if (!currentWord) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card key={animationKey} className={`shadow-xl transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Выбор правильного перевода
          </CardTitle>
          <div className="!mt-3">
          <ProgressDots
            totalExercises={words.length}
            completedExercises={exerciseResults.filter(r => r !== null).length}
            exerciseResults={exerciseResults}
            currentIndex={currentIndex}
          />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-2">
              {currentWord.baseWord?.word || currentWord.customWord}
            </h2>
            <p className="text-gray-600">Выберите правильный перевод</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedOption === option
              const correctTranslation = currentWord.customTranslation ||
                                         (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                                           ? currentWord.baseWord.translations[0].translation
                                           : '')
              const isCorrectOption = option === correctTranslation

              let buttonClass = 'h-auto py-4 text-lg justify-start'
              let variant: 'default' | 'outline' | 'secondary' = 'outline'

              if (isSelected) {
                if (isCorrect) {
                  buttonClass += ' bg-green-100 border-green-500 hover:bg-green-100'
                } else {
                  buttonClass += ' bg-red-100 border-red-500 hover:bg-red-100'
                }
              } else if (selectedOption !== null && isCorrectOption) {
                buttonClass += ' bg-green-100 border-green-500'
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  className={buttonClass}
                  onClick={() => handleSelectOption(option)}
                  disabled={selectedOption !== null}
                >
                  <span className="flex-1 text-left">{option}</span>
                  {isSelected && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  {selectedOption !== null && !isSelected && isCorrectOption && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </Button>
              )
            })}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

