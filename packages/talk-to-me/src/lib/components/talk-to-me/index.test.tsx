import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TalkToMe } from './index'

// Mock the useTalkToMe hook
const mockUseTalkToMe = vi.fn()
vi.mock('@lib/hooks/use-talk-to-me', () => ({
  useTalkToMe: () => mockUseTalkToMe()
}))

describe('TalkToMe', () => {
  const mockSupabase = {
    from: vi.fn(),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnValue({
        subscribe: vi.fn().mockReturnValue({
          unsubscribe: vi.fn()
        })
      })
    })
  }

  const mockComments = [
    {
      id: '1',
      post_id: 'test-post',
      author_id: 'user-1',
      content: 'Test comment',
      status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      author: {
        email: 'test@example.com',
        user_metadata: {
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTalkToMe.mockReturnValue({
      user: null,
      isAdmin: false,
      supabase: mockSupabase
    })
  })

  it('renders loading state initially', async () => {
    // Set up a delayed response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(
            new Promise(resolve => {
              setTimeout(() => {
                resolve({ data: [], error: null })
              }, 100)
            })
          )
        })
      })
    })

    render(<TalkToMe postId="test-post" />)
    expect(screen.getByText('Loading comments...')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument()
    })
  })

  it('loads and displays comments', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockComments,
            error: null
          })
        })
      })
    })

    render(<TalkToMe postId="test-post" />)

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument()
    })
  })

  it('shows login prompt when user is not authenticated', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })
    })

    render(<TalkToMe postId="test-post" />)

    await waitFor(() => {
      expect(screen.getByText('Please sign in to leave a comment')).toBeInTheDocument()
    })
  })

  it('allows admin to approve comments', async () => {
    const mockAdminUser = {
      id: 'admin-1',
      email: 'admin@example.com'
    }

    mockUseTalkToMe.mockReturnValue({
      user: mockAdminUser,
      isAdmin: true,
      supabase: mockSupabase
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                ...mockComments[0],
                status: 'pending'
              }
            ],
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    render(<TalkToMe postId="test-post" />)

    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Approve'))

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('comments')
    })
  })
})
