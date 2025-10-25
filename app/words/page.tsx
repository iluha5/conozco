'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { AddWordDialog } from '@/components/add-word-dialog'
import { useToast } from '@/hooks/use-toast'

type Word = {
  id: string
  foreignWord: string
  translation: string
  language: 'ENGLISH' | 'SPANISH'
  status: 'NOT_LEARNED' | 'LEARNED'
  examples: string[]
  createdAt: string
}

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([])
  const [filteredWords, setFilteredWords] = useState<Word[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchWords()
  }, [])

  useEffect(() => {
    filterWords()
  }, [words, selectedLanguage, selectedStatus])

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/words')
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

  const filterWords = () => {
    let filtered = words

    if (selectedLanguage !== 'ALL') {
      filtered = filtered.filter(word => word.language === selectedLanguage)
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(word => word.status === selectedStatus)
    }

    setFilteredWords(filtered)
  }

  const handleAddWord = async () => {
    await fetchWords()
  }

  const handleDeleteWord = async (id: string) => {
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Слово удалено',
        })
        await fetchWords()
      }
    } catch (error) {
      console.error('Error deleting word:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить слово',
        variant: 'destructive',
      })
    }
  }

  const handleToggleStatus = async (word: Word) => {
    try {
      const newStatus = word.status === 'LEARNED' ? 'NOT_LEARNED' : 'LEARNED'
      const response = await fetch(`/api/words/${word.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: `Слово помечено как ${newStatus === 'LEARNED' ? 'выученное' : 'невыученное'}`,
        })
        await fetchWords()
      }
    } catch (error) {
      console.error('Error updating word:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус слова',
        variant: 'destructive',
      })
    }
  }

  const getLanguageLabel = (language: string) => {
    return language === 'ENGLISH' ? '🇬🇧 Английский' : '🇪🇸 Испанский'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Мои слова</h1>
          <AddWordDialog onWordAdded={handleAddWord} />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Всего слов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{words.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Не выучено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {words.filter(w => w.status === 'NOT_LEARNED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Выучено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {words.filter(w => w.status === 'LEARNED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Выберите язык" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все языки</SelectItem>
              <SelectItem value="ENGLISH">🇬🇧 Английский</SelectItem>
              <SelectItem value="SPANISH">🇪🇸 Испанский</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все статусы</SelectItem>
              <SelectItem value="NOT_LEARNED">Не выучено</SelectItem>
              <SelectItem value="LEARNED">Выучено</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                Слова не найдены. Добавьте новое слово!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <Card key={word.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-1">
                        {word.foreignWord}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {word.translation}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {getLanguageLabel(word.language)}
                    </div>
                    {word.examples.length > 0 && (
                      <div className="text-sm text-gray-500 italic">
                        {word.examples[0]}
                      </div>
                    )}
                    <Button
                      variant={word.status === 'LEARNED' ? 'secondary' : 'default'}
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleToggleStatus(word)}
                    >
                      {word.status === 'LEARNED' ? 'Отметить как невыученное' : 'Отметить как выученное'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

