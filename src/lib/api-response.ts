import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Standardized API Response Wrapper
 * Provides consistent formatting for success and error states with integrated logging.
 */

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function successResponse(data: unknown, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  error?: unknown,
  context?: Record<string, unknown>
) {
  // Log the error professionally before responding
  if (status >= 500) {
    logger.error(`[API ERROR] ${code}: ${message}`, error, context);
  } else {
    logger.warn(`[API WARN] ${code}: ${message}`, { ...context, error } as Record<string, unknown>);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

// Shortcut for common errors
export const apiErrors = {
  BAD_REQUEST: (msg: string, ctx?: Record<string, unknown>) => errorResponse("BAD_REQUEST", msg, 400, null, ctx),
  UNAUTHORIZED: (msg = "Authentication required", ctx?: Record<string, unknown>) => errorResponse("UNAUTHORIZED", msg, 401, null, ctx),
  FORBIDDEN: (msg = "Access denied", ctx?: Record<string, unknown>) => errorResponse("FORBIDDEN", msg, 403, null, ctx),
  NOT_FOUND: (msg = "Resource not found", ctx?: Record<string, unknown>) => errorResponse("NOT_FOUND", msg, 404, null, ctx),
  SERVER_ERROR: (msg = "Internal server error", err?: unknown, ctx?: Record<string, unknown>) => errorResponse("SERVER_ERROR", msg, 500, err, ctx),
};
