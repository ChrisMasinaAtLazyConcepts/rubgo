// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  reactStrictMode: true,
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true // Required for static export
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