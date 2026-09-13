import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import fs from "node:fs";
import path from "node:path";

const NAV_PATH = path.join(process.cwd(), "content", "navigation.json");

export async function GET() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nav = JSON.parse(fs.readFileSync(NAV_PATH, "utf-8"));
  return Response.json(nav);
}

export async function PUT(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await req.json();
  if (!Array.isArray(items)) {
    return Response.json({ error: "Expected an array of nav items" }, { status: 400 });
  }

  // Validate each item
  for (const item of items) {
    if (typeof item.title !== "string" || typeof item.href !== "string") {
      return Response.json(
        { error: "Each item must have title and href strings" },
        { status: 400 }
      );
    }
  }

  // Ensure children array exists
  const clean = items.map((item: Record<string, unknown>) => ({
    title: item.title,
    href: item.href,
    children: Array.isArray(item.children) ? item.children : [],
  }));

  fs.writeFileSync(NAV_PATH, JSON.stringify(clean, null, 2) + "\n", "utf-8");
  return Response.json({ updated: true, count: clean.length });
}
