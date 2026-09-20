import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../lib/seedData";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then((log) => {
    for (const line of log) console.log(line);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
