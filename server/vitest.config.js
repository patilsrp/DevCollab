// server/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    testTimeout: 10000
  }
});