# 🐛 Исправление: Слово не появлялось в попапе после AI поиска

## Проблема

После добавления слова через кнопку "Найти" (AI поиск):

- ✅ Слово успешно добавлялось в базу данных
- ✅ Слово появлялось в списке слов пользователя на главной странице
- ❌ Слово НЕ появлялось в списке доступных слов в попапе
- ❌ При поиске этого слова оно не отображалось, но кнопка "Найти" блокировалась

## Причина

### Основная проблема: Race Condition

1. После успешного AI поиска мы делали:

    ```typescript
    setSearchTerm(''); // Очищали поле поиска
    onWordAdded(); // Обновляли список на главной странице
    handleSearch(0, true); // Пытались обновить список в попапе
    ```

2. **Проблема №1**: useEffect срабатывал на изменение `searchTerm`

    ```typescript
    useEffect(() => {
        if (open) {
            handleSearch(0, true); // Автоматический поиск!
        }
    }, [languageCode, searchTerm, open]);
    ```

    Когда мы делали `setSearchTerm('')`, срабатывал useEffect и запускал поиск с пустым термином ДО того, как наш ручной `handleSearch` успевал выполниться.

3. **Проблема №2**: Недостаточная задержка для БД
    - База данных могла не успеть закоммитить транзакцию
    - Запрос к `/api/base-words` выполнялся слишком быстро
    - Новое слово еще не было видно в базе

## Решение

### 1. Добавлен флаг `skipAutoSearch`

```typescript
const [skipAutoSearch, setSkipAutoSearch] = useState(false);
```

Этот флаг блокирует автоматический поиск в useEffect при очистке `searchTerm`.

### 2. Обновлен useEffect для поиска

```typescript
useEffect(() => {
    if (open && !skipAutoSearch) {
        // Проверяем флаг!
        setOffset(0);
        setAvailableWords([]);
        setHasMore(true);
        handleSearch(0, true);
    }

    // Сбрасываем флаг после пропуска
    if (skipAutoSearch) {
        setSkipAutoSearch(false);
    }
}, [languageCode, searchTerm, open, skipAutoSearch]);
```

### 3. Обновлена логика после AI поиска

```typescript
if (response.ok) {
    const addedWord = searchTerm.trim();
    toast({
        title: 'Успешно',
        description: `Слово "${addedWord}" добавлено...`,
    });

    // 1. Блокируем автоматический поиск
    setSkipAutoSearch(true);

    // 2. Очищаем поле поиска
    setSearchTerm('');

    // 3. Обновляем главную страницу
    onWordAdded();

    // 4. Через 300мс обновляем список в попапе
    setTimeout(async () => {
        setOffset(0);
        setHasMore(true);

        const params = new URLSearchParams({
            languageCode,
            limit: '30',
            offset: '0',
        });

        const response = await fetch(`/api/base-words?${params}`);
        if (response.ok) {
            const words = await response.json();
            setAvailableWords(words);
            setHasMore(words.length === 30);
            setOffset(words.length);
        }
    }, 300);
}
```

### 4. Улучшена функция resetForm

```typescript
const resetForm = () => {
    setSelectedWords([]);
    setAvailableWords([]);
    setOffset(0);
    setHasMore(true);
    setSearchTerm('');
    setSelectedPartsOfSpeech([]);
    setSkipAutoSearch(false); // Сброс флага
    setHasExactMatch(false); // Сброс флага точного совпадения
};
```

### 5. Добавлен обработчик закрытия диалога

```typescript
const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
        // При закрытии диалога сбрасываем форму
        resetForm();
    }
};
```

## Результат

После исправления:

- ✅ Слово добавляется через AI поиск
- ✅ Слово появляется на главной странице
- ✅ Слово появляется в списке в попапе (с пометкой что уже добавлено)
- ✅ При поиске слова оно отображается в списке
- ✅ Кнопка "Найти" правильно блокируется
- ✅ При закрытии попапа все состояния сбрасываются

## Тестирование

### Как проверить исправление:

1. Откройте http://localhost:3000/words
2. Нажмите "Добавить слово"
3. Введите новое слово (например: `perro`)
4. Нажмите "Найти"
5. Дождитесь успешного добавления
6. **Проверьте**: слово должно появиться в списке в попапе с галочкой (isAddedByUser)
7. **Проверьте**: очистите поиск и введите `perro` снова
8. **Проверьте**: слово должно отобразиться в списке
9. **Проверьте**: кнопка "Найти" должна быть заблокирована

### Ожидаемое поведение:

```
Перед добавлением:
- Поиск "perro" → не найдено в списке
- Кнопка "Найти" → активна ✅

После добавления:
- Поиск "perro" → найдено в списке ✅
- Слово отмечено как добавленное (isAddedByUser: true) ✅
- Кнопка "Найти" → заблокирована ❌

После закрытия и открытия попапа:
- Поиск "perro" → найдено в списке ✅
- Слово отмечено как добавленное ✅
```

