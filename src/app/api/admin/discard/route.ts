import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { discardBranch, revertChanges, getStatus } from "@/lib/git";

/**
 * POST /api/admin/discard
 * Reverts uncommitted changes and/or deletes a preview branch.
 */
export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { branch } = await req.json().catch(() => ({}));

  try {
    if (branch) {
      await discardBranch(branch);
    } else {
      await revertChanges();
    }

    const status = await getStatus();
    return Response.json({
      discarded: true,
      branch: branch ?? null,
      currentBranch: status.branch,
      clean: status.clean,
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("Discard failed:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
