import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Base path: '/ai-coaching-institute-intelligence/' for GitHub Pages
  // Vercel deployment sets VERCEL=1 or VITE_BASE_PATH=/ so it uses root '/'
  const isVercel = Boolean(process.env.VERCEL);
  const base = process.env.VITE_BASE_PATH || (isVercel ? '/' : '/ai-coaching-institute-intelligence/');

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5005',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
