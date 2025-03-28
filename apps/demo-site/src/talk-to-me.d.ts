declare module 'talk-to-me' {
  import { ReactNode } from 'react';

  export interface TalkToMeProviderProps {
    children: ReactNode;
    supabaseUrl: string;
    supabaseKey: string;
    config: {
      adminEmails: string[];
      theme?: {
        primaryColour?: string;
        darkMode?: boolean;
      };
    };
  }

  export function TalkToMeProvider(props: TalkToMeProviderProps): JSX.Element;

  export interface TalkToMeProps {
    postId: string;
  }

  export function TalkToMe(props: TalkToMeProps): JSX.Element;
}
