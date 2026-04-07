import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import toast from "react-hot-toast";
import WarStartForm from "../components/WarStartForm";
import MatchEntry from "../components/MatchEntry";
import Leaderboard from "../components/Leaderboard";
import WinnerDialog from "../components/WinnerDialog";
import EndWarPopup from "../components/EndWarPopup";

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
  const [isSubmitMatchLoading, setIsSubmitMatchLoading] = useState(false);
  const [showStartWarModal, setShowStartWarModal] = useState(false);

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

  const loadData = async () => {
    const warRes = await API.get("/wars/active");
    const teamRes = await API.get("/teams");
    setWar(warRes.data);
    setTeams(teamRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (war) setResults(getInitialResults());
  }, [war]);

  const startWar = async () => {
    const res = await API.post("/wars", {
      ...form,
      warPoints: form.type === "wins" ? 0 : form.warPoints,
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
    setIsSubmitMatchLoading(true);
    try {
      const res = await API.post(`/wars/${war._id}/match`, {
        results: formatted,
      });
      setIsSubmitMatchLoading(false);
      toast.success("Match Updated Successfully");
      setWar(res.data);
    } catch (err) {
      setIsSubmitMatchLoading(false);
      console.error(err);
      toast.error("Failed to submit match");
    }
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
      }
      setForm({
        title: "BOT Squad War",
        type: "placement",
        mode: "squad",
        warPoints: 2,
        prize: "",
        sponsors: "",
      });
      setWar(null);
      setShowEndPopup(false);
    } catch (err) {
      console.error(err);
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
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-2xl p-8 border border-red-500/20">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-yellow-400">
                 BGMI Bot Squad War
              </h2>
              <p className="text-xl text-gray-300">
                "Admin Control Center - Manage Tournaments & Teams"
              </p>
              <div className="flex justify-center gap-6 mt-6">
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">25</div>
                  <div className="text-sm text-gray-400">Registered Teams</div>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">100+</div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">₹50K+</div>
                  <div className="text-sm text-gray-400">Prize Distributed</div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => setShowStartWarModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🚀 Start New War
                </button>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">War Management</h3>
              <p className="text-gray-400 text-sm">
                Create and configure tournaments with custom rules, prize pools, and match schedules.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Team Administration</h3>
              <p className="text-gray-400 text-sm">
                Register teams, manage player rosters, and oversee team performance analytics.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Live Monitoring</h3>
              <p className="text-gray-400 text-sm">
                Track match results, update leaderboards, and manage tournament progression in real-time.
              </p>
            </div>
          </div>

          {/* Admin Quote */}
          <div className="bg-slate-800/30 p-6 rounded-xl border border-gray-600 text-center">
            <blockquote className="text-lg italic text-gray-300 mb-2">
              "Great administrators lead by example and inspire through action."
            </blockquote>
            <cite className="text-sm text-gray-500">- Administrative Wisdom</cite>
          </div>
        </div>
      )}

      {war && (
        <div className="space-y-6">
          {/* Active War Header */}
          <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl p-6 border border-blue-500/20">
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">⚔️</div>
              <h2 className="text-2xl font-bold text-green-400">
                War in Progress
              </h2>
              <p className="text-lg text-gray-300">
                "{war.title}" - Tournament Active
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{war?.matches?.length || 0}/5</div>
                  <div className="text-xs text-gray-400">Matches Played</div>
                </div>
                <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{war.leaderboard?.length || 0}</div>
                  <div className="text-xs text-gray-400">Active Teams</div>
                </div>
                <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{war.mode}</div>
                  <div className="text-xs text-gray-400">War Mode</div>
                </div>
                <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{war.type}</div>
                  <div className="text-xs text-gray-400">War Type</div>
                </div>
                <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">₹{war.prize}</div>
                  <div className="text-xs text-gray-400">Prize Pool</div>
                </div>
              </div>
            </div>
          </div>

          {/* War Management Tools */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Match Entry</h3>
              <p className="text-gray-400 text-xs">
                Submit match results and update team rankings in real-time.
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-sm font-semibold text-green-400 mb-1">Live Leaderboard</h3>
              <p className="text-gray-400 text-xs">
                Monitor team performance and tournament standings.
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-sm font-semibold text-red-400 mb-1">War Control</h3>
              <p className="text-gray-400 text-xs">
                End tournament when ready and declare winners.
              </p>
            </div>
          </div>

          {/* Main War Interface */}
          <div className="flex gap-6 h-screen">
            {/* LEFT: War Details + Match Input */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">

              <MatchEntry
                war={war}
                results={results}
                isLoading={isSubmitMatchLoading}
                setResults={setResults}
                playerKills={playerKills}
                setPlayerKills={setPlayerKills}
                teams={teams}
                submitMatch={submitMatch}
                handleTeamSelect={handleTeamSelect}
              />
            </div>

            <div className="w-1/3 h-[calc(100vh-400px)] flex">
              <div className="w-full h-full bg-slate-800 rounded-2xl border border-gray-700 p-4 shadow-lg flex flex-col">
                <h2 className="text-center text-lg font-bold mb-4 tracking-wide">
                  🏆 Leaderboard
                </h2>

                <Leaderboard
                  leaderboard={war.leaderboard}
                  war={war}
                  teams={teams}
                  isLoading={false}
                  getTeams={getTeams}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showWinnerDialog && winnerTeam && (
        <WinnerDialog
          winnerTeam={winnerTeam}
          setShowWinnerDialog={setShowWinnerDialog}
        />
      )}

      {showEndPopup && (
        <EndWarPopup
          tieTeams={tieTeams}
          selectedWinner={selectedWinner}
          setSelectedWinner={setSelectedWinner}
          confirmEndWar={confirmEndWar}
          setShowEndPopup={setShowEndPopup}
          war={war}
        />
      )}

      {showStartWarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl relative">
            <button
              onClick={() => setShowStartWarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-center text-yellow-400">
              ⚙️ Configure New War
            </h2>
            <WarStartForm
              form={form}
              setForm={setForm}
              startWar={() => {
                startWar();
                setShowStartWarModal(false);
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
