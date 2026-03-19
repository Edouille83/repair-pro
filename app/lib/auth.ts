import { cookies } from "next/headers";

const AUTH_COOKIE = "repairpro_auth";

export async function getAuth() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "authenticated";
}

export async function setAuth(authenticated: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, authenticated ? "authenticated" : "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
