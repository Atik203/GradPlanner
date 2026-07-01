import type { NextConfig } from "next";
import path from "path";
import withBundleAnalyzerImport from "@next/bundle-analyzer";

// In production (Vercel), NEXT_BACKEND_URL must be set to the deployed backend URL.
// In local dev it falls back to localhost:5000.
const BACKEND_URL = process.env.NEXT_BACKEND_URL || "http://localhost:5000";

const withBundleAnalyzer = withBundleAnalyzerImport({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "static",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client"],

  // Silence the "inferred workspace root" warning caused by pnpm-workspace.yaml
  // at the monorepo root. Points Next.js to the correct root for output file tracing.
  outputFileTracingRoot: path.resolve(__dirname, ".."),

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

export default withBundleAnalyzer(nextConfig);

