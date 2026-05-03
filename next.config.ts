import type { NextConfig } from "next";

/**
 * Next.js 16 Configuration
 * - turbopack.root resolves the workspace root inference warning
 *   caused by a parent-directory package-lock.json at E:\Abir
 */
const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: "./",
  },
};

export default nextConfig;
