"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { Settings, settings } from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface SettingsCreateOrUpdateRequest {
  llmModel: string;
  maxImageWidth: number;
  maxImageHeight: number;
}

interface SettingsGetRequest {
  userId: string;
}

/**
 * Get the latest settings for a user
 */
export const getUserSettings = withErrorHandler(
  withAuthHandler<SettingsGetRequest, Settings | null>(async ({ userId }) => {
    const userSettings = await drizzleClient.query.settings.findFirst({
      where: eq(settings.userId, userId),
      orderBy: desc(settings.createdAt),
    });

    return {
      message: "Settings retrieved successfully",
      code: 200,
      data: userSettings || null,
    };
  }),
);

/**
 * Create or update settings for a user
 * This creates a new settings record (snapshot) rather than updating existing ones
 * to preserve settings history for chats
 */
export const createOrUpdateUserSettings = withErrorHandler(
  withAuthHandler<SettingsCreateOrUpdateRequest, Settings>(
    async ({ llmModel, maxImageWidth, maxImageHeight, userId }) => {
      const [createdSettings] = await drizzleClient
        .insert(settings)
        .values({
          userId,
          llmModel,
          maxImageWidth,
          maxImageHeight,
        })
        .returning();

      revalidatePath("/");

      return {
        message: "Settings saved successfully",
        code: 200,
        data: createdSettings,
      };
    },
  ),
);

/**
 * Get or create default settings for a user
 */
export const getOrCreateUserSettings = withErrorHandler(
  withAuthHandler<{ userId: string }, Settings>(async ({ userId }) => {
    // Try to get existing settings
    let userSettings = await drizzleClient.query.settings.findFirst({
      where: eq(settings.userId, userId),
      orderBy: desc(settings.createdAt),
    });

    // If no settings exist, create default ones
    if (!userSettings) {
      [userSettings] = await drizzleClient
        .insert(settings)
        .values({
          userId,
          llmModel: "gemini-2.0-flash",
          maxImageWidth: 480,
          maxImageHeight: 360,
        })
        .returning();
    }

    return {
      message: "Settings retrieved successfully",
      code: 200,
      data: userSettings,
    };
  }),
);
