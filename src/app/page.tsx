import { AllianceCarousel } from "@/components/home/alliance-carousel";
import { LatestUpdates } from "@/components/home/latest-updates";
import { QuickStats } from "@/components/home/quick-stats";
import { allianceCarouselSlides, allianceProfile } from "@/lib/content";
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-5">
      <div className="ice-panel relative min-h-[320px] overflow-hidden rounded-3xl p-5 sm:min-h-[420px] sm:p-8 flex flex-col gap-8">
        {/* INFO - Atas */}
        <div className="relative z-10 grid md:grid-cols-12 items-start">
          <div className="text-left md:col-span-7 flex flex-col h-full">
            <div>
              <p className="text-xs tracking-[0.16em] text-cyan-200/90">
                WHITEOUT SURVIVAL - STATE {allianceProfile.state}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                <span className="frost-text">
                  {allianceProfile.tag} {allianceProfile.name} Alliance
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 sm:text-base">
                Together we grow, together we are strong. <br />
                {/* Join {allianceProfile.tag} {allianceProfile.name} in State {allianceProfile.state}. */}
              </p>
              {/* <div className="mt-4 inline-flex rounded-full border border-cyan-200/40 bg-slate-950/45 px-4 py-1 text-xs tracking-[0.12em] text-cyan-100">
                CORE ALLIANCE: {allianceProfile.tag} {allianceProfile.name} - {allianceProfile.state}
              </div> */}
            </div>
          </div>
        </div>
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${allianceProfile.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-cyan-950/55" />
        {/* DAFTAR - Bawah */}
        <div className="relative z-0 flex flex-wrap items-center gap-3 mt-auto">
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

      <QuickStats />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyan-100">Alliance Gallery</h2>
          <p className="text-xs tracking-[0.12em] text-slate-300">
            MOBILE CAROUSEL
          </p>
        </div>
        <AllianceCarousel slides={allianceCarouselSlides} />
      </div>
 
      <LatestUpdates />
    </section>
  );
}
