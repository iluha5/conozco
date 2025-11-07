'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { Stage1Training } from '@/components/training/stage1'
import { Stage2Training } from '@/components/training/stage2'
import { Stage3Training } from '@/components/training/stage3'
import { Stage4Training } from '@/components/training/stage4'
import { Stage5Training } from '@/components/training/stage5'
import { Stage6Training } from '@/components/training/stage6'
import { WordsList } from '@/components/words-list'
import { useToast } from '@/hooks/use-toast'
import { getTrainingSettings } from '@/lib/training-settings'

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
    grammaticalExamples: Array<{
      example: string
      translation: string
      pronoun: {
        pronoun: string
      }
      tense: {
        name: string
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
  trainingSessions: Array<{
    id: string
    stage: number
    isCorrect: boolean
    createdAt: string
  }>
}

export default function TrainingPage() {
  const { data: session } = useSession()
  const [words, setWords] = useState<Word[]>([])
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [trainingWords, setTrainingWords] = useState<Word[]>([])
  const [enabledStages, setEnabledStages] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]))
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [trainingCompleted, setTrainingCompleted] = useState(false)
  const [completedWords, setCompletedWords] = useState<Word[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.id) {
      loadSettings()
      fetchWords()
    }
  }, [session])

  useEffect(() => {
    filterTrainingWords()
  }, [words, selectedLanguage, selectedWords])

  useEffect(() => {
    // Если текущий этап отключен, переключаемся на первый доступный
    if (!isStageEnabled(currentStage)) {
      const firstEnabled = Array.from(enabledStages).sort()[0]
      if (firstEnabled) {
        setCurrentStage(firstEnabled)
      }
    }
  }, [enabledStages, currentStage])

  const fetchWords = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/words?status=NOT_LEARNED')
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
      setLoading(false)
    }
  }

  const loadSettings = () => {
    if (!session?.user?.id) return

    // Загружаем настройки с userId
    const settings = getTrainingSettings(session.user.id)
    setEnabledStages(new Set(settings.enabledStages))

    const savedLanguage = localStorage.getItem(`training_${session.user.id}_selected-language`)
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }

    const savedWords = localStorage.getItem(`training_${session.user.id}_selected-words`)
    if (savedWords) {
      try {
        const words = JSON.parse(savedWords)
        setSelectedWords(new Set(words))
      } catch (error) {
        console.error('Error loading selected words:', error)
      }
    }
  }

  const isStageEnabled = (stage: number) => enabledStages.has(stage)

  const filterTrainingWords = () => {
    let filtered = words.filter(w => w.status === 'NOT_LEARNED')

    if (selectedLanguage !== 'ALL') {
      filtered = filtered.filter(word => word.language.code === selectedLanguage)
    }

    // Фильтруем по выбранным словам
    if (selectedWords.size > 0) {
      filtered = filtered.filter(word => selectedWords.has(word.id))
    }

    setTrainingWords(filtered)
  }

  const handleStageComplete = async () => {
    const enabledStagesArray = Array.from(enabledStages).sort()
    const currentIndex = enabledStagesArray.indexOf(currentStage)

    if (currentIndex < enabledStagesArray.length - 1) {
      // Есть следующий этап - переключаемся на него
      const nextStage = enabledStagesArray[currentIndex + 1]
      setCurrentStage(nextStage)
    } else {
      // Это последний этап - завершаем тренировку и отмечаем слова как выученные
      // Отмечаем все слова как выученные
      try {
        for (const word of trainingWords) {
          await fetch(`/api/words/${word.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'LEARNED' }),
          })
        }

        // Обновляем список слов для отображения
        const response = await fetch('/api/words')
        if (response.ok) {
          const allWords = await response.json()
          // Фильтруем только те слова которые были в тренировке
          const trainedWordIds = trainingWords.map(w => w.id)
          const learnedWords = allWords.filter((w: Word) => trainedWordIds.includes(w.id))
          setCompletedWords(learnedWords)

          // Показываем зеленый toast с результатами
          toast({
            description: `Выучено слов: ${learnedWords.length}`,
            variant: 'success',
          })
        }

        setTrainingCompleted(true)
      } catch (error) {
        console.error('Error marking words as learned:', error)
        toast({
          title: 'Ошибка',
          description: 'Не удалось отметить слова как выученные',
          variant: 'destructive',
        })
      }
    }
  }

  const handleReloadWords = async () => {
    const response = await fetch('/api/words')
    if (response.ok) {
      const allWords = await response.json()
      const trainedWordIds = trainingWords.map(w => w.id)
      const learnedWords = allWords.filter((w: Word) => trainedWordIds.includes(w.id))
      setCompletedWords(learnedWords)
    }
  }

  const handleStartNewTraining = () => {
    setTrainingCompleted(false)
    setCompletedWords([])
    window.location.href = '/training/setup'
  }

  const renderTrainingScreen = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <Link href="/training/setup">
          <Button variant="outline">
            Начать сначала
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">Тренировка</h1>

      <div className="flex gap-4 mb-6 justify-center flex-wrap">
        {Array.from(enabledStages).sort().map((stage, index) => (
          <Card
            key={stage}
            className={`cursor-pointer transition-all aspect-square flex flex-col justify-center max-w-[120px] ${
              currentStage === stage
                ? 'ring-2 ring-purple-600 bg-purple-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setCurrentStage(stage)}
          >
            <CardHeader className="flex-1 flex items-center justify-center">
              <CardTitle className="text-center">
                <span className="md:hidden text-3xl font-bold">{index + 1}</span>
                <span className="hidden md:inline text-sm">Этап {index + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 hidden md:block">
              <p className="text-xs text-center text-gray-600">
                {stage === 1 && 'Просмотр + озвучка'}
                {stage === 2 && 'Выбор перевода'}
                {stage === 3 && 'Сопоставление'}
                {stage === 4 && 'Составление слова'}
                {stage === 5 && 'Составление предложения'}
                {stage === 6 && 'Составление по голосу'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Загрузка...</p>
        </div>
      ) : (
        renderStage()
      )}
    </>
  )

  const renderStage = () => {
    if (trainingWords.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Нет слов для тренировки. Добавьте слова в словарь!
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/words">
                <Button>Перейти к словам</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!isStageEnabled(currentStage)) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Этап {currentStage} отключен в настройках.
            </p>
          </CardContent>
        </Card>
      )
    }

    switch (currentStage) {
      case 1:
        return <Stage1Training words={trainingWords} onComplete={handleStageComplete} />
      case 2:
        return <Stage2Training words={trainingWords} onComplete={handleStageComplete} />
      case 3:
        return <Stage3Training words={trainingWords} onComplete={handleStageComplete} />
      case 4:
        return <Stage4Training words={trainingWords} onComplete={handleStageComplete} />
      case 5:
        return <Stage5Training words={trainingWords} onComplete={handleStageComplete} />
      case 6:
        return <Stage6Training words={trainingWords} onComplete={handleStageComplete} />
      default:
        return null
    }
  }

  const renderResultsScreen = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Главная
          </Button>
        </Link>
        <Button onClick={handleStartNewTraining}>
          Новая тренировка
        </Button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Тренировка завершена!</h1>
        <p className="text-md text-gray-600">
          Все слова отмечены как выученные. Вы можете изменить их статус ниже.
        </p>
      </div>

      <WordsList
        words={completedWords}
        onWordsChange={handleReloadWords}
        showBulkActions={true}
        emptyMessage="Слова не найдены"
      />
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {trainingCompleted ? renderResultsScreen() : renderTrainingScreen()}
      </div>
    </div>
  )
}

