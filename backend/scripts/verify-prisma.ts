import { prisma } from "../src/lib/prisma.js";

async function verify() {
  try {
    await prisma.user.findFirst();
    console.log("✅ Connected");
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
