/**
 * Professional Pagination Utility
 * SOLID: S (Single Responsibility for result windowing)
 */

export interface PaginationParams {
  limit: number;
  offset: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export function getPagination(url: string): PaginationParams {
  const { searchParams } = new URL(url);
  
  let limit = Math.abs(Number(searchParams.get("limit")) || DEFAULT_LIMIT);
  let offset = Math.abs(Number(searchParams.get("offset")) || 0);

  // Enforcement: Never allow unbounded queries
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { limit, offset };
}
