import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@visahobe/mobile': path.resolve(__dirname, './src/index.ts'),
      '@visahobe/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@visahobe/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
  },
});
