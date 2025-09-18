/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    transpilePackages: ['@c4r/ui'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Fix asset routing for unified server
    assetPrefix: process.env.NODE_ENV === 'production' ? '/randomization/smi-ran-ran-lit-v1' : '',
    basePath: process.env.NODE_ENV === 'production' ? '/randomization/smi-ran-ran-lit-v1' : '',
    // Ensure proper static file handling
    experimental: {
        outputFileTracingRoot: path.join(__dirname, '../../..'),
    },
};

module.exports = nextConfig;
