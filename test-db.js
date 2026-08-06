const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to connect to database...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Connection successful! Result:", result);
  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
