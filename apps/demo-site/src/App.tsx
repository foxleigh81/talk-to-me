/// <reference path="./declarations.d.ts" />
import { Routes, Route } from 'react-router-dom';
// TODO: Fix type declarations so we don't need to use ts-ignore
// @ts-ignore - Type definitions exist but TS isn't finding them correctly
import { TalkToMeProvider } from 'talk-to-me';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BlogPostPage } from './pages/BlogPost';
import { useState, useEffect } from 'react';

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught error:', event.error);
      setError(event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-red-700">{error?.message || 'Unknown error'}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setHasError(false)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <TalkToMeProvider
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
        config={{ themeColour: '#3B82F6', darkMode: false }}
      >
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Talk To Me Demo</h1>

            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Blog Demo Content</h2>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:slug" element={<BlogPostPage />} />
                </Routes>
              </Layout>
            </div>
          </div>
        </div>
      </TalkToMeProvider>
    </ErrorBoundary>
  );
}

export default App;
