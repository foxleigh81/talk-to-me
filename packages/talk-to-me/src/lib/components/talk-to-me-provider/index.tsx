import { useEffect, useState } from 'react'
import { createClient, SupabaseClient, User, Provider } from '@supabase/supabase-js'
import { TalkToMeContext } from '@lib/context/talk-to-me-context'
import { TalkToMeProviderProps } from '@lib/types/context'
import { AuthService } from '@lib/auth'
import '../../styles/global.css'

export const TalkToMeProvider = ({
  supabaseUrl,
  supabaseAnonKey,
  config,
  children,
}: TalkToMeProviderProps) => {
  const [supabase] = useState<SupabaseClient>(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and anon key are required')
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  })

  const [authService] = useState(() => new AuthService(supabase))
  const [user, setUser] = useState<User | null>(null)
  // Initialize isLoading to false to avoid loading state issues
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Effect to check the initial user
  useEffect(() => {
    const checkInitialUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          setError(error)
          setUser(null)
          return
        }

        if (data.user) {
          setUser(data.user)
          const adminStatus = await authService.checkAdminStatus(data.user)
          setIsAdmin(adminStatus)
        }
      } catch (err) {
        console.error('Error checking initial user:', err)
      }
    }

    checkInitialUser()
  }, [supabase.auth, authService])

  // Listen for changes on auth state
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const adminStatus = await authService.checkAdminStatus(currentUser)
        setIsAdmin(adminStatus)

        // Sync user to custom users table on sign in
        if (_event === 'SIGNED_IN') {
          try {
            const response = await supabase.functions.invoke('sync-user')
            if (response.error) {
              console.error('Error from sync-user function:', response.error)
            }
          } catch (err) {
            console.error('Failed to invoke sync-user function on sign in:', err)
          }
        }
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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
