import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { deployBranch } from "@/lib/git";

/**
 * POST /api/admin/deploy
 * Merges a preview branch to main and pushes to GitHub.
 * Triggers production rebuild via GitHub webhook on Boris.
 */
export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { branch } = await req.json().catch(() => ({}));
  if (!branch) {
    return Response.json({ error: "Missing branch" }, { status: 400 });
  }

  try {
    await deployBranch(branch, user.email);
    return Response.json({
      deployed: true,
      branch,
      message: `Branch ${branch} merged to main. Production rebuild in progress.`,
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("Deploy failed:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
