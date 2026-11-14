import path from 'node:path';
import { defineWorkspace } from 'vitest/config';

const toPosix = (p: string) => p.replace(/\\/g, '/');

const sharedAliases = {
  '@visahobe/cms': path.resolve(__dirname, 'packages/cms/src/index.ts'),
  '@visahobe/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
  '@visahobe/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
  '@visahobe/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
  '@visahobe/design-system': path.resolve(__dirname, 'packages/design-system/src/index.ts'),
  '@visahobe/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
  '@visahobe/mobile': path.resolve(__dirname, 'apps/mobile/src/index.ts'),
  '@visahobe/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
};

export default defineWorkspace([
  toPosix(path.resolve(__dirname, 'apps/*')),
  toPosix(path.resolve(__dirname, 'services/*')),
  toPosix(path.resolve(__dirname, 'packages/*')),
  toPosix(path.resolve(__dirname, 'workers/*')),
  {
    resolve: {
      alias: sharedAliases,
    },
    test: {
      name: 'security',
      root: path.resolve(__dirname, 'tests/security'),
      include: ['**/*.test.ts'],
    },
  },
]);
