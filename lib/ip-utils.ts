import { NextRequest } from 'next/server';

/**
 * Extracts real client IP address from request
 * Handles proxies, load balancers, and direct connections
 */
export function getIpAddress(req: NextRequest | Request): string | null {
    const headers =
        req instanceof NextRequest ? req.headers : new Headers(req.headers);

    // Check common proxy headers in order of priority
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        // x-forwarded-for can be a comma-separated list
        // First IP is the original client
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
    if (cfConnectingIp) {
        return cfConnectingIp.trim();
    }

    // For NextRequest, we can access additional properties
    if (req instanceof NextRequest) {
        // @ts-ignore - Next.js internal property
        const ip = req.ip;
        if (ip) {
            return ip;
        }
    }

    return null;
}

/**
 * Gets user agent from request
 */
export function getUserAgent(req: NextRequest | Request): string | null {
    const headers =
        req instanceof NextRequest ? req.headers : new Headers(req.headers);
    return headers.get('user-agent');
}

/**
 * Validates if IP address is valid IPv4 or IPv6
 */
export function isValidIp(ip: string): boolean {
    // Simple validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
