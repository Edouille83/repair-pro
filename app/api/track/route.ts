import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/app/lib/rateLimit";
import { publicTrackingSchema } from "@/app/lib/validation";

// Use the singleton instance of prisma from @/app/lib/prisma

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const limit = rateLimit(`track:${clientIP}`, 10, 60000);
  
  if (!limit.success) {
    return NextResponse.json(
      { success: false, message: "Trop de requêtes. Veuillez patienter." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetIn / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { searchType, searchValue } = body;

    if (searchType === "phone") {
      const validated = publicTrackingSchema.safeParse({ phone: searchValue });
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          message: "Numéro de téléphone invalide",
        });
      }
    }

    let repair;

    if (searchType === "invoice") {
      repair = await prisma.repair.findFirst({
        where: { invoiceRef: searchValue.toUpperCase() },
        include: { client: true },
      });
    } else if (searchType === "phone") {
      const client = await prisma.client.findFirst({
        where: { phone: searchValue },
        include: { repairs: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      repair = client?.repairs[0];
    }

    if (!repair) {
      return NextResponse.json({
        success: false,
        message: "Aucune réparation trouvée",
      });
    }

    return NextResponse.json({
      success: true,
      repair: {
        id: repair.id,
        invoiceRef: repair.invoiceRef,
        deviceType: repair.deviceType,
        brandModel: repair.brandModel,
        status: repair.status,
        issue: repair.issue,
        diagnosis: repair.diagnosis,
        solution: repair.solution,
        createdAt: repair.createdAt.toLocaleString("fr-FR"),
        completedAt: repair.completedAt?.toLocaleString("fr-FR") || null,
      },
    });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({
      success: false,
      message: "Une erreur est survenue",
    });
  }
}
