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
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunking: split heavy/stable dependencies into their own chunks
        // so user code changes don't bust the cache for vendor code.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'monaco-editor': ['@monaco-editor/react'],
          'socket-vendor': ['socket.io-client'],
          'utils-vendor': ['nanoid', 'uuid'],
        },
        // Stable, content-hashed filenames for long-term caching
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