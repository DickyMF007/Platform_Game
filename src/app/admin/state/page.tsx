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
      setMessage(`Gagal load state detail: ${stateResult.error.message}`);
      return;
    }

    if (timelineResult.error) {
      setMessage(`Gagal load timeline: ${timelineResult.error.message}`);
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
      setMessage("Nama state wajib diisi.");
      return;
    }

    const query = stateDetail
      ? supabase.from("states").update(payload).eq("id", stateDetail.id)
      : supabase.from("states").insert(payload);

    const { error } = await query;
    if (error) {
      setMessage(`Gagal simpan state detail: ${error.message}`);
      return;
    }

    setMessage("State detail berhasil disimpan.");
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
      setMessage("Title dan content timeline wajib diisi.");
      return;
    }

    if (parsedCreatedAt && Number.isNaN(parsedCreatedAt.getTime())) {
      setMessage("Format timestamp timeline tidak valid.");
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
      setMessage(`Gagal simpan timeline: ${error.message}`);
      return;
    }

    setMessage("Timeline update berhasil ditambahkan.");
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
      setMessage(`Gagal update publish timeline: ${error.message}`);
      return;
    }

    void loadData();
  }

  async function deleteTimeline(id: string) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase.from("state_updates").delete().eq("id", id);

    if (error) {
      setMessage(`Gagal hapus timeline: ${error.message}`);
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
          Nama State
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
            Umur State
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
          Simpan State Detail
        </button>
      </form>
    </section>
  );
}
