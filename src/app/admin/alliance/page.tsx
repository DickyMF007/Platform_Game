"use client";

import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AllianceRow = {
  id: string;
  name: string;
  tag: string;
  slogan: string | null;
  description: string | null;
  banner_url: string | null;
};

type AllianceEventRow = {
  id: string;
  title: string;
  subtitle: string | null;
  event_time: string;
  event_timestamp: string;
  is_published: boolean;
};

export default function AdminAlliancePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alliance, setAlliance] = useState<AllianceRow | null>(null);
  const [events, setEvents] = useState<AllianceEventRow[]>([]);
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

  async function loadAlliance() {
    if (!supabase || !hasSupabaseEnv) return;
    const supabaseClient = supabase;

    const [allianceResult, eventsResult] = await Promise.all([
      supabaseClient
        .from("alliances")
        .select("id, name, tag, slogan, description, banner_url")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseClient
        .from("alliance_events")
        .select("id, title, subtitle, event_time, event_timestamp, is_published")
        .order("created_at", { ascending: false }),
    ]);

    if (allianceResult.error) {
      setMessage(`Gagal load alliance: ${allianceResult.error.message}`);
      return;
    }

    if (eventsResult.error) {
      setMessage(`Gagal load alliance events: ${eventsResult.error.message}`);
      return;
    }

    setAlliance(allianceResult.data ?? null);
    setEvents(eventsResult.data ?? []);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      void loadAlliance();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      tag: String(formData.get("tag") ?? "").trim(),
      slogan: String(formData.get("slogan") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      banner_url: String(formData.get("bannerUrl") ?? "").trim() || null,
    };

    if (!payload.name || !payload.tag) {
      setMessage("Nama dan singkatan alliance wajib diisi.");
      return;
    }

    const query = alliance
      ? supabase.from("alliances").update(payload).eq("id", alliance.id)
      : supabase.from("alliances").insert(payload);

    const { error } = await query;
    if (error) {
      setMessage(`Gagal simpan alliance: ${error.message}`);
      return;
    }

    setMessage("Alliance master data berhasil disimpan.");
    void loadAlliance();
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const eventTime = String(formData.get("eventTime") ?? "").trim();
    // fix: correct isPublished logic for checkbox (it is checked when the element is present and checked)
    const isPublished = formData.get("isPublished") !== null;

    if (!title) {
      setMessage("Title event wajib diisi.");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(eventTime)) {
      setMessage("Format waktu harus HH:mm.");
      return;
    }

    const payload: {
      title: string;
      subtitle: string | null;
      event_time: string;
      is_published: boolean;
      alliance_id?: string;
    } = {
      title,
      subtitle: subtitle || null,
      event_time: eventTime,
      is_published: isPublished,
    };

    if (alliance?.id) payload.alliance_id = alliance.id;

    const { error } = await supabase.from("alliance_events").insert(payload);
    if (error) {
      setMessage(`Gagal simpan event: ${error.message}`);
      return;
    }

    setMessage("Event alliance berhasil ditambahkan.");
    formEl.reset();
    void loadAlliance();
  }

  async function toggleEventPublish(row: AllianceEventRow) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase
      .from("alliance_events")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);

    if (error) {
      setMessage(`Gagal update publish event: ${error.message}`);
      return;
    }

    void loadAlliance();
  }

  async function handleDeleteEvent(id: string) {
    if (!supabase || !hasSupabaseEnv) return;
    const { error } = await supabase.from("alliance_events").delete().eq("id", id);
    if (error) {
      setMessage(`Gagal hapus event: ${error.message}`);
      return;
    }

    void loadAlliance();
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
          <h1 className="mt-2 text-2xl font-bold">Master Data: Alliance</h1>
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

      <form onSubmit={handleSave} className="ice-panel space-y-4 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Alliance Detail</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Nama
            <input
              name="name"
              defaultValue={alliance?.name ?? ""}
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Singkatan
            <input
              name="tag"
              defaultValue={alliance?.tag ?? ""}
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Slogan
          <input
            name="slogan"
            defaultValue={alliance?.slogan ?? ""}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={alliance?.description ?? ""}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Banner URL (untuk hero Home)
          <input
            name="bannerUrl"
            defaultValue={alliance?.banner_url ?? ""}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950"
        >
          Simpan Alliance
        </button>
      </form>

      <form
        onSubmit={handleCreateEvent}
        className="ice-panel space-y-4 rounded-3xl p-5"
      >
        <h2 className="text-lg font-semibold text-cyan-100">Alliance Events</h2>
        <label className="block text-sm">
          Title
          <input
            name="title"
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Subtitle
          <input
            name="subtitle"
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Waktu (HH:mm)
            <input
              name="eventTime"
              type="time"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
    
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked />
            Publish sekarang
          </label>
        </div>
        <button
          type="submit"
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950"
        >
          Simpan Event
        </button>
      </form>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Subtitle</th>
              <th className="px-3 py-2">Waktu</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((eventItem) => (
              <tr key={eventItem.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{eventItem.title}</td>
                <td className="px-3 py-2">{eventItem.subtitle ?? "-"}</td>
                <td className="px-3 py-2">{eventItem.event_time}</td>
                <td className="px-3 py-2">
                  {eventItem.is_published ? "Published" : "Draft"}
                </td>
                <td className="flex gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleEventPublish(eventItem)}
                    className="rounded-lg border border-cyan-300/40 px-2 py-1 text-xs text-cyan-300"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(eventItem.id)}
                    className="rounded-lg border border-rose-300/50 px-2 py-1 text-xs text-rose-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-300">
                  Belum ada event alliance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
