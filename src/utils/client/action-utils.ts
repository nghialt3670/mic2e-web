"use client";

import { ApiResponse } from "@/types/api-types";
import { toast } from "sonner";

export async function withToastHandler<T>(
  action: (args: any) => Promise<ApiResponse<T>>,
  args: any,
): Promise<T> {
  try {
    const response = await action(args);

    if (response.code !== 200) {
      console.error(response);
      toast.error(response.message, {
        description: `Code: ${response.code}`,
      });
      return undefined as any;
    }

    if (!response.data) {
      toast.error("No data returned from action");
      return undefined as any;
    }

    return response.data;
  } catch (error) {
    console.error(error);
    toast.error("An error occurred while executing the action", {
      description: `Code: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
    return undefined as any;
  }
}
