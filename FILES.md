# 📦 Список файлов проекта Flash Cards

## Общая информация

- **Всего файлов**: 47
- **TypeScript/JavaScript**: 31
- **Документация**: 7
- **Конфигурация**: 9

---

## 📘 Документация (7 файлов)

```
📄 README.md                 - Основное описание проекта
📄 QUICKSTART.md             - Быстрый старт за 3 минуты
📄 USAGE.md                  - Подробное руководство пользователя
📄 ARCHITECTURE.md           - Техническая документация и архитектура
📄 CONTRIBUTING.md           - Руководство для разработчиков
📄 CHANGELOG.md              - История изменений проекта
📄 PROJECT_SUMMARY.md        - Сводка по проекту
```

---

## ⚙️ Конфигурация (9 файлов)

```
📄 package.json              - Зависимости Node.js
📄 tsconfig.json             - Настройки TypeScript
📄 next.config.js            - Конфигурация Next.js
📄 postcss.config.js         - PostCSS настройки
📄 tailwind.config.ts        - Tailwind CSS конфигурация
📄 .eslintrc.json            - ESLint правила
📄 .gitignore                - Git игнорирование
📄 .dockerignore             - Docker игнорирование
📄 .gitlab-ci.yml            - GitLab CI/CD (шаблон)
```

---

## 🐳 Docker (3 файла)

```
📄 docker-compose.yml        - Оркестрация контейнеров
📄 Dockerfile                - Docker образ приложения
📄 start.sh                  - Скрипт быстрого запуска (исполняемый)
```

---

## 🗄️ База данных (3 файла)

```
prisma/
├── 📄 schema.prisma                              - Схема базы данных
└── migrations/
    ├── 📄 migration_lock.toml                    - Prisma миграции lock
    └── 20241024000000_init/
        └── 📄 migration.sql                      - Начальная миграция SQL
```

---

## 🎨 Frontend - Страницы (5 файлов)

```
app/
├── 📄 layout.tsx            - Корневой layout приложения
├── 📄 page.tsx              - Главная страница
├── 📄 globals.css           - Глобальные стили
├── words/
│   └── 📄 page.tsx          - Страница управления словами
└── training/
    └── 📄 page.tsx          - Страница тренировок
```

---

## 🧩 Frontend - Компоненты (12 файлов)

### UI компоненты (8 файлов)

```
components/ui/
├── 📄 button.tsx            - Кнопка
├── 📄 card.tsx              - Карточка
├── 📄 dialog.tsx            - Диалоговое окно
├── 📄 input.tsx             - Поле ввода
├── 📄 select.tsx            - Выпадающий список
├── 📄 toast.tsx             - Toast уведомления
└── 📄 toaster.tsx           - Toast контейнер
```

### Функциональные компоненты (5 файлов)

```
components/
├── 📄 add-word-dialog.tsx   - Диалог добавления слова
└── training/
    ├── 📄 stage1.tsx        - Этап 1: Просмотр + озвучка
    ├── 📄 stage2.tsx        - Этап 2: Выбор перевода
    ├── 📄 stage3.tsx        - Этап 3: Сопоставление
    └── 📄 stage4.tsx        - Этап 4: Составление слова
```

---

## 🔧 Backend - API (5 файлов)

```
app/api/
├── words/
│   ├── 📄 route.ts                               - GET/POST /api/words
│   └── [id]/
│       └── 📄 route.ts                           - GET/PATCH/DELETE /api/words/:id
├── base-words/
│   └── 📄 route.ts                               - GET /api/base-words
└── training/
    └── 📄 route.ts                               - GET/POST /api/training
```

---

## 📚 Библиотеки и утилиты (5+ файлов)

```
lib/
├── 📄 prisma.ts             - Prisma Client singleton
├── 📄 auth.ts               - NextAuth конфигурация
├── 📄 word-data.ts          - Утилиты для работы со словами
├── 📄 utils.ts              - Вспомогательные функции
└── 📄 words-seed-data*.ts   - Seed-данные для слов

hooks/
├── 📄 use-toast.ts          - React Hook для toast уведомлений
└── 📄 use-training-settings.ts - Hook для настроек тренировок
```

---

## 📊 Структура по типам файлов

### TypeScript/TSX (30+ файлов)

```
Страницы:              5+ файлов
UI компоненты:         8+ файлов
Функциональные:        5+ файлов
API Routes:            5+ файлов
Библиотеки:            5+ файлов
Hooks:                 2 файла
Конфигурация:          2 файла
```

### JavaScript (3 файла)

```
next.config.js
postcss.config.js
```

### CSS (1 файл)

```
globals.css
```

### Prisma (1 файл)

```
schema.prisma
```

### SQL (1 файл)

```
migration.sql
```

### Markdown (7 файлов)

```
README.md
QUICKSTART.md
USAGE.md
ARCHITECTURE.md
CONTRIBUTING.md
CHANGELOG.md
PROJECT_SUMMARY.md
```

### JSON (2 файла)

```
package.json
.eslintrc.json
```

### YAML (2 файла)

```
docker-compose.yml
.gitlab-ci.yml
```

### Shell (1 файл)

```
start.sh
```

### Docker (2 файла)

```
Dockerfile
.dockerignore
```

### Git (1 файл)

```
.gitignore
```

### TOML (1 файл)

```
migration_lock.toml
```

---

## 📈 Статистика кода

| Категория             | Файлов  | Примерные строки |
| --------------------- | ------- | ---------------- |
| Frontend (страницы)   | 6+      | ~1,000           |
| Frontend (компоненты) | 15+     | ~2,000           |
| Backend (API)         | 5+      | ~500             |
| Библиотеки            | 8+      | ~500             |
| База данных           | 3+      | ~300             |
| Конфигурация          | 9       | ~400             |
| Документация          | 7       | ~1,500           |
| **ИТОГО**             | **50+** | **~6,200**       |

---

## 🎯 Ключевые файлы для старта

### Для пользователей:

1. `QUICKSTART.md` - Начните отсюда!
2. `start.sh` - Запустите приложение
3. `USAGE.md` - Руководство по использованию

### Для разработчиков:

1. `README.md` - Общая информация
2. `ARCHITECTURE.md` - Архитектура
3. `CONTRIBUTING.md` - Как внести вклад
4. `prisma/schema.prisma` - Схема БД

### Конфигурация:

1. `docker-compose.yml` - Docker окружение
2. `package.json` - Зависимости
3. `.env` - Переменные окружения (создается автоматически)

---

## 🚀 Быстрая навигация

### Хочу запустить приложение:

→ `QUICKSTART.md` → `./start.sh`

### Хочу добавить функционал:

→ `ARCHITECTURE.md` → `CONTRIBUTING.md` → Начинайте кодить!

### Хочу понять как работает:

→ `README.md` → `ARCHITECTURE.md` → Изучайте код!

### Возникла проблема:

→ `USAGE.md` (раздел Troubleshooting) → Issues на GitLab

---

**Все файлы созданы и готовы к использованию!** ✅
