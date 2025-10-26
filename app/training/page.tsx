'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { Stage1Training } from '@/components/training/stage1'
import { Stage2Training } from '@/components/training/stage2'
import { Stage3Training } from '@/components/training/stage3'
import { Stage4Training } from '@/components/training/stage4'
import { useToast } from '@/hooks/use-toast'

type Language = {
  id: string
  code: string
  name: string
}

type Word = {
  id: string
  foreignWord: string
  translation: string
  language: Language
  status: 'NOT_LEARNED' | 'LEARNED'
  examples: string[]
}

export default function TrainingPage() {
  const [words, setWords] = useState<Word[]>([])
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [trainingWords, setTrainingWords] = useState<Word[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchWords()
  }, [])

  useEffect(() => {
    filterTrainingWords()
  }, [words, selectedLanguage])

  const fetchWords = async () => {
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

  const filterTrainingWords = () => {
    let filtered = words.filter(w => w.status === 'NOT_LEARNED')

    if (selectedLanguage !== 'ALL') {
      filtered = filtered.filter(word => word.language.code === selectedLanguage)
    }

    setTrainingWords(filtered)
  }

  const handleStageComplete = () => {
    toast({
      title: 'Этап завершен!',
      description: `Вы завершили этап ${currentStage}`,
    })
  }

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

    switch (currentStage) {
      case 1:
        return <Stage1Training words={trainingWords} onComplete={handleStageComplete} />
      case 2:
        return <Stage2Training words={trainingWords} onComplete={handleStageComplete} />
      case 3:
        return <Stage3Training words={trainingWords} onComplete={handleStageComplete} />
      case 4:
        return <Stage4Training words={trainingWords} onComplete={handleStageComplete} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Тренировка</h1>

        <div className="flex gap-4 mb-8">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Выберите язык" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все языки</SelectItem>
              <SelectItem value="en">🇬🇧 Английский</SelectItem>
              <SelectItem value="es">🇪🇸 Испанский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((stage) => (
            <Card
              key={stage}
              className={`cursor-pointer transition-all ${
                currentStage === stage
                  ? 'ring-2 ring-purple-600 bg-purple-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentStage(stage)}
            >
              <CardHeader>
                <CardTitle className="text-center">Этап {stage}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-center text-gray-600">
                  {stage === 1 && 'Просмотр + озвучка'}
                  {stage === 2 && 'Выбор перевода'}
                  {stage === 3 && 'Сопоставление'}
                  {stage === 4 && 'Составление слова'}
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
      </div>
    </div>
  )
}

