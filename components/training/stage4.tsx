'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Settings, X } from 'lucide-react'
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

type Stage4Props = {
  words: Word[]
  onComplete: () => void
}

type LetterState = {
  letter: string
  selected: boolean
}

type DifficultyLevel = 'easy' | 'medium' | 'hard'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  currentDifficulty: DifficultyLevel
  onChange: (difficulty: DifficultyLevel) => void
}

function SettingsModal({ isOpen, onClose, currentDifficulty, onChange }: SettingsModalProps) {
  if (!isOpen) return null

  const difficultyOptions = [
    { key: 'easy' as DifficultyLevel, label: 'Простой', description: 'Только буквы из слова' },
    { key: 'medium' as DifficultyLevel, label: 'Средний', description: '+ 3 дополнительные буквы' },
    { key: 'hard' as DifficultyLevel, label: 'Сложный', description: '+ 6 дополнительных букв' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Настройки тренировки</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Уровень сложности:</p>

          <div className="space-y-2">
            {difficultyOptions.map((option) => (
              <Button
                key={option.key}
                variant={currentDifficulty === option.key ? "default" : "outline"}
                onClick={() => onChange(option.key)}
                className="w-full justify-start h-auto p-3 text-left"
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Stage4Training({ words, onComplete }: Stage4Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [letters, setLetters] = useState<LetterState[]>([])
  const [userWord, setUserWord] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy')
  const [showSettings, setShowSettings] = useState(false)
  const [isFirstCard, setIsFirstCard] = useState(true)
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([])

  const currentWord = words[currentIndex]

  // Инициализируем массив результатов упражнений
  useEffect(() => {
    setExerciseResults(new Array(words.length).fill(null))
  }, [words.length])

  useEffect(() => {
    if (currentWord) {
      initializeLetters()
      setUserWord([])
      setIsComplete(false)
      setIsCorrect(null)
    }
  }, [currentIndex, difficulty])

  const initializeLetters = () => {
    const word = currentWord.baseWord?.word || currentWord.customWord || ''
    const wordLetters = word.split('')

    // Получаем дополнительные буквы в зависимости от сложности
    let extraLetters: string[] = []
    if (difficulty === 'medium') {
      extraLetters = getRandomLetters(3, wordLetters)
    } else if (difficulty === 'hard') {
      extraLetters = getRandomLetters(6, wordLetters)
    }

    const allLetters = [...wordLetters, ...extraLetters]
    const shuffled = allLetters.sort(() => Math.random() - 0.5)
    const letterStates: LetterState[] = shuffled.map(letter => ({
      letter,
      selected: false
    }))
    setLetters(letterStates)
  }

  const getRandomLetters = (count: number, excludeLetters: string[]): string[] => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    const availableLetters = alphabet.split('').filter(letter =>
      !excludeLetters.includes(letter)
    )
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const handleLetterClick = (index: number) => {
    const letter = letters[index].letter
    setUserWord([...userWord, letter])
    setLetters(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: true } : item
    ))
  }

  const handleRemoveFromWord = (index: number) => {
    const letter = userWord[index]
    setUserWord(userWord.filter((_, i) => i !== index))

    // Найти эту букву в массиве letters и снять выделение
    setLetters(prev => prev.map(item =>
      item.letter === letter && item.selected ? { ...item, selected: false } : item
    ))
  }

  const handleCheck = async () => {
    const constructed = userWord.join('')
    const correctWord = currentWord.baseWord?.word || currentWord.customWord || ''
    const correct = constructed.toLowerCase() === correctWord.toLowerCase()

    setIsCorrect(correct)
    setIsComplete(true)

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
        stage: 4,
        isCorrect: correct,
      }),
    })

    // После первого ответа скрываем кнопку настроек
    if (isFirstCard) {
      setIsFirstCard(false)
    }

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleSettingsChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty)
    setShowSettings(false)
    // Сбрасываем прогресс при изменении сложности
    setCurrentIndex(0)
    setStats({ correct: 0, total: 0 })
    setIsFirstCard(true)
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-600">
              Составление слова
            </CardTitle>
            {isFirstCard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="p-2 h-auto"
                title="Настройки тренировки"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="!mt-3">
          <ProgressDots
            results={exerciseResults}
            currentIndex={currentIndex}
          />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {currentWord.customTranslation ||
               (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                 ? currentWord.baseWord.translations[0].translation
                 : 'Нет перевода')}
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
          <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            {letters.map((letterState, index) => (
              <div key={index} className="relative w-12 h-12">
                {letterState.selected ? (
                  // Светло-серый блок-заполнитель для выбранных букв с текстом
                  <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">{letterState.letter}</span>
                  </div>
                ) : (
                  // Активная кнопка для невыбранных букв
                  <button
                    onClick={() => handleLetterClick(index)}
                    disabled={isComplete}
                    className="w-full h-full bg-white border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {letterState.letter}
                  </button>
                )}
              </div>
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
                  disabled={userWord.length !== (currentWord.baseWord?.word || currentWord.customWord || '').length}
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
                      Правильный ответ: <span className="font-bold">{currentWord.baseWord?.word || currentWord.customWord}</span>
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
        </CardContent>
      </Card>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentDifficulty={difficulty}
        onChange={handleSettingsChange}
      />
    </div>
  )
}

