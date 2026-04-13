"use client";

import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import { registrationProofBucket } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Registration = {
  id: string;
  name: string;
  game_id: string;
  power_image_url: string;
  note: string | null;
  status: string;
  created_at: string;
};

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rows, setRows] = useState<Registration[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<{
    name: string;
    imageUrl: string;
  } | null>(null);

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

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      if (!supabase || !hasSupabaseEnv) return;
      const supabaseClient = supabase;

      const { data, error } = await supabaseClient
        .from("registrations")
        .select("id, name, game_id, power_image_url, note, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setRows(data ?? []);
    }

    void loadData();
  }, [isAuthenticated]);

  function resolveProofUrl(filePath: string): string {
    if (!supabase || !hasSupabaseEnv || !filePath) return "";
    return supabase.storage.from(registrationProofBucket).getPublicUrl(filePath).data
      .publicUrl;
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
          <p className="text-xs tracking-[0.16em] text-cyan-200/80">
            ADMIN RECRUITER
          </p>
          <h1 className="mt-2 text-2xl font-bold">List Pendaftar</h1>
          <p className="mt-2 text-sm text-slate-200">
            Pantau data pendaftar dan lihat foto power secara detail.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm"
        >
          Admin Summary
        </Link>
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
              <th className="px-3 py-2">Foto Power</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700/60">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.game_id}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2 text-slate-300">{row.note ?? "-"}</td>
                <td className="px-3 py-2">
                  {row.power_image_url ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhoto({
                          name: row.name,
                          imageUrl: resolveProofUrl(row.power_image_url),
                        })
                      }
                      className="rounded-lg border border-cyan-300/40 px-2 py-1 text-xs text-cyan-200"
                    >
                      Lihat Foto
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-300">
                  Belum ada data pendaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="ice-panel w-full max-w-3xl rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-cyan-100">
                Bukti Power - {selectedPhoto.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-lg border border-cyan-300/40 px-3 py-1 text-xs text-cyan-200"
              >
                Tutup
              </button>
            </div>

            {selectedPhoto.imageUrl ? (
              <img
                src={selectedPhoto.imageUrl}
                alt={`Bukti power ${selectedPhoto.name}`}
                className="max-h-[75vh] w-full rounded-2xl border border-cyan-300/20 object-contain"
              />
            ) : (
              <p className="text-sm text-rose-300">
                Gagal memuat gambar. Pastikan bucket `{
                  registrationProofBucket
                }` bersifat public atau memiliki policy read.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
