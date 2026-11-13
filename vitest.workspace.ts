import path from 'node:path';
import { defineWorkspace } from 'vitest/config';

const toPosix = (p: string) => p.replace(/\\/g, '/');

export default defineWorkspace([
  toPosix(path.resolve(__dirname, 'apps/*')),
  toPosix(path.resolve(__dirname, 'services/*')),
  toPosix(path.resolve(__dirname, 'packages/*')),
  toPosix(path.resolve(__dirname, 'workers/*')),
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
      root: path.resolve(__dirname, 'tests/security'),
      include: ['**/*.test.ts'],
    },
  },
]);
