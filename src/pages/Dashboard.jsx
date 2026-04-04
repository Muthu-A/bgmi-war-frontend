import { useEffect, useState } from "react";
import {
  Trophy,
  User,
  Users,
  Swords,
  Flame,
  Handshake,
  LucideSplinePointer,
} from "lucide-react";
import Layout from "../components/Layout";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSeason } from "../context/SeasonContext";
import Loader from "../components/Loader";

const TEAM_COLORS = [
  "#22c55e", // green (1st)
  "#eab308", // yellow (2nd)
  "#3b82f6", // blue (3rd)
  "#ef4444", // red (4th)
  "#a855f7", // purple (5th)
];

export default function Dashboard() {
  const { season } = useSeason();
  const [stats, setStats] = useState({
    totalWars: 0,
    totalMatches: 0,
    solo: 0,
    duo: 0,
    squad: 0,
    totalPrize: 0,
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [season]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leaderboardRes, graphRes] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get("/dashboard/leaderboard"),
        API.get("/dashboard/graph"),
      ]);

      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
      setGraphData(transformGraphData(graphRes.data));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const transformGraphData = (data) => {
    const dateMap = {};

    data.forEach((team) => {
      team.data.forEach((entry) => {
        if (!dateMap[entry.date]) {
          dateMap[entry.date] = { date: entry.date };
        }
        dateMap[entry.date][team.teamName] = entry.points;
      });
    });

    return Object.values(dateMap);
  };

  const topTeams = leaderboard.slice(0, 5);

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        <h1 className="text-2xl font-bold mb-4">🏆 Season Dashboard</h1>

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          {[
            {
              label: "Total Wars",
              value: stats.totalWars,
              icon: <Trophy size={26} className="text-yellow-400" />,
            },
            {
              label: "Total Matches",
              value: stats.totalMatches,
              icon: <Trophy size={26} className="text-yellow-400" />,
            },
            {
              label: "Solo",
              value: stats.solo,
              icon: <Flame size={26} className="text-red-400" />,
            },
            {
              label: "Duo",
              value: stats.duo,
              icon: <Handshake size={26} className="text-purple-400" />,
            },
            {
              label: "Squad",
              value: stats.squad,
              icon: <Swords size={26} className="text-red-400" />,
            },
            { label: "Total Prize", value: `₹${stats.totalPrize}`, icon: "💰" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"
            >
              <div>
                <p className="text-gray-400">{item.label}</p>
                <h2 className="text-2xl font-bold text-green-400">
                  {item.value}
                </h2>
              </div>

              <div className="text-3xl opacity-80">{item.icon}</div>
            </div>
          ))}
        </div>

        {/* ================= MAIN SPLIT ================= */}
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* ================= GRAPH (LEFT) ================= */}
          <div className="w-2/3 bg-slate-800 p-4 rounded-xl border border-gray-700 flex flex-col">
            <h2 className="mb-2 text-lg font-semibold">
              📈 Top 5 Teams Performance
            </h2>

            <div className="flex-1">
              {isLoading ? (
                <Loader />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    {topTeams.map((team, index) => (
                      <Line
                        key={team.teamName}
                        type="natural"
                        dataKey={team.teamName}
                        stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ================= LEADERBOARD (RIGHT) ================= */}
          <div className="w-1/3 flex justify-center items-start">
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
                <>
                  {/* ================= PODIUM ================= */}
                  <div className="flex justify-center items-end gap-4 mb-6">
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

                  {/* ================= LIST ================= */}
                  <div className="space-y-2">
                    {leaderboard.slice(3).map((team, index) => (
                      <div
                        key={team.teamId || index}
                        className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-gray-700"
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
