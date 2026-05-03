/**
 * Strict CORS Configuration for Lawyer Case Diary
 */

const ALLOWED_ORIGINS = [
  "https://lawyer-case-diary.vercel.app", // Production
  "http://localhost:3000",                // Local Dev
];

export function isOriginAllowed(origin: string | null): boolean {
  // 1. Allow same-site requests (where origin is null)
  if (!origin) return true;

  // 2. Allow official domains
  return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.startsWith(allowed));
}

export function getCorsHeaders(origin: string | null) {
  const allowed = isOriginAllowed(origin);
  
  return {
    "Access-Control-Allow-Origin": allowed ? (origin || "*") : "FORBIDDEN",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}
