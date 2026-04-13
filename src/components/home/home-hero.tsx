"use client";

import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useEffect, useState } from "react";

type AllianceRow = {
  name: string;
  tag: string;
  slogan: string | null;
  banner_url: string | null;
};

type StateRow = {
  name: string;
};

const fallbackHero = {
  tag: "EVE",
  name: "Everlasting",
  slogan: "Together we grow, together we are strong.",
  stateName: "3302",
  bannerUrl: "/images/hero_wos.png",
};

export function HomeHero() {
  const [hero, setHero] = useState(fallbackHero);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) return;
    const supabaseClient = supabase;

    const timer = setTimeout(async () => {
      const [allianceResult, stateResult] = await Promise.all([
        supabaseClient
          .from("alliances")
          .select("name, tag, slogan, banner_url")
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle<AllianceRow>(),
        supabaseClient
          .from("states")
          .select("name")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle<StateRow>(),
      ]);

      const alliance = allianceResult.data;
      const state = stateResult.data;

      if (!alliance) return;

      setHero({
        tag: alliance.tag || fallbackHero.tag,
        name: alliance.name || fallbackHero.name,
        slogan: alliance.slogan || fallbackHero.slogan,
        stateName: state?.name || fallbackHero.stateName,
        bannerUrl: alliance.banner_url || fallbackHero.bannerUrl,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ice-panel relative flex min-h-[320px] flex-col gap-8 overflow-hidden rounded-3xl p-5 sm:min-h-[420px] sm:p-8">
      <div className="relative z-10 grid items-start md:grid-cols-12">
        <div className="flex h-full flex-col text-left md:col-span-7">
          <div>
            <p className="text-xs tracking-[0.16em] text-cyan-200/90">
              WHITEOUT SURVIVAL - STATE {hero.stateName}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="frost-text">
                {hero.tag ? `[${hero.tag}]` : ""} {hero.name} Alliance
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 sm:text-base">
              {hero.slogan}
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.bannerUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-cyan-950/55" />

      <div className="relative z-0 mt-auto flex flex-wrap items-center gap-3">
        <Link
          href="/register"
          className="frost-button rounded-xl px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Daftar Masuk State
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-xl border border-cyan-300/50 px-4 py-3 text-sm font-semibold text-cyan-100"
        >
          Lihat Leaderboard
        </Link>
      </div>
    </div>
  );
}
