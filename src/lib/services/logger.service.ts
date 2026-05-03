import db from "@/lib/db";

/**
 * Core Logging Service
 * Handles persistence of system logs, adhering to the Backend Engineering Spec.
 * Ensures passwords and sensitive case content are never logged.
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

/**
 * Sanitizes context to ensure sensitive fields are removed before logging.
 */
const sanitizeContext = (context?: Record<string, any>) => {
  if (!context) return undefined;
  
  const sanitized = { ...context };
  
  // Fields to strictly scrub
  const sensitiveKeys = ["password", "token", "jwt", "secret", "description", "content", "notes"];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    }
  }
  return JSON.stringify(sanitized);
};

export const logger = {
  async info(message: string, context?: Record<string, any>) {
    await logEvent({ level: "INFO", message, context });
  },

  async warn(message: string, context?: Record<string, any>) {
    await logEvent({ level: "WARN", message, context });
  },

  async error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    await logEvent({ level: "ERROR", message, error, context });
  }
};

/**
 * Internal persistence method
 */
async function logEvent({ level, message, context, error }: LogPayload) {
  try {
    const errorString = error instanceof Error 
      ? error.stack || error.message 
      : (error ? String(error) : undefined);

    await db.log.create({
      data: {
        level,
        message,
        context: sanitizeContext(context),
        error: errorString,
      }
    });

    // In development, also output to console
    if (process.env.NODE_ENV === "development") {
      const consoleMsg = `[${level}] ${message}`;
      if (level === "ERROR") console.error(consoleMsg, error);
      else if (level === "WARN") console.warn(consoleMsg);
      else console.log(consoleMsg);
    }
  } catch (err) {
    // Failsafe so the logging system never crashes the main thread
    console.error("CRITICAL: Failed to write to Log database", err);
  }
}
