/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
