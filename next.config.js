/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    // Disable strict Server Actions validation for NextAuth compatibility
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
            allowedOrigins: ['conozco.net', 'www.conozco.net'],
        },
    },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    analyzerMode: 'static',
    openAnalyzer: true,
});

module.exports =
    process.env.ANALYZE === 'true'
        ? withBundleAnalyzer(nextConfig)
        : nextConfig;
