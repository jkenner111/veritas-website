import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { AdminChat } from "./AdminChat";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <AdminChat userName={firstName} />
    </div>
  );
}
