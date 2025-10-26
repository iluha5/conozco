FROM node:20-alpine

WORKDIR /app

# Установка необходимых системных зависимостей для Prisma
RUN apk add --no-cache openssl libc6-compat

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование остальных файлов
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Экспонирование порта
EXPOSE 3000

# Запуск приложения
CMD ["sh", "-c", "npx prisma migrate deploy && npm run prisma:seed && npm run dev"]

