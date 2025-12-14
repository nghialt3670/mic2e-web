import { SettingsProvider } from "@/components/providers/settings-provider";
import { SessionProvider } from "next-auth/react";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  // Get base path and ensure it's clean
  let basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  
  // Remove trailing slashes
  basePath = basePath.replace(/\/+$/, "");
  
  // Ensure leading slash if basePath is not empty
  if (basePath && !basePath.startsWith("/")) {
    basePath = `/${basePath}`;
  }
  
  // Construct auth path - always starts with /
  const authBasePath = basePath ? `${basePath}/api/auth` : "/api/auth";
  
  console.log("[PROVIDER] NEXT_PUBLIC_BASE_PATH:", process.env.NEXT_PUBLIC_BASE_PATH);
  console.log("[PROVIDER] Cleaned basePath:", basePath);
  console.log("[PROVIDER] NextAuth basePath:", authBasePath);
  
  return (
    <SessionProvider basePath={authBasePath}>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
};
