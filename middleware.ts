import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/suivi", "/book", "/api/track", "/api/address-search", "/favicon.ico"];
const PROTECTED_PATHS = ["/intake", "/repairs", "/reports", "/quotes", "/clients", "/invoices", "/payments", "/parts", "/technicians", "/categories", "/warranties", "/reminders", "/notifications", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  
  if (isProtected) {
    const authCookie = request.cookies.get("repairpro_auth");
    if (authCookie?.value !== "authenticated") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  if (pathname === "/" || pathname.startsWith("/dossier")) {
    const authCookie = request.cookies.get("repairpro_auth");
    if (authCookie?.value !== "authenticated" && !pathname.startsWith("/dossier")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
