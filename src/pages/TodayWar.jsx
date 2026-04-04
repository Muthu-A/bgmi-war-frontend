import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import toast from "react-hot-toast";
import WarStartForm from "../components/WarStartForm";
import WarDetails from "../components/WarDetails";
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
        setShowEndPopup(false);
      }
      setWar(null);
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
        <WarStartForm form={form} setForm={setForm} startWar={startWar} />
      )}

      {war && (
        <div className="flex gap-6 h-screen">
          {/* LEFT: War Details + Match Input */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <WarDetails war={war} />

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

          <div className="w-1/3 h-[calc(100vh-200px)] flex">
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
    </Layout>
  );
}
