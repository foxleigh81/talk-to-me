import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LoginForm } from './index'
import { useTalkToMe } from '@lib/hooks/use-talk-to-me'

// Mock the useTalkToMe hook
vi.mock('@lib/hooks/use-talk-to-me')

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockLoginWithEmail = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useTalkToMe).mockReturnValue({
      user: null,
      isAdmin: false,
      supabase: {} as any,
      config: {
        themeColour: '#000000',
        darkMode: false
      },
      login: mockLogin,
      loginWithEmail: mockLoginWithEmail,
      logout: vi.fn(),
      isLoading: false,
      error: null
    })
  })

  it('renders sign in options', () => {
    render(<LoginForm />)
    expect(screen.getByText('Sign in to comment')).toBeInTheDocument()
    expect(screen.getByText('Continue with Email')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('switches to email form when email option is clicked', () => {
    render(<LoginForm />)

    fireEvent.click(screen.getByText('Continue with Email'))

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Send Magic Link')).toBeInTheDocument()
  })

  it('calls loginWithEmail when email form is submitted', () => {
    render(<LoginForm />)

    // Switch to email form
    fireEvent.click(screen.getByText('Continue with Email'))

    // Fill and submit form
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByText('Send Magic Link'))

    expect(mockLoginWithEmail).toHaveBeenCalledWith('test@example.com')
  })

  it('calls login when social button is clicked', () => {
    render(<LoginForm />)

    // Click Google login button
    fireEvent.click(screen.getByText('Google'))

    expect(mockLogin).toHaveBeenCalledWith('google')
  })

  it('shows success message after email is sent', async () => {
    render(<LoginForm />)

    // Switch to email form
    fireEvent.click(screen.getByText('Continue with Email'))

    // Fill and submit form
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Mock the email sending function
    mockLoginWithEmail.mockImplementation(() => {
      return Promise.resolve()
    })

    // Submit form (wrapped in act)
    await act(async () => {
      fireEvent.click(screen.getByText('Send Magic Link'))
      // Allow any promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Assert success message is visible
    expect(screen.getByText('Email Sent')).toBeInTheDocument()
    expect(screen.getByText('Check your email for a magic link to sign in.')).toBeInTheDocument()
  })
})
