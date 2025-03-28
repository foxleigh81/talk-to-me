import { User, SupabaseClient } from '@supabase/supabase-js';
import React from 'react';

declare module 'talk-to-me' {
  export type SocialProvider = 'facebook' | 'google' | 'linkedin' | 'github';

  export interface TalkToMeConfig {
    adminEmails: string[];
    theme?: {
      primaryColour?: string;
      darkMode?: boolean;
    };
  }

  export interface TalkToMeContextType {
    user: User | null;
    isAdmin: boolean;
    config: TalkToMeConfig;
    supabase: SupabaseClient;
    login: (provider: SocialProvider) => Promise<void>;
    loginWithEmail: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    error: Error | null;
  }

  export interface TalkToMeProviderProps {
    supabaseUrl: string;
    supabaseAnonKey: string;  // Note: This matches the implementation
    config: TalkToMeConfig;
    children: React.ReactNode;
  }

  export function TalkToMeProvider(props: TalkToMeProviderProps): JSX.Element;
  export function useTalkToMe(): TalkToMeContextType;
  export function TalkToMe(props: { postId: string }): JSX.Element;
}
