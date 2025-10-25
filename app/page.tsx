'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, Languages, PlusCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Flash Cards
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Изучайте иностранные слова эффективно и легко
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-6 h-6 text-blue-600" />
                Управление словами
              </CardTitle>
              <CardDescription>
                Добавляйте новые слова, просматривайте переводы и управляйте своим словарем
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/words">
                <Button className="w-full" size="lg">
                  Перейти к словам
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Тренировки
              </CardTitle>
              <CardDescription>
                4 этапа тренировки для эффективного запоминания слов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/training">
                <Button className="w-full" size="lg" variant="secondary">
                  Начать тренировку
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Этапы обучения
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этап 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Просмотр слова с озвучкой и переводом
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этап 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Выбор правильного перевода из 4 вариантов
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этап 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Сопоставление иностранного и русского слова
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этап 4</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Составление слова из букв
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-white/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Поддерживаемые языки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">🇬🇧</div>
                  <p className="font-semibold">Английский</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🇪🇸</div>
                  <p className="font-semibold">Испанский</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

