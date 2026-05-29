import { headers } from "next/headers";
import Link from "next/link";
import { findUserByEmail } from "@/lib/users";

export const metadata = {
  title: "Veritas Admin",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Chat", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { href: "/admin/manual", label: "Manual Editors", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/admin/contact", label: "Contact Admin", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const authMode = h.get("x-admin-auth-mode");
  const user = email ? findUserByEmail(email) : null;

  const cfTeamDomain = process.env.CF_ACCESS_TEAM_DOMAIN;
  const cfLogoutUrl =
    authMode === "cf-access" && cfTeamDomain
      ? `https://${cfTeamDomain}/cdn-cgi/access/logout?returnTo=${encodeURIComponent("https://admin.veritasconsultingpartnersllc.com")}`
      : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Not authorized
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {email ? (
              <>
                <code className="font-mono">{email}</code> is not on the admin
                list. Contact Jack if you should have access.
              </>
            ) : (
              "No identity was passed through. Cloudflare Access may not be configured yet."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-200">
          <Link href="/admin" className="font-semibold text-gray-900 text-lg">
            Veritas Admin
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-3 py-3">
          <div className="px-3 pb-2">
            <div className="text-sm font-medium text-gray-700 truncate">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          {cfLogoutUrl ? (
            <a
              href={cfLogoutUrl}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </a>
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500 italic leading-relaxed">
              Auto-signed in via tailnet. Sign out by closing this tab or disconnecting from the network.
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="px-8 py-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
