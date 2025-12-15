import { SettingsProvider } from "@/components/providers/settings-provider";
import { SessionProvider } from "next-auth/react";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  // When nginx strips the path prefix, we need to tell SessionProvider
  // the full public path where auth endpoints are accessible
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  // Client calls: /chat2edit/file/api/auth/* (public URL)
  // Server receives: /api/auth/* (after nginx strips prefix)
  const authBasePath = basePath ? `${basePath}/api/auth` : "/api/auth";
  
  console.log("[PROVIDER] Auth basePath for client:", authBasePath);
  
  return (
    <SessionProvider basePath={authBasePath}>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
};
