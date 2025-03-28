import { useEffect, useState } from 'react'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { TalkToMeContext } from '../../context/talk-to-me-context'
import { TalkToMeProviderProps, TalkToMeConfig } from '../../types/context'

export const TalkToMeProvider = ({
  supabaseUrl,
  supabaseAnonKey,
  config,
  children,
}: TalkToMeProviderProps) => {
  const [supabase] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseAnonKey)
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const isAdmin = user ? config.adminEmails.includes(user.email ?? '') : false

  const login = async (provider: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
      })
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
      const { error } = await supabase.auth.signOut()
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
