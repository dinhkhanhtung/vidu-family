@echo off
echo Changing to project directory...
cd /d "d:\Dev\Projects\Web\Vidu Family"

echo Current directory:
cd

echo Checking git status...
git status

echo Adding changed files...
git add family-expense-manager/vercel.json

echo Committing changes...
git commit -m "Fix: Add NextAuth routing rules to Vercel config for authentication compatibility

- Added rewrites for /api/auth/(.*) to handle NextAuth routes properly
- This fixes 404 errors on Vercel authentication endpoints
- Ensures Google OAuth callback works correctly on production"

echo Pushing to GitHub...
git push origin main

echo Deployment complete! Vercel should auto-deploy the changes.
