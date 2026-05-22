import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ── Startup Guards ─────────────────────────────────────────────────────────────
// Fail immediately rather than allowing a misconfigured deployment to serve
// requests with an insecure fallback JWT secret or no database.
if (!process.env.DATABASE_URL) {
  throw new Error("FATAL: DATABASE_URL environment variable is not set.");
}
if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "Generate one with: openssl rand -base64 32"
  );
}

/**
 * Prisma Client Singleton for Prisma 7 + PostgreSQL Adapter
 * This configuration resolves the "PrismaClientInitializationError" in Next.js 16/Prisma 7
 * by explicitly providing the PostgreSQL adapter and pooler configurations.
 */

const prismaClientSingleton = () => {
  // Use connection pooling for Supabase compatibility
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in the environment.");
  }

  const pool = new Pool({ 
    connectionString,
    // Serverless-safe pool size.
    // Supabase free tier: ~20 total connections.
    // With many serverless instances, max:20 per instance exhausts the limit.
    // max:2 keeps us safely within bounds while still benefiting from pooling.
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ 
    adapter,
    // Enhanced logging for professional monitoring
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Lazy-load Proxy to ensure Prisma only connects when a database operation is triggered.
// This prevents connection crashes during Next.js build-time static generation.
const db = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
  get(target, prop, receiver) {
    if (!globalThis.prisma) {
      console.log("[DB] Initializing Prisma Client with PG Adapter...");
      globalThis.prisma = prismaClientSingleton();
    }
    return Reflect.get(globalThis.prisma, prop, receiver);
  },
});

export default db;
