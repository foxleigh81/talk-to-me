import { User, SupabaseClient } from '@supabase/supabase-js'

export type SocialProvider = 'facebook' | 'google' | 'linkedin' | 'github'

export interface TalkToMeConfig {
  socialProviders: SocialProvider[]
  themeColour: string
  darkMode: boolean
  moderationBadgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export interface TalkToMeContextType {
  user: User | null
  isAdmin: boolean
  config: TalkToMeConfig
  supabase: SupabaseClient
  login: (provider: SocialProvider) => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: Error | null
}

export interface TalkToMeProviderProps {
  supabaseUrl: string
  supabaseAnonKey: string
  config: TalkToMeConfig
  children: React.ReactNode
}
