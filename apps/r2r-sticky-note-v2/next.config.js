/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const path = require('path');

const nextConfig = {
  webpack: (config) => {
        // Add alias to redirect logger to browser-compatible version for client-side code
    config.resolve.alias = {
      ...config.resolve.alias,
      '../../../../packages/logging/logger.js': require.resolve('../../../../packages/logging/browser-logger.js'),
      '../../../packages/logging/logger.js': require.resolve('../../../packages/logging/browser-logger.js'),
      '../../packages/logging/logger.js': require.resolve('../../packages/logging/browser-logger.js'),
      '../packages/logging/logger.js': require.resolve('../packages/logging/browser-logger.js'),
    };

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
    transpilePackages: [],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
