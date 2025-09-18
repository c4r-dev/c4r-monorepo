/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      net: false,
      tls: false,
      child_process: false,
      dns: false,
      zlib: require.resolve('browserify-zlib'),
      querystring: require.resolve('querystring-es3'),
      events: require.resolve('events'),
      vm: require.resolve('vm-browserify')
    };

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ]);

    return config;
  },
    transpilePackages: ['@c4r/ui'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Asset routing handled by seamless server
    // assetPrefix and basePath are set dynamically by the seamless server
    // Ensure proper static file handling
    experimental: {
        outputFileTracingRoot: path.join(__dirname, '../../..'),
    },
};

module.exports = nextConfig;
