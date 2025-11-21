# Код-ревью компонентов Stage1-6

## 🔍 Выявленные проблемы

### 1. **Дублирование кода**

#### 1.1 Типы (Word, Language)

- Определены локально в каждом компоненте
- **Решение**: Использовать общий тип `Word` из `types/training.types.ts`
- **Проблема**: В общем типе отсутствует `customTranslations`

#### 1.2 Retry Mode логика

Идентичная логика во всех stage2-6:

```typescript
- findNextError()
- findNextErrorWithResults()
- handleNext() с проверкой ошибок
- isRetryMode/hasCompletedFirstRound состояние
```

#### 1.3 Анимации

Все компоненты имеют:

```typescript
- fadeIn/animationKey состояние
- useEffect для fade-in анимации
```

#### 1.4 API запросы

Одинаковый код записи результатов:

```typescript
await fetch('/api/training', {
    method: 'POST',
    body: JSON.stringify({ wordId, stage, isCorrect }),
});
storage.recordAttempt(stage, wordId, isCorrect);
```

#### 1.5 Exercise Results

Все компоненты управляют `exerciseResults` одинаково:

```typescript
const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
useEffect(() => {
    setExerciseResults(new Array(words.length).fill(null));
}, [words.length]);
```

### 2. **Проблемы с типизацией**

#### 2.1 customTranslations

- Stage1, Stage2, Stage4 используют `customTranslations`, но тип не определен в `Word`
- Нужно добавить в `types/training.types.ts`:

```typescript
customTranslations?: Array<{
    id: number;
    translation: string;
}>;
```

#### 2.2 Variant типы в Button

```typescript
let variant: 'default' | 'outline' | 'secondary' = 'outline';
```

Используется хардкод типов вместо импорта из компонента

### 3. **Архитектурные проблемы**

#### 3.1 Бизнес-логика в компонентах

- Вся логика retry mode встроена в компоненты
- Отсутствует разделение concerns

#### 3.2 Дублирование useEffect зависимостей

Множественные useEffect с комментарием `eslint-disable-next-line react-hooks/exhaustive-deps`

#### 3.3 Отсутствие error handling

- Нет обработки ошибок при API запросах
- Нет fallback при ошибках речевого синтеза

### 4. **Проблемы производительности**

#### 4.1 Избыточные ре-рендеры

- `speakWord` в Stage1 создается каждый рендер (useCallback с зависимостями)
- `generateOptions` в Stage2 может вызываться чаще необходимого

#### 4.2 Тяжелые вычисления в рендере

Stage5: `currentPhraseNumber` вычисляется при каждом рендере

### 5. **UX проблемы**

#### 5.1 Нет индикации загрузки

При API запросах нет feedback пользователю

#### 5.2 Прерывание речи

Stage1, Stage6: при быстром переключении слов speechSynthesis может накладываться

## ✅ Предложенные улучшения

### Этап 1: Общие типы и утилиты

1. **Обновить `types/training.types.ts`**:
    - Добавить `customTranslations` в `Word`
    - Экспортировать вспомогательные типы

2. **Создать `lib/training-utils.ts`**:
    - `getWordTranslation(word)` - получение перевода
    - `getWordText(word)` - получение текста слова

3. **Создать `lib/training-api.ts`**:
    - `recordTrainingResult()` - запись результата с error handling

### Этап 2: Общие хуки

1. **`hooks/training/use-retry-mode.ts`**:

    ```typescript
    - Управление retry mode состоянием
    - findNextError/findNextErrorWithResults
    - Проверка завершения и переход к ошибкам
    ```

2. **`hooks/training/use-exercise-results.ts`**:

    ```typescript
    - Управление exerciseResults
    - Автоматическая инициализация
    - Хелперы для обновления результатов
    ```

3. **`hooks/training/use-fade-animation.ts`**:

    ```typescript
    - Управление fade-in/out анимацией
    - animationKey для принудительного ремонтирования
    ```

4. **`hooks/training/use-record-result.ts`**:

    ```typescript
    - Централизованная запись результатов
    - Error handling
    - Объединение API + localStorage
    ```

5. **`hooks/training/use-speech.ts`**:
    ```typescript
    - Управление speechSynthesis
    - Предотвращение наложения
    - Error handling
    ```

### Этап 3: Рефакторинг компонентов

Для каждого stage:

1. Заменить локальные типы на импорты из `types/training.types.ts`
2. Использовать общие хуки
3. Вынести вспомогательные функции
4. Добавить error handling
5. Оптимизировать зависимости useEffect

### Этап 4: Тестирование

Проверить корнер-кейсы:

- ✅ Ошибка на последнем слове в обычном режиме
- ✅ Ошибка на последнем слове в retry mode
- ✅ Единственная ошибка в retry mode
- ✅ Все слова правильные с первого раза
- ✅ Переход между этапами с сохранением состояния

## 📊 Метрики улучшений

### До рефакторинга:

- **Дублирование кода**: ~40% (оценка)
- **Строк кода в stage компонентах**: ~3200
- **Общих типов**: 0
- **Общих хуков**: 1 (useTrainingStorage)

### После рефакторинга (ожидается):

- **Дублирование кода**: ~10%
- **Строк кода в stage компонентах**: ~2400 (-25%)
- **Общих типов**: 5+
- **Общих хуков**: 7+
- **Новых утилит**: 3+

## 🎯 Приоритеты

### High Priority (критично для поддерживаемости):

1. ✅ Общие типы
2. ✅ Retry mode hook
3. ✅ Exercise results hook
4. ✅ Record result hook

### Medium Priority (улучшает качество):

1. ✅ Fade animation hook
2. ✅ Speech synthesis hook
3. ✅ Error handling
4. ✅ Training utils/API

### Low Priority (nice to have):

1. Оптимизация производительности
2. Дополнительные UI индикаторы
3. Расширенное логирование

## 🚀 План внедрения

1. **Создать новые файлы** (не ломая существующий код)
2. **Постепенно мигрировать** stage за stage
3. **Тестировать** каждый stage после миграции
4. **Удалить** дублирующийся код после полной миграции
