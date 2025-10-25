'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

type Word = {
  id: string
  foreignWord: string
  translation: string
  language: 'ENGLISH' | 'SPANISH'
}

type Stage4Props = {
  words: Word[]
  onComplete: () => void
}

export function Stage4Training({ words, onComplete }: Stage4Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [letters, setLetters] = useState<string[]>([])
  const [userWord, setUserWord] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const currentWord = words[currentIndex]

  useEffect(() => {
    if (currentWord) {
      initializeLetters()
      setUserWord([])
      setIsComplete(false)
      setIsCorrect(null)
    }
  }, [currentIndex])

  const initializeLetters = () => {
    const wordLetters = currentWord.foreignWord.split('')
    const shuffled = [...wordLetters].sort(() => Math.random() - 0.5)
    setLetters(shuffled)
  }

  const handleLetterClick = (letter: string, index: number) => {
    setUserWord([...userWord, letter])
    setLetters(letters.filter((_, i) => i !== index))
  }

  const handleRemoveFromWord = (index: number) => {
    const letter = userWord[index]
    setUserWord(userWord.filter((_, i) => i !== index))
    setLetters([...letters, letter])
  }

  const handleCheck = async () => {
    const constructed = userWord.join('')
    const correct = constructed.toLowerCase() === currentWord.foreignWord.toLowerCase()
    
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
        stage: 4,
        isCorrect: correct,
      }),
    })

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleReset = () => {
    initializeLetters()
    setUserWord([])
    setIsComplete(false)
    setIsCorrect(null)
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
            Этап 4: Составление слова
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Слово {currentIndex + 1} из {words.length}
          </p>
          <p className="text-center text-sm text-green-600 font-medium">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {currentWord.translation}
            </p>
            <p className="text-gray-600">Составьте слово из букв</p>
          </div>

          {/* Собранное слово */}
          <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-wrap gap-2 justify-center">
              {userWord.length === 0 ? (
                <p className="text-gray-400">Выберите буквы ниже</p>
              ) : (
                userWord.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => !isComplete && handleRemoveFromWord(index)}
                    disabled={isComplete}
                    className="w-12 h-12 bg-white border-2 border-purple-500 rounded-lg text-xl font-bold text-gray-900 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed"
                  >
                    {letter}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Доступные буквы */}
          <div className="flex flex-wrap gap-2 justify-center">
            {letters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(letter, index)}
                disabled={isComplete}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {letter}
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
                  disabled={userWord.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Сброс
                </Button>
                <Button
                  onClick={handleCheck}
                  disabled={userWord.length !== currentWord.foreignWord.length}
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
                      Правильный ответ: <span className="font-bold">{currentWord.foreignWord}</span>
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button size="lg" onClick={handleNext} className="gap-2">
                    {currentIndex < words.length - 1 ? 'Следующее слово' : 'Завершить'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

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

