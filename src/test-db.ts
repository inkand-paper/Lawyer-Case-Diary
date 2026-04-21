import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = "postgres://21dbc1f83bcd5876ff56f81947576b5e10a99e746a895493cfe6bd7af90466fb:sk_wXwbZs0PVaY9EHT13ftjN@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function test() {
  console.log("Testing connection...");
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const userCount = await prisma.user.count();
    console.log("Success! User count:", userCount);
    
    const logs = await prisma.log.findMany({ take: 1 });
    console.log("Log table check:", logs.length > 0 ? "Exists with data" : "Exists but empty");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
