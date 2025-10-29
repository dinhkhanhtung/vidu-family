import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorBoundary, DefaultErrorFallback } from '../ErrorBoundary'

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockConsoleError.mockClear()
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  const ThrowError = () => {
    throw new Error('Test error')
  }

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('should catch and display error fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Đã xảy ra lỗi không mong muốn')).toBeInTheDocument()
    expect(screen.getByText('Thử lại')).toBeInTheDocument()
    expect(screen.getByText('Tải lại trang')).toBeInTheDocument()

    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should show error details in development mode', () => {
    const envSpy = jest.spyOn(process.env, 'NODE_ENV', 'get').mockReturnValue('development')

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error')).toBeInTheDocument()

    envSpy.mockRestore()
  })

  it('should not show error details in production mode', () => {
    const envSpy = jest.spyOn(process.env, 'NODE_ENV', 'get').mockReturnValue('production')

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Test error')).not.toBeInTheDocument()

    envSpy.mockRestore()
  })

  it('should reset error when retry is clicked', async () => {
    let shouldThrow = true

    const ConditionalThrow = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Recovered content</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    )

    expect(screen.getByText('Đã xảy ra lỗi không mong muốn')).toBeInTheDocument()

    // Click retry button
    shouldThrow = false
    fireEvent.click(screen.getByText('Thử lại'))

    rerender(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('Recovered content')).toBeInTheDocument()
    })
  })

  it('should use custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })
})

describe('DefaultErrorFallback', () => {
  it('should render error message and actions', () => {
    render(<DefaultErrorFallback />)

    expect(screen.getByText('Đã xảy ra lỗi không mong muốn')).toBeInTheDocument()
    expect(screen.getByText('Thử lại')).toBeInTheDocument()
    expect(screen.getByText('Tải lại trang')).toBeInTheDocument()
  })

  it('should show error details when error provided', () => {
    const testError = new Error('Test error message')

    render(<DefaultErrorFallback error={testError} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should call resetError when retry clicked', () => {
    const mockReset = jest.fn()

    render(<DefaultErrorFallback resetError={mockReset} />)

    fireEvent.click(screen.getByText('Thử lại'))

    expect(mockReset).toHaveBeenCalled()
  })

  it('should reload page when reload clicked', () => {
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(<DefaultErrorFallback />)

    fireEvent.click(screen.getByText('Tải lại trang'))

    expect(mockReload).toHaveBeenCalled()
  })
})
