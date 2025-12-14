### План разработки: новые режимы тренировки/проверки

Ниже представлена финальная версия плана с учётом предварительного рефакторинга и последующей реализации фичи.

---

#### Фаза 0: Предварительный рефакторинг (до начала фичи)

1. Централизация API-слоя (типобезопасно)
    - Создать `lib/api/words.api.ts` (слова, review-слова, обновление статуса, удаление)
    - Создать `lib/api/word-groups.api.ts` (списки групп, слова группы, поиск A1)
    - Обновить `lib/api/training.api.ts` (оставить тренинговые операции; переиспользовать `wordsApi`)
    - Создать единый экспорт `lib/api/index.ts`
2. Единый модуль работы со словами
    - `lib/words/filters.ts` (byLanguage, byStatus, lastAdded, random)
    - `lib/words/selectors.ts` (getRandomLearned, getLastAddedNotLearned и др.)
3. Хранилище настроек тренировки
    - `lib/storage/training-storage.service.ts` (типобезопасные save/load/remove/clear)
    - Перевести `lib/training-settings.ts` на сервис
4. Рефакторинг запуска тренировок
    - Унифицировать в `helpers/training-modes/startTrainingMode.ts` с разными хендлерами: custom/quickCheck/groupCheck/A1/standard/sentences
5. Декомпозиция хука
    - `hooks/training-modes/useTrainingModesData.ts`, `useTrainingModesDialogs.ts`, `useTrainingModesActions.ts` и тонкий `useTrainingModes.ts`
6. Типы API-ответов
    - `types/api.types.ts` (WordGroupResponse, GroupWordsResponse, ApiResponse и т. п.)
7. Проверка статуса
    - Существующие режимы, FlashCardsReview, прогресс и настройки — без регрессий.

---

#### Фаза 1: Подготовка инфраструктуры фичи

1. UI Tabs
    - Добавить компонент: `npx shadcn-ui@latest add tabs`
    - Проверить наличие `components/ui/tabs.tsx` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).
2. API для слов группы (для тестов A1)
    - `app/api/user/word-groups/[groupId]/words/route.ts` (GET с auth, 401/400/404/500, опциональные `limit`, `offset`).
3. Адаптер BaseWord → Word
    - `components/training-list/helpers/createUserWordsFromBase.ts`: batch-проверка существующих, `createMany` для новых, вернуть массив `Word.id`.

---

#### Фаза 2: Типы, константы и конфигурация

1. Типы
    - Расширить `TrainingModeId` новыми режимами: `learned-quick-check`, `learned-group-check`, `learned-sentences`, `learned-test-a1-easy`, `learned-test-a1-medium`.
    - Ввести `TrainingModeGroupId = 'new' | 'learned'`.
2. Конфигурация групп
    - `components/training-list/constants/training-modes-config.ts`: `TRAINING_MODE_GROUPS = { new: { ... }, learned: { ... } }`.
3. Константы изученных
    - `components/training-list/constants/learned-training-modes.ts` (5 режимов с иконками и градиентами).
4. Рефакторинг существующих констант
    - Переименовать `TRAINING_MODES` → `NEW_WORDS_TRAINING_MODES` и использовать в конфигурации групп.

---

#### Фаза 3: Хелперы и утилиты фичи

1. Изученные слова
    - `components/training-list/helpers/getLearnedWords.ts`: `getLearnedWords`, `getRandomLearnedWords`.
2. Группа A1
    - `components/training-list/helpers/getA1GroupWords.ts`: `getA1GroupId`, `getA1GroupWords`, `getRandomWordsFromGroup`.
3. Унифицированный запуск
    - Обновить `helpers/training-modes/startTrainingMode.ts` под оба типа режимов и спец-режимы (FlashCards/GroupSetup/A1).

---

#### Фаза 4: Хуки и состояние

1. Обновить `useTrainingModes`
    - Состояния: `activeTab ('new'|'learned')`, `flashCardsParams`, `showFlashCardsReview`, `showGroupReviewSetup`, `noWordsDialogMode`.
    - Мемоизация: вычислять `learnedWords`/`notLearnedWords` через `useMemo` и селекторы.
    - Поддержка спец-режимов: открытие FlashCardsReview/GroupSetup через колбэки.
    - Edge cases: минимум слов, недоступность группы A1, смена языка.
2. Диалог отсутствия слов
    - Расширить `NoWordsDialog` пропом `mode: 'new' | 'learned'`.

---

#### Фаза 5: UI — страница `/training/list`

1. Вёрстка табов с анимацией и адаптивом
    - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` с классами анимаций.
    - Счётчики слов в табах (badge).
2. Карточки режимов
    - Рендер наборов из `TRAINING_MODE_GROUPS.new/learned`.
3. Интеграция диалогов
    - `FlashCardsReview`, `GroupReviewSetupDialog`, `NoWordsDialog`.
4. Блокировка параллельных тренировок
    - Предупреждать при попытке старта второй.

---

#### Фаза 6: Анимации и стили

1. Tailwind анимации (если нет)
    - `tailwind.config.ts`: keyframes `fade-in`, `zoom-in`; анимации `fade-in`, `zoom-in`.
2. Применение
    - К `TabsContent` и активным `TabsTrigger`.

---

#### Фаза 7: Тестирование и проверка

1. Функциональные сценарии
    - Все режимы новых слов; 5 режимов закрепления; спец-режимы (FlashCards/Groups/A1).
2. Адаптив
    - Mobile/Tablet/Desktop сетки, читаемость, кликабельность.
3. Производительность
    - 100/500/1000+ слов; переключение табов < 100ms; плавность анимаций.
4. Accessibility
    - Клавиатурная навигация табов и карточек, aria-атрибуты.

---

#### Фаза 8: Финализация

1. Проверки качества
    - `npm run type-check`, `npm run lint`, `npm run format`, `npm run verify`.
2. Верификация структуры
    - Наличие всех новых/обновлённых файлов и отсутствие `any`.
3. Документация
    - Обновить README/ARCHITECTURE (кратко: новые режимы, табы, A1).

---

#### Детали режимов закрепления (итог)

- **Быстрая проверка изученных (`learned-quick-check`)**
    - 10 случайных изученных слов, через FlashCardsReview.
- **Проверка по группам (`learned-group-check`)**
    - Выбор группы, запуск через FlashCardsReview + диалог настроек группы.
- **Составление предложений (`learned-sentences`)**
    - 5 случайных изученных слов, только этап 5, по 4 предложения/слово.
- **Тест A1 (лёгкий) (`learned-test-a1-easy`)**
    - 10 случайных слов из группы “A1: All words”, настройки как режим «Средний».
- **Тест A1 (средний) (`learned-test-a1-medium`)**
    - 20 случайных слов из группы “A1: All words”, настройки как режим «Средний».

---

#### Критерии готовности (Definition of Done)

- Табы на `/training/list` с анимацией и адаптивом; переключение без лагов.
- Все новые режимы запускаются, edge cases обработаны (нет слов, мало слов, смена языка, отсутствует A1).
- A1: слова подтягиваются по API группы; при необходимости создаются пользовательские `Word` из `BaseWord`.
- FlashCardsReview/GroupSetup интегрированы и не конфликтуют между собой.
- Нет `any`, строгая типизация, консистентные API-клиенты.
- Проверки типов/линта/формата проходят; без регрессий в старых режимах.
