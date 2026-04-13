"use client";

import { useEffect, useState } from "react";
import { formatPowerCompact } from "@/lib/power";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type PlayerItem = {
  id: string;
  name: string;
  game_id: string;
  power: number;
  role: string;
};

export default function PlayersPage() {
  const isSupabaseReady = hasSupabaseEnv && Boolean(supabase);
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [message, setMessage] = useState(
    isSupabaseReady ? "" : "Supabase is not configured.",
  );

  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;
    const supabaseClient = supabase;

    const timer = setTimeout(async () => {
      const { data, error } = await supabaseClient
        .from("players")
        .select("id, name, game_id, power, role")
        .order("power", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) {
        setMessage(`Failed to load players: ${error.message}`);
      } else {
        setPlayers((data ?? []) as PlayerItem[]);
      }

      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [isSupabaseReady]);

  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          PLAYER INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">Main Roster</h1>
        <p className="mt-2 text-sm text-slate-200">
          Compact player data for tracking contribution and alliance strength.
        </p>
      </header>

      {loading && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          Loading player data...
        </div>
      )}

      {!loading && message && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-rose-200">{message}</div>
      )}

      {!loading && !message && players.length === 0 && (
        <div className="ice-panel rounded-2xl p-4 text-sm text-slate-300">
          No players yet. Add them from Admin Player Master Data.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {players.map((player) => (
          <article key={player.id} className="ice-panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-cyan-100">{player.name}</p>
                <p className="text-xs text-slate-300">{player.game_id}</p>
              </div>
              <span className="rounded-xl bg-cyan-400/20 px-3 py-1 text-xs text-cyan-100">
                {player.role}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-300">Power</p>
            <p className="text-2xl font-black">{formatPowerCompact(player.power)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
