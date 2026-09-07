import type { NextConfig } from "next";

// Next.js dev mode bootstraps the app with eval-based scripts (webpack HMR,
// React Fast Refresh). CSP must allow 'unsafe-eval' in development or the
// page fails to hydrate and animation/content stays invisible.
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
  {
    // Baseline CSP. `script-src 'unsafe-inline'` is required for Next.js's
    // inline bootstrapping. Treat this as a hardening baseline, not a strict
    // policy — pair with nonce-based CSP for maximum protection.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https: https://*.supabase.co",
      "font-src 'self' data: https:",
      "connect-src 'self' https:",
      `script-src 'self' 'unsafe-inline' https:${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;