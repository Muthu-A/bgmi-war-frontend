import Button from "./Button";

export default function MatchEntry({
  war,
  results,
  setResults,
  isLoading,
  playerKills,
  setPlayerKills,
  teams,
  submitMatch,
  handleTeamSelect,
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <h2 className="mb-4 font-semibold">Enter Match Result ({war.type})</h2>

      {war.type === "highest_wins" && (
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">
            Select Winning Team
          </label>
          <select
            value={results[0]?.teamId}
            onChange={(e) => setResults([{ teamId: e.target.value, rank: 1 }])}
            className="w-full p-2 bg-slate-900 rounded"
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {(war.type === "placement" || war.type === "placement_kills") &&
        results.map((r, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-3 items-center">
            <div className="p-2 bg-slate-900 rounded text-center">
              Rank {r.rank}
            </div>
            <div>
              <select
                value={r.teamId}
                onChange={(e) => {
                  const updated = [...results];
                  updated[i].teamId = e.target.value;
                  setResults(updated);
                }}
                className="w-full p-2 bg-slate-900 rounded"
              >
                <option value="">Select Team</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {war.type === "placement_kills" ? (
              <div>
                <input
                  type="number"
                  placeholder="Kills"
                  value={r.kills}
                  onChange={(e) => {
                    const updated = [...results];
                    updated[i].kills = Number(e.target.value);
                    setResults(updated);
                  }}
                  className="w-full p-2 bg-slate-900 rounded"
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        ))}

      {war.type === "highest_kills" && (
        <>
          <select
            className="w-full p-2 bg-slate-900 rounded mb-3"
            onChange={(e) => handleTeamSelect(e.target.value)}
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {playerKills.map((p, i) => (
            <div key={i} className="flex justify-between gap-2 mb-2">
              <span className="text-sm">{p.name}</span>

              <input
                type="number"
                value={p.kills}
                onChange={(e) => {
                  const updated = [...playerKills];
                  updated[i].kills = Number(e.target.value);
                  setPlayerKills(updated);
                }}
                className="w-20 p-1 bg-slate-900 rounded"
              />
            </div>
          ))}
        </>
      )}

      {war.type === "wins" && (
        <>
          <select
            className="w-full p-2 bg-slate-900 rounded mb-3"
            onChange={(e) => handleTeamSelect(e.target.value)}
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </>
      )}

      <Button
        loading={isLoading}
        onClick={submitMatch}
        className="bg-green-500 px-4 py-2 rounded mt-3"
      >
        Submit Match
      </Button>
    </div>
  );
}
