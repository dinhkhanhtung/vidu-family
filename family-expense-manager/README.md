This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Authentication Setup

This project includes a full authentication flow with hybrid support for Google OAuth and email magic-link, with optional fallback to credentials (email/password).

### Features
- **Google OAuth**: Sign in with Google account
- **Magic Link**: Passwordless authentication via email
- **Account Linking**: Safe collision handling for existing emails
- **Password Reset**: Forgot password flow with rate limiting
- **Security**: JWT tokens, bcrypt hashing, rate limiting

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-make-it-very-random-and-long

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (for magic link and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/your-database

# Optional for production
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENTRY_DSN=https://...
```

### Database Setup

1. Run Prisma migration to update database schema:
```bash
npx prisma migrate dev --name add_auth_fields
```

2. Generate Prisma client:
```bash
npx prisma generate
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`

### Testing Authentication

1. Start the development server:
```bash
npm run dev
```

2. Visit `/auth/signin` to test login

3. Test Magic Link:
   - Enter email and submit
   - Check email (use Ethereal for testing: https://ethereal.email/)
   - Click the link to complete sign-in

4. Test Google Sign-in:
   - Click "Tiếp tục với Google"
   - Ensure Google credentials are configured

5. Test Account Linking:
   - Create user via magic link
   - Try Google sign-in with same email
   - Check for confirmation email

### Password Reset Testing

Use Postman or curl to test endpoints:

**Forgot Password:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:3000/api/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"jwt-token-here","password":"newpassword123"}'
```

### Security Notes

- Passwords are hashed with bcryptjs (saltRounds: 10)
- Reset tokens expire in 15 minutes
- Magic links expire after 1 hour (NextAuth default)
- Rate limiting implemented for email endpoints (3 attempts/15 min per IP)
- Consider adding Redis for production rate limiting
- Do not log sensitive information

### Deploy on Vercel

When deploying to Vercel, add these environment variables in the dashboard:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- DATABASE_URL

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production Deployment

### 🚀 Quick Deploy Options

**1. Vercel (Recommended for quick setup)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Follow the checklist in DEPLOY_GUIDE.md
```

**2. Custom VPS/Server (Full control)**
See detailed deployment guide in [`DEPLOY_GUIDE.md`](DEPLOY_GUIDE.md) for step-by-step instructions on deploying to a VPS with Docker, SSL, monitoring, and all requirements for business-ready production.

---

### 📋 Quick Production Checklist

- ✅ SSL certificate configured
- ✅ Database (PostgreSQL) set up
- ✅ Environment variables configured
- ✅ Admin account created
- ✅ Payment gateway (if applicable)
- ✅ Backup strategy implemented
- ✅ Security hardened
- ✅ Monitoring configured

For complete deployment instructions, see [`DEPLOY_GUIDE.md`](DEPLOY_GUIDE.md).
