import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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
    // Optimal pooler settings for Supabase
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 30000, // 30s allowance for cold starts
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
