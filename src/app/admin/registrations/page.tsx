"use client";

import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type Registration = {
  id: string;
  name: string;
  game_id: string;
  note: string | null;
  status: string;
  created_at: string;
};

export default function AdminRegistrationsPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!supabase || !hasSupabaseEnv) return;

      const { data, error } = await supabase
        .from("registrations")
        .select("id, name, game_id, note, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setRows(data ?? []);
    }

    void loadData();
  }, []);

  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          ADMIN RECRUITER
        </p>
        <h1 className="mt-2 text-2xl font-bold">Daftar Pendaftar</h1>
        <p className="mt-2 text-sm text-slate-200">
          Halaman ini ditujukan untuk role admin/recruiter dengan policy RLS.
        </p>
      </header>

      {!hasSupabaseEnv && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-amber-200">
          NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum
          diatur.
        </article>
      )}

      {errorMessage && (
        <article className="ice-panel rounded-2xl p-4 text-sm text-rose-300">
          Gagal mengambil data: {errorMessage}
        </article>
      )}

      <div className="ice-panel overflow-x-auto rounded-3xl p-3">
        <table className="min-w-full text-left text-sm">
          <thead className="text-cyan-100">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Game ID</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.game_id}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2 text-slate-300">{row.note ?? "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-300">
                  Belum ada data pendaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
