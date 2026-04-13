"use client";

import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

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
  created_at: string;
};

export default function StatePage() {
  const [stateDetail, setStateDetail] = useState<StateDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStateData() {
      if (!supabase || !hasSupabaseEnv) {
        setErrorMessage("Supabase is not configured.");
        setLoading(false);
        return;
      }

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
          .select("id, title, content, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (stateResult.error) {
        setErrorMessage(stateResult.error.message);
        setLoading(false);
        return;
      }

      if (timelineResult.error) {
        setErrorMessage(timelineResult.error.message);
        setLoading(false);
        return;
      }

      setStateDetail(stateResult.data ?? null);
      setTimeline(timelineResult.data ?? []);
      setLoading(false);
    }

    void loadStateData();
  }, []);

  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          STATE INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {stateDetail?.name ?? "State is not configured yet"}
        </h1>
        <p className="mt-2 text-sm text-slate-200">
          {stateDetail?.description ??
            "State description is not available yet. Configure it in the admin section."}
        </p>
      </header>

      {loading && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          Loading state data...
        </article>
      )}

      {!loading && errorMessage && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-rose-300">
          Failed to load state data: {errorMessage}
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Commander In Charge</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {stateDetail?.commander_in_charge ?? "-"}
          </p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Reset Event</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {stateDetail?.reset_event ?? "-"}
          </p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">State Age</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            {stateDetail?.state_age ?? "-"}
          </p>
        </article>
      </div>

      <div className="ice-panel rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Timeline Update</h2>
        <div className="mt-4 space-y-3">
          {timeline.map((item) => (
            <article key={item.id} className="rounded-2xl bg-slate-900/45 p-4">
              <p className="text-xs text-cyan-200">
                {new Date(item.created_at).toLocaleDateString("en-US")}
              </p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-200">{item.content}</p>
            </article>
          ))}
          {!loading && !errorMessage && timeline.length === 0 && (
            <article className="rounded-2xl bg-slate-900/45 p-4 text-sm text-slate-300">
              No timeline updates yet.
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
