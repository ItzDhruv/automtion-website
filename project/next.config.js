const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias['socket.io-client$'] = path.join(
      path.dirname(require.resolve('socket.io-client/package.json')),
      'build/esm/index.js'
    );
    config.resolve.alias.bufferutil = false;
    config.resolve.alias['utf-8-validate'] = false;
    return config;
  },
};

module.exports = nextConfig;
