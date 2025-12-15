import { SettingsProvider } from "@/components/providers/settings-provider";
import { SessionProvider } from "next-auth/react";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  // When using Next.js basePath in next.config.ts, SessionProvider
  // should use the default "/api/auth" - Next.js handles the prefix automatically
  console.log("[PROVIDER] NEXT_PUBLIC_BASE_PATH:", process.env.NEXT_PUBLIC_BASE_PATH);
  
  return (
    <SessionProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
};
