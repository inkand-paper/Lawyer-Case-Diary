/**
 * [XSS PROTECTION ENGINE]
 * Professional input scrubbing for the Lawyer Case Diary.
 * Ensures that case notes and client data are free from malicious scripts.
 */

export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "[BLOCKED_SCRIPT]") // Block <script> tags
    .replace(/on\w+="[^"]*"/gim, "[BLOCKED_EVENT]") // Block inline event handlers (onerror, onclick, etc)
    .replace(/javascript:[^"']*/gim, "[BLOCKED_JS]") // Block javascript: URLs
    .trim();
}

/**
 * Recursively sanitizes all string properties of an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = (obj as any)[key];

    if (typeof value === "string") {
      (sanitized as any)[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null) {
      (sanitized as any)[key] = sanitizeObject(value);
    } else {
      (sanitized as any)[key] = value;
    }
  }

  return sanitized as T;
}
