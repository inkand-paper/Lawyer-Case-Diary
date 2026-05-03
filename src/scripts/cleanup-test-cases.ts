import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "tabir8431@gmail.com";
  
  try {
    console.log(`Finding user: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error("User not found!");
      return;
    }

    console.log("Deleting all test cases...");
    const result = await prisma.case.deleteMany({
      where: { 
        userId: user.id,
        title: { startsWith: "Test Case" }
      }
    });

    console.log(`Successfully deleted ${result.count} test cases.`);
  } catch (err) {
    console.error("Operation failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanup();
