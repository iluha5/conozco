'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Settings, X } from 'lucide-react'

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

type ProgressDotsProps = {
  results: boolean[]
  currentIndex: number
}

function ProgressDots({ results, currentIndex }: ProgressDotsProps) {
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Автоматическая прокрутка к текущей точке
    if (dotsRef.current) {
      const dotElement = dotsRef.current.children[currentIndex] as HTMLElement
      if (dotElement) {
        dotElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [currentIndex])

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={dotsRef}
        className="flex gap-2 px-4 py-2 min-w-max justify-start"
        style={{ scrollbarWidth: 'thin' }}
      >
        {results.map((result, index) => {
          let dotClass = 'w-3 h-3 rounded-full transition-colors duration-300 '

          if (index === currentIndex) {
            dotClass += 'ring-2 ring-purple-400 ring-offset-1 '
          }

          if (result === true) {
            dotClass += 'bg-green-500'
          } else if (result === false) {
            dotClass += 'bg-red-500'
          } else {
            dotClass += 'bg-gray-300'
          }

          return (
            <div
              key={index}
              className={dotClass}
              title={`Exercise ${index + 1}: ${result === true ? 'Correct' : result === false ? 'Incorrect' : 'Pending'}`}
            />
          )
        })}
      </div>
    </div>
  )
}

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  currentValue: number
  onChange: (value: number) => void
}

function SettingsModal({ isOpen, onClose, currentValue, onChange }: SettingsModalProps) {
  if (!isOpen) return null

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
          <p className="text-sm text-gray-600">Количество предложений на слово:</p>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={currentValue === num ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(num)}
                className="h-10"
              >
                {num}
              </Button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Если в базе меньше предложений, будут использованы все доступные.
          </p>
        </div>
      </div>
    </div>
  )
}

type WordState = {
  word: string
  selected: boolean
}

