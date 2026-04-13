import { AllianceCarousel } from "@/components/home/alliance-carousel";
import {
  allianceCarouselSlides,
  allianceProfile,
  quickStats,
  stateUpdates,
} from "@/lib/content";
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
        <div className="relative z-20 flex flex-wrap items-center gap-3 mt-auto">
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickStats.map((stat) => (
          <article key={stat.label} className="ice-panel rounded-2xl p-4">
            <p className="text-xs text-slate-300">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-cyan-100">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-300">{stat.note}</p>
          </article>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyan-100">Alliance Gallery</h2>
          <p className="text-xs tracking-[0.12em] text-slate-300">
            MOBILE CAROUSEL
          </p>
        </div>
        <AllianceCarousel slides={allianceCarouselSlides} />
      </div>
 

      <div className="ice-panel rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Latest State Updates</h2>
        <div className="mt-4 space-y-3">
          {stateUpdates.map((item) => (
            <article key={item.title} className="rounded-2xl bg-slate-900/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-slate-300">{item.date}</span>
              </div>
              <p className="mt-2 text-sm text-slate-200">{item.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
