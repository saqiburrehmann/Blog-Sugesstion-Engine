import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/", "/dashboard", "/profile"];

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  try {
    console.log("[Middleware] Verifying token...");
    const { payload } = await jwtVerify(token, secret);
    console.log("[Middleware] Token is valid. Payload:", payload);
    return payload;
  } catch (err) {
    console.error("[Middleware] Token verification failed:", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Request path: ${pathname}`);

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("token")?.value;
    console.log("[Middleware] Retrieved token from cookie:", token);

    if (!token) {
      console.warn("[Middleware] No token found. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      console.warn("[Middleware] Invalid token. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log("[Middleware] Access granted to protected route:", pathname);
    return NextResponse.next();
  }

  console.log("[Middleware] Public route. Continuing.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/profile"],
};
