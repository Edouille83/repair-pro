import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
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

    return NextResponse.json({ success: true, message: "Base de données réinitialisée avec succès" });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la réinitialisation" },
      { status: 500 }
    );
  }
}
