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
import { PlusCircle, Loader2, Search, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PartOfSpeech } from '@prisma/client'

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

type AddWordDialogProps = {
  onWordAdded: () => void
}

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false)
  const [languageCode, setLanguageCode] = useState<'en' | 'es'>('es')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWord, setSelectedWord] = useState<BaseWord | null>(null)
  const [customTranslation, setCustomTranslation] = useState('')
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

  const handleAddWord = async () => {
    if (!selectedWord) {
      toast({
        title: 'Ошибка',
        description: 'Выберите слово для добавления',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseWordId: selectedWord.id,
          customTranslation: customTranslation.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Слово добавлено в ваш словарь',
        })
        resetForm()
        setOpen(false)
        onWordAdded()
      } else {
        const data = await response.json()
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить слово',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding word:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить слово',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedWord(null)
    setCustomTranslation('')
    setAvailableWords([])
  }

  const getPartOfSpeechLabel = (pos: PartOfSpeech) => {
    const labels = {
      [PartOfSpeech.NOUN]: 'сущ.',
      [PartOfSpeech.VERB]: 'гл.',
      [PartOfSpeech.ADJECTIVE]: 'прил.',
      [PartOfSpeech.ADVERB]: 'нареч.',
      [PartOfSpeech.PRONOUN]: 'мест.',
      [PartOfSpeech.PREPOSITION]: 'предл.',
      [PartOfSpeech.CONJUNCTION]: 'союз',
      [PartOfSpeech.INTERJECTION]: 'межд.',
    }
    return labels[pos] || pos
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
            <label className="text-sm font-medium">
              Доступные слова {searching && <Loader2 className="w-4 h-4 animate-spin inline ml-2" />}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {availableWords.map((word) => (
                <Card
                  key={word.id}
                  className={`cursor-pointer transition-all ${
                    selectedWord?.id === word.id
                      ? 'ring-2 ring-primary bg-blue-50'
                      : 'hover:bg-gray-50'
                  } ${word.isAddedByUser ? 'opacity-60' : ''}`}
                  onClick={() => !word.isAddedByUser && setSelectedWord(word)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {word.word}
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {getPartOfSpeechLabel(word.partOfSpeech)}
                        </span>
                        {word.isAddedByUser && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </CardTitle>
                    </div>
                    {word.translations.length > 0 && (
                      <CardDescription>
                        {word.translations[0].translation}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {word.examples.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="text-sm text-gray-600 space-y-1">
                        {word.examples.slice(0, 2).map((example, idx) => (
                          <div key={idx} className="italic">
                            • {example.example} - {example.translation}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            {availableWords.length === 0 && !searching && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm.length >= 2 ? 'Слова не найдены' : 'Введите минимум 2 символа для поиска'}
              </div>
            )}
          </div>

          {/* Кастомный перевод */}
          {selectedWord && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ваш вариант перевода (необязательно)
              </label>
              <Input
                placeholder={`Перевод для "${selectedWord.word}"...`}
                value={customTranslation}
                onChange={(e) => setCustomTranslation(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Оставьте пустым, если хотите использовать перевод из словаря
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleAddWord}
            disabled={loading || !selectedWord}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Добавление...
              </>
            ) : (
              'Добавить слово'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

