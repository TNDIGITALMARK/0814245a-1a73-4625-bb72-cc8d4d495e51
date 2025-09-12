import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  
  // Image optimization for gaming platform
  images: { 
    unoptimized: false,
    domains: ['localhost', 'gamehub.example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Compression and bundling
  compress: true,
  generateEtags: true,
  
  // PWA and caching
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/generated/:path*",
        headers: [
          {
            key: "Cache-Control", 
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options", 
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          }
        ]
      }
    ];
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Game asset handling
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
        },
      },
    });

    // Performance optimizations for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            games: {
              test: /[\\/]src[\\/](components[\\/]game|lib[\\/]games)[\\/]/,
              name: 'games',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'custom-value',
    NEXT_PUBLIC_APP_NAME: 'GameHub',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
