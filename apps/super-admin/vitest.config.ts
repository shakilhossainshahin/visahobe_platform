import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@visahobe/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@visahobe/cms': path.resolve(__dirname, '../../packages/cms/src/index.ts'),
      '@visahobe/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@visahobe/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@visahobe/design-system': path.resolve(
        __dirname,
        '../../packages/design-system/src/index.ts',
      ),
      '@visahobe/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@visahobe/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
  },
});
