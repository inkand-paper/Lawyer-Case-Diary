import db from "@/lib/db";

/**
 * Core Logging Service — Production Grade
 *
 * Key design decisions:
 * 1. Console output is SYNCHRONOUS — always visible even if DB is down.
 * 2. DB write is FIRE-AND-FORGET — never blocks the calling request.
 * 3. Context is sanitized — passwords, tokens, case content are never stored.
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

/**
 * Keys whose values are redacted before writing to the database.
 * Uses substring matching, so "resetToken" is caught by "token", etc.
 */
const SENSITIVE_KEYS = ["password", "token", "jwt", "secret", "description", "content", "notes"];

const sanitizeContext = (context?: Record<string, unknown>): string | undefined => {
  if (!context) return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const isSecret = SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk));
    sanitized[key] = isSecret ? "[REDACTED]" : value;
  }

  return JSON.stringify(sanitized);
};

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    logEvent({ level: "INFO", message, context });
  },

  warn(message: string, context?: Record<string, unknown>) {
    logEvent({ level: "WARN", message, context });
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    logEvent({ level: "ERROR", message, error, context });
  },
};

/**
 * Internal log dispatcher.
 * Console write is synchronous; DB write is intentionally not awaited.
 */
function logEvent({ level, message, context, error }: LogPayload) {
  const errorString =
    error instanceof Error
      ? error.stack || error.message
      : error
      ? String(error)
      : undefined;

  // 1. Structured console output — always written synchronously
  if (process.env.NODE_ENV === "production") {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        context: sanitizeContext(context),
        ...(errorString && { error: errorString }),
      })
    );
  } else {
    const prefix = `[${level}] ${message}`;
    if (level === "ERROR") console.error(prefix, error ?? "");
    else if (level === "WARN") console.warn(prefix);
    else console.log(prefix);
  }

  // 2. Async DB persistence — fire-and-forget, never blocks the request
  db.log
    .create({
      data: {
        level,
        message,
        context: sanitizeContext(context),
        error: errorString,
      },
    })
    .catch((err) => {
      // Last-resort fallback — log to console only
      console.error("CRITICAL: Failed to persist log entry to database", err);
    });
}
