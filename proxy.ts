import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);

  if (pathname === "/") {
    return NextResponse.redirect(loginUrl);
  }

  if (!(await isAuthenticated(request))) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/v1/:path*"],
};
