import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚖️  Starting Lawyer Amnesty Protocol...");
  
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: false,
    },
    data: {
      emailVerified: true,
    },
  });

  console.log(`✅ Success! ${result.count} lawyer accounts have been auto-verified.`);
}

main()
  .catch((e) => {
    console.error("❌ Amnesty Protocol Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
