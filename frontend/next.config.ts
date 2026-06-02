import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
