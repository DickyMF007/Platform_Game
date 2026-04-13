"use client";

import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type StateDetail = {
  id: string;
  name: string;
  description: string | null;
  commander_in_charge: string | null;
  reset_event: string | null;
  state_age: string | null;
};

type TimelineItem = {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
};

export default function AdminStatePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stateDetail, setStateDetail] = useState<StateDetail | null>(null);
  const [timelineRows, setTimelineRows] = useState<TimelineItem[]>([]);
  const [message, setMessage] = useState("");

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

  async function loadData() {
    if (!supabase || !hasSupabaseEnv) return;

    const [stateResult, timelineResult] = await Promise.all([
      supabase
        .from("states")
        .select(
          "id, name, description, commander_in_charge, reset_event, state_age"
        )
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("state_updates")
        .select("id, title, content, is_published, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (stateResult.error) {
      setMessage(`Failed to load state details: ${stateResult.error.message}`);
      return;
    }

    if (timelineResult.error) {
      setMessage(`Failed to load timeline: ${timelineResult.error.message}`);
      return;
    }

    setStateDetail(stateResult.data ?? null);
    setTimelineRows(timelineResult.data ?? []);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleSaveStateDetail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      commander_in_charge:
        String(formData.get("commanderInCharge") ?? "").trim() || null,
      reset_event: String(formData.get("resetEvent") ?? "").trim() || null,
      state_age: String(formData.get("stateAge") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.name) {
      setMessage("State name is required.");
      return;
    }

    const query = stateDetail
      ? supabase.from("states").update(payload).eq("id", stateDetail.id)
      : supabase.from("states").insert(payload);

    const { error } = await query;
    if (error) {
      setMessage(`Failed to save state details: ${error.message}`);
      return;
    }

    setMessage("State details saved successfully.");
    void loadData();
  }

  async function handleCreateTimeline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const createdAtInput = String(formData.get("createdAt") ?? "").trim();
    const isPublished = formData.get("isPublished") === "on";
    const parsedCreatedAt = createdAtInput ? new Date(createdAtInput) : null;

    if (!title || !content) {
      setMessage("Timeline title and content are required.");
      return;
    }

    if (parsedCreatedAt && Number.isNaN(parsedCreatedAt.getTime())) {
      setMessage("Invalid timeline timestamp format.");
      return;
    }

    const payload: {
      title: string;
      content: string;
      is_published: boolean;
      state_id?: string;
      created_at?: string;
    } = {
      title,
      content,
      is_published: isPublished,
    };

    if (stateDetail?.id) payload.state_id = stateDetail.id;
    if (parsedCreatedAt) payload.created_at = parsedCreatedAt.toISOString();

    const { error } = await supabase.from("state_updates").insert(payload);
    if (error) {
      setMessage(`Failed to save timeline: ${error.message}`);
      return;
    }

    setMessage("Timeline update added successfully.");
    formEl.reset();
    void loadData();
  }

  async function toggleTimelinePublish(row: TimelineItem) {
    if (!supabase || !hasSupabaseEnv) return;

    const { error } = await supabase
      .from("state_updates")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);

    if (error) {
      setMessage(`Failed to update timeline publish status: ${error.message}`);
      return;
    }

    void loadData();
  }

  async function deleteTimeline(id: string) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase.from("state_updates").delete().eq("id", id);

    if (error) {
      setMessage(`Failed to delete timeline: ${error.message}`);
      return;
    }

    void loadData();
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
          <h1 className="mt-2 text-2xl font-bold">Master Data: State</h1>
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

      {message && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-cyan-100">
          {message}
        </article>
      )}

      <form
        onSubmit={handleSaveStateDetail}
        className="ice-panel space-y-4 rounded-3xl p-5"
      >
        <h2 className="text-lg font-semibold text-cyan-100">State Detail</h2>
        <label className="block text-sm">
          State Name
          <input
            name="name"
            defaultValue={stateDetail?.name ?? ""}
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            defaultValue={stateDetail?.description ?? ""}
            rows={3}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            Commander in Charge
            <input
              name="commanderInCharge"
              defaultValue={stateDetail?.commander_in_charge ?? ""}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Reset Event
            <input
              name="resetEvent"
              defaultValue={stateDetail?.reset_event ?? ""}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            State Age
            <input
              name="stateAge"
              defaultValue={stateDetail?.state_age ?? ""}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950"
        >
          Save State Details
        </button>
      </form>

      <form
        onSubmit={handleCreateTimeline}
        className="ice-panel space-y-4 rounded-3xl p-5"
      >
        <h2 className="text-lg font-semibold text-cyan-100">Timeline Update</h2>
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
            rows={3}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Timestamp (backdate)
            <input
              name="createdAt"
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked />
            Publish now
          </label>
        </div>
        <button
          type="submit"
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950"
        >
          Save Timeline
        </button>
      </form>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timelineRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">
                  {new Date(row.created_at).toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2">
                  {row.is_published ? "Published" : "Draft"}
                </td>
                <td className="flex gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleTimelinePublish(row)}
                    className="rounded-lg border border-cyan-300/40 px-2 py-1 text-xs text-cyan-300"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTimeline(row.id)}
                    className="rounded-lg border border-rose-300/50 px-2 py-1 text-xs text-rose-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {timelineRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-300">
                  No timeline updates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
