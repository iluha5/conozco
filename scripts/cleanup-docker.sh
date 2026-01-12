#!/bin/bash

echo "🧹 Очистка Docker ресурсов..."
echo ""

# Показываем текущее использование
echo "📊 Текущее использование диска Docker:"
docker system df
echo ""

# Очистка неиспользуемых образов, контейнеров, сетей и кэша сборки
echo "🗑️  Удаление неиспользуемых ресурсов..."
docker system prune -a --volumes -f

echo ""
echo "✅ Очистка завершена!"
echo ""
echo "📊 Использование диска после очистки:"
docker system df

