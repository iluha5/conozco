'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react'
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

  const currentWord = words[currentIndex]

  // Инициализируем массив результатов упражнений
  useEffect(() => {
    setExerciseResults(new Array(words.length).fill(null))
  }, [words.length])

  useEffect(() => {
    if (currentWord) {
      generateOptions()
      setSelectedOption(null)
      setIsCorrect(null)
    }
  }, [currentIndex])

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
      onComplete()
      setCurrentIndex(0)
      setStats({ correct: 0, total: 0 })
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
            Выбор правильного перевода
          </CardTitle>
          <div className="!mt-3">
            <ProgressDots
              results={exerciseResults}
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

          {selectedOption !== null && (
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleNext} className="gap-2">
                {currentIndex < words.length - 1 ? 'Следующее слово' : 'Завершить'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

