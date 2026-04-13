"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPowerCompact } from "@/lib/power";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type LeaderboardRow = {
  id: string;
  name: string;
  game_id: string;
  power: number;
};

function rankStyle(rank: number) {
  if (rank === 1) return "text-amber-300";
  if (rank === 2) return "text-slate-200";
  if (rank === 3) return "text-orange-300";
  return "text-cyan-100";
}

export default function LeaderboardPage() {
  const isSupabaseReady = hasSupabaseEnv && Boolean(supabase);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [message, setMessage] = useState(
    isSupabaseReady ? "" : "Supabase belum dikonfigurasi.",
  );

  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;
    const supabaseClient = supabase;

    const timer = setTimeout(async () => {
      const { data, error } = await supabaseClient
        .from("players")
        .select("id, name, game_id, power")
        .order("power", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) {
        setMessage(`Gagal memuat leaderboard: ${error.message}`);
      } else {
        setRows((data ?? []) as LeaderboardRow[]);
      }

      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [isSupabaseReady]);

  const leaderboard = useMemo(
    () =>
      rows.map((row, index) => ({
        rank: index + 1,
        ...row,
      })),
    [rows],
  );

  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">LEADERBOARD</p>
        <h1 className="mt-2 text-2xl font-bold">Top Power - Weekly Snapshot</h1>
        <p className="mt-2 text-sm text-slate-200">
          Pemeringkatan performa player untuk monitoring progres kekuatan aliansi.
        </p>
      </header>

      {loading && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          Memuat leaderboard...
        </div>
      )}

      {!loading && message && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-rose-200">{message}</div>
      )}

      {!loading && !message && leaderboard.length === 0 && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          Belum ada player untuk diranking.
        </div>
      )}

      <div className="ice-panel rounded-3xl p-3 sm:p-5">
        <div className="space-y-2">
          {leaderboard.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-slate-900/45 px-4 py-3 sm:grid sm:grid-cols-[80px_1fr_auto] sm:items-center"
            >
              <p className={`text-xl font-black ${rankStyle(item.rank)}`}>
                #{item.rank}
              </p>
              <div>
                <p className="font-semibold text-cyan-100">{item.name}</p>
                <p className="text-xs text-slate-300">{item.game_id}</p>
              </div>
              <p className="mt-2 text-lg font-semibold sm:mt-0">
                {formatPowerCompact(item.power)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
