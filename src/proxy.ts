import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only; the dashboard layout verifies the session again.
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has("mb_session");
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith("/dashboard") || pathname === "/onboarding") && !signedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login"],
};
