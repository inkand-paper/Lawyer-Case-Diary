/**
 * Safe JSON Fetch Utility
 * ─────────────────────────────────────────────────────────────
 * Guards against HTML responses (e.g. 401 redirect to /login)
 * being parsed as JSON, which causes SyntaxError in the browser.
 * Returns null on non-JSON or non-ok responses instead of throwing.
 * ─────────────────────────────────────────────────────────────
 */
export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}
