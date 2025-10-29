# 🚀 Hướng Dẫn Triển Khai Production - Family Expense Manager

Hướng dẫn đầy đủ để triển khai ứng dụng Family Expense Manager lên môi trường production và sẵn sàng cho kinh doanh.

## 📋 Tổng Quan

Ứng dụng sẽ được triển khai với stack sau:
- **Frontend/Backend**: Next.js 15 với TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Reverse Proxy**: Nginx
- **Container**: Docker & Docker Compose
- **Host**: VPS (AWS EC2, DigitalOcean, Vultr, etc.)

## 🔧 Yêu Cầu Hệ Thống

### Server Requirements
- **CPU**: 2 cores minimum (4 cores recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 25GB SSD minimum
- **OS**: Ubuntu 20.04/22.04 LTS

### Software Dependencies
- Docker & Docker Compose
- Git
- Certbot (cho SSL)

---

## 📝 Chuẩn Bị Server

### 1. Khởi Tạo Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip htop ncdu ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install -y docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Enable UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Configure SSH security
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Set timezone
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
```

### 2. Cài Đặt SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (thay your-domain.com bằng domain thật)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### 3. Clone Project

```bash
# Clone project
cd ~
git clone https://github.com/dinhkhanhtung/vidu-family.git
cd vidu-family/family-expense-manager

# Checkout production branch (nếu có)
git checkout main
```

---

## ⚙️ Cấu Hình Biến Môi Trường

### 1. Tạo File .env.production

```bash
cp .env.example .env.production
nano .env.production
```

Cấu hình các giá trị thực tế:

```env
# App Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-char-random-secret-here

# Database (thay đổi mật khẩu bảo mật)
DATABASE_URL=postgresql://postgres:your-secure-postgres-password@postgres:5432/family_expense_manager?schema=public

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Stripe (cho payments - có thể skip nếu không dùng payment ngay)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring (tùy chọn)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics (tùy chọn)
NEXT_PUBLIC_GA_ID=GA-MEASUREMENT-ID

# Redis (cho caching)
REDIS_URL=redis://redis:6379

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key-here
JWT_SECRET=your-jwt-secret-here
```

### 2. Cập Nhật docker-compose.yml

Sửa `docker-compose.yml` để sử dụng `.env.production`:

```yaml
# Trong phần services.app.environment:
env_file:
  - .env.production
```

---

## 🗄️ Thiết Lập Database

### 1. Khởi Tạo Database với Docker

```bash
# Build và chạy services (không cần nginx lúc này)
docker-compose up -d postgres redis

# Wait for database to be ready
sleep 30

# Connect to database
docker-compose exec postgres psql -U postgres -d family_expense_manager

# Inside psql, create user (optional - đã có trong docker-compose)
CREATE USER family_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE family_expense_manager TO family_user;
\q
```

### 2. Thiết Lập Prisma

```bash
# Generate Prisma client
docker-compose run --rm app npx prisma generate

# Deploy migrations
docker-compose run --rm app npx prisma migrate deploy

# Tạo admin user (optional)
docker-compose run --rm app npx prisma db seed
```

### 3. Tạo Admin Account

Trong production, tạo account admin qua database trực tiếp:

```bash
docker-compose exec postgres psql -U postgres -d family_expense_manager

# Trong psql:
INSERT INTO users (id, email, name, "hashedPassword", role, "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'admin@your-domain.com',
  'Admin User',
  '$2a$10$your-hashed-password-here', -- Hash từ bcrypt 'password123'
  'ADMIN',
  NOW(),
  true,
  NOW(),
  NOW()
);
```

---

## 🚀 Deploy Application

### 1. Build và Deploy

```bash
# Build tất cả services
docker-compose build --no-cache

# Khởi động toàn bộ stack
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 2. Verify Deployment

```bash
# Check container status
docker-compose ps

# Test app
curl -I https://your-domain.com

# Check database connection
docker-compose exec app npx prisma studio --port 5556

# Test API endpoints
curl https://your-domain.com/api/health
```

### 3. Cấu Hình Nginx Reverse Proxy

Sửa `nginx.conf` để phù hợp với domain:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}
```

Deploy Nginx:

```bash
docker-compose --profile production up -d nginx
```

---

## 🔒 Bảo Mật và Monitoring

### 1. Thiết Lập Fail2ban

```bash
sudo apt install -y fail2ban

# Tạo config
sudo nano /etc/fail2ban/jail.local

# Thêm:
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

# Restart
sudo systemctl restart fail2ban
```

### 2. Thiết Lập Log Rotation

```bash
# Configure logrotate for Docker logs
sudo nano /etc/logrotate.d/docker-container

