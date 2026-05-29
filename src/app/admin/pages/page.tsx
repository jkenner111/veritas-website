import { listPageSlugs, loadPage } from "@/lib/pages";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminPages() {
  const slugs = listPageSlugs();
  const pages = slugs.map((slug) => {
    const page = loadPage(slug);
    return {
      slug,
      title: page?.frontmatter.title ?? "—",
      type: page?.frontmatter.type ?? "—",
      lastUpdated: page?.frontmatter.lastUpdated ?? "—",
      bodyLength: page?.body.length ?? 0,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pages</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pages.length} MDX pages in content/pages/
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Page
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Last Updated</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.slug}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{p.type}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{(p.bodyLength / 1024).toFixed(1)} KB</td>
                <td className="px-4 py-3 text-gray-500">{p.lastUpdated}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pages/${p.slug}`}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
