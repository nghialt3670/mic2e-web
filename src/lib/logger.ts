// Simple logger utility for consistent logging across the app

type LogLevel = "info" | "warn" | "error" | "debug";

function formatMessage(
  level: LogLevel,
  area: string,
  message: string,
  data?: any,
) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${area}]`;

  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  info: (area: string, message: string, data?: any) => {
    console.log(formatMessage("info", area, message, data));
  },

  warn: (area: string, message: string, data?: any) => {
    console.warn(formatMessage("warn", area, message, data));
  },

  error: (area: string, message: string, error?: any) => {
    const errorData =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
    console.error(formatMessage("error", area, message, errorData));
  },

  debug: (area: string, message: string, data?: any) => {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.AUTH_DEBUG === "true"
    ) {
      console.debug(formatMessage("debug", area, message, data));
    }
  },

  request: (
    method: string,
    path: string,
    status?: number,
    duration?: number,
  ) => {
    const statusEmoji = status
      ? status >= 500
        ? "❌"
        : status >= 400
          ? "⚠️"
          : status >= 300
            ? "↪️"
            : "✓"
      : "→";

    const durationStr = duration ? ` (${duration}ms)` : "";
    console.log(`${statusEmoji} ${method} ${path}${durationStr}`);
  },
};

// Export for use in server components
export default logger;
