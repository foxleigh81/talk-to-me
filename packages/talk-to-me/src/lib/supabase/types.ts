import { SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  options?: {
    auth?: {
      persistSession?: boolean
      autoRefreshToken?: boolean
      detectSessionInUrl?: boolean
    }
  }
}

export type SupabaseInstance = SupabaseClient
