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
  // When nginx STRIPS the path prefix, use assetPrefix for static assets only
  // Do NOT use basePath - it would double the prefix
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
