import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { analytics } from "@/lib/analytics"

// Custom middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"
  ]
}

// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}

// Store for rate limiting
const rateLimitStore = new Map()

// Helper to check rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - rateLimit.windowMs

  // Clean up old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.timestamp < windowStart) {
      rateLimitStore.delete(key)
    }
  }

  // Check current IP
  const current = rateLimitStore.get(ip) || { count: 0, timestamp: now }
  
  if (current.timestamp < windowStart) {
    current.count = 0
    current.timestamp = now
  }

  if (current.count >= rateLimit.max) {
    return false
  }

  current.count++
  rateLimitStore.set(ip, current)
  return true
}

// Security headers
const securityHeaders = {
  // Disable iframes
  "X-Frame-Options": "DENY",
  // XSS protection
  "X-XSS-Protection": "1; mode=block",
  // Disable content type sniffing
  "X-Content-Type-Options": "nosniff",
  // Strict HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content security policy
  "Content-Security-Policy": `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.umami.is;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://analytics.umami.is;
    frame-ancestors 'none';
    form-action 'self';
  `.replace(/\s+/g, " ").trim()
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const ip = request.ip || "127.0.0.1"
  
  // Rate limiting
  if (!checkRateLimit(ip)) {
    analytics.track("rate_limit_exceeded", { ip })
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "900" } // 15 minutes
    })
  }

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Verify authentication for protected routes
  if (shouldProtectRoute(request.nextUrl.pathname)) {
    const token = await getToken({ req: request })
    if (!token) {
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(url)
    }

    // Add user context for analytics
    if (token.email) {
      analytics.identify(token.sub as string, {
        email: token.email
      })
    }
  }

  // Track request for analytics
  analytics.track("page_view", {
    path: request.nextUrl.pathname,
    ip,
    userAgent: request.headers.get("user-agent")
  })

  return response
}

// Helper to determine if a route should be protected
function shouldProtectRoute(pathname: string): boolean {
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot",
    "/auth/reset",
    "/pricing",
    "/about",
    "/contact",
    "/premium-demo"
  ]

  // Allow public paths and their sub-routes
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return false
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return false
  }

  // Protect everything else
  return true
}