import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Pre-compress assets at build time (servers can serve .gz/.br directly)
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    // Bundle analyzer: opens stats.html in browser when ANALYZE=true
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
  ].filter(Boolean),

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    // Vite 8 uses Rolldown's built-in minifier by default — no need to specify.
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunking: split heavy/stable deps into their own chunks so
        // user-code changes don't bust the browser cache for vendor code.
        // Function form is required by Vite 8 / Rollup 5+.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react-router')) return 'react-vendor';
          if (id.includes('/react-dom/') || /\/react\//.test(id)) return 'react-vendor';
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'monaco-editor';
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'socket-vendor';
          if (id.includes('nanoid')) return 'utils-vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // Pre-bundle these deps in dev for faster cold starts
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'socket.io-client',
      'nanoid',
    ],
    exclude: ['@monaco-editor/react'],
  },

  // Lightweight dev server config
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },

  preview: {
    port: 4173,
  },
}));