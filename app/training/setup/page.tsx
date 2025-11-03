'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TrainingSetupPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [enabledStages, setEnabledStages] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]))
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    saveSettings()
  }, [enabledStages])

  const loadSettings = () => {
    const saved = localStorage.getItem('training-enabled-stages')
    if (saved) {
      try {
        const stages = JSON.parse(saved)
        setEnabledStages(new Set(stages))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }

  const saveSettings = () => {
    localStorage.setItem('training-enabled-stages', JSON.stringify([...enabledStages]))
  }

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
    // Сохраняем выбранный язык
    localStorage.setItem('training-selected-language', selectedLanguage)
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

              {/* Выбор этапов */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Выберите этапы тренировки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Кнопка начать */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={startTraining}
                  size="lg"
                  className="px-8 py-3 text-lg"
                  disabled={enabledStages.size === 0}
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
