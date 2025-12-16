import { SettingsProvider } from "@/components/providers/settings-provider";
import { SessionProvider } from "next-auth/react";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  // SessionProvider needs explicit basePath for auth API calls
  // NEXT_PUBLIC_BASE_PATH is inlined at build time
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const authBasePath = `${basePath}/api/auth`;
  
  return (
    <SessionProvider basePath={authBasePath}>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
};
