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
        optimizePackageImports: ['lucide-react', 'lodash-es'],
    },
};

module.exports =
    process.env.ANALYZE === 'true'
        ? require('@next/bundle-analyzer')({
              enabled: true,
              analyzerMode: 'static',
              openAnalyzer: true,
          })(nextConfig)
        : nextConfig;
