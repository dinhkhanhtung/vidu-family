# 🚀 Production Setup Guide

Hướng dẫn triển khai ứng dụng Family Expense Manager lên môi trường production với các công nghệ hiện đại và best practices.

## 📋 Mục lục

1. [Cài đặt môi trường](#cài-đặt-môi-trường)
2. [Cấu hình deployment](#cấu-hình-deployment)
3. [Monitoring & Analytics](#monitoring--analytics)
4. [Bảo mật](#bảo-mật)
5. [Tối ưu hóa hiệu suất](#tối-ưu-hóa-hiệu-suất)
6. [Docker Development](#docker-development)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

## 🛠️ Cài đặt môi trường

### 1. Vercel Deployment

1. **Tạo tài khoản Vercel**
   ```bash
   # Cài đặt Vercel CLI
   npm i -g vercel

   # Đăng nhập vào Vercel
   vercel login
   ```

2. **Cấu hình Vercel**
   - Import project từ GitHub
   - Cấu hình environment variables trong Vercel Dashboard
   - Enable Vercel Analytics

### 2. Database Setup (Vercel Postgres)

1. **Tạo database**
   - Trong Vercel Dashboard → Storage → Create Database
   - Chọn PostgreSQL
   - Copy `DATABASE_URL`

2. **Cấu hình Prisma**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Deploy migrations
   npx prisma migrate deploy
   ```

### 3. Environment Variables

Sao chép `.env.production` thành `.env.local` và điền các giá trị thực tế:

```bash
cp .env.production .env.local
```

Các biến môi trường cần thiết:
- `DATABASE_URL` - Vercel Postgres connection string
- `NEXTAUTH_SECRET` - Secret key cho NextAuth.js
- `NEXTAUTH_URL` - Production domain
- `GOOGLE_CLIENT_ID/SECRET` - OAuth credentials
- `STRIPE_PUBLISHABLE_KEY/SECRET_KEY` - Payment processing
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_ID` - Google Analytics 4

## 📊 Monitoring & Analytics

### 1. Sentry (Error Tracking)

1. **Cài đặt Sentry**
   ```bash
   # Đã được cài đặt trong project
   npm install @sentry/nextjs
   ```

2. **Cấu hình Sentry**
   - Tạo project tại [sentry.io](https://sentry.io)
   - Copy DSN vào environment variables
   - Cấu hình error filtering trong `src/lib/sentry.ts`

3. **Monitoring Features**
   - Performance monitoring
   - Error tracking với stack traces
   - Release health tracking
   - Session replay

### 2. Google Analytics 4

1. **Cấu hình GA4**
   - Tạo property tại [Google Analytics](https://analytics.google.com)
   - Copy Measurement ID
   - Thêm vào environment variables

2. **Custom Events Tracking**
   ```typescript
   import { trackEvent, trackUserAction } from '@/lib/analytics';

   // Track user actions
   trackUserAction('button_click', { button: 'add_transaction' });

   // Track business metrics
   trackBusinessMetric('revenue', 100000, 'VND');
   ```

## 🔒 Bảo mật

### 1. Input Validation & Sanitization

Đã được triển khai trong `src/lib/security.ts`:

- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ File upload validation

### 2. Security Headers

Được cấu hình trong `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy

### 3. Rate Limiting

```typescript
import { securityMiddleware } from '@/lib/security';

// Trong API routes
export async function POST(request: NextRequest) {
  const securityCheck = securityMiddleware(request, 'auth');
  if (securityCheck.error) {
    return Response.json(
      { error: securityCheck.error },
      { status: securityCheck.status }
    );
  }

  // Xử lý request
}
```

## ⚡ Tối ưu hóa hiệu suất

### 1. Image Optimization

Đã được cấu hình trong `next.config.ts`:
- WebP và AVIF formats
- Responsive images
- Lazy loading
- CDN optimization

### 2. Code Splitting

Tự động bởi Next.js:
- Route-based code splitting
- Component-based code splitting
- Vendor chunk optimization

### 3. Caching Strategies

```typescript
// Trong next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 4. PWA Setup

Đã được cấu hình:
- Web App Manifest (`public/manifest.json`)
- Service Worker (tự động bởi next-pwa)
- Offline support
- App shortcuts

## 🐳 Docker Development

### 1. Chạy local development

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f app

# Dừng services
docker-compose down
```

### 2. Services bao gồm

- **PostgreSQL**: Database chính
- **Redis**: Caching và sessions
- **App**: Next.js application
- **Nginx**: Reverse proxy (tùy chọn)
- **MailHog**: Email testing (tùy chọn)

### 3. Database Management

```bash
# Kết nối tới database
docker-compose exec postgres psql -U postgres -d family_expense_manager

# Backup database
docker-compose exec postgres pg_dump -U postgres family_expense_manager > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d family_expense_manager < backup.sql
```

## 🚀 CI/CD Pipeline

### 1. GitHub Actions Workflow

File `.github/workflows/deploy.yml` bao gồm:

- ✅ Build và test tự động
- ✅ Deploy tới production (main branch)
- ✅ Deploy tới staging (develop branch)
- ✅ Security scanning
- ✅ Performance monitoring với Lighthouse

### 2. Deployment Process

1. **Push to main**: Tự động deploy production
2. **Push to develop**: Tự động deploy staging
3. **Pull requests**: Chạy tests và build validation

### 3. Environment Configuration

**Production Environment:**
```yaml
# Vercel Dashboard → Project Settings → Environment Variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
# ... các biến khác
```

**Staging Environment:**
```yaml
# Tương tự production nhưng với prefix STAGING_
STAGING_DATABASE_URL=postgresql://...
STAGING_NEXTAUTH_SECRET=your-secret
# ... các biến khác
```

## 🔧 Troubleshooting

### 1. Common Issues

**Database Connection Issues:**
```bash
# Kiểm tra database connection
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables:**
```bash
# Kiểm tra biến môi trường
npx next build --debug

# Validate Prisma schema
npx prisma validate
```

### 2. Performance Issues

**Bundle Analyzer:**
```bash
# Chạy bundle analyzer
npx @next/bundle-analyzer
```

**Database Performance:**
```sql
-- Kiểm tra slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Monitoring Alerts

**Sentry Alerts:**
- Error rate > 1%
- Performance degradation
- Release health drops

**Database Alerts:**
- Connection pool exhaustion
- Slow query detection
- Disk space monitoring

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Logs: `docker-compose logs -f [service-name]`
2. Sentry dashboard cho error tracking
3. Vercel deployment logs
4. Database performance metrics

## 🔄 Backup & Recovery

### 1. Database Backup

```bash
# Tự động backup hàng ngày
# Cấu hình trong docker-compose với cron job

# Manual backup
docker-compose exec postgres pg_dump -U postgres family_expense_manager > backup_$(date +%Y%m%d).sql
```

### 2. Recovery Process

```bash
# Khôi phục từ backup
docker-compose down
docker volume rm family-expense-manager_postgres_data
docker-compose up -d postgres
docker-compose exec -T postgres psql -U postgres -d family_expense_manager < backup.sql
```

---

🎉 **Chúc mừng!** Bạn đã sẵn sàng triển khai ứng dụng lên production với setup hiện đại và bảo mật cao.