/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    notifempty
}
/var/lib/docker/containers/*/*-json.log {
    rotate 7
    daily
    compress
    missingok
    notifempty
}
```

### 3. Monitoring với Prometheus & Grafana (Tùy Chọn)

```bash
# Thêm vào docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=your-secure-password
```

---

## 🔄 Backup Strategy

### 1. Database Backup Script

Tạo file `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres family_expense_manager > $BACKUP_DIR/db_backup_$DATE.sql

# Backup Redis (optional)
docker-compose exec -T redis redis-cli dumpall > $BACKUP_DIR/redis_backup_$DATE.rdb

# Compress backups
tar -czf $BACKUP_DIR/backups_$DATE.tar.gz -C $BACKUP_DIR db_backup_$DATE.sql redis_backup_$DATE.rdb

# Upload to cloud (optional - cài đặt rclone hoặc awscli)
# aws s3 cp $BACKUP_DIR/backups_$DATE.tar.gz s3://your-bucket/backups/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "backups_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backups_$DATE.tar.gz"
```

Làm script executable và tạo cron job:

```bash
chmod +x backup.sh
sudo crontab -e

# Thêm: Chạy backup hàng ngày lúc 2 AM
0 2 * * * /path/to/your/backup.sh
```

### 2. File System Backup

```bash
# Backup app data
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/family-expense/uploads/
```

### 3. Test Recovery

```bash
# Test database restore
docker-compose exec -T postgres psql -U postgres -d family_expense_manager < backup.sql

# Test app restart
docker-compose restart app
```

---

## 🔧 Maintenance & Troubleshooting

### 1. Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild và restart
docker-compose build --no-cache app
docker-compose up -d app

# Run migrations nếu có
docker-compose run --rm app npx prisma migrate deploy
```

### 2. Troubleshooting Commands

```bash
# Check logs
docker-compose logs -f app
docker-compose logs -f postgres

# Check resource usage
docker stats
htop

# Restart services
docker-compose restart [service-name]

# Recreate containers
docker-compose up -d --force-recreate [service-name]

# Clean up
docker system prune -f
docker volume prune -f
```

### 3. Common Issues & Solutions

**Issue: Database connection fails**
```bash
# Check database container
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d family_expense_manager -c "SELECT 1;"
```

**Issue: App not accessible**
```bash
# Check nginx logs
docker logs family-expense-nginx

# Test internal connection
docker exec family-expense-app curl http://localhost:3000

# Check firewall
sudo ufw status
```

**Issue: SSL certificate expired**
```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

### 4. Performance Optimization

```bash
# Monitor performance
docker stats

# Database optimization
docker-compose exec postgres psql -U postgres -d family_expense_manager -c "VACUUM FULL;"

# Enable Redis persistence
docker-compose exec redis redis-cli CONFIG SET appendonly yes
```

---

## 🎯 Chuẩn Bị Kinh Doanh

### 1. Cài Đặt Payment Gateway

Theo hướng dẫn trong `PRODUCTION_SETUP.md` để cấu hình Stripe hoặc VNPay.

### 2. Cài Đặt Domain & DNS

- Trỏ domain về server IP
- Cấu hình DNS records (A record cho root, CNAME cho www)

### 3. Thiết Lập Analytics

- Google Analytics 4
- Google Search Console
- Hotjar (optional cho user feedback)

### 4. Backup & Disaster Recovery

- Thiết lập offsite backups (AWS S3, Cloud Storage)
- Test recovery procedures hàng tháng

### 5. Security Audit

```bash
# Run security scanner
docker run --rm -v $(pwd):/app clair-scanner --ip localhost family-expense-app

# Check for vulnerabilities
npm audit
```

### 6. Go Live Checklist

- [ ] SSL certificate active
- [ ] Domain DNS propagated
- [ ] Application accessible via domain
- [ ] Database connected & data populated
- [ ] Admin account created
- [ ] Payment gateway configured (if used)
- [ ] Email sending working
- [ ] Backup system configured
- [ ] Monitoring & alerts set up
- [ ] Performance tested under load
- [ ] Documentation completed
- [ ] Support contact information ready

---

## 📞 Support & Next Steps

Sau khi triển khai thành công:

1. **User Management**: Tạo landing page và đăng ký users
2. **Marketing**: Thiết lập Google Ads, Facebook Ads
3. **Support System**: Cài đặt Zendesk hoặc Intercom
4. **Billing**: Cấu hình subscription plans
5. **Scaling**: Monitor và scale khi traffic tăng

### Resources
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

### Emergency Contacts
- Email: your-support@email.com
- Hotline: +84 xxx xxx xxx
- Emergency SSH access from backup IP

---

🎉 **Chúc mừng!** Ứng dụng của bạn đã sẵn sàng cho production và kinh doanh. Theo dõi metrics và tối ưu liên tục để cung cấp trải nghiệm tốt nhất cho users.
