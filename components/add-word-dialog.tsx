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
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, Loader2, Search } from 'lucide-react'
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
    sentenceType?: {
      id: number
      code: string
      displayName: string
      isNegative: boolean
      isQuestion: boolean
    }
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
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const { toast } = useToast()

  // Поиск слов при изменении параметров
  useEffect(() => {
    if (open) {
      // Сброс и загрузка при изменении языка или поиска
      setOffset(0)
      setAvailableWords([])
      setHasMore(true)
      handleSearch(0, true)
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

  const getLanguageFlag = (languageCode: string) => {
    return languageCode === 'en' ? '🇬🇧' : '🇪🇸'
  }

  const getPartOfSpeechAbbrev = (displayName: string) => {
    const abbreviations: { [key: string]: string } = {
      'существительное': 'сущ',
      'глагол': 'гл',
      'прилагательное': 'пр',
      'наречие': 'нар',
      'местоимение': 'мест',
      'предлог': 'пред',
      'союз': 'союз',
      'частица': 'част',
      'междометие': 'межд',
      'noun': 'n',
      'verb': 'v',
      'adjective': 'adj',
      'adverb': 'adv',
      'pronoun': 'pron',
      'preposition': 'prep',
      'conjunction': 'conj',
      'particle': 'part',
      'interjection': 'int',
    }
    return abbreviations[displayName.toLowerCase()] || displayName.substring(0, 3)
  }

  const handleSearch = async (currentOffset: number = offset, isNewSearch: boolean = false) => {
    if (isNewSearch) {
      setSearching(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        languageCode,
        limit: '30',
        offset: currentOffset.toString()
      })

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }

      const response = await fetch(`/api/base-words?${params}`)

      if (response.ok) {
        const words = await response.json()

        // Если это новый поиск, заменяем слова, иначе добавляем
        if (isNewSearch) {
          setAvailableWords(words)
        } else {
          setAvailableWords(prev => [...prev, ...words])
        }

        // Если получили меньше 30 слов, значит больше нет
        setHasMore(words.length === 30)
        setOffset(currentOffset + words.length)
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
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    handleSearch(offset, false)
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
        setSelectedWords([])
        onWordAdded()
        // Обновляем список слов, не закрывая попап
        handleSearch(0, true)
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
    setOffset(0)
    setHasMore(true)
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusCircle className="w-4 h-4 mr-2" />
          Добавить слово
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Добавить слово из словаря</DialogTitle>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllWords}
                  disabled={searching || availableWords.filter(w => !w.isAddedByUser).length === 0}
                >
                  Выбрать все
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllWords}
                  disabled={searching || selectedWords.length === 0}
                >
                  Отменить выбор
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] overflow-y-auto border rounded-md p-3 bg-gray-50">
                {searching && availableWords.length === 0 ? (
                  // Скелетон во время загрузки
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gray-300 rounded shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </>
                ) : availableWords.filter(word => !word.isAddedByUser).length > 0 ? (
                  availableWords.filter(word => !word.isAddedByUser).map((word) => (
                    <Card
                      key={word.id}
                      className={`transition-all cursor-pointer ${
                        isWordSelected(word.id)
                          ? 'ring-2 ring-primary bg-blue-50'
                          : 'hover:bg-gray-50 bg-white'
                      }`}
                      onClick={() => toggleWordSelection(word.id)}
                    >
                      <CardHeader className="pb-2 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={isWordSelected(word.id)}
                              onChange={() => {}} // отключаем прямое взаимодействие с чекбоксом
                              className="shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                <span className="truncate">{word.word}</span>
                                <span className="text-sm shrink-0">{getLanguageFlag(word.language.code)}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                  {getPartOfSpeechAbbrev(word.partOfSpeech.displayName)}
                                </span>
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                <span className="truncate text-sm text-gray-500">
                                  {word.translations.length > 0
                                    ? word.translations[0].translation
                                    : 'Нет перевода'}
                                </span>
                                {word.translations.length > 1 && (
                                  <span className="text-xs text-gray-400 shrink-0">
                                    (+{word.translations.length - 1})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center text-gray-500">
                    Слова не найдены
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={searching || loadingMore || !hasMore}
                  className={!hasMore && availableWords.length > 0 ? 'invisible' : ''}
                >
                  Показать еще
                </Button>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter className="flex-row justify-end space-x-2">
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

