// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  trailingSlash: true,
  distDir: 'dist',
  images: {
    unoptimized: true
  },
   // Add this to ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true, // Temporary fix
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporary fix
  }
}

module.exports = nextConfig