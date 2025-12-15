import type { NextConfig } from "next";

type RemotePatterns = NonNullable<NextConfig["images"]>["remotePatterns"];

const remotePatterns: RemotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  output: "standalone",
  // Only use assetPrefix for static assets (CSS, JS, images)
  // Do NOT use basePath when nginx strips the path prefix
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
