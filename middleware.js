// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/home", "/login", "/signup", "/contact"];
const ADMIN_PREFIX = "/admin";
const DASHBOARD = "/dashboard";
const ADMIN_DASHBOARD = "/admin/dashboard";

// Verify JWT
async function verifyJwt(token) {
  if (!token) throw new Error("No token");

  const secret =
    process.env.JWT_Secret ||
    process.env.JWT_SECRET ||
    process.env.NEXT_PUBLIC_JWT_SECRET;

  if (!secret) throw new Error("JWT secret not configured");

  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  return payload;
}

// Extract token from Set-Cookie
function extractTokenFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const match = setCookie.match(/Token=([^;]+)/);
  return match ? match[1] : null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("Token")?.value || null;

  let payload = null;

  if (token) {
    try {
      payload = await verifyJwt(token);
    } catch (err) {
      // token expired/invalid → try refresh
      try {
        const refreshRes = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: "POST",
          headers: { cookie: request.headers.get("cookie") || "" },
        });

        if (refreshRes.ok) {
          const response = NextResponse.next();

          const setCookie = refreshRes.headers.get("set-cookie");
          let newToken = extractTokenFromSetCookie(setCookie);

          if (!newToken) {
            try {
              const json = await refreshRes.json();
              newToken = json?.token || json?.Token || null;
            } catch {
              newToken = null;
            }
          }

          if (newToken) {
            response.cookies.set("Token", newToken, {
              httpOnly: true,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7,
            });
            payload = await verifyJwt(newToken);
            return response;
          }
        }

        // Refresh failed → redirect login
        const redirect = NextResponse.redirect(new URL("/login", request.url));
        redirect.cookies.set("Token", "", { path: "/", httpOnly: true, maxAge: 0 });
        return redirect;
      } catch {
        const redirect = NextResponse.redirect(new URL("/login", request.url));
        redirect.cookies.set("Token", "", { path: "/", httpOnly: true, maxAge: 0 });
        return redirect;
      }
    }
  }

  // Helper: check if user is admin
  const isAdmin =
    payload?.isAdmin === true ||
    (Array.isArray(payload?.roles) && payload.roles.includes("admin")) ||
    payload?.role === "admin";

  // Public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    if (payload) {
      return NextResponse.redirect(new URL(isAdmin ? ADMIN_DASHBOARD : DASHBOARD, request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If admin → block access to user dashboard
  if (pathname.startsWith(DASHBOARD) && isAdmin) {
    return NextResponse.redirect(new URL(ADMIN_DASHBOARD, request.url));
  }

  // If normal user → block access to admin dashboard
  if (pathname.startsWith(ADMIN_PREFIX) && !isAdmin) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/login",
    "/signup",
    "/contact",
    "/dashboard",
    "/admin/:path*",
  ],
};