## Файлы изменены

- `/components/add-word-dialog.tsx` - основные исправления

## Дата исправления

09.11.2025

---

## 🐛 Дополнительное исправление: Уже добавленные слова не отображались в списке

### Проблема №2

После первого исправления слова появлялись в ответе API, но **не отображались в списке** попапа, потому что функция `getFilteredWords()` **фильтровала их**.

```typescript
// БЫЛО (неправильно):
const getFilteredWords = () => {
    if (selectedPartsOfSpeech.length === 0) {
        return availableWords.filter(word => !word.isAddedByUser); // ❌ Скрывали добавленные
    }
    return availableWords.filter(
        word =>
            !word.isAddedByUser && // ❌ Скрывали добавленные
            selectedPartsOfSpeech.includes(word.partOfSpeech.name),
    );
};
```

### Решение

Изменили подход - теперь **показываем все слова**, но визуально отличаем уже добавленные:

#### 1. Обновлена функция фильтрации

```typescript
// СТАЛО (правильно):
const getFilteredWords = () => {
    if (selectedPartsOfSpeech.length === 0) {
        return availableWords; // ✅ Показываем все слова
    }
    return availableWords.filter(word =>
        selectedPartsOfSpeech.includes(word.partOfSpeech.name),
    );
};
```

#### 2. Визуальное отличие в UI

Уже добавленные слова теперь:

- ✅ **Серый фон** с прозрачностью (`bg-gray-100 opacity-60`)
- ✅ **Курсор "не разрешено"** (`cursor-not-allowed`)
- ✅ **Заблокированный чекбокс** (`disabled={word.isAddedByUser}`)
- ✅ **Зеленый бейдж** "✓ В словаре" (`bg-green-100 text-green-700`)
- ✅ **Не кликабельны** (проверка `if (!word.isAddedByUser)`)

```typescript
<Card
  className={`transition-all ${
    word.isAddedByUser
      ? 'bg-gray-100 opacity-60 cursor-not-allowed'
      : isWordSelected(word.id)
      ? 'ring-2 ring-primary bg-blue-50 cursor-pointer'
      : 'hover:bg-gray-50 bg-white cursor-pointer'
  }`}
  onClick={() => {
    if (!word.isAddedByUser) {
      toggleWordSelection(word.id);
    }
  }}
>
  <Checkbox
    checked={isWordSelected(word.id)}
    disabled={word.isAddedByUser}
  />
  {word.isAddedByUser && (
    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
      ✓ В словаре
    </span>
  )}
</Card>
```

#### 3. Обновлена кнопка "Выбрать все"

```typescript
const selectAllWords = () => {
  // Выбираем только слова, которые еще не добавлены
  const newSelections = getFilteredWords()
    .filter(word => !word.isAddedByUser)
    .map(word => word.id);
  setSelectedWords(newSelections);
};

// Кнопка активна только если есть слова для выбора
<Button
  disabled={
    searching ||
    getFilteredWords().filter(w => !w.isAddedByUser).length === 0
  }
>
  Выбрать все
</Button>
```

### Результат

Теперь пользователь видит **все слова** в списке:

- ✅ Новые слова - белые, кликабельные, можно выбрать
- ✅ Уже добавленные - серые с бейджем "✓ В словаре", не кликабельные
- ✅ При поиске слова `cuando` оно отображается в списке с индикацией
- ✅ Кнопка "Найти" правильно блокируется для добавленных слов
- ✅ Кнопка "Выбрать все" выбирает только не добавленные слова

### UX преимущества

1. **Прозрачность** - пользователь видит что слово есть в базе
2. **Информативность** - понятно что слово уже в словаре
3. **Предотвращение ошибок** - невозможно добавить дубликат
4. **Удобство** - можно увидеть перевод уже добавленного слова

### Тестирование

**Сценарий 1: Поиск добавленного слова**

```
1. Откройте попап "Добавить слово"
2. Введите "cuando" в поиск
3. Результат: ✅ Слово отображается серым с бейджем "✓ В словаре"
4. Результат: ❌ Чекбокс заблокирован
5. Результат: ❌ При клике ничего не происходит
6. Результат: ❌ Кнопка "Найти" заблокирована
```

**Сценарий 2: Добавление нового слова**

```
1. Введите новое слово "perro" в поиск
2. Результат: ✅ Кнопка "Найти" активна (слова нет в базе)
3. Нажмите "Найти"
4. Дождитесь добавления
5. Результат: ✅ Слово появляется в списке серым с бейджем
6. Результат: ❌ Кнопка "Найти" заблокирована
```

**Сценарий 3: Выбрать все**

```
1. Откройте попап с несколькими словами (добавленные + новые)
2. Нажмите "Выбрать все"
3. Результат: ✅ Выбираются только НЕ добавленные слова
4. Результат: ❌ Добавленные слова остаются не выбранными
```
