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
