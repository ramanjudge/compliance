import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react', 'drizzle-orm'],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
