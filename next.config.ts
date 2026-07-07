import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react', 'drizzle-orm'],
  },
};

if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch(console.error);
}

export default nextConfig;
