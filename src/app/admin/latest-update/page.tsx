"use client";

import {
  ADMIN_SESSION_KEY,
} from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UpdateItem = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export default function AdminLatestUpdatePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [rows, setRows] = useState<UpdateItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      const isAuthed = session === "ok";
      setIsAuthenticated(isAuthed);
      setIsReady(true);
      if (!isAuthed) {
        router.replace("/admin");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  async function loadUpdates() {
    if (!supabase || !hasSupabaseEnv) return;

    const { data, error } = await supabase
      .from("state_updates")
      .select("id, title, content, image_url, is_published, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Failed to load data: ${error.message}`);
      return;
    }

    const sortedRows = (data ?? []).sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });

    setRows(sortedRows);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      void loadUpdates();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;
    const formEl = event.currentTarget;

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const createdAtInput = String(formData.get("createdAt") ?? "").trim();
    const isPublished = formData.get("isPublished") === "on";
    const parsedCreatedAt = createdAtInput ? new Date(createdAtInput) : null;

    if (!title || !content) {
      setMessage("Title and content are required.");
      return;
    }

    if (parsedCreatedAt && Number.isNaN(parsedCreatedAt.getTime())) {
      setMessage("Invalid timestamp format.");
      return;
    }

    setLoading(true);
    const payload: {
      title: string;
      content: string;
      image_url: string | null;
      is_published: boolean;
      created_at?: string;
    } = {
      title,
      content,
      image_url: imageUrl || null,
      is_published: isPublished,
    };

    if (parsedCreatedAt) {
      payload.created_at = parsedCreatedAt.toISOString();
    }

    const { error } = await supabase.from("state_updates").insert(payload);

    setLoading(false);

    if (error) {
      setMessage(`Failed to save update: ${error.message}`);
      return;
    }

    setMessage("Update added successfully.");
    formEl.reset();
    void loadUpdates();
  }

  async function togglePublish(row: UpdateItem) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase
      .from("state_updates")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);

    if (error) {
      setMessage(`Failed to update publish status: ${error.message}`);
      return;
    }

    void loadUpdates();
  }

  async function handleDelete(id: string) {
    if (!supabase || !hasSupabaseEnv) return;

    const { error } = await supabase.from("state_updates").delete().eq("id", id);
    if (error) {
      setMessage(`Failed to delete data: ${error.message}`);
      return;
    }

    void loadUpdates();
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  }

  if (!isReady) {
    return (
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="ice-panel rounded-3xl p-5">
          <p className="text-sm text-slate-300">Loading admin session...</p>
        </header>
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="ice-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-cyan-200/80">
            ADMIN SECTION
          </p>
          <h1 className="mt-2 text-2xl font-bold">Master Data: Latest Update</h1>
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

      {!hasSupabaseEnv && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-amber-200">
          Supabase env is not configured.
        </article>
      )}

      <form onSubmit={handleCreate} className="ice-panel space-y-4 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Add New Update</h2>
        <label className="block text-sm">
          Title
          <input
            name="title"
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Content
          <textarea
            name="content"
            required
            rows={4}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label
          className="block text-sm cursor-pointer"
          onClick={e => {
            // If clicking the label and an input exists inside, focus/select the input
            const input = (e.currentTarget.querySelector('input') as HTMLInputElement | null);
            if (input) {
              input.showPicker?.(); // for browsers supporting showPicker
              input.focus();
              // Fallback: open the default picker by triggering a click if showPicker is not supported
              if (!input.showPicker) input.click();
            }
          }}
        >
          Timestamp
          <input
            name="createdAt"
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2 cursor-pointer"
            onFocus={e => {
              // Some UX: try to open picker immediately on focus (Chrome supports showPicker)
              e.currentTarget.showPicker?.();
            }}
          />
        </label>
        {/* <label className="block text-sm">
          Image URL (optional)
          <input
            name="imageUrl"
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label> */}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked />
            Publish now
        </label>
        <button
          type="submit"
          disabled={loading}
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Update"}
        </button>
        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </form>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Content</th>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">{row.content}</td>
                <td className="px-3 py-2">
                  {new Date(row.created_at).toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2">
                  {row.is_published ? "Published" : "Draft"}
                </td>
                <td className="flex gap-2 px-3 py-2">
                  {row.is_published ? (
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className="rounded-lg border border-yellow-300/70 bg-yellow-500/15 px-2 py-1 text-xs text-yellow-300"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className="rounded-lg border border-cyan-300/40 px-2 py-1 text-xs text-cyan-300"
                    >
                      Publish
                    </button>
                  )}
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
                <td colSpan={5} className="px-3 py-4 text-center text-slate-300">
                  No updates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
