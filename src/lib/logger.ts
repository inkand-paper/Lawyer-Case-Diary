import db from "./db";

/**
 * Professional Logging Utility
 * Handles both console logging and persistent database logging for errors.
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogContext {
  userId?: string;
  path?: string;
  method?: string;
  ip?: string;
  [key: string]: any;
}

export async function log(
  level: LogLevel,
  message: string,
  error?: any,
  context?: LogContext
) {
  const timestamp = new Date().toISOString();
  const contextString = context ? JSON.stringify(context) : null;
  const errorString = error ? (error.stack || JSON.stringify(error)) : null;

  // 1. Console Logging (Immediate visibility)
  const color = level === "ERROR" ? "\x1b[31m" : level === "WARN" ? "\x1b[33m" : "\x1b[32m";
  const reset = "\x1b[0m";
  console.log(`${color}[${timestamp}] [${level}] ${message}${reset}`);
  if (error) console.error(error);

  // 2. Persistent Logging (Professional Auditing)
  // We use a background-like approach by not awaiting this in some cases,
  // but for the logger utility itself, we provide the option.
  try {
    await db.log.create({
      data: {
        level,
        message,
        context: contextString,
        error: errorString,
      },
    });
  } catch (logError) {
    console.error("[CRITICAL] Failed to persist log to database:", logError);
  }
}

export const logger = {
  info: (msg: string, ctx?: LogContext) => log("INFO", msg, undefined, ctx),
  warn: (msg: string, ctx?: LogContext) => log("WARN", msg, undefined, ctx),
  error: (msg: string, err: any, ctx?: LogContext) => log("ERROR", msg, err, ctx),
};
