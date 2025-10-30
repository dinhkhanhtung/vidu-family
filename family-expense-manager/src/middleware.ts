import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { analytics } from "@/lib/analytics"

// Custom middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - auth (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|auth/|_next/static|_next/image|favicon.ico|public).*)"
  ]
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
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.umami.is https://accounts.google.com;
    style-src 'self' 'unsafe-inline' https://accounts.google.com;
    img-src 'self' data: https: https://accounts.google.com https://*.googleusercontent.com;
    font-src 'self' https://accounts.google.com;
    connect-src 'self' https://analytics.umami.is https://accounts.google.com;
    frame-src 'self' https://accounts.google.com;
    frame-ancestors 'none';
    form-action 'self' https://accounts.google.com;
  `.replace(/\s+/g, " ").trim()
}

// Simple in-memory rate limiter (best-effort; not suitable for multi-instance without shared store)
const requestHistoryByIp: Map<string, number[]> = new Map()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // per IP per window

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") || ""
  const ip = forwarded.split(",")[0]?.trim()
  return ip || (request as any).ip || "unknown"
}

function isSensitiveApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/transactions") ||
    pathname.startsWith("/api/webhooks/stripe") ||
    pathname.startsWith("/api/admin")
  )
}

function isRateLimited(ip: string, now: number): boolean {
  const history = requestHistoryByIp.get(ip) || []
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const recent = history.filter(ts => ts > windowStart)
  recent.push(now)
  requestHistoryByIp.set(ip, recent)
  return recent.length > RATE_LIMIT_MAX_REQUESTS
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Attach/propagate request id
  const existingRequestId = request.headers.get("x-request-id")
  const requestId = existingRequestId || crypto.randomUUID()
  response.headers.set("x-request-id", requestId)

  // Best-effort rate limiting for sensitive API routes
  if (isSensitiveApiPath(request.nextUrl.pathname)) {
    const ip = getClientIp(request)
    const now = Date.now()
    if (isRateLimited(ip, now)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
            "x-request-id": requestId
          }
        }
      )
    }
  }

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

  // Track request for analytics (simplified without rate limiting)
  analytics.track("page_view", {
    path: request.nextUrl.pathname,
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
