import { Routes, Route } from 'react-router-dom';
import { TalkToMeProvider } from './mock-talk-to-me';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BlogPostPage } from './pages/BlogPost';

function App() {
  return (
    <TalkToMeProvider
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
      config={{
        adminEmails: [import.meta.env.VITE_ADMIN_EMAIL],
        theme: {
          primaryColour: '#3B82F6',
          darkMode: false
        }
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<BlogPostPage />} />
        </Routes>
      </Layout>
    </TalkToMeProvider>
  );
}

export default App;
