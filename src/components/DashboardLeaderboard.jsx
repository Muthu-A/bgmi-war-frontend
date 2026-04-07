import Loader from "./Loader";

export default function DashboardLeaderboard({ leaderboard, isLoading }) {
  return (
    <div className="w-full lg:w-1/3 flex justify-center items-start">
      <div className="w-full h-full max-w-sm bg-slate-800 rounded-2xl border border-gray-700 p-4 shadow-lg flex flex-col">
        {/* Title */}
        <h2 className="text-center text-lg font-bold mb-4 tracking-wide">
          🏆 Leaderboard
        </h2>

        {isLoading ? (
          <Loader />
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-gray-400">No data</div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* ================= PODIUM ================= */}
            <div className="flex justify-center items-end gap-4 mb-6 flex-shrink-0">
              {/* 🥈 Rank 2 */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center w-20">
                  <div className="text-3xl">🥈</div>
                  <div className="mt-2 text-xs text-center break-words">
                    {leaderboard[1].teamName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {leaderboard[1].points}
                  </div>
                </div>
              )}

              {/* 🥇 Rank 1 */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center w-24">
                  <div className="text-5xl">👑</div>
                  <div className="mt-2 text-sm font-semibold text-center break-words">
                    {leaderboard[0].teamName}
                  </div>
                  <div className="text-xs text-green-400 font-bold">
                    {leaderboard[0].points}
                  </div>
                </div>
              )}

              {/* 🥉 Rank 3 */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center w-20">
                  <div className="text-3xl">🥉</div>
                  <div className="mt-2 text-xs text-center break-words">
                    {leaderboard[2].teamName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {leaderboard[2].points}
                  </div>
                </div>
              )}
            </div>

            {/* ================= SCROLLABLE LIST ================= */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-2">
              {leaderboard.slice(3).map((team, index) => (
                <div
                  key={team.teamId || index}
                  className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-gray-700 flex-shrink-0"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center bg-purple-600 rounded text-xs font-bold">
                      {index + 4}
                    </div>

                    <span className="text-sm text-white truncate max-w-[120px]">
                      {team.teamName}
                    </span>
                  </div>

                  {/* Right */}
                  <div className="bg-purple-500/20 px-2 py-1 rounded text-xs font-semibold text-purple-300">
                    {team.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}