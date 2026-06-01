import { prisma } from "./src/lib/prisma";
async function main() {
  try {
    const unis = await prisma.university.findMany({ include: { ranking: true }, take: 1 });
    console.log("Success:", unis.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
