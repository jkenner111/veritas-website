import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import {
  createPreviewBranch,
  getStatus,
  getVercelPreviewUrl,
} from "@/lib/git";

/**
 * POST /api/admin/preview
 * Creates a branch, commits changes, pushes to GitHub.
 * Returns the branch name for Vercel preview polling.
 */
export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json().catch(() => ({}));

  try {
    const status = await getStatus();

    if (status.clean) {
      return Response.json(
        { error: "No changes to preview. Make edits first." },
        { status: 400 },
      );
    }

    const branch = await createPreviewBranch(
      user.email,
      user.name,
      message || `Edit by ${user.name}`,
    );

    return Response.json({ branch, files: status.files });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("Preview failed:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}

/**
 * GET /api/admin/preview?branch=xxx
 * Returns git status and (if branch is provided) polls Vercel for preview URL.
 * When branch=__check__, just returns the git status without Vercel polling.
 */
export async function GET(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");
  if (!branch) {
    return Response.json({ error: "Missing branch param" }, { status: 400 });
  }

  try {
    const status = await getStatus();

    // If this is just a status check, skip Vercel polling
    if (branch === "__check__") {
      return Response.json({
        currentBranch: status.branch,
        clean: status.clean,
        files: status.files,
        previewUrl: null,
        ready: false,
      });
    }

    // Poll Vercel for a preview URL matching the branch
    const previewUrl = await getVercelPreviewUrl(branch);
    return Response.json({
      branch,
      previewUrl,
      ready: previewUrl !== null,
      currentBranch: status.branch,
      clean: status.clean,
      files: status.files,
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
