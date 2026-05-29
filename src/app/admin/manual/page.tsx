import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { listPageSlugs, loadPage } from "@/lib/pages";
import { listPosts } from "@/lib/posts";
import { loadUsers } from "@/lib/users";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function loadNavigation() {
  try {
    const navPath = path.join(process.cwd(), "content", "navigation.json");
    return JSON.parse(fs.readFileSync(navPath, "utf-8"));
  } catch {
    return [];
  }
}

export default async function ManualDashboard() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  const firstName = user?.name.split(" ")[0] ?? "there";

  const pages = listPageSlugs();
  const posts = listPosts();
  const users = loadUsers();
  const navigation = loadNavigation();

  const stats = [
    {
      label: "Pages",
      value: pages.length,
      href: "/admin/pages",
      description: "MDX content pages",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Blog Posts",
      value: posts.length,
      href: "/admin/blog",
      description: "Published articles",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Admin Users",
      value: users.length,
      href: "/admin/users",
      description: "Authorized editors",
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Nav Items",
      value: navigation.length,
      href: "/admin/navigation",
      description: "Top-level menu entries",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ↤ Back to Chat
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Manual Editors</h1>
      <p className="mt-2 text-gray-600 text-sm">
        Direct access to content editors. For most changes, try the chat interface on the main page.
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
          >
            <div className={`inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${s.color}`}>
              {s.label}
            </div>
            <div className="mt-3 text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-sm text-gray-500">{s.description}</div>
          </Link>
        ))}
      </div>

      {/*"Blog posts */}
      {posts.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Blog Posts</h2>
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm minw-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Title</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Author</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.slice(0, 5).map((post) => (
                    <tr key={post.slug} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{post.frontmatter.date}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/blog/${post.slug}`} className="text-blue-600 hover:underline">
                          {post.frontmatter.title || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{post.frontmatter.author ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content pages */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Content Pages</h2>
          <Link href="/admin/pages" className="text-sm text-blue-600 hover:underline">
            Manage pages
          </Link>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm minw-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {pages.slice(0, 5).map((slug) => {
                  const page = loadPage(slug);
                  return (
                    <tr key={slug} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{slug}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/pages/${slug}`} className="text-blue-600 hover:underline">
                          {page?.frontmatter.title ?? "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{page?.frontmatter.lastUpdated ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
