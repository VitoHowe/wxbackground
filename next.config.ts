import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {},
  eslint: {
    // Docker/CI builds shouldn't be blocked by local lint rules.
    // Keep `pnpm lint:check` as the explicit gate when needed.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
