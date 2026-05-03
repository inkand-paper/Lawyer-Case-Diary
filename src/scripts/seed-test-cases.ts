import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
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

    // Ensure a test client exists
    let client = await prisma.client.findFirst({
      where: { userId: user.id, name: "Test Client" }
    });

    if (!client) {
      console.log("Creating test client...");
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name: "Test Client",
          phone: "0123456789",
          address: "Test Address"
        }
      });
    }

    console.log("Creating 45 test cases...");
    const cases = [];
    for (let i = 1; i <= 45; i++) {
      cases.push({
        userId: user.id,
        clientId: client.id,
        title: `Test Case ${i}`,
        caseNumber: `TS-${1000 + i}`,
        courtName: "Test Court",
        judgeName: "Test Judge",
        status: "ACTIVE"
      });
    }

    await prisma.case.createMany({
      data: cases
    });

    console.log(`Successfully created 45 cases for ${email}`);
    const totalCases = await prisma.case.count({ where: { userId: user.id } });
    console.log(`Current total cases for this user: ${totalCases}`);
  } catch (err) {
    console.error("Operation failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();
