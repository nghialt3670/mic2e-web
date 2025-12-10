"use client";

import { ApiResponse } from "@/types/api-types";
import { toast } from "sonner";

export async function withToastHandler<T>(
  action: (args: any) => Promise<ApiResponse<T>>,
  args: any,
): Promise<T> {
  const response = await action(args);

  if (response.code !== 200) {
    console.error(response);
    toast.error(response.message, {
      description: `Code: ${response.code}`,
    });
    throw new Error(response.message ?? "Unknown error");
  }

  if (!response.data) {
    throw new Error("No data returned from action");
  }

  return response.data;
}
