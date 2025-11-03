'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, Loader2, Search, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type PartOfSpeech = {
  id: string
  name: string
  displayName: string
}

type BaseWord = {
  id: string
  word: string
  partOfSpeech: PartOfSpeech
  language: {
    code: string
    name: string
  }
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
    isNegative?: boolean
    isQuestion?: boolean
  }>
  isAddedByUser: boolean
}

type SelectedWord = string // просто baseWordId

type AddWordDialogProps = {
  onWordAdded: () => void
}

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false)
  const [languageCode, setLanguageCode] = useState<'en' | 'es'>('es')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [availableWords, setAvailableWords] = useState<BaseWord[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const { toast } = useToast()

  // Поиск слов при изменении параметров
  useEffect(() => {
    if (open && (searchTerm.length >= 2 || !searchTerm)) {
      handleSearch()
    }
  }, [languageCode, searchTerm, open])

  // Функции для работы с выбранными словами
  const toggleWordSelection = (baseWordId: string) => {
    setSelectedWords(prev =>
      prev.includes(baseWordId)
        ? prev.filter(id => id !== baseWordId)
        : [...prev, baseWordId]
    )
  }

  const selectAllWords = () => {
    const newSelections = availableWords
      .filter(word => !word.isAddedByUser) // только не добавленные пользователем
      .map(word => word.id)
    setSelectedWords(newSelections)
  }

  const deselectAllWords = () => {
    setSelectedWords([])
  }

  const isWordSelected = (baseWordId: string) => {
    return selectedWords.includes(baseWordId)
  }

  const handleSearch = async () => {
    setSearching(true)
    try {
      const params = new URLSearchParams({
        languageCode,
        limit: '20'
      })

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }

      const response = await fetch(`/api/base-words?${params}`)

      if (response.ok) {
        const words = await response.json()
        setAvailableWords(words)
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить слова',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error searching words:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить слова',
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }

  const handleAddWords = async () => {
    if (selectedWords.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите слова для добавления',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    try {
      // Добавляем слова по одному
      for (const baseWordId of selectedWords) {
        const wordData = availableWords.find(w => w.id === baseWordId)
        if (!wordData) continue

        const response = await fetch('/api/words', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            baseWordId: baseWordId,
            // Используем первый (самый популярный) перевод
            customTranslation: wordData.translations[0]?.translation || undefined,
          }),
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
          console.error('Error adding word:', baseWordId)
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Успешно',
          description: `Добавлено ${successCount} слов${errorCount > 0 ? `, ${errorCount} ошибок` : ''}`,
        })
        resetForm()
        setOpen(false)
        onWordAdded()
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось добавить ни одного слова',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding words:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить слова',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedWords([])
    setAvailableWords([])
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusCircle className="w-4 h-4 mr-2" />
          Добавить слово
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить слово из словаря</DialogTitle>
          <DialogDescription>
            Выберите слово из нашей базы данных и добавьте его в свой словарь
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Язык</label>
              <Select
                value={languageCode}
                onValueChange={(value: 'en' | 'es') => setLanguageCode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Испанский</SelectItem>
                  <SelectItem value="en">🇬🇧 Английский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Поиск слова</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Введите слово для поиска..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Список доступных слов */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Доступные слова {searching && <Loader2 className="w-4 h-4 animate-spin inline ml-2" />}
              </label>
              {availableWords.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllWords}
                    disabled={availableWords.every(w => w.isAddedByUser)}
                  >
                    Выбрать все
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllWords}
                    disabled={selectedWords.length === 0}
                  >
                    Отменить выбор
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {availableWords.map((word) => (
                <Card
                  key={word.id}
                  className={`transition-all cursor-pointer ${
                    isWordSelected(word.id)
                      ? 'ring-2 ring-primary bg-blue-50'
                      : 'hover:bg-gray-50'
                  } ${word.isAddedByUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !word.isAddedByUser && toggleWordSelection(word.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isWordSelected(word.id)}
                          onChange={() => {}} // отключаем прямое взаимодействие с чекбоксом
                          disabled={word.isAddedByUser}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                            <span className="truncate">{word.word}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                              {word.partOfSpeech.displayName}
                            </span>
                            {word.isAddedByUser && (
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                          </CardTitle>
                          {word.translations.length > 0 && (
                            <CardDescription className="truncate">
                              {word.translations[0].translation}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            {availableWords.length === 0 && !searching && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm.length >= 2 ? 'Слова не найдены' : 'Введите минимум 2 символа для поиска'}
              </div>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleAddWords}
            disabled={loading || selectedWords.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Добавление...
              </>
            ) : (
              `Добавить ${selectedWords.length} ${selectedWords.length === 1 ? 'слово' : 'слов'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

