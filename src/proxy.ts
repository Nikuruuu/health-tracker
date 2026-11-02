import { NextResponse, type NextRequest } from "next/server";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic edge cookie-presence check
  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  const isAuthPage = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // 1. Signed-in user visits auth pages -> redirect to /
  if (hasSessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Signed-out user visits protected app paths -> redirect to /sign-in
  if (!hasSessionCookie && !isAuthPage) {
    const signInUrl = new URL("/sign-in", request.url);
    if (pathname !== "/" && pathname !== "") {
      signInUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (Better Auth endpoints)
     * - /_next/* (Next.js internals)
     * - static files (favicon.ico, svg, png, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

