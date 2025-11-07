import { ApiResponse } from "@/types/api-types";

import { getSessionUserId } from "./session";

export function withErrorHandler<TArgs extends any, TReturn>(
  action: (args: TArgs) => Promise<ApiResponse<TReturn>>,
): (args: TArgs) => Promise<ApiResponse<TReturn>> {
  return async (args: TArgs) => {
    try {
      return await action(args);
    } catch (err) {
      return {
        message: err instanceof Error ? err.message : "Unexpected error",
        code: 500,
      };
    }
  };
}

export function withAuthHandler<TArgs extends object, TReturn>(
  action: (args: TArgs & { userId: string }) => Promise<ApiResponse<TReturn>>,
): (args: TArgs) => Promise<ApiResponse<TReturn>> {
  return async (args: TArgs) => {
    const userId = await getSessionUserId();
    if (!userId) {
      return { message: "Unauthorized", code: 401 };
    }

    try {
      return await action({ ...args, userId });
    } catch (err) {
      return {
        message: err instanceof Error ? err.message : "Unexpected error",
        code: 500,
      };
    }
  };
}
