"use client";

import { getUserSettings } from "@/actions/settings-actions";
import { useSettingsStore } from "@/stores/settings-store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * Provider component that syncs settings from database to Zustand store
 * This component should be mounted high in the component tree
 */
export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  const { setLlmModel, setMaxImageWidth, setMaxImageHeight } =
    useSettingsStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (status === "authenticated" && session?.user?.id && !isLoaded) {
        try {
          const response = await getUserSettings({ userId: session.user.id });
          if (response.data) {
            // Update Zustand store with database settings
            setLlmModel(response.data.llmModel);
            setMaxImageWidth(response.data.maxImageWidth);
            setMaxImageHeight(response.data.maxImageHeight);
          }
        } catch (error) {
          console.error("Failed to load settings:", error);
          // If loading fails, keep the default/localStorage settings
        } finally {
          setIsLoaded(true);
        }
      }
    };

    loadSettings();
  }, [
    session,
    status,
    isLoaded,
    setLlmModel,
    setMaxImageWidth,
    setMaxImageHeight,
  ]);

  return <>{children}</>;
};
