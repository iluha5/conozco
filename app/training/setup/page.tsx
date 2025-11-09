'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { ArrowLeft, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Stage1SettingsModal, Stage4SettingsModal, Stage5SettingsModal } from '@/components/training/stage-settings'
import {
  useTrainingSettings,
  useTrainingSelection,
  useStage1Settings,
  useStage4Settings,
  useStage5Settings
} from '@/hooks/use-training-settings'
import { useTrainingWords } from '@/contexts/training-words-context'

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
      sentenceType?: {
        id: number
        code: string
        displayName: string
        isNegative: boolean
        isQuestion: boolean
      }
    }>
  }
}

export default function TrainingSetupPage() {
  const { settings: trainingSettings, updateEnabledStages, updateStagesSettingsExpanded, isLoaded: trainingSettingsLoaded, userId } = useTrainingSettings()
  const { selectedLanguage, setSelectedLanguage, isLoaded: selectionLoaded } = useTrainingSelection()
  const { selectedWords, setSelectedWords } = useTrainingWords()
  const { settings: stage1Settings, updateSettings: updateStage1 } = useStage1Settings()
  const { settings: stage4Settings, updateSettings: updateStage4 } = useStage4Settings()
  const { settings: stage5Settings, updateSettings: updateStage5 } = useStage5Settings()
  
  const [words, setWords] = useState<Word[]>([])
  const [visibleWordsCount, setVisibleWordsCount] = useState(12)
  const [isInitialSelection, setIsInitialSelection] = useState(true)
  const [showStage1SettingsModal, setShowStage1SettingsModal] = useState(false)
  const [showStage4SettingsModal, setShowStage4SettingsModal] = useState(false)
  const [showStage5SettingsModal, setShowStage5SettingsModal] = useState(false)
  const [isLoadingWords, setIsLoadingWords] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const enabledStages = trainingSettings ? new Set(trainingSettings.enabledStages) : new Set([1, 2, 3, 4, 5, 6])
  // По умолчанию свернут пока не загрузятся настройки, чтобы избежать "мигания"
  const showStagesSettings = trainingSettingsLoaded ? (trainingSettings?.stagesSettingsExpanded ?? true) : false
  
  const toggleStagesSettings = () => {
    updateStagesSettingsExpanded(!showStagesSettings)
  }

  useEffect(() => {
    fetchWords()
  }, [])

  useEffect(() => {
    // Когда слова загружены, выбираем первые 12 по умолчанию (только при первой загрузке)
    if (words.length > 0 && selectedWords.size === 0 && isInitialSelection) {
      const first12Words = words.slice(0, 12).map(word => word.id)
      setSelectedWords(new Set(first12Words))
      setIsInitialSelection(false)
    }
  }, [words, selectedWords.size, isInitialSelection, setSelectedWords])

  const fetchWords = async () => {
    setIsLoadingWords(true)
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
    } finally {
      setIsLoadingWords(false)
    }
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
    const newSet = new Set(enabledStages)
    if (newSet.has(stage)) {
      // Не позволяем отключить последний этап
      if (newSet.size > 1) {
        newSet.delete(stage)
        updateEnabledStages([...newSet])
      } else {
        toast({
          title: 'Ошибка',
          description: 'Должен быть выбран хотя бы один этап тренировки',
          variant: 'destructive',
        })
      }
    } else {
      newSet.add(stage)
      updateEnabledStages([...newSet])
    }
  }

  const isStageEnabled = (stage: number) => enabledStages.has(stage)

  // Обработчики изменения настроек этапов
  const handleStage1SettingsChange = (newSettings: typeof stage1Settings) => {
    updateStage1(newSettings)
    setShowStage1SettingsModal(false)
  }

  const handleStage4SettingsChange = (newSettings: typeof stage4Settings) => {
    updateStage4(newSettings)
    setShowStage4SettingsModal(false)
  }

  const handleStage5SettingsChange = (newSettings: typeof stage5Settings) => {
    updateStage5(newSettings)
    setShowStage5SettingsModal(false)
  }

  const startTraining = () => {
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
                    disabled={isLoadingWords}
                  >
                    Выбрать все
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    disabled={isLoadingWords}
                  >
                    Снять выделение
                  </button>
                </div>
                <div className="relative border rounded-lg p-4 h-[350px] overflow-y-auto">
                  {isLoadingWords ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600">Загрузка слов...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
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
                  )}
                </div>
                {!isLoadingWords && (
                  <p className="text-xs text-gray-500 mt-2">
                    Показано {Math.min(visibleWordsCount, words.length)} из {words.length} слов
                  </p>
                )}
              </div>

              {/* Настройки этапов тренировки */}
              <div>
                <button
                  onClick={toggleStagesSettings}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold">Настройки этапов тренировки</h3>
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
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`setup-stage-${stage}`}
                        checked={isStageEnabled(stage)}
                        onChange={() => {}} // Пустой обработчик, чтобы предотвратить warnings
                        onClick={() => toggleStage(stage)}
                        className="cursor-pointer"
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => toggleStage(stage)}>
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
                      {(stage === 1 || stage === 4 || stage === 5) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (stage === 1) setShowStage1SettingsModal(true)
                            if (stage === 4) setShowStage4SettingsModal(true)
                            if (stage === 5) setShowStage5SettingsModal(true)
                          }}
                          className="p-2 h-auto shrink-0"
                          title="Настройки этапа"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
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

      {/* Модальные окна настроек этапов */}
      <Stage1SettingsModal
        isOpen={showStage1SettingsModal}
        onClose={() => setShowStage1SettingsModal(false)}
        settings={stage1Settings}
        onChange={handleStage1SettingsChange}
      />
      <Stage4SettingsModal
        isOpen={showStage4SettingsModal}
        onClose={() => setShowStage4SettingsModal(false)}
        settings={stage4Settings}
        onChange={handleStage4SettingsChange}
      />
      <Stage5SettingsModal
        isOpen={showStage5SettingsModal}
        onClose={() => setShowStage5SettingsModal(false)}
        settings={stage5Settings}
        onChange={handleStage5SettingsChange}
      />
    </div>
  )
}
