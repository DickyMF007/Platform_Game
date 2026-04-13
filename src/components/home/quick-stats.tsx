"use client";

import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type QuickStat = {
  id: string;
  label: string;
  value: string;
  note: string | null;
};

export function QuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStats() {
      if (!supabase || !hasSupabaseEnv) {
        setErrorMessage("Supabase belum dikonfigurasi.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("quick_stats")
        .select("id, label, value, note")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(8);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setStats(data ?? []);
      setLoading(false);
    }

    void loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="ice-panel rounded-2xl p-4">
            <div className="h-3 w-2/3 rounded bg-slate-700/60" />
            <div className="mt-3 h-7 w-1/2 rounded bg-slate-700/60" />
            <div className="mt-2 h-3 w-3/4 rounded bg-slate-700/50" />
          </article>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <article className="ice-panel rounded-2xl p-4 text-sm text-rose-300">
        Gagal memuat quick stats: {errorMessage}
      </article>
    );
  }

  if (stats.length === 0) {
    return (
      <article className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
        Quick stats belum tersedia.
      </article>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.id} className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-cyan-100">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-300">{stat.note ?? "-"}</p>
        </article>
      ))}
    </div>
  );
}
