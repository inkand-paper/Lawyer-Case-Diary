import sanitizeHtml from "sanitize-html";
/**
 * [XSS PROTECTION ENGINE]
 * Professional input scrubbing for the Lawyer Case Diary.
 * Ensures that case notes and client data are free from malicious scripts.
 */

export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Use DOM-parsing sanitizer rather than bypassable Regex
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href"]
    },
    allowedIframeHostnames: [], // Block all iframes
    disallowedTagsMode: 'discard'
  }).trim();
}

/**
 * Recursively sanitizes all string properties of an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = (Array.isArray(obj) ? [] : {}) as Record<string, unknown>;
  const inputObj = obj as Record<string, unknown>;

  for (const key in inputObj) {
    const value = inputObj[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
