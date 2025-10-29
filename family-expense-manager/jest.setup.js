import '@testing-library/jest-dom'

// Mock process.env for testing
const originalEnv = process.env

beforeEach(() => {
  // Create fresh env for each test
  process.env = { ...originalEnv }
})

afterEach(() => {
  // Restore original env
  process.env = originalEnv
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global test setup
beforeAll(() => {
  // Setup for all tests
})

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks()
})

afterAll(() => {
  // Cleanup after all tests
})
