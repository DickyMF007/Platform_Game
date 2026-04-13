import { leaderboard } from "@/lib/content";

function rankStyle(rank: number) {
  if (rank === 1) return "text-amber-300";
  if (rank === 2) return "text-slate-200";
  if (rank === 3) return "text-orange-300";
  return "text-cyan-100";
}

export default function LeaderboardPage() {
  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">LEADERBOARD</p>
        <h1 className="mt-2 text-2xl font-bold">Top Power - Weekly Snapshot</h1>
        <p className="mt-2 text-sm text-slate-200">
          Pemeringkatan performa player untuk monitoring progres kekuatan aliansi.
        </p>
      </header>

      <div className="ice-panel rounded-3xl p-3 sm:p-5">
        <div className="space-y-2">
          {leaderboard.map((item) => (
            <article
              key={item.gameId}
              className="rounded-2xl bg-slate-900/45 px-4 py-3 sm:grid sm:grid-cols-[80px_1fr_auto] sm:items-center"
            >
              <p className={`text-xl font-black ${rankStyle(item.rank)}`}>
                #{item.rank}
              </p>
              <div>
                <p className="font-semibold text-cyan-100">{item.player}</p>
                <p className="text-xs text-slate-300">{item.gameId}</p>
              </div>
              <p className="mt-2 text-lg font-semibold sm:mt-0">{item.score}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
