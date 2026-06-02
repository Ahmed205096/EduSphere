import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import customeAuth from "./utils/customeAuth/customeAuth";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = await customeAuth();
  const { pathname } = request.nextUrl;

  if (!session || !session.user) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  if (pathname === "/instructor") {
    if (!["instructor", "admin"].includes(session.user.role as string)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next|assets|favicon.ico).*)",
};
