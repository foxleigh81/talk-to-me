import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TalkToMeProvider } from '../components/TalkToMeProvider';

// Mock Supabase configuration
const mockSupabaseConfig = {
  supabaseUrl: 'https://mock.supabase.co',
  supabaseKey: 'mock-key'
};

// Mock provider configuration
const mockConfig = {
  adminEmails: ['admin@example.com'],
  theme: {
    primaryColor: '#007bff',
    darkMode: false
  },
  allowedProviders: ['google', 'github']
};

type CustomRenderOptions = {
  providerProps?: {
    supabaseConfig?: typeof mockSupabaseConfig;
    config?: typeof mockConfig;
  };
};

/**
 * Custom render function that wraps component with TalkToMeProvider
 * Useful for testing components that rely on our context
 */
function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
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
        supabaseConfig={providerProps.supabaseConfig}
        config={providerProps.config}
      >
        {children}
      </TalkToMeProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
