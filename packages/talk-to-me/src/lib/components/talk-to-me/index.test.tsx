import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { TalkToMe } from './index'
import { useTalkToMe } from '@lib/hooks/use-talk-to-me'
import { SupabaseClient } from '@supabase/supabase-js'
import { TalkToMeConfig } from '@lib/types/context'

// Mock the useTalkToMe hook
vi.mock('@lib/hooks/use-talk-to-me')

describe('TalkToMe', () => {
  const mockComment = {
    id: '1',
    post_id: '123',
    author_id: '456',
    content: 'Test comment',
    created_at: '2025-03-28T00:00:00.000Z',
    status: 'pending',
    author: {
      id: '456',
      email: 'test@example.com'
    }
  }

  const mockConfig: TalkToMeConfig = {
    adminEmails: ['admin@example.com'],
    socialProviders: ['google'],
    themeColour: '#000000',
    darkMode: false
  }

  const mockUser = {
    id: '789',
    email: 'admin@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  }

  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(Promise.resolve({ data: [mockComment], error: null }))
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(Promise.resolve({ error: null }))
      }),
      insert: vi.fn().mockReturnValue(Promise.resolve({ error: null }))
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnValue({
        subscribe: vi.fn().mockReturnValue({
          unsubscribe: vi.fn()
        })
      })
    }),
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    },
    realtime: {
      channel: vi.fn(),
      setAuth: vi.fn()
    },
    rest: {
      from: vi.fn(),
      rpc: vi.fn()
    },
    storage: {
      from: vi.fn(),
      createSignedUrl: vi.fn(),
      createSignedUploadUrl: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      list: vi.fn(),
      remove: vi.fn(),
      upload: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    },
    realtimeUrl: 'wss://test.supabase.co/realtime/v1',
    authUrl: 'https://test.supabase.co/auth/v1',
    storageUrl: 'https://test.supabase.co/storage/v1',
    databaseUrl: 'https://test.supabase.co/rest/v1',
    schema: 'public',
    headers: {},
    global: {
      headers: {}
    }
  } as unknown as SupabaseClient

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup the default mock implementation
    vi.mocked(useTalkToMe).mockReturnValue({
      user: mockUser,
      isAdmin: true,
      supabase: mockSupabase,
      config: mockConfig,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: null
    })
  })

  it('renders loading state initially', async () => {
    render(<TalkToMe postId="123" />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('loads and displays comments', async () => {
    render(<TalkToMe postId="123" />)
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText('Test comment')).toBeInTheDocument()
  })

  it('shows login prompt when user is not authenticated', async () => {
    vi.mocked(useTalkToMe).mockReturnValue({
      user: null,
      isAdmin: false,
      supabase: mockSupabase,
      config: mockConfig,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: null
    })

    render(<TalkToMe postId="123" />)
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText(/please sign in/i)).toBeInTheDocument()
  })

  it('allows admin to approve comments', async () => {
    render(<TalkToMe postId="123" />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check for pending comment and approve button
    const comment = screen.getByRole('listitem')
    expect(comment).toHaveClass('t-t-m-comment t-t-m-pending')
    const approveButton = screen.getByRole('button', { name: /approve/i })
    expect(approveButton).toBeInTheDocument()

    // Click approve button
    await act(async () => {
      fireEvent.click(approveButton)
    })

    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('comments')
    expect(mockSupabase.from('comments').update).toHaveBeenCalledWith({ status: 'approved' })
  })
})
