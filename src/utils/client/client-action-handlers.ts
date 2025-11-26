"use client";

import { ApiResponse } from "@/types/api-types";
import { toast } from "sonner";

export async function withToastHandler<T>(
  action: (args: any) => Promise<ApiResponse<T>>,
  args: any,
): Promise<T | undefined> {
  const response = await action(args);

  if (response.code !== 200) {
    console.error(response);
    toast.error(response.message, {
      description: `Code: ${response.code}`,
    });
    return undefined;
  }

  return response.data;
}
