import { useEffect, useState } from 'react'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { TalkToMeContext } from '../../context/talk-to-me-context'
import { TalkToMeProviderProps, TalkToMeConfig } from '../../types/context'
import { AuthService } from '../../auth'

export const TalkToMeProvider = ({
  supabaseUrl,
  supabaseAnonKey,
  config,
  children,
}: TalkToMeProviderProps) => {
  const [supabase] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseAnonKey)
  )
  const [authService] = useState(() => new AuthService(supabase))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    authService.getCurrentUser().then(({ user, error }) => {
      if (error) {
        setError(error)
      } else {
        setUser(user)
        if (user) {
          authService.checkAdminStatus(user, config.adminEmails).then(setIsAdmin)
          // Sync user to custom users table
          supabase.functions.invoke('sync-user').catch((err) => {
            console.error('Failed to sync user:', err)
          })
        }
      }
      setIsLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const adminStatus = await authService.checkAdminStatus(currentUser, config.adminEmails)
        setIsAdmin(adminStatus)
        // Sync user to custom users table on sign in
        if (_event === 'SIGNED_IN') {
          supabase.functions.invoke('sync-user').catch((err) => {
            console.error('Failed to sync user:', err)
          })
        }
      } else {
        setIsAdmin(false)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, authService, config.adminEmails])

  const login = async (provider: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await authService.signInWithSocial(provider as any)
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during login'))
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithEmail = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await authService.signInWithEmail(email)
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during login'))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await authService.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during logout'))
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAdmin,
    config,
    login,
    loginWithEmail,
    logout,
    isLoading,
    error,
  }

  return (
    <TalkToMeContext.Provider value={value}>
      {children}
    </TalkToMeContext.Provider>
  )
}
