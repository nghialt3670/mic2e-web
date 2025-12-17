import type { NextConfig } from "next";

type RemotePatterns = NonNullable<NextConfig["images"]>["remotePatterns"];

const remotePatterns: RemotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
  {
    protocol: "https",
    hostname: "avatars.githubusercontent.com",
  }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  output: "standalone",
  // basePath tells Next.js that routes are served from this sub-path
  // This is needed when nginx forwards the full path (e.g., /chat2edit/api/...)
  // basePath must be either empty string or a path prefix (not just "/")
  basePath: process.env.NEXT_PUBLIC_BASE_PATH === "/" ? "" : (process.env.NEXT_PUBLIC_BASE_PATH || ""),
};

export default nextConfig;
