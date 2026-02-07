/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  //trailingSlash: true,
  //distDir: 'dist',
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