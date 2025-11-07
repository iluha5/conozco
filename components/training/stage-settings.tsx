'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import type { Stage1Settings, Stage4Settings, Stage5Settings } from '@/lib/training-settings'

// Компонент настроек для этапа 1
type Stage1SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  settings: Stage1Settings
  onChange: (settings: Stage1Settings) => void
}

export function Stage1SettingsModal({ isOpen, onClose, settings, onChange }: Stage1SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Настройки этапа 1</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-examples"
              checked={settings.showExamples}
              onCheckedChange={(checked) => onChange({ showExamples: checked as boolean })}
            />
            <label
              htmlFor="show-examples"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Показывать примеры использования слов
            </label>
          </div>
          <p className="text-xs text-gray-500">
            При включении будут показаны примеры предложений с изучаемым словом
          </p>
        </div>
      </div>
    </div>
  )
}

// Компонент настроек для этапа 4
type Stage4SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  settings: Stage4Settings
  onChange: (settings: Stage4Settings) => void
}

export function Stage4SettingsModal({ isOpen, onClose, settings, onChange }: Stage4SettingsModalProps) {
  if (!isOpen) return null

  const difficultyOptions = [
    { key: 'easy' as const, label: 'Простой', description: 'Только буквы из слова' },
    { key: 'medium' as const, label: 'Средний', description: '+ 3 дополнительные буквы' },
    { key: 'hard' as const, label: 'Сложный', description: '+ 6 дополнительных букв' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Настройки этапа 4</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Уровень сложности:</p>

          <div className="space-y-2">
            {difficultyOptions.map((option) => (
              <Button
                key={option.key}
                variant={settings.difficulty === option.key ? "default" : "outline"}
                onClick={() => onChange({ difficulty: option.key })}
                className="w-full justify-start h-auto p-3 text-left"
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент настроек для этапа 5
type Stage5SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  settings: Stage5Settings
  onChange: (settings: Stage5Settings) => void
}

export function Stage5SettingsModal({ isOpen, onClose, settings, onChange }: Stage5SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Настройки этапа 5</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Количество предложений на слово:</p>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={settings.sentencesPerWord === num ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ sentencesPerWord: num })}
                className="h-10"
              >
                {num}
              </Button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Если в базе меньше предложений, будут использованы все доступные.
          </p>
        </div>
      </div>
    </div>
  )
}

