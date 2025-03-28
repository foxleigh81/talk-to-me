import { createClient } from '@supabase/supabase-js'
import type { SupabaseConfig, SupabaseInstance } from './types'

export function createSupabaseClient(config: SupabaseConfig): SupabaseInstance {
  if (!config.supabaseUrl) {
    throw new Error('Missing required configuration: supabaseUrl')
  }

  if (!config.supabaseAnonKey) {
    throw new Error('Missing required configuration: supabaseAnonKey')
  }

  return createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.options || {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}
