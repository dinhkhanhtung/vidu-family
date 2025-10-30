# 🔧 Cách khắc phục lỗi 404 khi đăng nhập Google

## ❌ Vấn đề hiện tại

1. **Lỗi 404 NOT_FOUND** khi nhấn "Đăng nhập với Google"
2. **Liên kết đăng nhập email cũng báo 404**
3. **Redirect URI không khớp** giữa Google Console và Vercel

## 🔍 Nguyên nhân

### 1. Redirect URI sai domain ⚠️ QUAN TRỌNG NHẤT
- Trong Google Cloud Console, bạn đã cấu hình:
  - Redirect URI: `https://vidu-family.app/api/auth/callback/google`
- Nhưng app đang chạy trên Vercel với domain:
  - Domain thực tế: `https://vidu-family.vercel.app`

### 2. Thiếu NEXTAUTH_SECRET trong code (đã fix ✅)
- Đã thêm `secret: process.env.NEXTAUTH_SECRET` vào auth config

### 3. SMTP config cho EmailProvider (đã fix ✅)
- Đã fix để work với Resend khi SMTP empty

## ✅ Giải pháp

### Bước 1: Cập nhật Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn (`437224187254-1eihf012ir65upro0tuococefm8vjth6`)
5. Trong phần **Authorized redirect URIs**, sửa lại:

```
❌ Xóa: https://vidu-family.app/api/auth/callback/google
✅ Thêm: https://vidu-family.vercel.app/api/auth/callback/google
```

6. Trong phần **Authorized JavaScript origins**, cũng sửa lại:

```
❌ Xóa: https://vidu-family.app
✅ Thêm: https://vidu-family.vercel.app
```

7. Click **Save**
8. ⏰ Đợi 5 phút - vài giờ để Google cập nhật

### Bước 2: Cấu hình Environment Variables trên Vercel

✅ **Bạn đã import đầy đủ rồi!** Đây là env vars bạn đã có:

```env
# ✅ Database (Supabase)
DATABASE_URL="postgresql://your-db-connection-string"

# ✅ App URL
NEXTAUTH_URL="https://vidu-family.vercel.app"

# ✅ NextAuth Secret
NEXTAUTH_SECRET="your-random-secret-here"



# ✅ Email (Resend - miễn phí)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM="onboarding@resend.dev"

# ✅ Cron Secret
CRON_SECRET="your-cron-secret"

# ✅ SMTP (empty - sử dụng Resend)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
```

**Điền các giá trị thực tế cho các env vars.** ✅

### Bước 3: Commit và Push code mới lên GitHub

Code đã được fix (thêm NEXTAUTH_SECRET và fix EmailProvider). Cần push lên:

```bash
git add .
git commit -m "Fix: Add NEXTAUTH_SECRET and EmailProvider config for Resend"
git push origin master
```

Vercel sẽ tự động deploy code mới.

Hoặc nếu muốn redeploy ngay:
1. Trong Vercel Dashboard, vào tab **Deployments**
2. Click vào **⋯** (3 chấm) của deployment mới nhất
3. Chọn **Redeploy**
4. Chờ deployment hoàn thành

### Bước 4: Test lại

1. Vào `https://vidu-family.vercel.app/auth/signin`
2. Nhấn "Tiếp tục với Google"
3. Chọn tài khoản Google
4. Kiểm tra redirect về app thành công

## 🧪 Test Magic Link (Email đăng nhập)

1. Vào `/auth/signin`
2. Nhập email của bạn
3. Nhấn "Gửi liên kết đăng nhập"
4. Kiểm tra email (và spam folder)
5. Click vào link trong email
6. Nên redirect về app và đăng nhập thành công

## 📝 Checklist

- [ ] Đã sửa **Authorized redirect URIs** trong Google Console thành `*.vercel.app`
- [ ] Đã sửa **Authorized JavaScript origins** trong Google Console thành `*.vercel.app`
- [ ] Đã thêm `NEXTAUTH_URL` vào Vercel env vars
- [ ] Đã thêm `NEXTAUTH_SECRET` vào Vercel env vars (random 32+ chars)
- [ ] Đã thêm `GOOGLE_CLIENT_ID` vào Vercel env vars
- [ ] Đã thêm `GOOGLE_CLIENT_SECRET` vào Vercel env vars
- [ ] Đã redeploy trên Vercel
- [ ] Đã đợi 5+ phút sau khi save Google Console
- [ ] Đã test lại Google OAuth login
- [ ] Đã test lại Magic Link

## 🐛 Nếu vẫn lỗi

### Kiểm tra logs trên Vercel:
1. Vào Vercel Dashboard → **Deployments** → Click vào deployment mới nhất
2. Xem **Function Logs** hoặc **Build Logs**
3. Tìm lỗi liên quan đến NextAuth hoặc OAuth

### Kiểm tra Network:
1. Mở DevTools (F12)
2. Tab **Network**
3. Thử đăng nhập lại
4. Xem request nào fail (status 404 hoặc 500)

### Common issues:

**❌ "redirect_uri_mismatch"**
→ Google Console chưa cập nhật redirect URI đúng

**❌ "Invalid client secret"**
→ GOOGLE_CLIENT_SECRET sai hoặc chưa được set

**❌ "NextAuth requires a secret"**
→ NEXTAUTH_SECRET chưa được set trên Vercel

**❌ Vẫn 404**
→ Chờ thêm vài phút sau khi update Google Console, hoặc hard refresh (Ctrl+Shift+R)

## 💡 Tips

- Nếu test trên local development, sử dụng `http://localhost:3000`
- Production phải dùng `https://vidu-family.vercel.app` (không phải `.app`)
- Google OAuth settings có thể mất 5 phút - vài giờ mới có hiệu lực
- Kiểm tra `NEXTAUTH_URL` phải khớp chính xác với domain Vercel (không có trailing slash)
