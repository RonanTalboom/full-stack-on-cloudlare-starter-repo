import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable edge runtime for all routes
    runtime: 'edge',
  },
  // Required for Cloudflare Pages
  images: {
    unoptimized: true,
  },
  // Disable static exports since we're using SSR
  output: undefined,
};

export default nextConfig;