import db from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PRODUCTION HEALTH CHECK ENDPOINT
 * Used by Load Balancers and Uptime Monitors to verify system integrity.
 */
export async function GET() {
  const status: Record<string, any> = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      api: "healthy",
      database: "unknown"
    }
  };

  try {
    // 1. Verify Database Connection
    await db.$queryRaw`SELECT 1`;
    status.services.database = "healthy";
    
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    status.services.database = "unhealthy";
    status.error = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(status, { status: 503 });
  }
}
