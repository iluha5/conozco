'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { ArrowLeft, Trash2, CheckCircle, CheckCircle2, X } from 'lucide-react'
import { AddWordDialog } from '@/components/add-word-dialog'
import { useToast } from '@/hooks/use-toast'

type Language = {
  id: number
  code: string
  name: string
}

type Word = {
  id: number
  userId: number
  baseWordId?: number
  customWord?: string
  customTranslation?: string
  languageId: number
  language: Language
  status: 'NOT_LEARNED' | 'LEARNED'
  createdAt: string
  updatedAt: string
  baseWord?: {
    id: number
    word: string
    partOfSpeech: {
      id: number
      name: string
      displayName: string
    }
    languageId: number
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

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([])
  const [filteredWords, setFilteredWords] = useState<Word[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED')
  const [selectedWords, setSelectedWords] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
    fetchWords()
  }, [])

  useEffect(() => {
    filterWords()
  }, [words, selectedLanguage, selectedStatus])

  useEffect(() => {
    // Сбрасываем выделение при изменении фильтров
    setSelectedWords([])
  }, [filteredWords])

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
      filtered = filtered.filter(word => word.language.code === selectedLanguage)
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(word => word.status === selectedStatus)
    }

    setFilteredWords(filtered)
  }

  const handleAddWord = async () => {
    await fetchWords()
  }

  const handleDeleteWord = async (id: number) => {
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Слово удалено',
          variant: 'success',
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
          variant: 'success',
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

  // Функции для работы с выбранными словами
  const toggleWordSelection = (wordId: number) => {
    setSelectedWords(prev =>
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    )
  }

  const selectAllWords = () => {
    setSelectedWords(filteredWords.map(word => word.id))
  }

  const deselectAllWords = () => {
    setSelectedWords([])
  }

  const isWordSelected = (wordId: number) => {
    return selectedWords.includes(wordId)
  }

  const handleBulkStatusChange = async (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
    if (selectedWords.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите слова для изменения статуса',
        variant: 'destructive',
      })
      return
    }

    let successCount = 0
    let errorCount = 0

    try {
      for (const wordId of selectedWords) {
        const response = await fetch(`/api/words/${wordId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Успешно',
          description: `${successCount} слов ${newStatus === 'LEARNED' ? 'отмечено как выученные' : 'отмечено как невыученные'}${errorCount > 0 ? `, ${errorCount} ошибок` : ''}`,
          variant: 'success',
        })
        setSelectedWords([])
        await fetchWords()
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось изменить статус ни одного слова',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating words status:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус слов',
        variant: 'destructive',
      })
    }
  }

  const getLanguageFlag = (language: Language) => {
    return language.code === 'en' ? '🇬🇧' : '🇪🇸'
  }

  const getLanguageLabel = (language: Language) => {
    return language.code === 'en' ? '🇬🇧 Английский' : '🇪🇸 Испанский'
  }


  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <SelectItem value="en">🇬🇧 Английский</SelectItem>
              <SelectItem value="es">🇪🇸 Испанский</SelectItem>
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
          <div className="space-y-4">
            {/* Кнопки массового управления */}
            {filteredWords.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllWords}
                    disabled={selectedWords.length === filteredWords.length}
                  >
                    Выделить все
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllWords}
                    disabled={selectedWords.length === 0}
                  >
                    Отменить выделение
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleBulkStatusChange('LEARNED')}
                    disabled={selectedWords.length === 0}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Выучено ({selectedWords.length})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkStatusChange('NOT_LEARNED')}
                    disabled={selectedWords.length === 0}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Не выучено ({selectedWords.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Список слов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
              {filteredWords.map((word) => (
                <Card
                  key={word.id}
                  className={`transition-all cursor-pointer ${
                    isWordSelected(word.id)
                      ? 'ring-2 ring-primary bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleWordSelection(word.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isWordSelected(word.id)}
                          onChange={() => {}} // отключаем прямое взаимодействие с чекбоксом
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                            <span className="truncate">{word.baseWord?.word || word.customWord}</span>
                            <span className="text-sm shrink-0">{getLanguageFlag(word.language)}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                              {word.baseWord?.partOfSpeech?.displayName || 'Слово'}
                            </span>
                          </CardTitle>
                          <CardDescription className="truncate">
                            {word.customTranslation ||
                             (word.baseWord?.translations && word.baseWord.translations.length > 0
                               ? word.baseWord.translations[0].translation
                               : 'Нет перевода')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(word)
                          }}
                        >
                          {word.status === 'LEARNED' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteWord(word.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

