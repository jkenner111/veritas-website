import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { revertLastDeploy } from "@/lib/git";

export async function POST() {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sha = await revertLastDeploy(user.email);
    return Response.json({
      reverted: true,
      sha,
      message:
        "Reverted the last change on main. Production rebuild in progress.",
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("Revert failed:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
