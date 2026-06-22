// Sign-in gate: every dashboard and API request must carry a session cookie. This is the
// app's logical access control.
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session) {
    return Response.redirect(new URL("/login", request.url));
  }
  return undefined;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
