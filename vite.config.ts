import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'extension') {
    return {
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://focjutlqaeojrcdjkiey.supabase.co'),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvY2p1dGxxYWVvanJjZGpraWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODA1NjEsImV4cCI6MjA3NjI1NjU2MX0.siNYom-9JUdEyz4a0TGL6Mr0GuRp6wtT-Xw8n7o2tyU'),
      },
      build: {
        rollupOptions: {
          input: {
            content: resolve(__dirname, 'src/extension/content.tsx'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'content.css') {
                return 'content.css';
              }
              return '[name].[ext]';
            },
          },
        },
        outDir: 'dist',
        emptyOutDir: false,
        cssCodeSplit: false,
      },
      optimizeDeps: {
        exclude: ['lucide-react'],
      },
    };
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
