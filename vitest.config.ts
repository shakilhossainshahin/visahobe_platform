import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@visahobe/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
      '@visahobe/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
      '@visahobe/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@visahobe/design-system': path.resolve(__dirname, 'packages/design-system/src/index.ts'),
      '@visahobe/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@visahobe/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/**/test/**/*.{test,spec}.{ts,tsx}',
      'packages/**/test/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', 'test/fixtures/**'],
    },
  },
});
