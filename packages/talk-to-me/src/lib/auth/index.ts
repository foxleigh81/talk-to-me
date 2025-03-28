import { SupabaseClient, User } from '@supabase/supabase-js'
import { SocialProvider } from '@lib/types/context'
import md5 from 'md5'

export interface AuthError extends Error {
  code?: string
}

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async signInWithEmail(email: string): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to send magic link'),
      }
    }
  }

  async signInWithSocial(provider: SocialProvider): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to sign in with social provider'),
      }
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to sign out'),
      }
    }
  }

  getGravatarUrl(email: string, size: number = 80): string {
    const hash = md5(email.toLowerCase().trim())
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return { user: data?.user ?? null, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to get current user'),
      }
    }
  }

  async checkAdminStatus(user: User, adminEmails: string[]): Promise<boolean> {
    if (!user.email) return false
    return adminEmails.includes(user.email.toLowerCase())
  }
}
