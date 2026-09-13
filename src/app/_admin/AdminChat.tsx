"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState, useEffect, useCallback } from "react";

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx";

// Marks that a deploy/revert rebuild is in flight, so the lock survives a page
// reload until the fresh container (different bootId) is live.
const DEPLOY_MARKER_KEY = "veritas-deploy-in-progress";
const DEPLOY_STALL_MS = 6 * 60 * 1000; // give up waiting on the rebuild after 6 min

type PendingFile = { id: string; file: File };
type UploadResult = {
  accepted: Array<{ originalName: string; storedName: string; path: string; size: number; type: string }>;
  rejected: Array<{ name: string; reason: string }>;
};

type ChangeState =
  | "idle"
  | "has-changes"
  | "previewing"
  | "preview-ready"
  | "deploying"
  | "deployed"
  | "discarding"
  | "reverting"
  | "reverted"
  | "error";

interface AdminChatProps {
  userName?: string;
}

export function AdminChat({ userName = "there" }: AdminChatProps) {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/admin/chat" }),
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [changeState, setChangeState] = useState<ChangeState>("idle");
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [branch, setBranch] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState("");
  // True once a rebuild has been waited on past DEPLOY_STALL_MS without the
  // container swapping — lifts the lock so the user isn't stranded.
  const [deployStalled, setDeployStalled] = useState(false);

  // Boot id of the container at the moment a deploy/revert was triggered, used
  // to auto-reload once the rebuild swaps in a fresh container.
  const deployBootIdRef = useRef<string | null>(null);
  const snapshotBootId = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/deploy", { cache: "no-store" });
      deployBootIdRef.current = res.ok ? (await res.json()).bootId ?? null : null;
    } catch {
      deployBootIdRef.current = null;
    }
  }, []);

  // Persist a deploy-in-progress marker so a page reload mid-rebuild re-asserts
  // the lock instead of dropping the user onto a clean, editable page while the
  // production container is still rebuilding.
  const markDeploying = useCallback(() => {
    try {
      sessionStorage.setItem(
        DEPLOY_MARKER_KEY,
        JSON.stringify({ bootId: deployBootIdRef.current, startedAt: Date.now() }),
      );
    } catch {
      // sessionStorage unavailable; lock just won't survive a reload
    }
  }, []);
  const clearDeployMarker = useCallback(() => {
    try {
      sessionStorage.removeItem(DEPLOY_MARKER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/preview?branch=__check__");
      if (!res.ok) return;
      const data = await res.json();
      const files: string[] = data.files ?? [];
      setChangedFiles(files);

      // Resume an undeployed preview after a page reload. The chat/preview UI
      // state is client-only, but if HEAD is parked on an edit/* branch the
      // change was committed (working tree clean) and is neither deployed nor
      // discarded - restore the card so Discard/Deploy + the preview link return.
      const resumeBranch = data.currentBranch as string | undefined;
      if (resumeBranch && resumeBranch.startsWith("edit/")) {
        setBranch((prev) => prev ?? resumeBranch);
        setChangeState((prev) =>
          prev === "idle" || prev === "has-changes" ? "preview-ready" : prev,
        );
        setPreviewUrl((prev) => {
          if (!prev) {
            fetch(`/api/admin/preview?branch=${encodeURIComponent(resumeBranch)}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => { if (d && d.previewUrl) setPreviewUrl(d.previewUrl); })
              .catch(() => {});
          }
          return prev;
        });
        return;
      }
      setChangeState((prev) => {
        if (
          prev === "previewing" ||
          prev === "preview-ready" ||
          prev === "deploying" ||
          prev === "deployed" ||
          prev === "discarding" ||
          prev === "reverting" ||
          prev === "reverted" ||
          prev === "error"
        ) {
          return prev;
        }
        return files.length === 0 ? "idle" : "has-changes";
      });
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== "ready" && status === "ready") {
      checkStatus();
    }
    prevStatusRef.current = status;
  }, [status, checkStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // After a deploy or revert, the production container rebuilds (~2-3 min) and
  // is force-recreated. Poll for a new boot id and reload once it appears, so
  // the admin always lands on the freshly built, clean state — and can't race
  // the in-flight rebuild with a second edit. If the rebuild never completes
  // (build error, webhook down), bail out after DEPLOY_STALL_MS so the user
  // isn't stranded on a permanent spinner with the chat locked.
  useEffect(() => {
    if (changeState !== "deployed" && changeState !== "reverted") return;
    const before = deployBootIdRef.current;
    let startedAt = Date.now();
    try {
      const marker = JSON.parse(sessionStorage.getItem(DEPLOY_MARKER_KEY) || "null");
      if (marker?.startedAt) startedAt = marker.startedAt;
    } catch {
      // ignore
    }
    let active = true;
    const interval = setInterval(async () => {
      if (Date.now() - startedAt > DEPLOY_STALL_MS) {
        clearInterval(interval);
        clearDeployMarker();
        if (active) setDeployStalled(true);
        return;
      }
      try {
        const res = await fetch("/api/admin/deploy", { cache: "no-store" });
        if (!res.ok) return;
        const { bootId } = await res.json();
        if (active && bootId && bootId !== before) {
          clearInterval(interval);
          clearDeployMarker();
          window.location.reload();
        }
      } catch {
        // container is mid-swap; keep polling
      }
    }, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [changeState, clearDeployMarker]);

  // On (re)mount, if a deploy was in flight when the page reloaded, re-assert
  // the lock until the fresh container is live — unless the rebuild already
  // finished (bootId changed) or the marker is too old, in which case clear it.
  useEffect(() => {
    let marker: { bootId: string | null; startedAt: number } | null = null;
    try {
      marker = JSON.parse(sessionStorage.getItem(DEPLOY_MARKER_KEY) || "null");
    } catch {
      marker = null;
    }
    if (!marker) return;
    if (Date.now() - marker.startedAt > DEPLOY_STALL_MS) {
      clearDeployMarker();
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/admin/deploy", { cache: "no-store" });
        const bootId = res.ok ? (await res.json()).bootId : null;
        // Different (or unknown) bootId => the rebuild already swapped the
        // container; nothing to lock. Same bootId => still rebuilding, re-lock.
        if (!bootId || bootId !== marker.bootId) {
          clearDeployMarker();
          return;
        }
        deployBootIdRef.current = marker.bootId;
        setChangeState("deployed");
      } catch {
        clearDeployMarker();
      }
    })();
  }, [clearDeployMarker]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const extras = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
    }));
    setPending((prev) => [...prev, ...extras].slice(0, 10));
  };

  const removePending = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadPending = async (): Promise<UploadResult["accepted"]> => {
    if (pending.length === 0) return [];
    const form = new FormData();
    for (const p of pending) form.append("files", p.file, p.file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return (await res.json() as UploadResult).accepted;
  };

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && pending.length === 0) return;

    let suffix = "";
    if (pending.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      try {
        const uploaded = await uploadPending();
        if (uploaded.length > 0) {
          const names = uploaded.map((u) => `${u.originalName} (${u.path})`).join(", ");
          suffix = `\n\n[Attached files: ${names}]`;
        }
        setPending([]);
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Upload failed. Try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const payload = (trimmed + suffix).trim();
    sendMessage({ text: payload || "(attachments only)" });
    setInput("");
  };

  const handlePreview = async () => {
    setChangeState("previewing");
    setChangeError(null);
    setPreviewUrl(null);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMessage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setBranch(data.branch);

      const startTime = Date.now();
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(
            `/api/admin/preview?branch=${encodeURIComponent(data.branch)}`,
          );
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.ready && pollData.previewUrl) {
              setPreviewUrl(pollData.previewUrl);
              setChangeState("preview-ready");
              clearInterval(pollInterval);
              return;
            }
          }
          if (Date.now() - startTime > 180_000) {
            clearInterval(pollInterval);
            setChangeError(
              "Preview is taking longer than expected. Your changes were pushed — check the Vercel dashboard, or try again.",
            );
            setChangeState("error");
          }
        } catch {
          // keep polling
        }
      }, 5000);
    } catch (e) {
      setChangeError(e instanceof Error ? e.message : "Preview failed");
      setChangeState("error");
    }
  };

  const handleDeploy = async () => {
    if (!branch) return;
    setDeployStalled(false);
    setChangeState("deploying");
    setChangeError(null);
    await snapshotBootId();
    try {
      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      markDeploying();
      setChangeState("deployed");
    } catch (e) {
      setChangeError(e instanceof Error ? e.message : "Deploy failed");
      setChangeState("error");
    }
  };

  const handleRevert = async () => {
    setDeployStalled(false);
    setChangeState("reverting");
    setChangeError(null);
    await snapshotBootId();
    try {
      const res = await fetch("/api/admin/revert", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revert failed");
      markDeploying();
      setChangeState("reverted");
    } catch (e) {
      setChangeError(e instanceof Error ? e.message : "Revert failed");
      setChangeState("error");
    }
  };

  const handleDiscard = async () => {
    setChangeState("discarding");
    setChangeError(null);
    try {
      const res = await fetch("/api/admin/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discard failed");
      resetChangeFlow();
    } catch (e) {
      setChangeError(e instanceof Error ? e.message : "Discard failed");
      setChangeState("error");
    }
  };

  const resetChangeFlow = () => {
    clearDeployMarker();
    setDeployStalled(false);
    setChangeState("idle");
    setBranch(null);
    setPreviewUrl(null);
    setChangedFiles([]);
    setCommitMessage("");
    setTimeout(checkStatus, 500);
  };

  const handleErrorDismiss = () => {
    setChangeError(null);
    setChangeState(changedFiles.length > 0 ? "has-changes" : "idle");
  };

  const openPicker = () => fileInputRef.current?.click();

  // While a deploy/revert rebuild is in flight the chat is locked: starting a
  // new edit now would race the rebuild (the deploy script hard-resets the
  // shared working tree and force-recreates this container mid-request). Once
  // the rebuild is declared stalled we lift the lock so the user can recover.
  const deployLocked =
    !deployStalled &&
    (changeState === "deploying" ||
      changeState === "deployed" ||
      changeState === "reverting" ||
      changeState === "reverted");

  const canSend =
    (status === "ready" || status === "error") &&
    !isUploading &&
    !deployLocked &&
    (input.trim().length > 0 || pending.length > 0);

  const hasMessages = messages.length > 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Hi {userName}, welcome to the Veritas Admin Portal
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Describe a change to the website in plain English. For example: &ldquo;Add a board
          meeting on June 15th at 7pm,&rdquo; &ldquo;Update the home page to mention the new park
          project,&rdquo; or &ldquo;Add this photo to the gallery.&rdquo;
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">How it works</h2>
          <ol className="space-y-1.5 text-sm text-blue-900">
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Describe the change you want in the chat box below.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>The AI makes the change and lists the affected files under &ldquo;Your changes.&rdquo;</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Click <strong>Preview changes</strong> and open the preview link to make sure it looks right.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>If you&rsquo;re satisfied, click <strong>Deploy to live site</strong>.</span>
            </li>
          </ol>
        </div>
      </section>

      <section>
        {uploadError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 ring-1 ring-red-200 mb-2">
            {uploadError}
          </div>
        )}
        {pending.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pending.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
                <span className="max-w-[200px] truncate">{p.file.name}</span>
                <span className="text-gray-400">({Math.round(p.file.size / 1024)} KB)</span>
                <button type="button" onClick={() => removePending(p.id)} className="ml-1 text-gray-400 hover:text-gray-700" aria-label={`Remove ${p.file.name}`}>x</button>
              </span>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="flex flex-col rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 overflow-hidden"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) submit(input);
              }
            }}
            placeholder={
              deployLocked
                ? "Locked while the live site rebuilds — this page will refresh automatically..."
                : "Describe what you want to change on the website..."
            }
            disabled={(status !== "ready" && status !== "error") || deployLocked}
            rows={5}
            className="flex-1 px-4 py-3 text-base bg-transparent outline-none placeholder:text-gray-400 disabled:bg-transparent resize-none border-b border-gray-200"
          />
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              title="Attach a file"
              onClick={openPicker}
              disabled={deployLocked}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperclipIcon />
              <span>Attach</span>
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white disabled:bg-gray-300 shrink-0"
            >
              Send
            </button>
          </div>
        </form>
        {(status === "submitted" || status === "streaming" || isUploading) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />
            {isUploading ? "Uploading attachments..." : status === "submitted" ? "Thinking..." : "Answering..."}
            {status === "streaming" && (
              <button type="button" onClick={() => stop()} className="underline hover:text-gray-700">
                Stop
              </button>
            )}
          </div>
        )}
      </section>

      {hasMessages && (
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </section>
      )}

      <ChangesCard
        state={changeState}
        stalled={deployStalled}
        files={changedFiles}
        previewUrl={previewUrl}
        error={changeError}
        commitMessage={commitMessage}
        setCommitMessage={setCommitMessage}
        onPreview={handlePreview}
        onDeploy={handleDeploy}
        onDiscard={handleDiscard}
        onRevert={handleRevert}
        onDismissDeploy={resetChangeFlow}
        onErrorDismiss={handleErrorDismiss}
      />
    </div>
  );
}

interface ChangesCardProps {
  state: ChangeState;
  stalled: boolean;
  files: string[];
  previewUrl: string | null;
  error: string | null;
  commitMessage: string;
  setCommitMessage: (s: string) => void;
  onPreview: () => void;
  onDeploy: () => void;
  onDiscard: () => void;
  onRevert: () => void;
  onDismissDeploy: () => void;
  onErrorDismiss: () => void;
}

function ChangesCard({
  state,
  stalled,
  files,
  previewUrl,
  error,
  commitMessage,
  setCommitMessage,
  onPreview,
  onDeploy,
  onDiscard,
  onRevert,
  onDismissDeploy,
  onErrorDismiss,
}: ChangesCardProps) {
  const isBusy = state === "previewing" || state === "deploying" || state === "discarding" || state === "reverting";
  const canPreview = !isBusy && files.length > 0 && state !== "deployed";
  const canDeploy = state === "preview-ready";
  const canDiscard = !isBusy && state !== "idle" && state !== "deployed" && state !== "reverted";

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-3">Your changes</h2>

      {state === "idle" && files.length === 0 && (
        <p className="text-sm text-gray-500 mb-4">
          No pending changes yet. Describe a change in the chat box above to get started.
        </p>
      )}

      {files.length > 0 && state !== "deployed" && state !== "reverted" && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            {files.length} file{files.length !== 1 ? "s" : ""} pending
          </p>
          <ul className="text-sm text-gray-700 font-mono space-y-0.5 max-h-32 overflow-y-auto">
            {files.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {(state === "has-changes" || (state === "error" && files.length > 0)) && (
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Optional: short description of these changes"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:border-gray-500 focus:outline-none"
        />
      )}

      {state === "previewing" && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 mb-3 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm text-blue-900">
            Building preview... (this takes 30&ndash;60 seconds)
          </span>
        </div>
      )}

      {state === "preview-ready" && previewUrl && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 mb-3">
          <p className="text-sm font-medium text-green-900 mb-1">Preview ready</p>
          <p className="text-xs text-green-800 mb-2">
            Open the link below to review your changes on a test version of the site before going live.
          </p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-700 hover:text-green-900 underline font-mono break-all"
          >
            {previewUrl}
          </a>
          <p className="text-xs text-gray-600 mt-3">
            If everything looks right, click <strong>Deploy to live site</strong>. If not, click <strong>Discard</strong> and try again.
          </p>
        </div>
      )}

      {state === "deploying" && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 mb-3 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <span className="text-sm text-blue-900">Deploying to the live site...</span>
        </div>
      )}

      {state === "deployed" && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 mb-3">
          <p className="text-sm font-semibold text-green-900 mb-1">Deployed!</p>
          <p className="text-sm text-green-800 mb-2">
            Your changes have been published. The live site is rebuilding now.
          </p>
          {stalled ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 mb-3">
              The rebuild is taking longer than usual. Your change may already be
              live &mdash; reload to check. The chat is unlocked so you can keep
              working in the meantime.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-800 mb-3">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              <span>
                Rebuilding the live site (~2&ndash;3 minutes). This page refreshes
                automatically once it&rsquo;s live.
              </span>
            </div>
          )}
          <p className="text-xs text-gray-600">
            Notice a problem with what you just deployed?{" "}
            <button
              onClick={onRevert}
              className="text-red-700 underline hover:text-red-900"
            >
              Revert last deploy
            </button>
          </p>
        </div>
      )}

      {state === "reverting" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-3 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <span className="text-sm text-amber-900">Reverting last deploy and triggering rebuild...</span>
        </div>
      )}

      {state === "reverted" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-3">
          <p className="text-sm font-semibold text-amber-900 mb-1">Reverted</p>
          <p className="text-sm text-amber-900 mb-2">
            The previous change has been undone on main. The live site is rebuilding now.
          </p>
          {stalled ? (
            <div className="rounded-md bg-white border border-amber-300 px-3 py-2 text-xs text-amber-900">
              The rebuild is taking longer than usual. The revert may already be
              live &mdash; reload to check. The chat is unlocked so you can keep
              working in the meantime.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span>
                Rebuilding the live site (~2&ndash;3 minutes). This page refreshes
                automatically once it&rsquo;s live.
              </span>
            </div>
          )}
        </div>
      )}

      {state === "discarding" && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-3 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          <span className="text-sm text-gray-700">Discarding changes...</span>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-3">
          <p className="text-sm font-medium text-red-900 mb-1">Something went wrong</p>
          <p className="text-sm text-red-800 mb-2 break-words">{error}</p>
          <button
            onClick={onErrorDismiss}
            className="text-xs text-red-700 underline hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action buttons — always visible, enabled/disabled based on state */}
      {state === "deployed" || state === "reverted" ? (
        <p className="text-center text-xs text-gray-500">
          {stalled ? "Rebuild is taking a while." : "Waiting for the rebuild to finish…"}{" "}
          <button
            onClick={() => window.location.reload()}
            className="underline hover:text-gray-700"
          >
            Reload now
          </button>
          {stalled && (
            <>
              {" · "}
              <button
                onClick={onDismissDeploy}
                className="underline hover:text-gray-700"
              >
                Dismiss
              </button>
            </>
          )}
        </p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            disabled={!canDiscard}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onPreview}
            disabled={!canPreview}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {state === "previewing" ? "Building preview..." : "Preview changes"}
          </button>
          <button
            onClick={onDeploy}
            disabled={!canDeploy}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {state === "deploying" ? "Deploying..." : "Deploy to live site"}
          </button>
        </div>
      )}
    </section>
  );
}

function PaperclipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.98 8.86l-8.21 8.21a2 2 0 0 1-2.83-2.83l7.07-7.07" />
    </svg>
  );
}

type ChatMessage = ReturnType<typeof useChat>["messages"][number];

const TOOL_LABELS: Record<string, string> = {
  list_pages: "Looked up pages",
  list_posts: "Looked up blog posts",
  list_navigation: "Looked up navigation",
  read_file: "Read a file",
  create_page: "Created a page",
  create_post: "Created a blog post",
  update_page: "Updated a page",
  update_post: "Updated a blog post",
  delete_page: "Deleted a page",
  delete_post: "Deleted a blog post",
  update_navigation: "Updated navigation",
  attach_image: "Attached an image",
  delete_image: "Deleted an image",
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-xl bg-gray-900 px-4 py-2 text-sm text-white"
            : "max-w-[85%] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900"
        }
      >
        {message.parts.map((part, idx) => {
          if (part.type === "text") {
            return (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {part.text}
              </div>
            );
          }
          if (part.type?.startsWith("tool-")) {
            const toolName = part.type.replace(/^tool-/, "");
            const label = TOOL_LABELS[toolName] ?? toolName;
            // A tool part is a discriminated union on `state`. The pill must
            // reflect the real outcome: tools return { error } objects on
            // failure (state "output-available" with output.error) and the SDK
            // marks thrown/cut calls "output-error". Showing a success arrow for
            // those would tell the user a change was made when nothing was
            // written — the exact trap that hid the original create_event bug.
            const p = part as {
              state?: string;
              errorText?: string;
              output?: unknown;
            };
            if (p.state === "input-streaming" || p.state === "input-available") {
              return (
                <div key={idx} className="text-xs text-gray-400 italic mt-1">
                  &hellip; {label}
                </div>
              );
            }
            const outputError =
              p.output &&
              typeof p.output === "object" &&
              "error" in p.output
                ? String((p.output as { error: unknown }).error)
                : null;
            const failure =
              p.state === "output-error"
                ? p.errorText || "the action did not complete"
                : outputError;
            if (failure) {
              return (
                <div key={idx} className="text-xs text-red-600 italic mt-1">
                  &#9888; {label} failed: {failure}
                </div>
              );
            }
            return (
              <div key={idx} className="text-xs text-gray-500 italic mt-1">
                &rarr; {label}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
