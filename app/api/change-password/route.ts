import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const currentEnvPassword = process.env.AUTH_PASSWORD || "admin123";

    if (currentPassword !== currentEnvPassword) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 401 });
    }

    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    try {
      envContent = fs.readFileSync(envPath, "utf8");
    } catch {
      envContent = "";
    }

    const authPasswordLine = `AUTH_PASSWORD="${newPassword}"`;
    if (envContent.includes("AUTH_PASSWORD=")) {
      envContent = envContent.replace(/AUTH_PASSWORD="[^"]*"/, authPasswordLine);
    } else {
      envContent += `\n${authPasswordLine}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + "\n");
    
    process.env.AUTH_PASSWORD = newPassword;

    const cookieStore = await cookies();
    cookieStore.set("repairpro_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
