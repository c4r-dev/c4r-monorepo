#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Activities that need Next.js config files created
const missingConfigDirs = [
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-caus-cau-lang-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-issue-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-pan-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-rev-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-fix-bias-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-neu-jeo-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-pos-con-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-dag-for-caus-v0',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-fix-bia-v1',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-pos-con-v1'
];

// Standard Next.js config with webpack fallback
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
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
      new config.webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ]);

    return config;
  },
  experimental: {
    esmExternals: false
  }
};

module.exports = nextConfig;
`;

function createNextConfig(dirPath) {
    const configPath = path.join(dirPath, 'next.config.js');
    
    if (!fs.existsSync(dirPath)) {
        console.log(`❌ Directory not found: ${dirPath}`);
        return false;
    }
    
    if (fs.existsSync(configPath)) {
        console.log(`ℹ️  Config already exists: ${path.basename(dirPath)}`);
        return false;
    }

    try {
        console.log(`🔧 Creating Next.js config for: ${path.basename(dirPath)}`);
        fs.writeFileSync(configPath, nextConfigContent);
        console.log(`✅ Created config for: ${path.basename(dirPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error creating config for ${dirPath}:`, error.message);
        return false;
    }
}

console.log('🚀 Creating missing Next.js config files...\n');

let createdCount = 0;

for (const dirPath of missingConfigDirs) {
    if (createNextConfig(dirPath)) {
        createdCount++;
    }
}

console.log(`\n🎉 Created ${createdCount} Next.js config files`);
console.log('✅ Missing config creation completed!');