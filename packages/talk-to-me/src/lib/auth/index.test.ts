import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './index'
import { createClient } from '@supabase/supabase-js'
import { SocialProvider } from '../types/context'
import md5 from 'md5'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signInWithOtp: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    authService = new AuthService(mockSupabase)
  })

  describe('signInWithEmail', () => {
    it('should successfully send magic link', async () => {
      const email = 'test@example.com'
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ error: null })

      const result = await authService.signInWithEmail(email)

      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
    })

    it('should handle errors when sending magic link', async () => {
      const email = 'test@example.com'
      const error = new Error('Failed to send')
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ error })

      const result = await authService.signInWithEmail(email)

      expect(result.user).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('signInWithSocial', () => {
    it('should successfully initiate social sign in', async () => {
      const provider = 'google' as SocialProvider
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null })

      const result = await authService.signInWithSocial(provider)

      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      })
    })

    it('should handle errors when signing in with social provider', async () => {
      const provider = 'google' as SocialProvider
      const error = new Error('Failed to sign in')
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error })

      const result = await authService.signInWithSocial(provider)

      expect(result.user).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle errors when signing out', async () => {
      const error = new Error('Failed to sign out')
      mockSupabase.auth.signOut.mockResolvedValue({ error })

      const result = await authService.signOut()

      expect(result.user).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('getGravatarUrl', () => {
    it('should generate correct Gravatar URL', () => {
      const email = 'test@example.com'
      const size = 100

      const url = authService.getGravatarUrl(email, size)

      expect(url).toBe(`https://www.gravatar.com/avatar/${md5(email.toLowerCase().trim())}?s=${size}&d=mp`)
    })
  })

  describe('getCurrentUser', () => {
    it('should successfully get current user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authService.getCurrentUser()

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle errors when getting current user', async () => {
      const error = new Error('Failed to get user')
      mockSupabase.auth.getUser.mockResolvedValue({ error })

      const result = await authService.getCurrentUser()

      expect(result.user).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('checkAdminStatus', () => {
    it('should return true for admin email', async () => {
      const user = { email: 'admin@example.com' }
      const adminEmails = ['admin@example.com']

      const result = await authService.checkAdminStatus(user as any, adminEmails)

      expect(result).toBe(true)
    })

    it('should return false for non-admin email', async () => {
      const user = { email: 'user@example.com' }
      const adminEmails = ['admin@example.com']

      const result = await authService.checkAdminStatus(user as any, adminEmails)

      expect(result).toBe(false)
    })

    it('should return false for user without email', async () => {
      const user = { email: null }
      const adminEmails = ['admin@example.com']

      const result = await authService.checkAdminStatus(user as any, adminEmails)

      expect(result).toBe(false)
    })
  })
})
