import { simpleGit, SimpleGit } from "simple-git";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.env.REPO_ROOT ?? process.cwd();
const GITHUB_PAT = process.env.GITHUB_PAT ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "jkenner111/veritas-website";
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? "http://host.docker.internal:9877/deploy";
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET ?? "";

// Security: Only show board members files they should see (content, not source code)
const BOARD_VISIBLE_PATTERNS = [
  /^content\//,
  /^data\/users\.json$/,
  /^public\/images\//,
];

function isBoardVisible(filePath: string): boolean {
  return BOARD_VISIBLE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function getGit(): SimpleGit {
  return simpleGit(REPO_ROOT);
}

const INDEX_LOCK = path.join(REPO_ROOT, ".git", "index.lock");

// If a git process was killed mid-operation — e.g. the container was
// force-recreated during a deploy — a stale index.lock can be left behind and
// block every future write ("Unable to create '.git/index.lock': File exists").
// withGitLock guarantees no in-process git command is running when this is
// called, so a lock older than 30s (far longer than any real op, including the
// host's `git reset` during a deploy) is safe to remove.
function clearStaleIndexLock(): void {
  try {
    const st = fs.statSync(INDEX_LOCK);
    if (Date.now() - st.mtimeMs > 30_000) {
      fs.rmSync(INDEX_LOCK, { force: true });
    }
  } catch {
    // no lock present
  }
}

// Serialize every git operation in this process. simple-git only serializes
// commands issued through a single instance, but each admin request calls
// getGit() for a fresh instance — so the 10s status poller and a Preview/Deploy
// write would otherwise run as concurrent git subprocesses and collide on
// .git/index.lock. This promise-chain mutex makes them run one at a time.
let gitChain: Promise<unknown> = Promise.resolve();
function withGitLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = gitChain.then(() => {
    clearStaleIndexLock();
    return fn();
  });
  // Keep the chain alive regardless of success/failure so one error doesn't
  // wedge every later operation.
  gitChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function githubUrl(): string {
  if (!GITHUB_PAT) throw new Error("GITHUB_PAT not set");
  return `https://x-access-token:${GITHUB_PAT}@github.com/${GITHUB_REPO}.git`;
}

/**
 * Ensure the 'github' remote points to the PAT-authenticated URL.
 * This is needed because the repo's .git/config may have the plain HTTPS URL
 * which won't work for push/pull from inside the container.
 */
async function ensureGithubRemote(git: SimpleGit): Promise<void> {
  const url = githubUrl();
  const remotes = await git.getRemotes();
  const hasGithub = remotes.some((r) => r.name === "github");
  if (hasGithub) {
    await git.remote(["set-url", "github", url]);
  } else {
    await git.addRemote("github", url);
  }
}

export type BranchStatus = {
  branch: string;
  clean: boolean;
  files: string[];
};

/**
 * Get the current git status — which board-visible files differ from HEAD.
 * Includes untracked files (simple-git puts them in not_added, not created).
 */
export async function getStatus(): Promise<BranchStatus> {
  return withGitLock(async () => {
    const git = getGit();
    const status = await git.status();
    const allFiles = [
      ...status.modified,
      ...status.created,
      ...status.not_added,
      ...status.deleted,
      ...status.renamed.map((r) => r.to),
    ];

    const visibleFiles = allFiles.filter(isBoardVisible);

    return {
      branch: status.current ?? "main",
      clean: visibleFiles.length === 0,
      files: visibleFiles,
    };
  });
}

/**
 * Create a branch for preview, commit all changes, and push to GitHub.
 * Returns the branch name.
 */
export async function createPreviewBranch(
  authorEmail: string,
  authorName: string,
  message: string,
): Promise<string> {
 return withGitLock(async () => {
  const git = getGit();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const userSlug = authorEmail.split("@")[0].replace(/[^a-z0-9]/gi, "");
  const branchName = `edit/${userSlug}/${timestamp}`;

  // Ensure github remote has PAT auth
  await ensureGithubRemote(git);

  // Make sure we're on main and up to date
  await git.checkout("main");
  await git.pull("github", "main");

  // Create and checkout the new branch
  await git.checkoutLocalBranch(branchName);

  // SAFETY: stage only the paths board members are allowed to touch.
  // Doing this instead of `git add -A` prevents accidentally committing
  // deletions of tracked-but-not-mounted-into-container files like
  // .gitignore / .dockerignore / README.md. Filter to existing paths
  // because `git add` fails the whole operation if any pathspec misses.
  // -A so we stage deletions (delete_event/delete_page/delete_image) in
  // addition to additions and modifications, scoped to these paths only.
  const candidates = ["content/", "data/users.json", "public/images/"];
  const existing = candidates.filter((p) =>
    fs.existsSync(path.join(REPO_ROOT, p)),
  );
  if (existing.length > 0) {
    await git.add(["-A", ...existing]);
  }

  // Check if anything was actually staged (diff --cached lists staged paths only)
  const stagedDiff = await git.raw(["diff", "--cached", "--name-only"]);
  if (stagedDiff.trim().length > 0) {
    await git.commit(message || `Edit by ${authorName}`, {
      "--author": `${authorName} <${authorEmail}>`,
    });
  }

  // Push to GitHub
  await git.push(["-u", "github", branchName]);

  return branchName;
 });
}

/**
 * Poll Vercel Deployments API for a preview URL matching the given branch.
 * Returns the deployment URL or null if not ready yet.
 */
export async function getVercelPreviewUrl(
  branch: string,
): Promise<string | null> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;

  const params = new URLSearchParams({
    projectId,
    state: "READY",
    limit: "10",
  });

  const res = await fetch(
    `https://api.vercel.com/v6/deployments?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    deployments?: Array<{
      url: string;
      meta?: { githubCommitRef?: string };
      state: string;
      created: number;
      inspectorUrl?: string;
    }>;
  };

  const match = data.deployments?.find(
    (d) => d.meta?.githubCommitRef === branch && d.state === "READY",
  );

  return match ? `https://${match.url}` : null;
}

/**
 * Trigger the local rebuild orchestrator (veritas-webhook on port 9877).
 * Sends a minimal GitHub-shaped push payload signed with GITHUB_WEBHOOK_SECRET
 * so the existing listener accepts it without any code changes.
 */
async function triggerRebuild(latestSha: string, pusher: string): Promise<void> {
  if (!WEBHOOK_SECRET) {
    throw new Error("GITHUB_WEBHOOK_SECRET is not set in the environment");
  }

  const payload = JSON.stringify({
    ref: "refs/heads/main",
    pusher: { name: pusher },
    commits: [{ id: latestSha, message: "Triggered from admin portal" }],
  });

  const sig =
    "sha256=" +
    crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Hub-Signature-256": sig,
      "X-GitHub-Event": "push",
    },
    body: payload,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Rebuild trigger failed: ${res.status} ${body}`);
  }
}

/**
 * Merge a preview branch to main, push to GitHub, then trigger the local
 * rebuild orchestrator so the production container picks up the change.
 */
export async function deployBranch(branch: string, pusher: string): Promise<void> {
 return withGitLock(async () => {
  const git = getGit();

  await ensureGithubRemote(git);

  await git.checkout("main");
  await git.pull("github", "main");

  await git.merge([branch, "--no-ff", "-m", `Deploy ${branch}`]);

  await git.push(["github", "main"]);

  const sha = (await git.revparse(["HEAD"])).trim();

  try {
    await git.deleteLocalBranch(branch, true);
  } catch {
    // best-effort
  }

  // Remove the now-merged edit branch from GitHub as well, so old preview
  // branches don't pile up on the remote.
  try {
    await git.push(["github", "--delete", branch]);
  } catch {
    // best-effort
  }

  await triggerRebuild(sha, pusher);
 });
}

/**
 * Revert the most recent commit on main and push, then trigger a rebuild.
 * Used by the "Revert last deploy" button.
 */
export async function revertLastDeploy(pusher: string): Promise<string> {
 return withGitLock(async () => {
  const git = getGit();

  await ensureGithubRemote(git);

  await git.checkout("main");
  await git.pull("github", "main");

  // deployBranch merges with --no-ff, so HEAD is a merge commit; reverting a
  // merge requires -m to pick the mainline parent (1 = main before the merge).
  await git.raw(["revert", "-m", "1", "--no-edit", "HEAD"]);

  await git.push(["github", "main"]);

  const sha = (await git.revparse(["HEAD"])).trim();

  await triggerRebuild(sha, pusher);

  return sha;
 });
}

/**
 * Discard a preview branch — revert content changes and delete the branch.
 */
export async function discardBranch(branch: string): Promise<void> {
 return withGitLock(async () => {
  const git = getGit();
  const status = await git.status();

  if (status.current === branch) {
    // We're on the preview branch — switch to main and restore content
    await git.checkout("main");
    await git.checkout(["main", "--", "content/", "public/"]);
  }

  // Delete the branch locally
  try {
    await git.deleteLocalBranch(branch, true);
  } catch {
    // Branch may not exist
  }

  // Delete it on GitHub too, so the Vercel preview is torn down and abandoned
  // edit branches don't accumulate on the remote.
  try {
    await ensureGithubRemote(git);
    await git.push(["github", "--delete", branch]);
  } catch {
    // Remote branch may not exist or already be deleted
  }
 });
}

/**
 * Revert all uncommitted changes in content/ and public/.
 */
export async function revertChanges(): Promise<void> {
 return withGitLock(async () => {
  const git = getGit();
  await git.checkout(["HEAD", "--", "content/", "public/"]);
  // Clean up any untracked files in content/
  try {
    await git.clean("f", ["content/", "public/"]);
  } catch {
    // Clean may fail if there are no untracked files
  }
 });
}
