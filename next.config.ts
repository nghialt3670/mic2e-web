import type { NextConfig } from "next";

type RemotePatterns = NonNullable<NextConfig["images"]>["remotePatterns"];

const remotePatterns: RemotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
];

// Get basePath - must be empty string or path starting with "/" (but not just "/")
const getBasePath = (): string => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
  // Return empty string if not set, empty, or just "/"
  if (!basePath || basePath === "/") {
    return "";
  }
  // Ensure it starts with "/"
  return basePath.startsWith("/") ? basePath : `/${basePath}`;
};

const basePath = getBasePath();

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  output: "standalone",
  // Use basePath when nginx does NOT strip the path prefix
  // basePath handles both routes AND assets automatically - don't set assetPrefix
  basePath: basePath || undefined,
};

export default nextConfig;
