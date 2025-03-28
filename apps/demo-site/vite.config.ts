import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd());

  console.log('Env variables:', {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ? '******' : undefined,
    VITE_ADMIN_EMAIL: env.VITE_ADMIN_EMAIL,
  });

  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['talk-to-me']
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/, /talk-to-me/]
      }
    },
    // Make envPrefix explicit
    envPrefix: 'VITE_',
  };
});
