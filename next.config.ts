import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "eecpssnbvbeccmdankwm.supabase.co",
      },
    ],
  },
};

export default nextConfig;
