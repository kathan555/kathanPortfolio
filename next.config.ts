import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint errors during production build — warnings only
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript errors during production build as safety net
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "kathanpatel.vercel.app",
        "www.kathanpatel.vercel.app",
        // Add your custom domain here later, e.g.:
        // "kathanpatel.dev",
        // "www.kathanpatel.dev",
      ],
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
