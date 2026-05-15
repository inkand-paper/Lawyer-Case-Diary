import { z } from "zod";
import { sanitizeObject } from "./sanitizer";

/**
 * Professional API Request Handling Utility
 * SOLID Principle: DRY (Don't Repeat Yourself) & Single Responsibility
 * Handles the boilerplate of sanitization and validation.
 */

export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const rawBody = await req.json();
    
    // 1. Sanitize to prevent XSS
    const sanitizedBody = sanitizeObject(rawBody);

    // 2. Validate with Zod
    const result = schema.safeParse(sanitizedBody);

    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: "Invalid JSON payload provided." };
  }
}
