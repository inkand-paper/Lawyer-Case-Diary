import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "tabir8431@gmail.com";
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log("User Info:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("Failed to check user:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUser();
