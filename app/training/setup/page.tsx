'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  getTrainingSettings,
  saveTrainingSettings,
  getStage1Settings,
  saveStage1Settings,
  getStage4Settings,
  saveStage4Settings,
  getStage5Settings,
  saveStage5Settings,
  type Stage1Settings,
  type Stage4Settings,
  type Stage5Settings
} from '@/lib/training-settings'

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
  const { data: session } = useSession()
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [enabledStages, setEnabledStages] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]))
  const [words, setWords] = useState<Word[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [visibleWordsCount, setVisibleWordsCount] = useState(12)
  const [showStagesSettings, setShowStagesSettings] = useState(false)
  const [isInitialSelection, setIsInitialSelection] = useState(true)
  const [showStage1Settings, setShowStage1Settings] = useState(false)
  const [showStage4Settings, setShowStage4Settings] = useState(false)
  const [showStage5Settings, setShowStage5Settings] = useState(false)
  const [stage1Settings, setStage1Settings] = useState<Stage1Settings>({ showExamples: false })
  const [stage4Settings, setStage4Settings] = useState<Stage4Settings>({ difficulty: 'easy' })
  const [stage5Settings, setStage5Settings] = useState<Stage5Settings>({ sentencesPerWord: 1 })
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.id) {
      loadSettings()
    }
    fetchWords()
  }, [session])

  useEffect(() => {
    // Сохраняем только после того, как настройки загружены
    if (session?.user?.id && settingsLoaded) {
      saveSettings()
    }
  }, [enabledStages, selectedWords, session, settingsLoaded])

  useEffect(() => {
    // Когда слова загружены, выбираем первые 12 по умолчанию (только при первой загрузке)
    if (words.length > 0 && selectedWords.size === 0 && isInitialSelection) {
      const first12Words = words.slice(0, 12).map(word => word.id)
      setSelectedWords(new Set(first12Words))
      setIsInitialSelection(false)
    }
  }, [words, selectedWords.size, isInitialSelection])

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
    if (!session?.user?.id) return

    // Загружаем все настройки тренировки
    const allSettings = getTrainingSettings(session.user.id)
    setEnabledStages(new Set(allSettings.enabledStages))
    
    // Загружаем настройки этапов
    setStage1Settings(allSettings.stage1)
    setStage4Settings(allSettings.stage4)
    setStage5Settings(allSettings.stage5)

    // Для обратной совместимости - проверяем старые ключи
    const savedWords = localStorage.getItem(`training_${session.user.id}_selected-words`)
    if (savedWords) {
      try {
        const words = JSON.parse(savedWords)
        setSelectedWords(new Set(words))
      } catch (error) {
        console.error('Error loading selected words:', error)
      }
    }

    // Отмечаем что настройки загружены
    setSettingsLoaded(true)
  }

  const saveSettings = () => {
    if (!session?.user?.id) return

    // Сохраняем выбранные этапы
    const allSettings = getTrainingSettings(session.user.id)
    saveTrainingSettings(session.user.id, {
      ...allSettings,
      enabledStages: [...enabledStages]
    })

    // Сохраняем выбранные слова
    localStorage.setItem(`training_${session.user.id}_selected-words`, JSON.stringify([...selectedWords]))
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

  // Обработчики изменения настроек этапов
  const handleStage1SettingsChange = (newSettings: Stage1Settings) => {
    if (!session?.user?.id) return
    setStage1Settings(newSettings)
    saveStage1Settings(session.user.id, newSettings)
    setShowStage1Settings(false)
  }

  const handleStage4SettingsChange = (newSettings: Stage4Settings) => {
    if (!session?.user?.id) return
    setStage4Settings(newSettings)
    saveStage4Settings(session.user.id, newSettings)
    setShowStage4Settings(false)
  }

  const handleStage5SettingsChange = (newSettings: Stage5Settings) => {
    if (!session?.user?.id) return
    setStage5Settings(newSettings)
    saveStage5Settings(session.user.id, newSettings)
    setShowStage5Settings(false)
  }

  const startTraining = () => {
    if (!session?.user?.id) return

    // Сохраняем выбранный язык и выбранные слова с userId
    localStorage.setItem(`training_${session.user.id}_selected-language`, selectedLanguage)
    localStorage.setItem(`training_${session.user.id}_selected-words`, JSON.stringify([...selectedWords]))

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
                            if (stage === 1) setShowStage1Settings(true)
                            if (stage === 4) setShowStage4Settings(true)
                            if (stage === 5) setShowStage5Settings(true)
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
        isOpen={showStage1Settings}
        onClose={() => setShowStage1Settings(false)}
        settings={stage1Settings}
        onChange={handleStage1SettingsChange}
      />
      <Stage4SettingsModal
        isOpen={showStage4Settings}
        onClose={() => setShowStage4Settings(false)}
        settings={stage4Settings}
        onChange={handleStage4SettingsChange}
      />
      <Stage5SettingsModal
        isOpen={showStage5Settings}
        onClose={() => setShowStage5Settings(false)}
        settings={stage5Settings}
        onChange={handleStage5SettingsChange}
      />
    </div>
  )
}
