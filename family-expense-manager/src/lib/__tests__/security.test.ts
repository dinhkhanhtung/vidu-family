import {
  sanitizeInput,
  validateInput,
  detectSQLInjection,
  detectXSS,
  checkRateLimit,
  generateSecureToken,
} from '../security'

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\x00string'
      const result = sanitizeInput(input)
      expect(result).toBe('teststring')
    })

    it('should remove control characters', () => {
      const input = 'test\x01\x02string'
      const result = sanitizeInput(input)
      expect(result).toBe('teststring')
    })

    it('should trim whitespace', () => {
      const input = '  test  '
      const result = sanitizeInput(input)
      expect(result).toBe('test')
    })

    it('should handle non-string input', () => {
      const result = sanitizeInput(123 as any)
      expect(result).toBe('')
    })
  })

  describe('validateInput', () => {
    describe('email validation', () => {
      it('should validate correct email', () => {
        const result = validateInput('test@example.com', 'email')
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid email', () => {
        const result = validateInput('invalid-email', 'email')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Email không hợp lệ')
      })
    })

    describe('password validation', () => {
      it('should validate strong password', () => {
        const result = validateInput('StrongPass123!', 'password')
        expect(result.isValid).toBe(true)
      })

      it('should reject weak password', () => {
        const result = validateInput('weak', 'password')
        expect(result.isValid).toBe(false)
        expect(result.error).toMatch(/Mật khẩu phải có ít nhất 8 ký tự/)
      })
    })

    describe('amount validation', () => {
      it('should validate correct amount', () => {
        const result = validateInput('123.45', 'amount')
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid amount', () => {
        const result = validateInput('abc', 'amount')
        expect(result.isValid).toBe(false)
      })
    })

    describe('length validation', () => {
      it('should enforce minimum length', () => {
        const result = validateInput('a', 'email', { minLength: 5 })
        expect(result.isValid).toBe(false)
        expect(result.error).toMatch(/Độ dài tối thiểu/)
      })

      it('should enforce maximum length', () => {
        const result = validateInput('a'.repeat(1000), 'email', { maxLength: 100 })
        expect(result.isValid).toBe(false)
        expect(result.error).toMatch(/Độ dài tối đa/)
      })
    })
  })

  describe('detectSQLInjection', () => {
    it('should detect basic SQL injection patterns', () => {
      expect(detectSQLInjection("'; DROP TABLE users; --")).toBe(true)
      expect(detectSQLInjection('1 OR 1=1')).toBe(true)
    })

    it('should not flag normal input', () => {
      expect(detectSQLInjection('normal input')).toBe(false)
      expect(detectSQLInjection('John Doe')).toBe(false)
    })
  })

  describe('detectXSS', () => {
    it('should detect XSS patterns', () => {
      expect(detectXSS('<script>alert("xss")</script>')).toBe(true)
      expect(detectXSS('javascript:alert(1)')).toBe(true)
      expect(detectXSS('<img src=x onerror=alert(1)>')).toBe(true)
    })

    it('should not flag normal input', () => {
      expect(detectXSS('normal <text> content')).toBe(false)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token of correct length', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(16)
    })

    it('should generate different tokens', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      expect(token1).not.toBe(token2)
    })

    it('should use valid characters', () => {
      const token = generateSecureToken(100)
      const validChars = /^[A-Za-z0-9]+$/
      expect(validChars.test(token)).toBe(true)
    })
  })

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Reset rate limit store
      jest.clearAllTimers()
    })

    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-ip', 'default')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeLessThanOrEqual(100)
    })

    it('should block requests over limit', () => {
      const ip = 'test-ip'

      // Use up all requests
      for (let i = 0; i < 100; i++) {
        checkRateLimit(ip, 'default')
      }

      // Next request should be blocked
      const result = checkRateLimit(ip, 'default')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })
})
