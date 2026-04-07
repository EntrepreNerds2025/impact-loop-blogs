/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    mdxRs: false,
  },
  // Brand env exposed at build time
  env: {
    NEXT_PUBLIC_BRAND: process.env.BRAND || 'impact-loop',
  },
  // Per-brand revalidation window for ISR (60 seconds)
  // Individual pages can override via `export const revalidate = ...`
};

export default nextConfig;
