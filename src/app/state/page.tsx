import { stateUpdates } from "@/lib/content";

export default function StatePage() {
  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          STATE INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">State 1472 - Frost Dominion</h1>
        <p className="mt-2 text-sm text-slate-200">
          Status stabil dengan fokus dominasi Fortress dan event lintas server.
          Semua member wajib mengikuti jadwal rally utama.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Commander In Charge</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">FrostKing</p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Reset Event</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">
            00:00 UTC Daily
          </p>
        </article>
      </div>

      <div className="ice-panel rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Timeline Update</h2>
        <div className="mt-4 space-y-3">
          {stateUpdates.map((item) => (
            <article key={item.title} className="rounded-2xl bg-slate-900/45 p-4">
              <p className="text-xs text-cyan-200">{item.date}</p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-200">{item.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
