const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    let client = await prisma.client.create({ data: { name: "Test Node", phone: "999" }});
    let repair = await prisma.repair.create({
      data: {
        clientId: client.id,
        deviceType: "phone",
        brandModel: "test",
        issue: "test",
        status: "Diagnostic",
        preChecklist: "{}",
        photos: "[]",
        signature: "base64..."
      }
    });
    console.log("Success Prisma ID:", repair.id);
  } catch(e) {
    console.error("Prisma Error:", e);
  }
}
run();