export function Stage5Training({ words, onComplete }: Stage5Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null)
  const [availableWords, setAvailableWords] = useState<WordState[]>([])
  const [userSentence, setUserSentence] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([])
  const [sentencesPerWord, setSentencesPerWord] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [isFirstCard, setIsFirstCard] = useState(true)

  // Фильтруем слова, у которых есть фразы
  const wordsWithPhrases = useMemo(() => words.filter(word => {
    const baseWord = word.baseWord
    if (!baseWord) return false

    const hasExamples = baseWord.examples && baseWord.examples.length > 0
    const hasGrammaticalExamples = baseWord.grammaticalExamples && baseWord.grammaticalExamples.length > 0

    return hasExamples || hasGrammaticalExamples
  }), [words])

  const currentWord = wordsWithPhrases[currentIndex]

  // Инициализируем массив фраз для всех слов
  const [wordPhrases, setWordPhrases] = useState<Phrase[][]>([])

  useEffect(() => {
    const phrases: Phrase[][] = wordsWithPhrases.map(word => {
      if (!word.baseWord) return []

      const allPhrases: Phrase[] = []

      // Добавляем простые примеры
      if (word.baseWord.examples) {
        word.baseWord.examples.forEach(example => {
          allPhrases.push({
            example: example.example,
            translation: example.translation,
            pronoun: example.pronoun.pronoun,
            words: example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''))
          })
        })
      }

      // Добавляем грамматические примеры
      if (word.baseWord.grammaticalExamples) {
        word.baseWord.grammaticalExamples.forEach(example => {
          allPhrases.push({
            example: example.example,
            translation: example.translation,
            pronoun: example.pronoun.pronoun,
            words: example.example.split(' ').map(w => w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''))
          })
        })
      }

      // Ограничиваем до выбранного количества предложений, но не больше доступных
      return allPhrases.slice(0, sentencesPerWord)
    })

    setWordPhrases(phrases)
    // Инициализируем массив результатов для всех упражнений
    const totalExercises = phrases.reduce((total, wordPhrases) => total + wordPhrases.length, 0)
    setExerciseResults(new Array(totalExercises).fill(null))
  }, [wordsWithPhrases, sentencesPerWord])

  // Рассчитываем общий прогресс
  const totalPhrases = wordPhrases.reduce((total, phrases) => total + phrases.length, 0)
  const currentPhraseNumber = wordPhrases.slice(0, currentIndex).reduce((total, phrases) => total + phrases.length, 0) + currentPhraseIndex + 1

  useEffect(() => {
    if (currentWord && wordPhrases.length > currentIndex && wordPhrases[currentIndex].length > 0) {
      initializePhrase()
      setUserSentence([])
      setIsComplete(false)
      setIsCorrect(null)
    }
  }, [currentIndex, currentPhraseIndex, wordPhrases])

  const initializePhrase = () => {
    if (wordPhrases.length <= currentIndex || wordPhrases[currentIndex].length <= currentPhraseIndex) return

    const currentWordPhrases = wordPhrases[currentIndex]
    const phrase = currentWordPhrases[currentPhraseIndex]
    setCurrentPhrase(phrase)

    // Получаем дополнительные слова
    const extraWords = getExtraWords(phrase.pronoun, currentWord.language.code, phrase.words)
    const allWords = [...phrase.words, ...extraWords]

    // Перемешиваем слова и создаем объекты состояния
    const shuffledWords = allWords.sort(() => Math.random() - 0.5)
    const wordStates: WordState[] = shuffledWords.map(word => ({
      word,
      selected: false
    }))
    setAvailableWords(wordStates)
  }

  const getExtraWords = (currentPronoun: string, languageCode: string, currentPhraseWords: string[]): string[] => {
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

  const handleWordClick = (index: number) => {
    if (isComplete) return

    const word = availableWords[index].word
    setUserSentence([...userSentence, word])
    setAvailableWords(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: true } : item
    ))
  }

  const handleRemoveFromSentence = (index: number) => {
    if (isComplete) return

    const word = userSentence[index]
    setUserSentence(userSentence.filter((_, i) => i !== index))

    // Найти это слово в массиве availableWords и снять выделение
    setAvailableWords(prev => prev.map(item =>
      item.word === word && item.selected ? { ...item, selected: false } : item
    ))
  }

  const handleCheck = async () => {
    if (!currentPhrase) return

    const constructed = userSentence.join(' ').toLowerCase()
    const correct = constructed === currentPhrase.example.toLowerCase().replace(/[¿?¡!.,;:]/g, '')

    setIsCorrect(correct)
    setIsComplete(true)

    // Обновляем результаты упражнения
    const exerciseIndex = wordPhrases.slice(0, currentIndex).reduce((total, phrases) => total + phrases.length, 0) + currentPhraseIndex
    setExerciseResults(prev => {
      const newResults = [...prev]
      newResults[exerciseIndex] = correct
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
        stage: 5,
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

  const handleSettingsChange = (newSentencesPerWord: number) => {
    setSentencesPerWord(newSentencesPerWord)
    setShowSettings(false)
    // Сбрасываем прогресс и счетчики при изменении настроек
    setCurrentIndex(0)
    setCurrentPhraseIndex(0)
    setStats({ correct: 0, total: 0 })
    setIsFirstCard(true)
  }

  const handleReset = () => {
    initializePhrase()
    setUserSentence([])
    setIsComplete(false)
    setIsCorrect(null)
  }

  const handleNext = () => {
    const currentWordPhrases = wordPhrases[currentIndex] || []

    // Если есть еще предложения для текущего слова
    if (currentPhraseIndex < currentWordPhrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1)
    } else {
      // Переходим к следующему слову
      setCurrentPhraseIndex(0)
      if (currentIndex < wordsWithPhrases.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        onComplete()
        setCurrentIndex(0)
        setStats({ correct: 0, total: 0 })
      }
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-600">
              Этап 5: Составление предложения
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
          <ProgressDots
            results={exerciseResults}
            currentIndex={wordPhrases.slice(0, currentIndex).reduce((total, phrases) => total + phrases.length, 0) + currentPhraseIndex}
          />
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
            {availableWords
              .map((wordState, originalIndex) => ({ wordState, originalIndex }))
              .filter(({ wordState }) => !wordState.selected)
              .map(({ wordState, originalIndex }) => (
                <button
                  key={originalIndex}
                  onClick={() => handleWordClick(originalIndex)}
                  disabled={isComplete}
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {wordState.word}
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
                    {currentPhraseIndex < (wordPhrases[currentIndex]?.length || 0) - 1
                      ? 'Следующее предложение'
                      : currentIndex < wordsWithPhrases.length - 1
                        ? 'Следующее слово'
                        : 'Завершить'}
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
        currentValue={sentencesPerWord}
        onChange={handleSettingsChange}
      />
    </div>
  )
}
