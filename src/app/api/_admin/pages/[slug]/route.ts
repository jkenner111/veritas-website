import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { loadPage, PAGES_DIR } from "@/lib/pages";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const page = loadPage(slug);
  if (!page) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(page);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = loadPage(slug);
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { frontmatter, body } = await req.json();
  const mergedFm = { ...existing.frontmatter, ...frontmatter };
  const content = matter.stringify(body ?? existing.body, mergedFm);

  const filePath = path.join(PAGES_DIR, `${slug}.mdx`);
  fs.writeFileSync(filePath, content, "utf-8");

  return Response.json({ slug, updated: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "owner") {
    return Response.json({ error: "Only owners can delete pages" }, { status: 403 });
  }

  const { slug } = await params;
  const filePath = path.join(PAGES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return Response.json({ slug, deleted: true });
}
