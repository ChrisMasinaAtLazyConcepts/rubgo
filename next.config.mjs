// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now the default and no longer needed
  // experimental.appDir is now stable and no longer needed in experimental
  images: {
    domains: ['localhost'],
    // For newer Next.js versions, use remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Add any other necessary configuration here
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Add buildExcludes to avoid build issues
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);