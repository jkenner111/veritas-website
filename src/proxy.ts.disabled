import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessJwt, devBypassIdentity, bypassIdentity } from "@/lib/cf-access";

export const config = {
  // Match everything except Next internals and common static assets.
  // Still broad so we can enforce the admin-hostname redirect on "/".
  matcher: [
    "/((?!_next|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)).*)",
  ],
};

const ADMIN_EMAIL_HEADER = "x-admin-email";
const ADMIN_AUTH_MODE_HEADER = "x-admin-auth-mode";
const ADMIN_HOSTS = new Set(["admin.veritasconsultingpartnersllc.com"]);

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin/");
}

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const path = req.nextUrl.pathname;
  const isAdminHost = ADMIN_HOSTS.has(host);
  const adminPath = isAdminPath(path);
  const isApiPath = path.startsWith("/api/");

  // Dual-path admin auth:
  // - requests to ADMIN_BYPASS_HOST (tailnet) get auto-logged-in as ADMIN_BYPASS_EMAIL
  // - requests to admin.veritasconsultingpartnersllc.com (public) go through Cloudflare Access JWT
  // - any other host hitting an admin path falls through to the JWT check and 401s
  const bypass = bypassIdentity();
  const bypassHost = (process.env.ADMIN_BYPASS_HOST ?? "").toLowerCase();
  const onBypassHost = bypass !== null && bypassHost !== "" && host === bypassHost;

  // On the admin hostname, anything that isn't an admin page or API gets
  // bounced to /admin — public routes shouldn't serve from admin.*.
  if (isAdminHost && !adminPath && !isApiPath) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Admin pages and admin APIs (on either hostname) require a valid identity.
  if (adminPath) {
    if (onBypassHost && bypass) return forwardWithEmail(req, bypass.email, "bypass");

    const dev = devBypassIdentity();
    if (dev) return forwardWithEmail(req, dev.email, "dev");

    const token =
      req.headers.get("cf-access-jwt-assertion") ||
      req.cookies.get("CF_Authorization")?.value;
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identity = await verifyAccessJwt(token);
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return forwardWithEmail(req, identity.email, "cf-access");
  }

  return NextResponse.next();
}

function forwardWithEmail(req: NextRequest, email: string, mode: string) {
  const headers = new Headers(req.headers);
  headers.set(ADMIN_EMAIL_HEADER, email);
  headers.set(ADMIN_AUTH_MODE_HEADER, mode);
  return NextResponse.next({ request: { headers } });
}
