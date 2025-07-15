// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// these will be injected from process.env
const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASSWORD;

export function middleware(req: NextRequest) {
  // allow public assets and auth callback (if any)
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static/")
  ) {
    return NextResponse.next();
  }

  // parse the “Authorization: Basic …” header
  const auth = req.headers.get("authorization") || "";
  const [scheme, encoded] = auth.split(" ");
  if (
    scheme === "Basic" &&
    encoded &&
    Buffer.from(encoded, "base64")
      .toString()
      .split(":")
      .every((val, i) => (i === 0 ? val === USER : val === PASS))
  ) {
    // credentials match!
    return NextResponse.next();
  }

  // otherwise, ask for credentials
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });
}

// apply to all routes except Next internals
export const config = {
  matcher: "/((?!_next/|favicon\\.ico|static/).*)",
};
