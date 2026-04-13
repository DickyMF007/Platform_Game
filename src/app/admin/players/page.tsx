"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";
import { formatPowerCompact, PowerUnit, toAbsolutePower } from "@/lib/power";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type PlayerItem = {
  id: string;
  name: string;
  game_id: string;
  power: number;
  role: string;
  updated_at: string;
};

export default function AdminPlayersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [rows, setRows] = useState<PlayerItem[]>([]);
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

  async function loadPlayers() {
    if (!supabase || !hasSupabaseEnv) return;

    const { data, error } = await supabase
      .from("players")
      .select("id, name, game_id, power, role, updated_at")
      .order("power", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(`Gagal load data player: ${error.message}`);
      return;
    }

    setRows((data ?? []) as PlayerItem[]);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      void loadPlayers();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !hasSupabaseEnv) return;

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const name = String(formData.get("name") ?? "").trim();
    const gameId = String(formData.get("gameId") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim() || "Member";
    const amount = Number(formData.get("powerAmount") ?? 0);
    const unit = String(formData.get("powerUnit") ?? "million") as PowerUnit;

    if (!name || !gameId) {
      setMessage("Nama dan Game ID wajib diisi.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setMessage("Power amount tidak valid.");
      return;
    }

    const absolutePower = toAbsolutePower(amount, unit);

    setLoading(true);
    const { error } = await supabase.from("players").insert({
      name,
      game_id: gameId,
      role,
      power: absolutePower,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);

    if (error) {
      setMessage(`Gagal simpan player: ${error.message}`);
      return;
    }

    formEl.reset();
    setMessage("Player berhasil ditambahkan.");
    void loadPlayers();
  }

  async function handleDelete(id: string) {
    if (!supabase || !hasSupabaseEnv) return;

    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      setMessage(`Gagal hapus player: ${error.message}`);
      return;
    }

    void loadPlayers();
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
          <h1 className="mt-2 text-2xl font-bold">Master Data: Player</h1>
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
        <h2 className="text-lg font-semibold text-cyan-100">Tambah Player</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Nama
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Game ID
            <input
              name="gameId"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            Power Amount
            <input
              name="powerAmount"
              type="number"
              step="0.01"
              min={0}
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Unit
            <select
              name="powerUnit"
              defaultValue="million"
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            >
              <option value="million">Million (M)</option>
              <option value="billion">Billion (B)</option>
            </select>
          </label>

          <label className="block text-sm">
            Role
            <input
              name="role"
              defaultValue="Member"
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="frost-button rounded-xl px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Player"}
        </button>
        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </form>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Game ID</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Power</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.game_id}</td>
                <td className="px-3 py-2">{row.role}</td>
                <td className="px-3 py-2">{formatPowerCompact(row.power)}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg border border-rose-300/50 px-2 py-1 text-xs text-rose-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-300">
                  Belum ada data player.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
