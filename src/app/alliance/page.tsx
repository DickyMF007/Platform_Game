"use client";

import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

type AllianceRow = {
  id: string;
  name: string;
  tag: string;
  slogan: string | null;
  description: string | null;
};

type AllianceEventRow = {
  id: string;
  title: string;
  subtitle: string | null;
  event_time: string | null;
  event_timestamp: string;
};

export default function AlliancePage() {
  const [alliance, setAlliance] = useState<AllianceRow | null>(null);
  const [events, setEvents] = useState<AllianceEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAlliance() {
      if (!supabase || !hasSupabaseEnv) {
        setErrorMessage("Supabase is not configured.");
        setLoading(false);
        return;
      }
      const supabaseClient = supabase;

      const [allianceResult, eventResult] = await Promise.all([
        supabaseClient
          .from("alliances")
          .select("id, name, tag, slogan, description")
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabaseClient
          .from("alliance_events")
          .select("id, title, subtitle, event_time, event_timestamp")
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
      ]);

      if (allianceResult.error) {
        setErrorMessage(allianceResult.error.message);
        setLoading(false);
        return;
      }

      if (eventResult.error) {
        setErrorMessage(eventResult.error.message);
        setLoading(false);
        return;
      }

      setAlliance(allianceResult.data ?? null);
      setEvents(eventResult.data ?? []);
      setLoading(false);
    }

    void loadAlliance();
  }, []);

  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          ALLIANCE INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {alliance ? `[${alliance.tag}] ${alliance.name}` : "Alliance is not configured yet"}
        </h1>
        <p className="mt-2 text-sm text-slate-200">
          {alliance?.description ??
            "Alliance details are not available yet. Configure them in admin master data."}
        </p>
      </header>

      {loading && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          Loading alliance data...
        </article>
      )}

      {!loading && errorMessage && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-rose-300">
          Failed to load alliance data: {errorMessage}
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Name</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {alliance?.name ?? "-"}
          </p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Tag</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {alliance?.tag ?? "-"}
          </p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Slogan</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {alliance?.slogan ?? "-"}
          </p>
        </article>
      </div>

      <div className="ice-panel rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Alliance Events</h2>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl bg-slate-900/45 p-4">
              <p className="text-xs text-cyan-200">
                {event.event_time ||
                  new Date(event.event_timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
              <p className="mt-1 font-semibold">{event.title}</p>
              <p className="mt-1 text-sm text-slate-200">{event.subtitle ?? "-"}</p>
            </article>
          ))}
          {!loading && !errorMessage && events.length === 0 && (
            <article className="rounded-2xl bg-slate-900/45 p-4 text-sm text-slate-300">
              No alliance events yet.
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
