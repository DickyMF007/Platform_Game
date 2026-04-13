"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type QuickStatItem = {
  id: string;
  label: string;
  value: string;
  note: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export default function AdminQuickStatsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [rows, setRows] = useState<QuickStatItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      const isAuthed = session === "ok";
      setIsAuthenticated(isAuthed);
      setIsReady(true);
      if (!isAuthed) router.replace("/admin");
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  async function loadQuickStats() {
    if (!supabase || !hasSupabaseEnv) return;

    const { data, error } = await supabase
      .from("quick_stats")
      .select("id, label, value, note, sort_order, is_active, updated_at")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(`Failed to load data: ${error.message}`);
      return;
    }

    setRows(data ?? []);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      void loadQuickStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const label = String(formData.get("label") ?? "").trim();
    const value = String(formData.get("value") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isActive = formData.get("isActive") === "on";

    if (!label || !value) {
      setMessage("Label and Value are required.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("quick_stats").insert({
      label,
      value,
      note: note || null,
      sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
      is_active: isActive,
    });
    setLoading(false);

    if (error) {
      setMessage(`Failed to save quick stats: ${error.message}`);
      return;
    }

    formEl.reset();
    setMessage("Quick stats added successfully.");
    void loadQuickStats();
  }

  async function toggleActive(row: QuickStatItem) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase
      .from("quick_stats")
      .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
      .eq("id", row.id);

    if (error) {
      setMessage(`Failed to update status: ${error.message}`);
      return;
    }

    void loadQuickStats();
  }

  async function handleDelete(id: string) {
    if (!supabase || !hasSupabaseEnv) return;

    const { error } = await supabase.from("quick_stats").delete().eq("id", id);
    if (error) {
      setMessage(`Failed to delete data: ${error.message}`);
      return;
    }

    void loadQuickStats();
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    router.replace("/admin");
  }

  if (!isReady || !isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="ice-panel rounded-3xl p-5">
          <p className="text-sm text-slate-300">Loading admin session...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="ice-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-cyan-200/80">
            ADMIN SECTION
          </p>
          <h1 className="mt-2 text-2xl font-bold">Master Data: Quick Stats</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm"
          >
            Admin Summary
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <form onSubmit={handleCreate} className="ice-panel space-y-4 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Add Quick Stats</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Label
            <input
              name="label"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Value
            <input
              name="value"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Note
          <input
            name="note"
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Sort Order
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Quick Stats"}
        </button>
        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </form>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Note</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2">{row.value}</td>
                <td className="px-3 py-2">{row.note ?? "-"}</td>
                <td className="px-3 py-2">{row.sort_order}</td>
                <td className="px-3 py-2">{row.is_active ? "Active" : "Hidden"}</td>
                <td className="flex gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    className="rounded-lg border border-cyan-300/40 px-2 py-1 text-xs text-cyan-300"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg border border-rose-300/50 px-2 py-1 text-xs text-rose-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-slate-300">
                  No quick stats data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
