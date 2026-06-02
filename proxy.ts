import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import customeAuth from "./utils/customeAuth/customeAuth";

const authRoutes = ["/login", "/register", "/forgot-password", "/confirm-email"];
const protectedRoutes = ["/student", "/instructor", "/quiz/student"];
const publicFilePattern = /\.(.*)$/;

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function getDashboardPath(role?: string) {
  return role === "admin" || role === "instructor" ? "/instructor" : "/student";
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    isRouteMatch(pathname, authRoutes) || pathname.startsWith("/reset-password");
  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);

  if (
    publicFilePattern.test(pathname) ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const session = await customeAuth();

  if (isAuthRoute) {
    if (session && session.user) {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.user.role), request.url),
      );
    }

    return NextResponse.next();
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!session || !session.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/instructor") &&
    !["instructor", "admin"].includes(session.user.role)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|assets|favicon.ico).*)",
};
