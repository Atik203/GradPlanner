import { prisma } from "./src/lib/prisma";

async function main() {
  const list = await prisma.countryIntelligence.findMany({
    select: {
      id: true,
      country: true,
      countryCode: true,
    },
    orderBy: {
      country: "asc",
    },
  });

  console.log("Countries in DB:", JSON.stringify(list, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
