import { User, SupabaseClient, Provider } from '@supabase/supabase-js';
import React from 'react';

declare module 'talk-to-me' {
  export interface TalkToMeConfig {
    themeColour: string;
    darkMode: boolean;
    moderationBadgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }

  export interface TalkToMeContextType {
    user: User | null;
    isAdmin: boolean;
    config: TalkToMeConfig;
    supabase: SupabaseClient;
    login: (provider: Provider) => Promise<void>;
    loginWithEmail: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    error: Error | null;
  }

  export interface TalkToMeProviderProps {
    supabaseUrl: string;
    supabaseAnonKey: string;
    config: TalkToMeConfig;
    children: React.ReactNode;
  }

  export function TalkToMeProvider(props: TalkToMeProviderProps): JSX.Element;
  export function useTalkToMe(): TalkToMeContextType;
  export function TalkToMe(props: { postId: string; className?: string }): JSX.Element;
}
