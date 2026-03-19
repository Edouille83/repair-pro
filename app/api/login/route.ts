import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit, getClientIP } from "@/app/lib/rateLimit";

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  const limit = rateLimit(`login:${clientIP}`, 5, 300000);
  
  if (!limit.success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter 5 minutes." },
      { status: 429 }
    );
  }

  try {
    const { password } = await request.json();
    const correctPassword = process.env.AUTH_PASSWORD || "admin123";

    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set("repairpro_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
