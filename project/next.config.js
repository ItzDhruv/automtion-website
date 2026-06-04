const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    CROWN_TEST_API: process.env.CROWN_TEST_API,
  },
  images: { unoptimized: true },
  async rewrites() {
    const backendUrl = process.env.CROWN_TEST_API;

    if (!backendUrl) {
      return [];
    }

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
