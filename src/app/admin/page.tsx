"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ADMIN_SESSION_KEY,
  isValidAdminCredential,
} from "@/lib/admin-auth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type AdminSummary = {
  latestUpdateCount: number;
  quickStatsCount: number;
  registrationCount: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [summary, setSummary] = useState<AdminSummary>({
    latestUpdateCount: 0,
    quickStatsCount: 0,
    registrationCount: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem(ADMIN_SESSION_KEY) === "ok") {
        setIsAuthenticated(true);
      }
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasSupabaseEnv || !supabase) return;
    const supabaseClient = supabase;

    const timer = setTimeout(async () => {
      const [{ count: latestUpdateCount }, { count: quickStatsCount }, { count: registrationCount }] =
        await Promise.all([
          supabaseClient
            .from("state_updates")
            .select("*", { count: "exact", head: true }),
          supabaseClient
            .from("quick_stats")
            .select("*", { count: "exact", head: true }),
          supabaseClient
            .from("registrations")
            .select("*", { count: "exact", head: true }),
        ]);

      setSummary({
        latestUpdateCount: latestUpdateCount ?? 0,
        quickStatsCount: quickStatsCount ?? 0,
        registrationCount: registrationCount ?? 0,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!isValidAdminCredential(username, password)) {
      setErrorMessage("Username atau password salah.");
      return;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, "ok");
    setIsAuthenticated(true);
    setErrorMessage("");
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    router.refresh();
  }

  if (!isReady) {
    return (
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="ice-panel rounded-3xl p-5">
          <p className="text-sm text-slate-300">Loading admin session...</p>
        </header>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="ice-panel rounded-3xl p-5">
          <p className="text-xs tracking-[0.16em] text-cyan-200/80">ADMIN ACCESS</p>
          <h1 className="mt-2 text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-200">
            Masuk dengan akun admin untuk membuka halaman khusus pengelolaan data.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="ice-panel space-y-4 rounded-3xl p-5">
          <label className="block text-sm">
            Username
            <input
              name="username"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            />
          </label>

          {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}

          <button
            type="submit"
            className="frost-button w-full rounded-xl px-4 py-3 font-semibold text-slate-950"
          >
            Masuk Admin
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="ice-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
        <div>
          <p className="text-xs tracking-[0.16em] text-cyan-200/80">ADMIN PANEL</p>
          <h1 className="mt-2 text-2xl font-bold">Master Data Sections</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm"
        >
          Logout
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/admin/latest-update"
          className="ice-panel rounded-2xl p-4 transition hover:border-cyan-200/60"
        >
          <p className="text-xs text-slate-300">MASTER DATA</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">Latest Update</p>
          <p className="mt-1 text-sm text-slate-300">Kelola berita dan publish status.</p>
        </Link>
        <Link
          href="/admin/quick-stats"
          className="ice-panel rounded-2xl p-4 transition hover:border-cyan-200/60"
        >
          <p className="text-xs text-slate-300">MASTER DATA</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">Quick Stats</p>
          <p className="mt-1 text-sm text-slate-300">Kelola statistik ringkas halaman Home.</p>
        </Link>
        <Link
          href="/admin/registrations"
          className="ice-panel rounded-2xl p-4 transition hover:border-cyan-200/60"
        >
          <p className="text-xs text-slate-300">MASTER DATA</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">Registrations</p>
          <p className="mt-1 text-sm text-slate-300">Pantau daftar pendaftar state.</p>
        </Link>
      </div>

      <div className="ice-panel overflow-x-auto rounded-3xl p-4">
        <h2 className="mb-3 text-lg font-semibold text-cyan-100">Admin Summary</h2>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-cyan-100">
              <th className="px-3 py-2">Master Data</th>
              <th className="px-3 py-2">Jumlah Data</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-700/60">
              <td className="px-3 py-2">Latest Update</td>
              <td className="px-3 py-2">{summary.latestUpdateCount}</td>
            </tr>
            <tr className="border-t border-slate-700/60">
              <td className="px-3 py-2">Quick Stats</td>
              <td className="px-3 py-2">{summary.quickStatsCount}</td>
            </tr>
            <tr className="border-t border-slate-700/60">
              <td className="px-3 py-2">Registrations</td>
              <td className="px-3 py-2">{summary.registrationCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
