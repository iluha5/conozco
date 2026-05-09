#!/bin/bash
set -e

echo "=== Flash Cards Server Setup ==="

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl git ufw

# Настройка swap (для 1GB RAM)
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Установка Docker из официального apt-репозитория
apt-get install -y ca-certificates gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker && systemctl start docker

# Установка Certbot
apt install -y certbot

# Установка s3cmd для работы с DigitalOcean Spaces
apt install -y s3cmd python3-magic

# Настройка UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Создание директорий
mkdir -p /opt/flashcards
mkdir -p /opt/flashcards/backups
mkdir -p /var/www/certbot

# Создание пользователя для деплоя (безопаснее, чем root)
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
  echo "Created user 'deploy' and added to docker group"
fi

# Клонирование репозитория (замените на ваш URL)
# git clone git@github.com:YOUR_USERNAME/flash-cards.git /opt/flashcards

# Настройка cron для бэкапов
cat > /etc/cron.d/flashcards-backup << 'EOF'
# Бэкап БД дважды в сутки
0 3 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
0 15 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
EOF

# Настройка cron для SSL renewal
cat > /etc/cron.d/certbot-renewal << 'EOF'
30 2 * * * root certbot renew --quiet --post-hook "docker exec flashcards-nginx nginx -s reload" >> /var/log/certbot-renewal.log 2>&1
EOF

# Настройка cron для проверки бэкапов
cat > /etc/cron.d/flashcards-backup-check << 'EOF'
# Проверка свежести бэкапов каждый день в 9:00
0 9 * * * root /opt/flashcards/scripts/server-setup/check-backups.sh >> /var/log/flashcards-backup-check.log 2>&1
EOF

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Add the public key above as Deploy Key in GitHub"
echo "2. Clone repository to /opt/flashcards"
echo "3. Configure s3cmd: s3cmd --configure (see section 4.2)"
echo "4. Configure DNS in Namecheap"
echo "5. Run: certbot certonly --webroot -w /var/www/certbot -d conozco.net -d www.conozco.net --non-interactive --agree-tos --email your-email@example.com"
echo "6. Create .env file and start containers"
