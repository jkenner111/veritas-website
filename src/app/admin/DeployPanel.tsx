"use client";

import { useState, useEffect, useCallback } from "react";

type DeployState =
  | "idle"
  | "has-changes"
  | "previewing"
  | "preview-ready"
  | "deploying"
  | "deployed"
  | "discarding"
  | "error";

export function DeployPanel() {
  const [state, setState] = useState<DeployState>("idle");
  const [branch, setBranch] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [polling, setPolling] = useState(false);

  // Check git status on mount and periodically
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/preview?branch=__check__");
      if (res.ok) {
        const data = await res.json();
        setChangedFiles(data.files ?? []);
        if (!data.clean && state === "idle") {
          setState("has-changes");
        }
      }
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Poll Vercel for preview URL
  useEffect(() => {
    if (!polling || !branch) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/admin/preview?branch=${encodeURIComponent(branch)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.ready && data.previewUrl) {
            setPreviewUrl(data.previewUrl);
            setState("preview-ready");
            setPolling(false);
          }
        }
      } catch {
        // keep polling
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [polling, branch]);

  const handlePreview = async () => {
    setState("previewing");
    setError(null);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setBranch(data.branch);
      setChangedFiles(data.files ?? []);
      setPolling(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setState("error");
    }
  };

  const handleDeploy = async () => {
    if (!branch) return;
    setState("deploying");
    setError(null);
    try {
      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      setState("deployed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed");
      setState("error");
    }
  };

  const handleDiscard = async () => {
    setState("discarding");
    setError(null);
    try {
      const res = await fetch("/api/admin/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discard failed");
      setState("idle");
      setBranch(null);
      setPreviewUrl(null);
      setChangedFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discard failed");
      setState("error");
    }
  };

  // Don't render if idle and no changes
  if (state === "idle" && changedFiles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-6 py-3">
        {state === "idle" || state === "has-changes" ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-amber-700">
                {changedFiles.length} unsaved change{changedFiles.length !== 1 ? "s" : ""}
              </span>
              {changedFiles.length > 0 && (
                <details className="inline-block ml-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    show files
                  </summary>
                  <ul className="mt-1 text-xs text-gray-500 font-mono max-h-32 overflow-y-auto">
                    {changedFiles.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Commit message (optional)"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-64 focus:border-gray-500 focus:outline-none"
              />
              <button
                onClick={handleDiscard}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handlePreview}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Preview Changes
              </button>
            </div>
          </div>
        ) : state === "previewing" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-blue-700">
                Pushing to GitHub and building Vercel preview...
              </span>
            </div>
            <span className="text-xs text-gray-400 font-mono">{branch}</span>
          </div>
        ) : state === "preview-ready" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-green-700">
                Preview ready
              </span>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-mono"
                >
                  {previewUrl}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleDeploy}
                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Deploy to Production
              </button>
            </div>
          </div>
        ) : state === "deploying" ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            <span className="text-sm text-green-700">
              Deploying to production... merging to main and triggering rebuild.
            </span>
          </div>
        ) : state === "deployed" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-700">
                ✓ Deployed! Production rebuild in progress (takes ~2-3 minutes).
              </span>
              <a
                href="https://veritasconsultingpartnersllc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View live site →
              </a>
            </div>
            <button
              onClick={() => {
                setState("idle");
                setBranch(null);
                setPreviewUrl(null);
                setChangedFiles([]);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        ) : state === "discarding" ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            <span className="text-sm text-gray-600">Discarding changes...</span>
          </div>
        ) : state === "error" ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => setState("has-changes")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
