import { prisma } from "../app/lib/prisma";

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.part.deleteMany();
  await prisma.category.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.client.deleteMany();

  console.log("✅ Database cleared!");
  process.exit(0);
}

resetDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
