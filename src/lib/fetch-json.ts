/**
 * Safe JSON Fetch Utility
 * ─────────────────────────────────────────────────────────────
 * Guards against HTML responses (e.g. 401 redirect to /login)
 * being parsed as JSON, which causes SyntaxError in the browser.
 * Returns null on non-JSON or non-ok responses instead of throwing.
 * ─────────────────────────────────────────────────────────────
 */
export type APIResponseFallback = { success: false; error: string; status: number };

export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<(T & { status?: number }) | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    
    // Safety check for HTML responses masking as API responses
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        return { success: false, error: "Network response was not JSON and failed.", status: res.status } as unknown as (T & { status?: number });
      }
      return { success: false, error: "Invalid Content-Type returned from server.", status: 500 } as unknown as (T & { status?: number });
    }

    const data = await res.json();
    
    if (!res.ok) {
      // Extract professional api-response.ts error structure
      return { 
        success: false, 
        error: data.error?.message || "An unexpected error occurred.", 
        status: res.status 
      } as unknown as (T & { status?: number });
    }

    return { ...data, status: res.status } as (T & { status?: number });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network failure.";
    return { success: false, error: message, status: 0 } as unknown as (T & { status?: number });
  }
}
