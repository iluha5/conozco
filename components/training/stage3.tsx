'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type Stage3Props = {
  words: Word[]
  onComplete: () => void
}

type MatchPair = {
  id: string
  foreign: string
  translation: string
  matched: boolean
}

export function Stage3Training({ words, onComplete }: Stage3Props) {
  const [currentBatch, setCurrentBatch] = useState(0)
  const [pairs, setPairs] = useState<MatchPair[]>([])
  const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([])
  const [selectedForeign, setSelectedForeign] = useState<string | null>(null)
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [errorForeign, setErrorForeign] = useState<string | null>(null)
  const [errorTranslation, setErrorTranslation] = useState<string | null>(null)

  const wordsPerBatch = 10
  const totalBatches = Math.ceil(words.length / wordsPerBatch)
  const currentWords = words.slice(currentBatch * wordsPerBatch, (currentBatch + 1) * wordsPerBatch)

  useEffect(() => {
    initializePairs()
  }, [currentBatch])

  const initializePairs = () => {
    const newPairs: MatchPair[] = currentWords.map(word => ({
      id: word.id,
      foreign: word.baseWord?.word || word.customWord || '',
      translation: word.customTranslation ||
                   (word.baseWord?.translations && word.baseWord.translations.length > 0
                     ? word.baseWord.translations[0].translation
                     : 'Нет перевода'),
      matched: false,
    }))

    setPairs(newPairs)

    // Перемешиваем переводы
    const translations = newPairs.map(p => p.translation).sort(() => Math.random() - 0.5)
    setShuffledTranslations(translations)

    setSelectedForeign(null)
    setSelectedTranslation(null)
    setErrorForeign(null)
    setErrorTranslation(null)
  }

  const handleForeignClick = (foreign: string) => {
    const pair = pairs.find(p => p.foreign === foreign)
    if (pair?.matched) return

    setSelectedForeign(foreign)

    if (selectedTranslation) {
      checkMatch(foreign, selectedTranslation)
    }
  }

  const handleTranslationClick = (translation: string) => {
    const pair = pairs.find(p => p.translation === translation)
    if (pair?.matched) return

    setSelectedTranslation(translation)

    if (selectedForeign) {
      checkMatch(selectedForeign, translation)
    }
  }

  const checkMatch = async (foreign: string, translation: string) => {
    const pair = pairs.find(p => p.foreign === foreign && p.translation === translation)

    if (pair) {
      // Правильное совпадение
      setPairs(prev => prev.map(p =>
        p.id === pair.id ? { ...p, matched: true } : p
      ))

      await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: pair.id,
          stage: 3,
          isCorrect: true,
        }),
      })

      setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))

      // Снимаем фокус с обоих слов после правильного сопоставления
      setSelectedForeign(null)
      setSelectedTranslation(null)
    } else {
      // Неправильное совпадение - подсвечиваем оба слова красным на 0.2 секунды
      setErrorForeign(foreign)
      setErrorTranslation(translation)

      // Снимаем подсветку и фокус через 0.2 секунды
      setTimeout(() => {
        setErrorForeign(null)
        setErrorTranslation(null)
        setSelectedForeign(null)
        setSelectedTranslation(null)
      }, 200)

      const wordPair = pairs.find(p => p.foreign === foreign)
      if (wordPair) {

        await fetch('/api/training', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordId: wordPair.id,
            stage: 3,
            isCorrect: false,
          }),
        })
      }

      setStats(prev => ({ correct: prev.correct, total: prev.total + 1 }))
    }
  }

  const allMatched = pairs.every(p => p.matched)

  // Автоматический переход к следующей группе или завершение этапа
  useEffect(() => {
    if (allMatched && pairs.length > 0) {
      const timer = setTimeout(() => {
        if (currentBatch < totalBatches - 1) {
          setCurrentBatch(currentBatch + 1)
        } else {
          onComplete()
          setCurrentBatch(0)
          setStats({ correct: 0, total: 0 })
        }
      }, 1500) // Задержка 1.5 секунды для визуального подтверждения

      return () => clearTimeout(timer)
    }
  }, [allMatched, currentBatch, totalBatches, pairs.length, onComplete])


  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Сопоставление слов
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Группа {currentBatch + 1} из {totalBatches}
          </p>
          <div className="!mt-3">
          <ProgressDots
            totalExercises={currentWords.length}
            completedExercises={pairs.filter(p => p.matched).length}
          />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Соедините иностранные слова с их переводами
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* Левая колонка - иностранные слова */}
            <div className="space-y-3 transition-all duration-200 ease-in-out">
              {pairs
                .sort((a, b) => {
                  // Сначала matched пары, затем неугаданные
                  if (a.matched && !b.matched) return -1
                  if (!a.matched && b.matched) return 1
                  return 0
                })
                .map((pair) => (
                  <Button
                    key={pair.id}
                    variant={pair.matched ? 'outline' : selectedForeign === pair.foreign ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 text-lg transition-all duration-200 ease-in-out ${
                    pair.matched ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' :
                    errorForeign === pair.foreign ? 'bg-red-500 border-red-500 text-white' : ''
                  }`}
                    onClick={() => handleForeignClick(pair.foreign)}
                    disabled={pair.matched}
                  >
                    {pair.foreign}
                  </Button>
                ))}
            </div>

            {/* Правая колонка - переводы */}
            <div className="space-y-3 transition-all duration-200 ease-in-out">
              {shuffledTranslations
                .sort((a, b) => {
                  // Сначала matched переводы, затем неугаданные
                  const pairA = pairs.find(p => p.translation === a)
                  const pairB = pairs.find(p => p.translation === b)
                  const isMatchedA = pairA?.matched || false
                  const isMatchedB = pairB?.matched || false

                  if (isMatchedA && !isMatchedB) return -1
                  if (!isMatchedA && isMatchedB) return 1
                  return 0
                })
                .map((translation, index) => {
                  const pair = pairs.find(p => p.translation === translation)
                  const isMatched = pair?.matched || false

                  return (
                    <Button
                      key={translation}
                      variant={isMatched ? 'outline' : selectedTranslation === translation ? 'default' : 'outline'}
                      className={`w-full h-auto py-4 text-lg transition-all duration-500 ease-in-out ${
                        isMatched ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' :
                        errorTranslation === translation ? 'bg-red-500 border-red-500 text-white' : ''
                      }`}
                      onClick={() => handleTranslationClick(translation)}
                      disabled={isMatched}
                    >
                      {translation}
                    </Button>
                  )
                })}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

