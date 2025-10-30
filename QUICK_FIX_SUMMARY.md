# 🎯 TÓM TẮT NHANH: Cách fix lỗi 404 đăng nhập Google

## ✅ Cái gì đã fix:
1. **Thêm NEXTAUTH_SECRET** vào auth config
2. **Fix EmailProvider** để work với Resend khi SMTP empty

## ⚠️ CÁI CẦN LÀM NGAY (QUAN TRỌNG NHẤT):

### 1. Fix Google Cloud Console - Redirect URI

Vào: https://console.cloud.google.com/apis/credentials

Tìm OAuth 2.0 Client ID: `437224187254-1eihf012ir65upro0tuococefm8vjth6`

**Sửa 2 chỗ:**

1. **Authorized JavaScript origins:**
   ```
   ❌ Xóa: https://vidu-family.app
   ✅ Thêm: https://vidu-family.vercel.app
   ```

2. **Authorized redirect URIs:**
   ```
   ❌ Xóa: https://vidu-family.app/api/auth/callback/google
   ✅ Thêm: https://vidu-family.vercel.app/api/auth/callback/google
   ```

**Save** và đợi 5 phút!

### 2. Push code lên GitHub

```bash
git add .
git commit -m "Fix: Add NEXTAUTH_SECRET and EmailProvider config"
git push
```

Vercel tự động deploy.

### 3. Test

1. Đợi 5-10 phút sau khi fix Google Console
2. Vào: https://vidu-family.vercel.app/auth/signin
3. Nhấn "Tiếp tục với Google"
4. Should work! ✅

---

## 🐛 Nếu vẫn lỗi sau 10 phút:

1. **Hard refresh browser:** Ctrl+Shift+R
2. **Xem logs Vercel:** Dashboard → Deployments → Latest → Function Logs
3. **Check Google Console:** Xác nhận redirect URI đã đổi thành `*.vercel.app`
4. **Wait thêm 5 phút:** Google OAuth settings cần thời gian propagate

## 📝 Checklist:

- [ ] Đã sửa Google Console redirect URI → `*.vercel.app`
- [ ] Đã push code mới lên GitHub
- [ ] Đã đợi 5-10 phút
- [ ] Đã test Google OAuth login
- [ ] Đã test Magic Link email

## 💡 Lý do lỗi:

**Domain mismatch!** Google OAuth cần redirect URI chính xác khớp với domain app. 
Bạn đã config `vidu-family.app` nhưng app chạy trên `vidu-family.vercel.app`.

Sửa xong là OK! 🎉

