import { ApiResponse } from "@/types/api-types";

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
