/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uncomment this ONLY if doing a static export
  // output: 'export',
  
  trailingSlash: true,
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // CORRECT dev indicators configuration
  devIndicators: false, // or use: devIndicators: { position: 'bottom-right' }
  
  // IMPORTANT: This must be false for static exports
  skipTrailingSlashRedirect: true,
  
  reactStrictMode: false,
  
  // Add security headers to prevent reload loops
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    // Fix for fs module in face-api.js and other Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        encoding: false,
        'node-fetch': false,
      };
    }
    
    // Exclude face-api.js from server-side bundle during static export
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(({ context, request }, callback) => {
        // Exclude face-api.js from server bundle
        if (/face-api\.js/.test(request)) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;