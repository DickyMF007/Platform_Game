const players = [
  { name: "FrostKing", gameId: "WOS-00991", power: "1.2B", role: "R5" },
  { name: "LunaWolf", gameId: "WOS-00117", power: "1.08B", role: "Recruiter" },
  { name: "Aegis", gameId: "WOS-00221", power: "986M", role: "War Marshal" },
  { name: "Valcryo", gameId: "WOS-00763", power: "872M", role: "Member" },
];

export default function PlayersPage() {
  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          PLAYER INFORMATION
        </p>
        <h1 className="mt-2 text-2xl font-bold">Roster Utama</h1>
        <p className="mt-2 text-sm text-slate-200">
          Data ringkas player untuk pemantauan kontribusi dan kekuatan aliansi.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {players.map((player) => (
          <article key={player.gameId} className="ice-panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-cyan-100">{player.name}</p>
                <p className="text-xs text-slate-300">{player.gameId}</p>
              </div>
              <span className="rounded-xl bg-cyan-400/20 px-3 py-1 text-xs text-cyan-100">
                {player.role}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-300">Power</p>
            <p className="text-2xl font-black">{player.power}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
