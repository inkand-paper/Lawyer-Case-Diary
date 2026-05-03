import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  const value = args[2];

  console.log("◇ injected env (9) from .env");

  switch (command) {
    case "make-admin":
      if (!target) return console.error("❌ Target email required.");
      try {
        await prisma.user.update({
          where: { email: target },
          data: { 
            role: "ADMIN", 
            emailVerified: true,
            plan: "ULTIMATE" // Give admins ultimate tier by default
          },
        });
        console.log(`🚀 User ${target} is now an ADMIN, VERIFIED, and on ULTIMATE tier.`);
      } catch (err) {
        console.error("❌ Failed to promote user:", err);
      }
      break;

    case "set-plan":
      if (!target || !value) return console.error("❌ Usage: set-plan <email> <ESSENTIAL|EXECUTIVE|ULTIMATE>");
      try {
        await prisma.user.update({
          where: { email: target },
          data: { plan: value.toUpperCase() },
        });
        console.log(`💎 User ${target} plan updated to ${value.toUpperCase()}.`);
      } catch (err) {
        console.error("❌ Failed to update plan:", err);
      }
      break;

    case "delete-user":
      if (!target) return console.error("❌ Target email required.");
      try {
        await prisma.user.delete({ where: { email: target } });
        console.log(`🗑️ User ${target} purged from registry.`);
      } catch (err) {
        console.error("❌ Failed to delete user:", err);
      }
      break;

    default:
      console.log(`
  Supreme Judicial CLI
  ────────────────────
  Available Commands:
  - make-admin <email>          Promote to Admin & Ultimate tier
  - set-plan <email> <plan>     Update plan (ESSENTIAL, EXECUTIVE, ULTIMATE)
  - delete-user <email>         Permanently remove practitioner
      `);
  }
  
  await prisma.$disconnect();
  await pool.end();
}

main();
