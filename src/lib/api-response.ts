import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Standardized API Response Wrapper
 * Provides consistent formatting for success and error states with integrated logging.
 */

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function successResponse(data: any, message = "Success", status = 200) {
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
  error?: any,
  context?: any
) {
  // Log the error professionally before responding
  if (status >= 500) {
    logger.error(`[API ERROR] ${code}: ${message}`, error, context);
  } else {
    logger.warn(`[API WARN] ${code}: ${message}`, { ...context, error });
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
  BAD_REQUEST: (msg: string, ctx?: any) => errorResponse("BAD_REQUEST", msg, 400, null, ctx),
  UNAUTHORIZED: (msg = "Authentication required", ctx?: any) => errorResponse("UNAUTHORIZED", msg, 401, null, ctx),
  FORBIDDEN: (msg = "Access denied", ctx?: any) => errorResponse("FORBIDDEN", msg, 403, null, ctx),
  NOT_FOUND: (msg = "Resource not found", ctx?: any) => errorResponse("NOT_FOUND", msg, 404, null, ctx),
  SERVER_ERROR: (msg = "Internal server error", err?: any, ctx?: any) => errorResponse("SERVER_ERROR", msg, 500, err, ctx),
};
