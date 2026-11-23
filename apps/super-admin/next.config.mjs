import process from 'node:process';

// Provide safe fallback defaults for Vercel preview and static build phases
// when runtime secrets are not configured, without overriding production secrets.
const isVercelPreviewOrBuild = Boolean(
  process.env.VERCEL ||
  process.env.CI ||
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV !== 'production',
);

if (isVercelPreviewOrBuild) {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'preview_jwt_secret_key_minimum_32_chars_for_build_only';
  }
  if (!process.env.STORAGE_SECRET) {
    process.env.STORAGE_SECRET = 'preview_storage_secret_16_chars';
  }
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      'postgresql://preview:preview@localhost:5432/visahobe_preview?schema=public';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  transpilePackages: [
    '@visahobe/ui',
    '@visahobe/design-system',
    '@visahobe/auth',
    '@visahobe/cms',
    '@visahobe/core',
    '@visahobe/agents',
    '@visahobe/browser-automation',
    '@visahobe/shared',
    '@visahobe/worker-browser-session',
  ],
  webpack: (config, { isServer }) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
