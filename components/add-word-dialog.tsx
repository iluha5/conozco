'use client'

import { useState } from 'react'
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
import { PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type TranslationVariant = {
  translation: string
  examples: string[]
  frequency?: string
}

type AddWordDialogProps = {
  onWordAdded: () => void
}

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false)
  const [languageCode, setLanguageCode] = useState<'en' | 'es'>('en')
  const [foreignWord, setForeignWord] = useState('')
  const [translations, setTranslations] = useState<TranslationVariant[]>([])
  const [selectedTranslation, setSelectedTranslation] = useState<string>('')
  const [customTranslation, setCustomTranslation] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!foreignWord.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите слово для поиска',
        variant: 'destructive',
      })
      return
    }

    setSearching(true)
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: foreignWord,
          languageCode,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTranslations(data.translations.slice(0, 5)) // Берем максимум 5 переводов
        if (data.translations.length > 0) {
          setSelectedTranslation(data.translations[0].translation)
        }
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось получить переводы',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error searching translations:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить переводы',
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }

  const handleAddWord = async () => {
    const finalTranslation = customTranslation.trim() || selectedTranslation

    if (!foreignWord.trim() || !finalTranslation) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const selectedVariant = translations.find(t => t.translation === selectedTranslation)
      const examples = selectedVariant?.examples || []

      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foreignWord: foreignWord.trim(),
          translation: finalTranslation,
          languageCode,
          examples,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Слово добавлено в словарь',
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
    setForeignWord('')
    setTranslations([])
    setSelectedTranslation('')
    setCustomTranslation('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusCircle className="w-4 h-4 mr-2" />
          Добавить слово
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новое слово</DialogTitle>
          <DialogDescription>
            Введите иностранное слово и получите варианты переводов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                <SelectItem value="en">🇬🇧 Английский</SelectItem>
                <SelectItem value="es">🇪🇸 Испанский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Иностранное слово</label>
            <div className="flex gap-2">
              <Input
                placeholder="Введите слово..."
                value={foreignWord}
                onChange={(e) => setForeignWord(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Поиск'
                )}
              </Button>
            </div>
          </div>

          {translations.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Варианты переводов (выберите один)
              </label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {translations.map((variant, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedTranslation === variant.translation
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTranslation(variant.translation)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {variant.translation}
                        {variant.frequency && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({variant.frequency})
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    {variant.examples.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="text-sm text-gray-600 space-y-1">
                          {variant.examples.slice(0, 2).map((example, idx) => (
                            <div key={idx} className="italic">
                              • {example}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Или введите свой перевод
            </label>
            <Input
              placeholder="Ваш вариант перевода..."
              value={customTranslation}
              onChange={(e) => setCustomTranslation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleAddWord} disabled={loading}>
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

