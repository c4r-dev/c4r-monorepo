#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// All Next.js config files found in the codebase
const nextjsConfigFiles = [
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-cbi-fav-game-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-comments-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-org-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-int-exe-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-wason-246-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lab-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lit-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-simple-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-str-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v3/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-caus-cau-lang-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-issue-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-pan-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-rev-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-fix-bias-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-neu-jeo-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-pos-con-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-dag-for-caus-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-fix-bia-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-pos-con-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-component-test/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-template-test/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/duq-finer-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v3/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-bias-map-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-fly-gam-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-gar-for-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-hyp-bot-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-wason-246-v2-grid/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/jhu-polio-ice-cream-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/neuroserpin_v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/r2r-sticky-note-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/smi-ran-why-ran-v4/next.config.js'
];

// Comprehensive webpack fallback configuration for Node.js modules
const webpackFallbackConfig = `
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
  },`;

function addWebpackFallback(configPath) {
    if (!fs.existsSync(configPath)) {
        console.log(`❌ Config file not found: ${configPath}`);
        return false;
    }

    try {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Check if webpack config already exists
        if (content.includes('webpack:') || content.includes('config.resolve.fallback')) {
            console.log(`ℹ️  Webpack config already exists in: ${path.basename(configPath)}`);
            return false;
        }

        console.log(`🔧 Adding webpack fallback to: ${path.basename(configPath)} in ${path.dirname(configPath)}`);

        // Handle different Next.js config patterns
        if (content.includes('module.exports = {')) {
            // Standard object export
            content = content.replace(
                'module.exports = {',
                `module.exports = {${webpackFallbackConfig}`
            );
        } else if (content.includes('const nextConfig = {')) {
            // nextConfig variable pattern
            content = content.replace(
                'const nextConfig = {',
                `const nextConfig = {${webpackFallbackConfig}`
            );
        } else if (content.includes('export default {')) {
            // ES6 export pattern
            content = content.replace(
                'export default {',
                `export default {${webpackFallbackConfig}`
            );
        } else {
            // Try to find any object opening and add webpack config
            const objectPattern = /({[\s\n]*)/;
            if (objectPattern.test(content)) {
                content = content.replace(objectPattern, `{${webpackFallbackConfig}\n  `);
            } else {
                console.log(`⚠️  Could not determine config structure for: ${path.basename(configPath)}`);
                return false;
            }
        }

        fs.writeFileSync(configPath, content);
        console.log(`✅ Added webpack fallback to: ${path.basename(configPath)}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error adding webpack fallback to ${configPath}:`, error.message);
        return false;
    }
}

console.log('🚀 Starting comprehensive webpack fallback configuration...\n');

let configuredCount = 0;

console.log('📋 Adding webpack fallback to Next.js config files:');
for (const configPath of nextjsConfigFiles) {
    if (addWebpackFallback(configPath)) {
        configuredCount++;
    }
}

console.log(`\n🎉 Configured webpack fallbacks in ${configuredCount} files`);
console.log(`📦 Note: You may need to install browserify polyfills:`);
console.log(`npm install path-browserify crypto-browserify stream-browserify buffer process os-browserify url assert stream-http https-browserify browserify-zlib querystring-es3 events vm-browserify util`);
console.log('✅ Webpack fallback configuration completed!');