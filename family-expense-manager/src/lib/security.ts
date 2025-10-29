import { NextRequest } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:\+84|84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])\d{7}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// Rate limiting configuration
const RATE_LIMITS = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 15 minutes, 100 requests
  strict: { windowMs: 60 * 1000, maxRequests: 10 }, // 1 minute, 10 requests
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 15 minutes, 5 requests for auth endpoints
};

// SQL Injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bor\b\s+\d+\s*=\s*\d+)/i,
  /(\band\b\s+\d+\s*=\s*\d+)/i,
  /('|(\\')|(;)|(\|\|))/,
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
];

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
};

// SQL injection detection
export const detectSQLInjection = (input: string): boolean => {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
};

// XSS detection
export const detectXSS = (input: string): boolean => {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateInput = (
  input: string,
  type: keyof typeof VALIDATION_PATTERNS,
  options?: { required?: boolean; minLength?: number; maxLength?: number }
): { isValid: boolean; error?: string } => {
  const { required = false, minLength = 0, maxLength = 1000 } = options || {};

  // Check if required
  if (required && (!input || input.trim().length === 0)) {
    return { isValid: false, error: 'Trường này là bắt buộc' };
  }

  // Skip validation if not required and empty
  if (!required && (!input || input.trim().length === 0)) {
    return { isValid: true };
  }

  // Length validation
  if (input.length < minLength) {
    return { isValid: false, error: `Độ dài tối thiểu là ${minLength} ký tự` };
  }

  if (input.length > maxLength) {
    return { isValid: false, error: `Độ dài tối đa là ${maxLength} ký tự` };
  }

  // Pattern validation
  const pattern = VALIDATION_PATTERNS[type];
  if (!pattern.test(input)) {
    const errorMessages = {
      email: 'Email không hợp lệ',
      phone: 'Số điện thoại không hợp lệ',
      amount: 'Số tiền không hợp lệ',
      password: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
      slug: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
    };

    return { isValid: false, error: errorMessages[type] || 'Dữ liệu không hợp lệ' };
  }

  return { isValid: true };
};

// Rate limiting check
export const checkRateLimit = (
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'default'
): { allowed: boolean; resetTime?: number; remaining?: number } => {
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // Create new rate limit window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return {
      allowed: true,
      resetTime: now + limit.windowMs,
      remaining: limit.maxRequests - 1,
    };
  }

  if (existing.count >= limit.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      resetTime: existing.resetTime,
      remaining: 0,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    resetTime: existing.resetTime,
    remaining: limit.maxRequests - existing.count,
  };
};

// Clean up expired rate limit entries
export const cleanupRateLimitStore = (): void => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Security middleware for API routes
export const securityMiddleware = (request: NextRequest, type: keyof typeof RATE_LIMITS = 'default') => {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // Check rate limiting
  const rateLimitResult = checkRateLimit(clientIP, type);
  if (!rateLimitResult.allowed) {
    return {
      error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      status: 429,
      resetTime: rateLimitResult.resetTime,
    };
  }

  // Check for suspicious user agents
  const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return {
      error: 'Truy cập bị từ chối',
      status: 403,
    };
  }

  return { allowed: true };
};

// Sanitize HTML content
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
  });
};

// Generate secure random string
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate file upload
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: 'Kích thước file không được vượt quá 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Loại file không được hỗ trợ' };
  }

  return { isValid: true };
};

// Periodic cleanup (call this in a cron job or interval)
setInterval(cleanupRateLimitStore, 5 * 60 * 1000); // Clean up every 5 minutes
