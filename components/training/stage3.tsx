'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

type Word = {
  id: string
  foreignWord: string
  translation: string
  language: 'ENGLISH' | 'SPANISH'
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

  const wordsPerBatch = 4
  const totalBatches = Math.ceil(words.length / wordsPerBatch)
  const currentWords = words.slice(currentBatch * wordsPerBatch, (currentBatch + 1) * wordsPerBatch)

  useEffect(() => {
    initializePairs()
  }, [currentBatch])

  const initializePairs = () => {
    const newPairs: MatchPair[] = currentWords.map(word => ({
      id: word.id,
      foreign: word.foreignWord,
      translation: word.translation,
      matched: false,
    }))
    
    setPairs(newPairs)
    
    // Перемешиваем переводы
    const translations = newPairs.map(p => p.translation).sort(() => Math.random() - 0.5)
    setShuffledTranslations(translations)
    
    setSelectedForeign(null)
    setSelectedTranslation(null)
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
    } else {
      // Неправильное совпадение
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
    
    setSelectedForeign(null)
    setSelectedTranslation(null)
  }

  const allMatched = pairs.every(p => p.matched)

  const handleNext = () => {
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(currentBatch + 1)
    } else {
      onComplete()
      setCurrentBatch(0)
      setStats({ correct: 0, total: 0 })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-600">
            Этап 3: Сопоставление слов
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Группа {currentBatch + 1} из {totalBatches}
          </p>
          <p className="text-center text-sm text-green-600 font-medium">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Соедините иностранные слова с их переводами
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* Левая колонка - иностранные слова */}
            <div className="space-y-3">
              {pairs.map((pair) => (
                <Button
                  key={pair.id}
                  variant={pair.matched ? 'secondary' : selectedForeign === pair.foreign ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 text-lg ${
                    pair.matched ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleForeignClick(pair.foreign)}
                  disabled={pair.matched}
                >
                  {pair.foreign}
                </Button>
              ))}
            </div>

            {/* Правая колонка - переводы */}
            <div className="space-y-3">
              {shuffledTranslations.map((translation, index) => {
                const pair = pairs.find(p => p.translation === translation)
                const isMatched = pair?.matched || false

                return (
                  <Button
                    key={index}
                    variant={isMatched ? 'secondary' : selectedTranslation === translation ? 'default' : 'outline'}
                    className={`w-full h-auto py-4 text-lg ${
                      isMatched ? 'opacity-50 cursor-not-allowed' : ''
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

          {allMatched && (
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleNext} className="gap-2">
                {currentBatch < totalBatches - 1 ? 'Следующая группа' : 'Завершить'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentBatch + 1) / totalBatches) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

