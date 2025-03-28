import { User, SupabaseClient, Provider } from '@supabase/supabase-js'

export interface TalkToMeConfig {
  themeColour: string
  darkMode: boolean
  moderationBadgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  hideTTMBranding?: boolean
}

export interface TalkToMeContextType {
  user: User | null
  isAdmin: boolean
  config: TalkToMeConfig
  supabase: SupabaseClient
  login: (provider: Provider) => Promise<void>
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
