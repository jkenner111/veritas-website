"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NavItem = {
  title: string;
  href: string;
  children: NavItem[];
};

export function NavigationEditor({ initial }: { initial: NavItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<NavItem[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateItem = (index: number, field: "title" | "href", value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setSaved(false);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: "", href: "", children: [] }]);
    setSaved(false);
  };

  const removeItem = (index: number) => {
    if (!confirm("Remove this navigation item?")) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}
      {saved && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">Saved successfully.</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-10">#</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Href</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(i, "title", e.target.value)}
                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateItem(i, "href", e.target.value)}
                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm font-mono focus:border-gray-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&#8593;</button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&#8595;</button>
                  <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs ml-2">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={addItem}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          + Add Item
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Navigation"}
        </button>
      </div>
    </div>
  );
}
