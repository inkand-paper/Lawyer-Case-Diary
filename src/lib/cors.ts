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

  // 2. Allow official domains — exact match only.
  // NOTE: previously used origin.startsWith(allowed), which let an attacker
  // pass CORS by hosting on e.g. https://lawyer-case-diary.vercel.app.evil.com
  // (a valid origin string that merely starts with an allowed one).
  return ALLOWED_ORIGINS.includes(origin);
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
