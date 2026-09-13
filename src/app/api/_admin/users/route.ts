import { headers } from "next/headers";
import { findUserByEmail, loadUsers, type AdminUser } from "@/lib/users";
import fs from "node:fs";
import path from "node:path";

const usersPath =
  process.env.USERS_JSON_PATH ?? path.resolve("/app/data/users.json");

function saveUsers(users: AdminUser[]) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2) + "\n", "utf-8");
}

export async function GET() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(loadUsers());
}

export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "owner") {
    return Response.json({ error: "Only owners can add users" }, { status: 403 });
  }

  const { name, email: newEmail, role } = await req.json();
  if (!name || !newEmail || !role) {
    return Response.json({ error: "name, email, and role are required" }, { status: 400 });
  }
  if (role !== "owner" && role !== "editor") {
    return Response.json({ error: "role must be 'owner' or 'editor'" }, { status: 400 });
  }

  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === newEmail.toLowerCase())) {
    return Response.json({ error: "User already exists" }, { status: 409 });
  }

  const newUser: AdminUser = { name, email: newEmail.toLowerCase(), role };
  users.push(newUser);
  saveUsers(users);

  return Response.json(newUser, { status: 201 });
}

export async function DELETE(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "owner") {
    return Response.json({ error: "Only owners can remove users" }, { status: 403 });
  }

  const url = new URL(req.url);
  const targetEmail = url.searchParams.get("email");
  if (!targetEmail) {
    return Response.json({ error: "email query param required" }, { status: 400 });
  }

  // Don't allow deleting yourself
  if (targetEmail.toLowerCase() === user.email.toLowerCase()) {
    return Response.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  const users = loadUsers();
  const filtered = users.filter((u) => u.email.toLowerCase() !== targetEmail.toLowerCase());
  if (filtered.length === users.length) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  saveUsers(filtered);
  return Response.json({ email: targetEmail, deleted: true });
}
