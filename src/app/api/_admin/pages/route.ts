import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { listPageSlugs, loadPage } from "@/lib/pages";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export async function GET() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slugs = listPageSlugs();
  const pages = slugs.map((slug) => {
    const page = loadPage(slug);
    return {
      slug,
      title: page?.frontmatter.title ?? null,
      type: page?.frontmatter.type ?? null,
      lastUpdated: page?.frontmatter.lastUpdated ?? null,
      bodyLength: page?.body.length ?? 0,
    };
  });

  return Response.json(pages);
}

export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "owner") {
    return Response.json({ error: "Only owners can create pages" }, { status: 403 });
  }

  const { slug, frontmatter, body } = await req.json();
  if (!slug || typeof slug !== "string") {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const pagesDir = path.join(process.cwd(), "content", "pages");
  const filePath = path.join(pagesDir, `${safeSlug}.mdx`);

  if (fs.existsSync(filePath)) {
    return Response.json({ error: "Page already exists" }, { status: 409 });
  }

  const fm = {
    title: frontmatter?.title ?? safeSlug,
    slug: safeSlug,
    type: frontmatter?.type ?? "page",
    lastUpdated: new Date().toISOString(),
    ...frontmatter,
  };

  const content = matter.stringify(body ?? "", fm);
  fs.writeFileSync(filePath, content, "utf-8");

  return Response.json({ slug: safeSlug, created: true }, { status: 201 });
}
