import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@visahobe/cms': path.resolve(__dirname, 'packages/cms/src/index.ts'),
      '@visahobe/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
      '@visahobe/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
      '@visahobe/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@visahobe/design-system': path.resolve(__dirname, 'packages/design-system/src/index.ts'),
      '@visahobe/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@visahobe/mobile': path.resolve(__dirname, 'apps/mobile/src/index.ts'),
      '@visahobe/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@visahobe/agents': path.resolve(__dirname, 'packages/agents/src/index.ts'),
      '@visahobe/browser-automation': path.resolve(
        __dirname,
        'packages/browser-automation/src/index.ts',
      ),
      '@visahobe/admin-mcp-server': path.resolve(
        __dirname,
        'packages/admin-mcp-server/src/index.ts',
      ),
      '@visahobe/partner-mcp-server': path.resolve(
        __dirname,
        'packages/partner-mcp-server/src/index.ts',
      ),
      '@visahobe/integrations': path.resolve(__dirname, 'packages/integrations/src/index.ts'),
      '@visahobe/workflows': path.resolve(__dirname, 'packages/workflows/src/index.ts'),
      '@visahobe/api': path.resolve(__dirname, 'services/api/src/index.ts'),
      '@visahobe/worker-browser-session': path.resolve(
        __dirname,
        'workers/browser-session/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/**/test/**/*.{test,spec}.{ts,tsx}',
      'packages/**/test/**/*.{test,spec}.{ts,tsx}',
      'services/**/test/**/*.{test,spec}.{ts,tsx}',
      'workers/**/test/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', 'test/fixtures/**'],
    },
  },
});
