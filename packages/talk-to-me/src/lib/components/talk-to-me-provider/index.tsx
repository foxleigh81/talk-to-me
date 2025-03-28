import { useEffect, useState } from 'react'
import { createClient, SupabaseClient, User, Provider } from '@supabase/supabase-js'
import { TalkToMeContext } from '@lib/context/talk-to-me-context'
import { TalkToMeProviderProps } from '@lib/types/context'
import { AuthService } from '@lib/auth'

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
          authService.checkAdminStatus(user).then(setIsAdmin)
          // Sync user to custom users table
          console.log('Attempting to sync user on initial load')
          supabase.functions.invoke('sync-user')
            .then(response => {
              if (response.error) {
                console.error('Error from sync-user function:', response.error)
              } else {
                console.log('User sync successful:', response)
              }
            })
            .catch((err) => {
              console.error('Failed to invoke sync-user function:', err)
            })
        }
      }
      setIsLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const adminStatus = await authService.checkAdminStatus(currentUser)
        setIsAdmin(adminStatus)
        // Sync user to custom users table on sign in
        if (_event === 'SIGNED_IN') {
          console.log('Attempting to sync user after SIGNED_IN event')
          supabase.functions.invoke('sync-user')
            .then(response => {
              if (response.error) {
                console.error('Error from sync-user function:', response.error)
              } else {
                console.log('User sync successful on sign in:', response)
              }
            })
            .catch((err) => {
              console.error('Failed to invoke sync-user function on sign in:', err)
            })
        }
      } else {
        setIsAdmin(false)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, authService])

  const login = async (provider: Provider) => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await authService.signInWithSocial(provider)
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
    supabase,
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
