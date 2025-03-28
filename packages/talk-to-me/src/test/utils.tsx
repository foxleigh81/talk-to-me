import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { TalkToMeProvider } from '@lib/components/talk-to-me-provider';
import { TalkToMeConfig } from '@lib/types/context';

// Mock Supabase configuration
const mockSupabaseConfig = {
  supabaseUrl: 'https://mock.supabase.co',
  supabaseKey: 'mock-key'
};

// Mock provider configuration
const mockConfig: TalkToMeConfig = {
  adminEmails: ['admin@example.com'],
  socialProviders: ['google', 'github'],
  themeColour: '#007bff',
  darkMode: false
};

type CustomRenderOptions = {
  providerProps?: {
    supabaseConfig?: typeof mockSupabaseConfig;
    config?: TalkToMeConfig;
  };
};

/**
 * Custom render function that wraps component with TalkToMeProvider
 * Useful for testing components that rely on our context
 */
function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): ReturnType<typeof render> & { user: UserEvent } {
  const {
    providerProps = {
      supabaseConfig: mockSupabaseConfig,
      config: mockConfig
    },
    ...renderOptions
  } = options;

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <TalkToMeProvider
        supabaseUrl={providerProps.supabaseConfig?.supabaseUrl || ''}
        supabaseAnonKey={providerProps.supabaseConfig?.supabaseKey || ''}
        config={providerProps.config || mockConfig}
      >
        {children}
      </TalkToMeProvider>
    );
  }

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  return {
    ...renderResult,
    user: userEvent.setup()
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
