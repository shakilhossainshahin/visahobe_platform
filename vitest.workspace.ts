import path from 'node:path';
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/*',
  'services/*',
  'packages/*',
  'workers/*',
  {
    resolve: {
      alias: {
        '@visahobe/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
        '@visahobe/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
        '@visahobe/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      },
    },
    test: {
      name: 'security',
      root: './tests/security',
      include: ['**/*.test.ts'],
    },
  },
]);
