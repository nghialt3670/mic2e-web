import type { NextConfig } from "next";

type RemotePatterns = NonNullable<NextConfig["images"]>["remotePatterns"];

const remotePatterns: RemotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
];

const apiUrl = process.env.NEXT_PUBLIC_CHAT2EDIT_API_URL;
if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    const basePath = parsed.pathname.replace(/\/$/, "");
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: `${basePath}/storage/**`,
    });
  } catch (error) {
    console.warn("Invalid NEXT_PUBLIC_CHAT2EDIT_API_URL", error);
  }
}

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
