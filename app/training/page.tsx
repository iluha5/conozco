'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { Stage1Training } from '@/components/training/stage1'
import { Stage2Training } from '@/components/training/stage2'
import { Stage3Training } from '@/components/training/stage3'
import { Stage4Training } from '@/components/training/stage4'
import { Stage5Training } from '@/components/training/stage5'
import { Stage6Training } from '@/components/training/stage6'
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
  trainingSessions: Array<{
    id: string
    stage: number
    isCorrect: boolean
    createdAt: string
  }>
}

export default function TrainingPage() {
  const [words, setWords] = useState<Word[]>([])
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [trainingWords, setTrainingWords] = useState<Word[]>([])
  const [enabledStages, setEnabledStages] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]))
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    fetchWords()
  }, [])

  useEffect(() => {
    filterTrainingWords()
  }, [words, selectedLanguage])

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
    const savedStages = localStorage.getItem('training-enabled-stages')
    if (savedStages) {
      try {
        const stages = JSON.parse(savedStages)
        setEnabledStages(new Set(stages))
      } catch (error) {
        console.error('Error loading stages:', error)
      }
    }

    const savedLanguage = localStorage.getItem('training-selected-language')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }
  }

  const isStageEnabled = (stage: number) => enabledStages.has(stage)

  const filterTrainingWords = () => {
    let filtered = words.filter(w => w.status === 'NOT_LEARNED')

    if (selectedLanguage !== 'ALL') {
      filtered = filtered.filter(word => word.language.code === selectedLanguage)
    }

    setTrainingWords(filtered)
  }

  const handleStageComplete = () => {
    const enabledStagesArray = Array.from(enabledStages).sort()
    const currentIndex = enabledStagesArray.indexOf(currentStage)

    if (currentIndex < enabledStagesArray.length - 1) {
      // Есть следующий этап - переключаемся на него
      const nextStage = enabledStagesArray[currentIndex + 1]
      setCurrentStage(nextStage)

      toast({
        title: 'Этап завершен!',
        description: `Переходим к этапу ${nextStage}`,
      })
    } else {
      // Это последний этап - завершаем тренировку
      toast({
        title: 'Все этапы завершены!',
        description: 'Поздравляем! Вы завершили всю тренировку',
      })

      // Можно добавить редирект на главную страницу через некоторое время
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {renderTrainingScreen()}
      </div>
    </div>
  )
}

