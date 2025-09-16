/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Make sure VERCEL_URL is available (automatically set by Vercel)
    VERCEL_URL: process.env.VERCEL_URL,
  },
}

export default nextConfig;
