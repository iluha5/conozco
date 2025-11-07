'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, CheckCircle, CheckCircle2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Language = {
  id: string | number
  code: string
  name: string
}

type Word = {
  id: string | number
  userId: string | number
  baseWordId?: string | number
  customWord?: string
  customTranslation?: string
  languageId: string | number
  language: Language
  status: 'NOT_LEARNED' | 'LEARNED'
  createdAt: string
  updatedAt: string
  baseWord?: {
    id: string | number
    word: string
    partOfSpeech: {
      id: string | number
      name: string
      displayName: string
    }
    languageId: string | number
    translations: Array<{
      translation: string
      priority: number
    }>
    examples?: Array<any>
    grammaticalExamples?: Array<any>
  }
  trainingSessions?: Array<any>
}

type WordsListProps = {
  words: Word[]
  onWordsChange?: () => Promise<void>
  showBulkActions?: boolean
  readOnly?: boolean
  emptyMessage?: string
}

export function WordsList({
  words,
  onWordsChange,
  showBulkActions = true,
  readOnly = false,
  emptyMessage = 'Слова не найдены'
}: WordsListProps) {
  const [selectedWords, setSelectedWords] = useState<(string | number)[]>([])
  const [translationSelectorOpen, setTranslationSelectorOpen] = useState<{[key: string | number]: boolean}>({})
  const [translationSelectorPosition, setTranslationSelectorPosition] = useState<{[key: string | number]: {top: number, left: number}}>({})
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Сбрасываем выделение при изменении списка слов
    setSelectedWords([])
  }, [words])

  // Закрываем все открытые translation selectors при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.translation-selector')) {
        setTranslationSelectorOpen({})
        setTranslationSelectorPosition({})
      }
    }

    const handleScroll = () => {
      // При скролле закрываем все открытые dropdown
      setTranslationSelectorOpen({})
      setTranslationSelectorPosition({})
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const handleDeleteWord = async (id: string | number) => {
    if (readOnly) return

    try {
      const response = await fetch(`/api/words/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await onWordsChange?.()
      }
    } catch (error) {
      console.error('Error deleting word:', error)
    }
  }

  const handleToggleStatus = async (word: Word) => {
    if (readOnly) return

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
        await onWordsChange?.()
      }
    } catch (error) {
      console.error('Error updating word:', error)
    }
  }

  const toggleWordSelection = (wordId: string | number) => {
    setSelectedWords(prev =>
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    )
  }

  const selectAllWords = () => {
    setSelectedWords(words.map(word => word.id))
  }

  const deselectAllWords = () => {
    setSelectedWords([])
  }

  const isWordSelected = (wordId: string | number) => {
    return selectedWords.includes(wordId)
  }

  const handleUpdateTranslation = async (wordId: string | number, newTranslation: string) => {
    if (readOnly) return

    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customTranslation: newTranslation }),
      })

      if (response.ok) {
        await onWordsChange?.()
        setTranslationSelectorOpen(prev => ({ ...prev, [wordId]: false }))
        setTranslationSelectorPosition(prev => {
          const newPositions = { ...prev }
          delete newPositions[wordId]
          return newPositions
        })
      }
    } catch (error) {
      console.error('Error updating translation:', error)
    }
  }

  const toggleTranslationSelector = (wordId: string | number, element?: HTMLElement) => {
    if (readOnly) return

    if (element) {
      const rect = element.getBoundingClientRect()
      const dropdownWidth = 200
      const dropdownHeight = 150

      let left = rect.left
      let top = rect.bottom + 4

      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 8
      }

      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 4
      }

      setTranslationSelectorPosition(prev => ({
        ...prev,
        [wordId]: { top, left }
      }))
    }

    setTranslationSelectorOpen(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }))
  }

  const handleBulkStatusChange = async (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
    if (readOnly) return

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
        await onWordsChange?.()
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

  if (words.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Кнопки массового управления */}
      {showBulkActions && words.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllWords}
              disabled={selectedWords.length === words.length || readOnly}
            >
              Выделить все
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAllWords}
              disabled={selectedWords.length === 0 || readOnly}
            >
              Отменить выделение
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleBulkStatusChange('LEARNED')}
              disabled={selectedWords.length === 0 || readOnly}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Выучено ({selectedWords.length})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkStatusChange('NOT_LEARNED')}
              disabled={selectedWords.length === 0 || readOnly}
            >
              <X className="w-4 h-4 mr-2" />
              Не выучено ({selectedWords.length})
            </Button>
          </div>
        </div>
      )}

      {/* Список слов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[600px] overflow-y-auto p-2">
        {words.map((word) => (
          <Card
            key={word.id}
            className={`transition-all ${readOnly ? '' : 'cursor-pointer'} m-1 ${
              isWordSelected(word.id)
                ? 'ring-2 ring-primary bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !readOnly && toggleWordSelection(word.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {!readOnly && (
                    <Checkbox
                      checked={isWordSelected(word.id)}
                      onChange={() => {}}
                      className="shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      <span className="truncate">{word.baseWord?.word || word.customWord}</span>
                      <span className="text-sm shrink-0">{getLanguageFlag(word.language)}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                        {word.baseWord?.partOfSpeech ? getPartOfSpeechAbbrev(word.baseWord.partOfSpeech.displayName) : 'Слово'}
                      </span>
                    </CardTitle>
                    <div className="translation-selector flex items-center gap-1">
                      <span
                        className={`truncate ${readOnly ? '' : 'cursor-pointer hover:text-blue-600'} transition-colors ${
                          (word.baseWord?.translations && word.baseWord.translations.length > 1) ||
                          word.customTranslation ? 'text-blue-500' : 'text-gray-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!readOnly && ((word.baseWord?.translations && word.baseWord.translations.length > 1) || word.customTranslation)) {
                            toggleTranslationSelector(word.id, e.currentTarget as HTMLElement)
                          }
                        }}
                      >
                        {word.customTranslation ||
                         (word.baseWord?.translations && word.baseWord.translations.length > 0
                           ? word.baseWord.translations[0].translation
                           : 'Нет перевода')}
                      </span>
                      {word.baseWord?.translations && word.baseWord.translations.length > 1 && (
                        <span className="text-xs text-gray-400 shrink-0">
                          (+{word.baseWord.translations.length - 1})
                        </span>
                      )}
                      {isClient && translationSelectorOpen[word.id] && translationSelectorPosition[word.id] && (
                        <div
                          className="translation-selector fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[200px]"
                          style={{
                            top: translationSelectorPosition[word.id].top,
                            left: translationSelectorPosition[word.id].left
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-medium text-gray-600">Выберите перевод:</div>
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                setTranslationSelectorOpen(prev => ({ ...prev, [word.id]: false }))
                                setTranslationSelectorPosition(prev => {
                                  const newPositions = { ...prev }
                                  delete newPositions[word.id]
                                  return newPositions
                                })
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {word.customTranslation && (
                              <button
                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateTranslation(word.id, word.customTranslation!)
                                }}
                              >
                                ✏️ {word.customTranslation} (текущий)
                              </button>
                            )}
                            {word.baseWord?.translations.map((translation, index) => (
                              <button
                                key={index}
                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateTranslation(word.id, translation.translation)
                                }}
                              >
                                {index + 1}. {translation.translation}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!readOnly && (
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
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

