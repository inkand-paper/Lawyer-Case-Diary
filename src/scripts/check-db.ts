import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const clients = await prisma.client.count();
  const cases = await prisma.case.count();
  const hearings = await prisma.hearing.count();

  console.log("Database Stats:");
  console.log(`Users: ${users}`);
  console.log(`Clients: ${clients}`);
  console.log(`Cases: ${cases}`);
  console.log(`Hearings: ${hearings}`);

  if (hearings > 0) {
    const lastHearing = await prisma.hearing.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { case: true }
    });
    console.log("\nLast Hearing Detail:");
    console.log(JSON.stringify(lastHearing, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
