/**
 * Safe JSON Fetch Utility
 * ─────────────────────────────────────────────────────────────
 * Guards against HTML responses (e.g. 401 redirect to /login)
 * being parsed as JSON, which causes SyntaxError in the browser.
 * Returns null on non-JSON or non-ok responses instead of throwing.
 * ─────────────────────────────────────────────────────────────
 */
export type FetchResult<T> = 
  | { success: true; data: T; status: number }
  | { success: false; error: string; status: number; data?: null };

export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    
    // Safety check for HTML responses masking as API responses
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        return { success: false, error: "Network response was not JSON and failed.", status: res.status };
      }
      return { success: false, error: "Invalid Content-Type returned from server.", status: 500 };
    }

    const data = await res.json();
    
    if (!res.ok) {
      // Extract professional api-response.ts error structure
      return { 
        success: false, 
        error: data.error?.message || "An unexpected error occurred.", 
        status: res.status 
      };
    }

    return { success: true, data: data.data || data, status: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network failure.";
    return { success: false, error: message, status: 0 };
  }
}
