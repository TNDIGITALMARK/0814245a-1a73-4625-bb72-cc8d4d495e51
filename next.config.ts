import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal resistance - catch critical errors, ignore warnings
  typescript: {
    ignoreBuildErrors: false, // Let TS errors surface for repair system
  },
  eslint: {
    ignoreDuringBuilds: false, // Let ESLint errors surface for repair system
    dirs: ['src'], // Only check src directory to reduce noise
  },
  
  // Simple image configuration
  images: { 
    unoptimized: true,
  },

  // Basic performance settings
  poweredByHeader: false,
  
  // Flexible iframe embedding
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
