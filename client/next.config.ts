import type { NextConfig } from "next";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ?? "https://hirehub-j1p8.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
