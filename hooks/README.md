# Hooks Organization Convention

## 📁 Структура

```
hooks/
├── training/          # Хуки для функционала тренировки
│   ├── index.ts       # Re-exports всех хуков
│   ├── use-training-state.ts
│   ├── use-training-logic.ts
│   ├── use-training-words-filter.ts
│   └── use-training-data.ts
├── shared/            # Общие хуки для всего приложения
│   ├── index.ts       # Re-exports всех хуков
│   ├── use-toast.ts
│   └── use-training-settings.ts
└── README.md          # Этот файл
```

---

## 🎯 Правила организации

### 1. **Feature-based структура**

Группируйте хуки по функциональности (фичам):

```
hooks/
├── training/       # Хуки для тренировки
├── words/          # Хуки для работы со словами (будущее)
├── auth/           # Хуки для авторизации (будущее)
└── shared/         # Общие хуки
```

### 2. **Когда создавать новую папку feature**

Создавайте новую папку, если:

- ✅ У вас есть 2+ связанных хука для одной фичи
- ✅ Хуки используются только в одной части приложения
- ✅ Логика специфична для конкретного функционала

### 3. **Когда использовать shared/**

Помещайте хук в `shared/`, если:

- ✅ Хук используется в 3+ разных фичах
- ✅ Хук предоставляет базовую функциональность (toast, theme, etc.)
- ✅ Хук не зависит от специфики конкретной фичи

### 4. **Colocation (будущее)**

Для очень специфичных хуков одной страницы:

```
app/training/
├── hooks/
│   └── use-specific-training-thing.ts
└── page.tsx
```

---

## 📝 Именование

### Имена файлов

- ✅ `use-training-state.ts` - kebab-case
- ❌ `useTrainingState.ts` - неправильно
- ❌ `training-state.ts` - без префикса use

### Имена функций

- ✅ `useTrainingState` - PascalCase с префиксом use
- ❌ `trainingState` - без префикса use

### Имена папок

- ✅ `training/` - единственное число, lowercase
- ❌ `Training/` - неправильный регистр
- ❌ `trainings/` - множественное число (исключение: если логично)

---

## 📦 index.ts паттерн

Каждая папка feature должна иметь `index.ts` для удобного импорта:

```typescript
// hooks/training/index.ts
export { useTrainingState } from './use-training-state';
export { useTrainingLogic } from './use-training-logic';
export { useTrainingWordsFilter } from './use-training-words-filter';
export { useTrainingData } from './use-training-data';
```

**Использование:**

```typescript
// ✅ Хорошо - один импорт
import { useTrainingState, useTrainingLogic } from '@/hooks/training';

// ❌ Плохо - множество импортов
import { useTrainingState } from '@/hooks/training/use-training-state';
import { useTrainingLogic } from '@/hooks/training/use-training-logic';
```

---

## 🔄 Миграция существующих хуков

При добавлении нового хука:

1. **Определите категорию**
    - Специфичен для одной фичи? → `hooks/[feature]/`
    - Используется везде? → `hooks/shared/`

2. **Создайте файл**

    ```bash
    touch hooks/[feature]/use-new-hook.ts
    ```

3. **Обновите index.ts**

    ```typescript
    export { useNewHook } from './use-new-hook';
    ```

4. **Используйте**
    ```typescript
    import { useNewHook } from '@/hooks/[feature]';
    ```

---

## 📋 Чек-лист для code review

При создании/изменении хука проверьте:

- [ ] Имя файла в kebab-case с префиксом `use-`
- [ ] Хук в правильной папке (feature vs shared)
- [ ] Добавлен экспорт в `index.ts`
- [ ] JSDoc комментарии для публичных функций
- [ ] TypeScript типы для всех параметров и возвращаемых значений
- [ ] Хук не нарушает Single Responsibility Principle

---

## 🎨 Примеры

### Создание нового feature

```bash
# 1. Создайте папку
mkdir -p hooks/words

# 2. Создайте хуки
touch hooks/words/use-words-filter.ts
touch hooks/words/use-word-actions.ts

# 3. Создайте index.ts
cat > hooks/words/index.ts << EOF
export { useWordsFilter } from './use-words-filter';
export { useWordActions } from './use-word-actions';
EOF
```

### Использование

```typescript
// app/words/page.tsx
import { useWordsFilter, useWordActions } from '@/hooks/words';
import { useToast } from '@/hooks/shared';

export default function WordsPage() {
    const filter = useWordsFilter();
    const actions = useWordActions();
    const { toast } = useToast();

    // ...
}
```

---

## 🚫 Антипаттерны

### ❌ Избегайте

```typescript
// Плохо: слишком много ответственностей
function useEverything() {
    const state = useState();
    const api = useApi();
    const validation = useValidation();
    const analytics = useAnalytics();
    // ...
}

// Плохо: неясное имя
function useData() {}
function useStuff() {}

// Плохо: нарушение feature boundaries
// В hooks/training/ импортировать из hooks/words/
import { useWordActions } from '@/hooks/words';
```

### ✅ Правильно

```typescript
// Хорошо: одна ответственность
function useTrainingState() {
    return useState();
}

// Хорошо: композиция через несколько хуков
function useTrainingPage() {
    const state = useTrainingState();
    const logic = useTrainingLogic();
    return { state, logic };
}

// Хорошо: общие зависимости через shared/
import { useToast } from '@/hooks/shared';
```

---

## 📚 Ресурсы

- [React Hooks Best Practices](https://reactjs.org/docs/hooks-rules.html)
- [Kent C. Dodds - Application State Management](https://kentcdodds.com/blog/application-state-management-with-react)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Последнее обновление:** 2025-11-19
