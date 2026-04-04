export default function Leaderboard({ leaderboard, war, isLoading, getTeams }) {
  if (isLoading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (leaderboard.length === 0) {
    return <div className="text-center text-gray-400">No data</div>;
  }

  if (leaderboard.length === 1) {
    // Single team view
    return (
      <div className="flex flex-col items-center justify-between flex-1">
        <div className="flex flex-col items-center">
          <div className="text-6xl mb-2">👑</div>
          <h2 className="text-xl font-bold text-center">
            {leaderboard[0].teamName}
          </h2>
          {war && war.type !== "wins" && (
            <div className="text-green-400 font-semibold mt-1">
              {war.type === "highest_kills" &&
                `${leaderboard[0].kills} Kills`}
              {war.type === "placement" &&
                `${leaderboard[0].points} pts`}
              {war.type === "highest_wins" &&
                `${leaderboard[0].wins} Wins`}
              {war.type === "placement_kills" &&
                `${leaderboard[0].points} pts | ${leaderboard[0].kills} Kills`}
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className="text-sm text-gray-400 mb-2 text-center">
            Team Players
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(war ? getTeams(war.leaderboard[0].teamId) : []).map((p, i) => (
              <div
                key={i}
                className="bg-slate-900 p-2 rounded text-center text-xs border border-gray-700"
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 italic px-4 space-y-2">
          <p>"Champions are made, not born."</p>
          <p>"One squad. One dream."</p>
          <p>"Victory loves preparation."</p>
          <p>"Dominate the battlefield."</p>
        </div>
      </div>
    );
  }

  // Podium and list
  return (
    <>
      <div className="flex justify-center items-end gap-4 mb-6">
        {leaderboard[1] && (
          <div className="flex flex-col items-center w-20">
            <div className="text-3xl">🥈</div>
            <div className="mt-2 text-xs text-center break-words">
              {leaderboard[1].teamName}
            </div>
            {war && war.type !== "wins" && (
              <div className="text-[10px] text-gray-400">
                {war.type === "highest_kills" &&
                  `${leaderboard[1].kills} Kills`}
                {war.type === "placement" &&
                  `${leaderboard[1].points} pts`}
                {war.type === "highest_wins" &&
                  `${leaderboard[1].wins} Wins`}
                {war.type === "placement_kills" &&
                  `${leaderboard[1].points} pts | ${leaderboard[1].kills} Kills`}
              </div>
            )}
          </div>
        )}

        {leaderboard[0] && (
          <div className="flex flex-col items-center w-24">
            <div className="text-5xl">👑</div>
            <div className="mt-2 text-sm font-semibold text-center break-words">
              {leaderboard[0].teamName}
            </div>
            {war && war.type !== "wins" && (
              <div className="text-xs text-green-400 font-bold">
                {war.type === "highest_kills" &&
                  `${leaderboard[0].kills} Kills`}
                {war.type === "placement" &&
                  `${leaderboard[0].points} pts`}
                {war.type === "highest_wins" &&
                  `${leaderboard[0].wins} Wins`}
                {war.type === "placement_kills" &&
                  `${leaderboard[0].points} pts | ${leaderboard[0].kills} Kills`}
              </div>
            )}
          </div>
        )}

        {leaderboard[2] && (
          <div className="flex flex-col items-center w-20">
            <div className="text-3xl">🥉</div>
            <div className="mt-2 text-xs text-center break-words">
              {leaderboard[2].teamName}
            </div>
            {war && war.type !== "wins" && (
              <div className="text-[10px] text-gray-400">
                {war.type === "highest_kills" &&
                  `${leaderboard[2].kills} Kills`}
                {war.type === "placement" &&
                  `${leaderboard[2].points} pts`}
                {war.type === "highest_wins" &&
                  `${leaderboard[2].wins} Wins`}
                {war.type === "placement_kills" &&
                  `${leaderboard[2].points} pts | ${leaderboard[2].kills} Kills`}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {leaderboard.slice(3).map((t, i) => (
          <div
            key={i + 3}
            className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-purple-600 rounded text-xs font-bold">
                {i + 4}
              </div>

              <span className="text-sm text-white truncate max-w-[120px]">
                {t.teamName}
              </span>
            </div>
            {war && war.type !== "wins" && (
              <div className="bg-purple-500/20 px-2 py-1 rounded text-xs font-semibold text-purple-300">
                {war.type === "placement" && `${t.points} Pts`}
                {war.type === "highest_wins" && `${t.wins} Wins`}
                {war.type === "placement_kills" &&
                  `${t.points} Pts | ${t.kills} Kills`}
                {war.type === "highest_kills" && `${t.kills} Kills`}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}