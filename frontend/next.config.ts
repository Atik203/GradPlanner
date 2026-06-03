import type { NextConfig } from "next";
import path from "path";

// In production (Vercel), NEXT_BACKEND_URL must be set to the deployed backend URL.
// In local dev it falls back to localhost:5000.
const BACKEND_URL = process.env.NEXT_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client"],

  // Fix: Tell Turbopack to treat this directory as the project root so it
  // doesn't walk up to the monorepo root and pick up the wrong pnpm-workspace.yaml.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Proxy all /api/* requests to the Express backend.
  // This is used by client-side fetches that use relative URLs.
  // Server-side RSC fetches must use NEXT_BACKEND_URL directly.
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
