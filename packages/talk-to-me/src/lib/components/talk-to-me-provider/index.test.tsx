import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@lib/auth'
import { TalkToMeProvider } from '.'
import { TalkToMeContext } from '@lib/context/talk-to-me-context'
import { useContext } from 'react'

// Mock the AuthService
vi.mock('@lib/auth', () => {
  // Create a mock class that extends AuthService
  class MockAuthService {
    signInWithEmail = vi.fn().mockResolvedValue({ user: null, error: null })
    signInWithSocial = vi.fn().mockResolvedValue({ user: null, error: null })
    signOut = vi.fn().mockResolvedValue({ user: null, error: null })
    getCurrentUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })
    getGravatarUrl = vi.fn().mockReturnValue('https://example.com/avatar.jpg')
    checkAdminStatus = vi.fn().mockResolvedValue(false)
  }

  return {
    AuthService: vi.fn().mockImplementation(() => new MockAuthService()),
  }
})

// Mock the useTalkToMe hook
vi.mock('@lib/hooks/use-talk-to-me', () => ({
  useTalkToMe: vi.fn(),
}))

// Test component to access context
const TestChild = () => {
  const context = useContext(TalkToMeContext)
  if (!context) {
    return <div>Context not provided</div>
  }
  return (
    <div>
      <div>Test Child</div>
      {context.isLoading && <div>Loading State Active</div>}
      {!context.isLoading && <div>Loading Completed</div>}
    </div>
  )
}

describe('TalkToMeProvider', () => {
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    themeColour: '#000000',
    darkMode: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(
      <TalkToMeProvider
        supabaseUrl={mockConfig.supabaseUrl}
        supabaseAnonKey={mockConfig.supabaseKey}
        config={mockConfig}
      >
        <div>Test Child</div>
      </TalkToMeProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('initializes with loading state', async () => {
    // Create a delayed promise that won't resolve during the test
    const delayedPromise = new Promise<{ user: null, error: null }>((resolve) => {
      // This will never resolve during the test
      setTimeout(() => resolve({ user: null, error: null }), 10000)
    })

    // Mock getCurrentUser to return the delayed promise
    vi.mocked(AuthService).mockImplementation(() => ({
      signInWithEmail: vi.fn().mockResolvedValue({ user: null, error: null }),
      signInWithSocial: vi.fn().mockResolvedValue({ user: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ user: null, error: null }),
      getCurrentUser: vi.fn().mockReturnValue(delayedPromise),
      getGravatarUrl: vi.fn().mockReturnValue('https://example.com/avatar.jpg'),
      checkAdminStatus: vi.fn().mockResolvedValue(false),
    }) as unknown as AuthService)

    render(
      <TalkToMeProvider
        supabaseUrl={mockConfig.supabaseUrl}
        supabaseAnonKey={mockConfig.supabaseKey}
        config={mockConfig}
      >
        <TestChild />
      </TalkToMeProvider>
    )

    // The loading state should be visible now
    expect(screen.getByText('Loading State Active')).toBeInTheDocument()
  })

  it('handles user authentication state', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
    }

    // Override the getCurrentUser implementation for this test
    vi.mocked(AuthService).mockImplementation(() => ({
      signInWithEmail: vi.fn().mockResolvedValue({ user: null, error: null }),
      signInWithSocial: vi.fn().mockResolvedValue({ user: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ user: null, error: null }),
      getCurrentUser: vi.fn().mockResolvedValue({ user: mockUser, error: null }),
      getGravatarUrl: vi.fn().mockReturnValue('https://example.com/avatar.jpg'),
      checkAdminStatus: vi.fn().mockResolvedValue(false),
    }) as unknown as AuthService)

    render(
      <TalkToMeProvider
        supabaseUrl={mockConfig.supabaseUrl}
        supabaseAnonKey={mockConfig.supabaseKey}
        config={mockConfig}
      >
        <TestChild />
      </TalkToMeProvider>
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Loading Completed')).toBeInTheDocument()
  })

  it('handles authentication errors', async () => {
    const mockError = new Error('Auth error')

    // Override the getCurrentUser implementation for this test
    vi.mocked(AuthService).mockImplementation(() => ({
      signInWithEmail: vi.fn().mockResolvedValue({ user: null, error: null }),
      signInWithSocial: vi.fn().mockResolvedValue({ user: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ user: null, error: null }),
      getCurrentUser: vi.fn().mockResolvedValue({ user: null, error: mockError }),
      getGravatarUrl: vi.fn().mockReturnValue('https://example.com/avatar.jpg'),
      checkAdminStatus: vi.fn().mockResolvedValue(false),
    }) as unknown as AuthService)

    render(
      <TalkToMeProvider
        supabaseUrl={mockConfig.supabaseUrl}
        supabaseAnonKey={mockConfig.supabaseKey}
        config={mockConfig}
      >
        <TestChild />
      </TalkToMeProvider>
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Loading Completed')).toBeInTheDocument()
  })
})
