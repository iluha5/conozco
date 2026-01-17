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

module.exports = nextConfig;
