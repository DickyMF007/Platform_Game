const officers = [
  { role: "R5 Leader", name: "EVE Sovereign", window: "19:00 - 23:00 WIB" },
  { role: "War Marshal", name: "EVE Vanguard", window: "18:00 - 22:00 WIB" },
  { role: "Recruiter", name: "EVE Ember", window: "12:00 - 20:00 WIB" },
];

export default function AlliancePage() {
  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          ALLIANCE INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">[EVE] Everlasting - State 3302</h1>
        <p className="mt-2 text-sm text-slate-200">
          Aliansi utama state 3302 dengan fokus dominasi event kompetitif,
          koordinasi rally, dan pertumbuhan power kolektif.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Requirement Power</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">200M+</p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Timezone Utama</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">UTC +7</p>
        </article>
        <article className="ice-panel rounded-2xl p-4">
          <p className="text-xs text-slate-300">Tagline</p>
          <p className="mt-2 text-lg font-semibold text-cyan-100">Rise Through Frost</p>
        </article>
      </div>

      <div className="ice-panel rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Officer Window</h2>
        <div className="mt-4 space-y-3">
          {officers.map((officer) => (
            <article
              key={officer.role}
              className="rounded-2xl bg-slate-900/45 p-4 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs text-cyan-200">{officer.role}</p>
                <p className="mt-1 font-semibold">{officer.name}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300 sm:mt-0">{officer.window}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
