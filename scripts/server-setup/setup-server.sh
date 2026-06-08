#!/bin/bash
set -e

echo "=== Flash Cards Server Setup ==="

# Update system packages
apt update && apt upgrade -y

# Install base packages
apt install -y curl git ufw

# Configure swap (for 1GB RAM hosts)
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Install Docker from official apt repository
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

# Install Certbot
apt install -y certbot

# Install s3cmd for DigitalOcean Spaces
apt install -y s3cmd python3-magic

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Create directories
mkdir -p /opt/flashcards
mkdir -p /opt/flashcards/backups
mkdir -p /var/www/certbot

# Create deploy user (safer than running as root)
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
  echo "Created user 'deploy' and added to docker group"
fi

# Clone repository (replace with your URL)
# git clone git@github.com:YOUR_USERNAME/flash-cards.git /opt/flashcards

# Configure backup cron
cat > /etc/cron.d/flashcards-backup << 'EOF'
# Database backup twice daily
0 3 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
0 15 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
EOF

# Configure SSL renewal cron
cat > /etc/cron.d/certbot-renewal << 'EOF'
30 2 * * * root certbot renew --quiet --post-hook "docker exec flashcards-nginx nginx -s reload" >> /var/log/certbot-renewal.log 2>&1
EOF

# Configure backup freshness check cron
cat > /etc/cron.d/flashcards-backup-check << 'EOF'
# Check backup freshness daily at 09:00
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
