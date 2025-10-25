# История исправлений

## Исправление OpenSSL ошибки в Prisma (24.10.2024)

### Проблема
При запуске приложения в Docker контейнере возникала ошибка:
```
prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected. 
Defaulting to "openssl-1.1.x".
Please manually install OpenSSL and try installing Prisma again.
Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON
```

### Причина
Образ `node:20-alpine` не содержит OpenSSL по умолчанию, который требуется для работы Prisma ORM.

### Решение
Добавлены системные зависимости в `Dockerfile`:

```dockerfile
# Установка необходимых системных зависимостей для Prisma
RUN apk add --no-cache openssl libc6-compat
```

### Измененные файлы
1. **Dockerfile** - добавлена установка `openssl` и `libc6-compat`
2. **docker-compose.yml** - удален устаревший атрибут `version`
3. **start.sh** - обновлен синтаксис с `docker-compose` на `docker compose`
4. Все документы (README.md, QUICKSTART.md, USAGE.md и др.) - обновлен синтаксис команд

### Изменения в синтаксисе Docker Compose
Docker Compose V2 использует новый синтаксис без дефиса:
- Старый: `docker-compose up`
- Новый: `docker compose up`

### Как применить исправление
```bash
# Остановить старые контейнеры
docker compose down -v

# Пересобрать с исправлениями
docker compose up --build
```

### Проверка работы
После применения исправлений в логах должно быть:
```
✓ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client
All migrations have been successfully applied.
✓ Ready in 2.8s
```

### Зависимости
- `openssl` - библиотека OpenSSL для криптографии
- `libc6-compat` - совместимость с библиотеками GNU C

### Дополнительная информация
- Alpine Linux использует LibreSSL по умолчанию
- Prisma требует OpenSSL 1.1.x или 3.x
- Решение тестировано на node:20-alpine и работает стабильно

---

## Дополнительные улучшения
1. Удален устаревший атрибут `version: '3.8'` из docker-compose.yml
2. Обновлена вся документация для использования современного синтаксиса Docker Compose
3. Обновлен скрипт запуска start.sh

---

## Исправление 'use client' директивы (24.10.2024)

### Проблема
После запуска приложения в браузере возникала ошибка:
```
Unhandled Runtime Error
Error: useState only works in Client Components. Add the "use client" directive at the top of the file to use it.
Source: hooks/use-toast.ts (167:28)
```

### Причина
В Next.js 14 App Router все компоненты по умолчанию являются Server Components. Для использования React хуков (`useState`, `useEffect` и т.д.) и клиентских API необходимо явно указывать директиву `'use client'` в начале файла.

### Решение
Добавлена директива `'use client'` в начало всех клиентских компонентов:

#### Обновленные файлы:
```
hooks/use-toast.ts          - использует useState и useEffect
components/ui/button.tsx     - использует React.forwardRef
components/ui/card.tsx       - использует React.forwardRef  
components/ui/dialog.tsx     - использует Radix UI (клиентский)
components/ui/input.tsx      - использует React.forwardRef
components/ui/select.tsx     - использует Radix UI (клиентский)
components/ui/toast.tsx      - использует Radix UI (клиентский)
components/ui/toaster.tsx    - использует useToast хук
```

### Как применить исправление
```bash
# Перезапустить контейнер для сброса кеша Next.js
docker compose restart app
```

### Проверка работы
После применения исправлений:
- ✅ Главная страница загружается без ошибок
- ✅ HTTP код 200
- ✅ Нет ошибок в консоли Next.js

### Важно знать
- Директива `'use client'` должна быть **первой строкой** файла
- Server Components не могут использовать хуки и клиентское API
- Client Components могут импортировать Server Components как children
- Radix UI компоненты всегда требуют `'use client'`

---

**Статус**: ✅ Исправлено и протестировано  
**Версия после исправления**: 0.1.1

