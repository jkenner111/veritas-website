"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "owner" | "editor";

export function UserManagement({ email, role }: { email?: string; role?: UserRole }) {
  const router = useRouter();

  // Delete mode (when email is provided)
  if (email) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
      if (!confirm(`Remove ${email} from admin users?`)) return;
      setDeleting(true);
      try {
        const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
        router.refresh();
      } catch {
        alert("Failed to remove user");
      } finally {
        setDeleting(false);
      }
    };

    return (
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
      >
        {deleting ? "Removing..." : "Remove"}
      </button>
    );
  }

  // Add mode (no email = the "Add User" form)
  return <AddUserForm />;
}

function AddUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add user");
      }
      setName("");
      setEmail("");
      setRole("editor");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium">Add User</h2>
      <p className="mt-1 text-sm text-gray-500 mb-4">Add a new admin user.</p>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-44 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          >
            <option value="editor">editor</option>
            <option value="owner">owner</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
}
