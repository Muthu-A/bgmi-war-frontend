import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import toast from "react-hot-toast";

export default function TodayWar() {
  const [war, setWar] = useState(null);
  const [teams, setTeams] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    title: "BOT Squad War",
    type: "placement",
    mode: "squad",
    warPoints: 2,
    prize: "",
    sponsors: "",
  });
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [tieTeams, setTieTeams] = useState([]);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [playerKills, setPlayerKills] = useState([]);

  const getInitialResults = () => {
    if (!war) return [];
    if (war.type === "highest_wins") return [{ teamId: "", rank: 1, kills: 0 }];
    return [
      { teamId: "", rank: 1, kills: "" },
      { teamId: "", rank: 2, kills: "" },
      { teamId: "", rank: 3, kills: "" },
      { teamId: "", rank: 4, kills: "" },
      { teamId: "", rank: 5, kills: "" },
    ];
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (war) setResults(getInitialResults());
  }, [war]);

  const loadData = async () => {
    const warRes = await API.get("/wars/active");
    const teamRes = await API.get("/teams");
    setWar(warRes.data);
    setTeams(teamRes.data);
  };

  const startWar = async () => {
    const res = await API.post("/wars", {
      ...form,
      warPoints: form.type === "wins" ? 0 : warPoints,
    });
    toast.success("War Started successfully");
    setWar(res.data);
  };

  const submitMatch = async () => {
    let formatted;

    if (war.type === "highest_kills") {
      const team = teams.find((t) => t._id === results[0].teamId);

      formatted = [
        {
          teamId: team._id,
          teamName: team.name,
          players: playerKills,
        },
      ];
    } else {
      formatted = results.map((r) => {
        const team = teams.find((t) => t._id === r.teamId);
        return {
          teamId: r.teamId,
          teamName: team?.name,
          rank: r.rank,
          kills: r.kills,
        };
      });
    }

    const res = await API.post(`/wars/${war._id}/match`, {
      results: formatted,
    });

    toast.success("Match Updated Successfully");
    setWar(res.data);
  };

  const handleTeamSelect = (teamId) => {
    const team = teams.find((t) => t._id === teamId);

    const players = team?.players || [];

    setResults([{ teamId }]);

    setPlayerKills(
      players.map((p) => ({
        name: p,
        kills: 0,
      })),
    );

    return players.map((p) => ({
      name: p,
      kills: 0,
    }));
  };

  const handleOpenEndPopup = () => {
    if (!war || !war.leaderboard.length) return;

    const topPoints = war.leaderboard[0].points;

    const tied = war.leaderboard.filter((t) => t.points === topPoints);

    setTieTeams(tied);

    if (tied.length === 1) {
      setSelectedWinner(tied[0].teamId);
    }

    setShowEndPopup(true);
  };

  const confirmEndWar = async () => {
    try {
      const winnerTeam = war.leaderboard.find(
        (t) => t.teamId === selectedWinner,
      );

      const res = await API.post(`/wars/${war._id}/end`, {
        winner:
          war.type === "wins" ? { teamId: "1", teamName: "A" } : winnerTeam,
      });

      toast.success("War Ended successfully");
      if (war.type !== "wins") {
        setWinnerTeam(res.data);
        setShowWinnerDialog(true);
        setShowEndPopup(false);
      }
      setWar(null);
    } catch (err) {
      toast.error("Failed to end war");
    }
  };

  const getTeams = (teamId) => {
    const team = teams.find((t) => t._id === teamId);

    const players = team?.players || [];

    return players;
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-6">🔥 Today War</h1>
        {war && (
          <button
            onClick={handleOpenEndPopup}
            className="bg-red-500 px-4 py-2 rounded mt-4"
          >
            End War
          </button>
        )}
      </div>

      {!war && (
        <div className="flex justify-center items-center h-[70vh]">
          <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full">
            <h2 className="mb-4 text-lg font-semibold text-center">
              Start New War
            </h2>

            {/* Form inputs */}
            {form.type === "wins"
              ? ["title", "prize", "sponsors"].map((field, i) => (
                  <input
                    key={i}
                    type={field.includes("Prize") ? "number" : "text"}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="w-full mb-3 p-2 bg-slate-900 rounded"
                    value={form[field]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [field]: field.includes("Prize")
                          ? Number(e.target.value)
                          : e.target.value,
                      })
                    }
                  />
                ))
              : ["title", "warPoints", "prize", "sponsors"].map((field, i) => (
                  <input
                    key={i}
                    type={
                      field.includes("Points") || field.includes("Prize")
                        ? "number"
                        : "text"
                    }
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="w-full mb-3 p-2 bg-slate-900 rounded"
                    value={form[field]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [field]:
                          field.includes("Points") || field.includes("Prize")
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                ))}

            <select
              className="w-full mb-3 p-2 bg-slate-900 rounded"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="placement">Placement</option>
              <option value="placement_kills">Placement + Kills</option>
              <option value="highest_wins">Highest Wins</option>
              <option value="highest_kills">Highest Kills</option>
              <option value="wins">Wins</option>
            </select>

            <select
              className="w-full mb-3 p-2 bg-slate-900 rounded"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>

            <button
              onClick={startWar}
              className="bg-green-500 px-4 py-2 rounded w-full"
            >
              Start War
            </button>
          </div>
        </div>
      )}

      {war && (
        <div className="flex gap-6 h-screen">
          {/* LEFT: War Details + Match Input */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* War Details */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold">{war.title}</h2>
              <p>Type: {war.type}</p>
              <p>Mode: {war.mode}</p>
              {war.type !== "wins" && <p>War Points: {war.warPoints}</p>}
              <p>Prize: ₹{war.prize}</p>
              {war.sponsors && <p>Sponsors: {war.sponsors}</p>}
              <p>Matches Played: {war?.matches?.length}/5</p>
            </div>

            {/* Match Entry */}
            {/* {war.matches.length < 5 && ( */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="mb-4 font-semibold">
                Enter Match Result ({war.type})
              </h2>

              {war.type === "highest_wins" && (
                <div className="mb-3">
                  <label className="block text-sm text-gray-400 mb-1">
                    Select Winning Team
                  </label>
                  <select
                    value={results[0]?.teamId}
                    onChange={(e) =>
                      setResults([{ teamId: e.target.value, rank: 1 }])
                    }
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

              {war.type === "placement" ||
                (war.type === "placement_kills" &&
                  results.map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 mb-3 items-center"
                    >
                      <div className="p-2 bg-slate-900 rounded text-center">
                        Rank {r.rank}
                      </div>
                      <div>
                        {/* <label className="block text-xs text-gray-400 mb-1">
                          Team
                        </label> */}
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
                  )))}

              {war.type === "highest_kills" && (
                <>
                  {/* Select Team */}
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

                  {/* Players Kills */}
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
                  {/* Select Team */}
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

              <button
                onClick={submitMatch}
                className="bg-green-500 px-4 py-2 rounded mt-3"
              >
                Submit Match
              </button>
            </div>
            {/* )} */}
          </div>

          {/* RIGHT: Leaderboard */}
          <div className="w-1/3 h-[calc(100vh-200px)] flex">
            <div className="w-full h-full bg-slate-800 rounded-2xl border border-gray-700 p-4 shadow-lg flex flex-col">
              {/* Title */}
              <h2 className="text-center text-lg font-bold mb-4 tracking-wide">
                🏆 Leaderboard
              </h2>

              {war.leaderboard.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  No data found
                </div>
              ) : war.leaderboard.length === 1 ? (
                // ================= SINGLE TEAM VIEW =================
                <div className="flex flex-col items-center justify-between flex-1">
                  {/* 🏆 Winner Card */}
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-2">👑</div>

                    <h2 className="text-xl font-bold text-center">
                      {war.leaderboard[0].teamName}
                    </h2>

                    {war.type !== "wins" && (
                      <div className="text-green-400 font-semibold mt-1">
                        {war.type === "highest_kills" &&
                          `${war.leaderboard[0].kills} Kills`}
                        {war.type === "placement" &&
                          `${war.leaderboard[0].points} pts`}
                        {war.type === "highest_wins" &&
                          `${war.leaderboard[0].wins} Wins`}
                        {war.type === "placement_kills" &&
                          `${war.leaderboard[0].points} pts | ${war.leaderboard[0].kills} Kills`}
                      </div>
                    )}
                  </div>

                  {/* 👥 Players */}
                  <div className="w-full">
                    <h3 className="text-sm text-gray-400 mb-2 text-center">
                      Team Players
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      {getTeams(war.leaderboard[0].teamId).map((p, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 p-2 rounded text-center text-xs border border-gray-700"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 💬 Quotes (fills empty space) */}
                  <div className="text-center text-xs text-gray-400 italic px-4 space-y-2">
                    <p>"Champions are made, not born."</p>
                    <p>"One squad. One dream."</p>
                    <p>"Victory loves preparation."</p>
                    <p>"Dominate the battlefield."</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* ================= PODIUM ================= */}
                  <div className="flex justify-center items-end gap-4 mb-6">
                    {/* 🥈 Rank 2 */}
                    {war.leaderboard[1] && (
                      <div className="flex flex-col items-center w-20">
                        <div className="text-3xl">🥈</div>
                        <span className="mt-2 text-xs text-center break-words">
                          {war.leaderboard[1].teamName}
                        </span>
                        {war.type !== "wins" && (
                          <span className="text-[10px] text-gray-400">
                            {war.type === "highest_kills" &&
                              `${war.leaderboard[1].kills} Kills`}
                            {war.type === "placement" &&
                              `${war.leaderboard[1].points} pts`}
                            {war.type === "highest_wins" &&
                              `${war.leaderboard[1].wins} Wins`}
                            {war.type === "placement_kills" &&
                              `${war.leaderboard[1].points} pts | ${war.leaderboard[1].kills} Kills`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 🥇 Rank 1 */}
                    {war.leaderboard[0] && (
                      <div className="flex flex-col items-center w-24">
                        <div className="text-5xl">👑</div>
                        <span className="mt-2 text-sm font-semibold text-center break-words">
                          {war.leaderboard[0].teamName}
                        </span>
                        {war.type !== "wins" && (
                          <span className="text-xs text-green-400 font-bold">
                            {war.type === "highest_kills" &&
                              `${war.leaderboard[0].kills} Kills`}
                            {war.type === "placement" &&
                              `${war.leaderboard[0].points} pts`}
                            {war.type === "highest_wins" &&
                              `${war.leaderboard[0].wins} Wins`}
                            {war.type === "placement_kills" &&
                              `${war.leaderboard[0].points} pts | ${war.leaderboard[0].kills} Kills`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 🥉 Rank 3 */}
                    {war.leaderboard[2] && (
                      <div className="flex flex-col items-center w-20">
                        <div className="text-3xl">🥉</div>
                        <span className="mt-2 text-xs text-center break-words">
                          {war.leaderboard[2].teamName}
                        </span>
                        {war.type !== "wins" && (
                          <span className="text-[10px] text-gray-400">
                            {war.type === "highest_kills" &&
                              `${war.leaderboard[2].kills} Kills`}
                            {war.type === "placement" &&
                              `${war.leaderboard[2].points} pts`}
                            {war.type === "highest_wins" &&
                              `${war.leaderboard[2].wins} Wins`}
                            {war.type === "placement_kills" &&
                              `${war.leaderboard[2].points} pts | ${war.leaderboard[2].kills} Kills`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================= LIST ================= */}
                  <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    {war.leaderboard.slice(3).map((t, i) => (
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
                        {war.type !== "wins" && (
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
              )}
            </div>
          </div>
        </div>
      )}

      {showWinnerDialog && winnerTeam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-96 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-center mb-4">🏆 Winner</h2>

            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🥇</div>
              <span className="text-xl font-semibold">
                {winnerTeam.teamName}
              </span>
            </div>

            {winnerTeam.players.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {winnerTeam.players.map((p, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 p-3 rounded-lg flex flex-col items-center shadow-md"
                  >
                    <div className="text-white font-semibold">{p}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 mb-4">
                No players found
              </div>
            )}

            <div className="text-center mt-2">
              <button
                className="bg-green-500 px-4 py-2 rounded-lg"
                onClick={() => setShowWinnerDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-96 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">
              ⚠️ End War Confirmation
            </h2>

            {/* Tie Case */}
            {tieTeams.length > 1 && war.type !== "wins" ? (
              <>
                <p className="text-sm text-gray-300 mb-3 text-center">
                  Multiple teams have same points. Select winner:
                </p>

                <select
                  className="w-full p-2 mb-4 bg-slate-900 border border-white rounded"
                  value={selectedWinner}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                >
                  <option value="">Select Team</option>
                  {tieTeams.map((t) => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.teamName} ({t.points} pts)
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className="text-center text-gray-300 mb-4">
                Are you sure you want to end the war?
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndPopup(false)}
                className="w-full bg-gray-600 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmEndWar}
                disabled={war.type !== "wins" && !selectedWinner}
                className={`w-full py-2 rounded ${
                  selectedWinner ? "bg-red-600 hover:bg-red-700" : "bg-gray-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
