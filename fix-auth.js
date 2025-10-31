// Fix script for NextAuth Vercel deployment issues
const fs = require('fs');
const path = require('path');

// Fix vercel.json to ensure proper redirects
const vercelConfigPath = path.join(__dirname, 'family-expense-manager', 'vercel.json');
let vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

// Ensure proper rewrites for NextAuth
if (!vercelConfig.rewrites) {
  vercelConfig.rewrites = [];
}

// Add NextAuth rewrites if not present
const hasNextAuthRewrite = vercelConfig.rewrites.some(rewrite =>
  rewrite.source === '/api/auth/(.*)' && rewrite.destination === '/api/auth/[...nextauth]'
);

if (!hasNextAuthRewrite) {
  vercelConfig.rewrites.push({
    "source": "/api/auth/(.*)",
    "destination": "/api/auth/[...nextauth]"
  });
}

fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

// Ensure proper environment variables are documented
const envProductionPath = path.join(__dirname, 'family-expense-manager', '.env.production');
let envProd = fs.readFileSync(envProductionPath, 'utf8');

// Ensure NEXTAUTH_URL is correct
if (!envProd.includes('NEXTAUTH_URL="https://vidu-family.vercel.app"')) {
  envProd = envProd.replace(/NEXTAUTH_URL=.*/, 'NEXTAUTH_URL="https://vidu-family.vercel.app"');
  fs.writeFileSync(envProductionPath, envProd);
}

console.log('✅ Auth fixes applied');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Update Google Cloud Console redirect URI from .app to .vercel.app');
console.log('2. Set environment variables in Vercel dashboard');
console.log('3. Redeploy the application');
console.log('');
console.log('🔗 Google Console Settings:');
console.log('Authorized redirect URIs:');
console.log('  https://vidu-family.vercel.app/api/auth/callback/google');
console.log('Authorized JavaScript origins:');
console.log('  https://vidu-family.vercel.app');
