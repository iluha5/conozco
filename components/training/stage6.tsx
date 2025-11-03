'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Volume2 } from 'lucide-react'
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

type Stage6Props = {
  words: Word[]
  onComplete: () => void
}

type LetterState = {
  letter: string
  selected: boolean
}

export function Stage6Training({ words, onComplete }: Stage6Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [letters, setLetters] = useState<LetterState[]>([])
  const [userWord, setUserWord] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([])

  // Filter only base words (exclude custom words)
  const baseWords = words.filter(word => word.baseWordId && !word.customWord)

  // Инициализируем массив результатов упражнений
  useEffect(() => {
    setExerciseResults(new Array(baseWords.length).fill(null))
  }, [baseWords.length])

  const currentWord = baseWords[currentIndex]

  useEffect(() => {
    if (currentWord) {
      initializeLetters()
      setUserWord([])
      setIsComplete(false)
      setIsCorrect(null)
      setHasPlayedOnce(false)
      // Auto-play the word once when loading a new word
      setTimeout(() => speakWord(), 500) // Small delay to allow UI to render
    }
  }, [currentIndex])

  const initializeLetters = () => {
    const word = currentWord.baseWord?.word || ''
    const wordLetters = word.split('')
    const shuffled = [...wordLetters].sort(() => Math.random() - 0.5)

    // Add 3 random letters
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    const randomLetters = []
    for (let i = 0; i < 3; i++) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]
      randomLetters.push(randomLetter)
    }

    const allLetters = [...shuffled, ...randomLetters]
    const finalShuffled = allLetters.sort(() => Math.random() - 0.5)

    const letterStates: LetterState[] = finalShuffled.map(letter => ({
      letter,
      selected: false
    }))
    setLetters(letterStates)
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

  const speakWord = () => {
    if (!currentWord?.baseWord?.word) return

    setIsPlaying(true)

    // Use Web Speech API
    const utterance = new SpeechSynthesisUtterance(currentWord.baseWord.word)

    // Set language based on the word's language
    if (currentWord.language.code === 'en') {
      utterance.lang = 'en-US'
    } else if (currentWord.language.code === 'es') {
      utterance.lang = 'es-ES'
    }

    utterance.rate = 0.8 // Slightly slower for learning
    utterance.pitch = 1

    utterance.onend = () => {
      setIsPlaying(false)
      setHasPlayedOnce(true)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setHasPlayedOnce(true)
    }

    speechSynthesis.speak(utterance)
  }

  const handleCheck = async () => {
    const constructed = userWord.join('')
    const correctWord = currentWord.baseWord?.word || ''
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
        stage: 6,
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
    if (currentIndex < baseWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete()
      setCurrentIndex(0)
      setStats({ correct: 0, total: 0 })
    }
  }

  if (!currentWord) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Нет основных слов для тренировки. Добавьте слова из словаря!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Составление слова по голосу
          </CardTitle>
          <div className="!mt-3">
          <ProgressDots
            results={exerciseResults}
            currentIndex={currentIndex}
          />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">Послушайте слово и составьте его из букв</p>

            {/* Optional replay button - only show after first auto-play */}
            {hasPlayedOnce && (
              <Button
                onClick={speakWord}
                disabled={isPlaying}
                variant="outline"
                size="sm"
                className="gap-2 mt-2"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Проигрывается...' : 'Прослушать еще раз'}
              </Button>
            )}

            {/* Show status when auto-playing */}
            {isPlaying && !hasPlayedOnce && (
              <div className="flex items-center justify-center gap-2 text-purple-600 mt-2">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Проигрывание слова...</span>
              </div>
            )}
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
                  disabled={userWord.length !== (currentWord.baseWord?.word || '').length}
                  size="lg"
                >
                  Проверить
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                {isCorrect ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600 text-lg font-medium">
                      <CheckCircle className="w-6 h-6" />
                      Правильно!
                    </div>
                    <div className="text-center space-y-2">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {currentWord.baseWord?.word}
                        </p>
                        <p className="text-lg text-gray-600">
                          {currentWord.customTranslation ||
                           (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                             ? currentWord.baseWord.translations[0].translation
                             : 'Нет перевода')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-red-600 text-lg font-medium">
                      <XCircle className="w-6 h-6" />
                      Неправильно
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-gray-600">Правильный ответ:</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {currentWord.baseWord?.word}
                        </p>
                        <p className="text-lg text-gray-600">
                          {currentWord.customTranslation ||
                           (currentWord.baseWord?.translations && currentWord.baseWord.translations.length > 0
                             ? currentWord.baseWord.translations[0].translation
                             : 'Нет перевода')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button size="lg" onClick={handleNext} className="gap-2">
                    {currentIndex < baseWords.length - 1 ? 'Следующее слово' : 'Завершить'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
