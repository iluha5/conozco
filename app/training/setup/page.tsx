'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

export default function TrainingSetupPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [enabledStages, setEnabledStages] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]))
  const [words, setWords] = useState<Word[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [visibleWordsCount, setVisibleWordsCount] = useState(12)
  const [showStagesSettings, setShowStagesSettings] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadSettings()
    fetchWords()
  }, [])

  useEffect(() => {
    saveSettings()
  }, [enabledStages, selectedWords])

  useEffect(() => {
    // Когда слова загружены, выбираем первые 12 по умолчанию
    if (words.length > 0 && selectedWords.size === 0) {
      const first12Words = words.slice(0, 12).map(word => word.id)
      setSelectedWords(new Set(first12Words))
    }
  }, [words, selectedWords.size])

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/words?status=NOT_LEARNED&limit=120')
      if (response.ok) {
        const data = await response.json()
        setWords(data)
      }
    } catch (error) {
      console.error('Error fetching words:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить слова',
        variant: 'destructive',
      })
    }
  }

  const loadSettings = () => {
    const savedStages = localStorage.getItem('training-enabled-stages')
    if (savedStages) {
      try {
        const stages = JSON.parse(savedStages)
        setEnabledStages(new Set(stages))
      } catch (error) {
        console.error('Error loading stages:', error)
      }
    }

    const savedWords = localStorage.getItem('training-selected-words')
    if (savedWords) {
      try {
        const words = JSON.parse(savedWords)
        setSelectedWords(new Set(words))
      } catch (error) {
        console.error('Error loading selected words:', error)
      }
    }
  }

  const saveSettings = () => {
    localStorage.setItem('training-enabled-stages', JSON.stringify([...enabledStages]))
    localStorage.setItem('training-selected-words', JSON.stringify([...selectedWords]))
  }

  const toggleWord = (wordId: string) => {
    setSelectedWords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(wordId)) {
        newSet.delete(wordId)
      } else {
        newSet.add(wordId)
      }
      return newSet
    })
  }

  const loadMoreWords = () => {
    setVisibleWordsCount(prev => Math.min(prev + 12, 120))
  }

  const selectAllVisible = () => {
    const visibleWordIds = words.slice(0, visibleWordsCount).map(word => word.id)
    setSelectedWords(prev => new Set([...prev, ...visibleWordIds]))
  }

  const deselectAll = () => {
    const visibleWordIds = words.slice(0, visibleWordsCount).map(word => word.id)
    setSelectedWords(prev => {
      const newSet = new Set(prev)
      visibleWordIds.forEach(id => newSet.delete(id))
      return newSet
    })
  }

  const isWordSelected = (wordId: string) => selectedWords.has(wordId)

  const toggleStage = (stage: number) => {
    setEnabledStages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stage)) {
        // Не позволяем отключить последний этап
        if (newSet.size > 1) {
          newSet.delete(stage)
        } else {
          toast({
            title: 'Ошибка',
            description: 'Должен быть выбран хотя бы один этап тренировки',
            variant: 'destructive',
          })
        }
      } else {
        newSet.add(stage)
      }
      return newSet
    })
  }

  const isStageEnabled = (stage: number) => enabledStages.has(stage)

  const startTraining = () => {
    // Сохраняем выбранный язык и выбранные слова
    localStorage.setItem('training-selected-language', selectedLanguage)
    localStorage.setItem('training-selected-words', JSON.stringify([...selectedWords]))

    if (selectedWords.size === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одно слово для тренировки',
        variant: 'destructive',
      })
      return
    }

    // Переходим на страницу тренировки
    router.push('/training')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Настройка тренировки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Выбор языка */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Выберите язык для тренировки</h3>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все языки</SelectItem>
                    <SelectItem value="en">🇬🇧 Английский</SelectItem>
                    <SelectItem value="es">🇪🇸 Испанский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор слов */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Выберите слова для тренировки ({selectedWords.size} выбрано)
                </h3>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={selectAllVisible}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Выбрать все
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Снять выделение
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {words.slice(0, visibleWordsCount).map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => toggleWord(word.id)}
                    >
                      <Checkbox
                        id={`word-${word.id}`}
                        checked={isWordSelected(word.id)}
                        onChange={() => {}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium truncate">
                            {word.baseWord?.word || word.customWord}
                          </span>
                          <span className="text-xs text-gray-500">→</span>
                          <span className="text-sm text-purple-600 truncate">
                            {word.customTranslation ||
                             (word.baseWord?.translations && word.baseWord.translations.length > 0
                               ? word.baseWord.translations[0].translation
                               : 'Нет перевода')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {words.length > visibleWordsCount && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={loadMoreWords}
                        className="w-full"
                      >
                        Показать еще ({Math.min(visibleWordsCount + 12, Math.min(words.length, 120)) - visibleWordsCount} слов)
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Показано {Math.min(visibleWordsCount, words.length)} из {words.length} слов
                </p>
              </div>

              {/* Выбор этапов (свернутый по умолчанию) */}
              <div>
                <button
                  onClick={() => setShowStagesSettings(!showStagesSettings)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold">Выберите этапы тренировки</h3>
                  {showStagesSettings ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {showStagesSettings && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((stage) => (
                    <div
                      key={stage}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleStage(stage)}
                    >
                      <Checkbox
                        id={`setup-stage-${stage}`}
                        checked={isStageEnabled(stage)}
                        onChange={() => {}} // Пустой обработчик, чтобы предотвратить warnings
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium leading-none">
                          Этап {stage}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {stage === 1 && 'Просмотр + озвучка'}
                          {stage === 2 && 'Выбор перевода'}
                          {stage === 3 && 'Сопоставление'}
                          {stage === 4 && 'Составление слова'}
                          {stage === 5 && 'Составление предложения'}
                          {stage === 6 && 'Составление по голосу'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Кнопка начать */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={startTraining}
                  size="lg"
                  className="px-8 py-3 text-lg"
                  disabled={enabledStages.size === 0 || selectedWords.size === 0}
                >
                  Начать тренировку
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
