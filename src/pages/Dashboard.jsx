import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useSeason } from "../context/SeasonContext";
import StatsCards from "../components/StatsCards";
import PerformanceGraph from "../components/PerformanceGraph";
import DashboardLeaderboard from "../components/DashboardLeaderboard";

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

  useEffect(() => {
    loadDashboard();
  }, [season]);

  const transformGraphData = (data) => {
    // Collect all unique dates
    const allDates = new Set();
    const teamDataMap = {};

    data.forEach((team) => {
      teamDataMap[team.teamName] = {};
      team.data.forEach((entry) => {
        allDates.add(entry.date);
        teamDataMap[team.teamName][entry.date] = entry.points;
      });
    });

    const sortedDates = Array.from(allDates).sort();

    // For each team, fill in missing dates with last known value
    const result = sortedDates.map((date) => {
      const row = { date };
      Object.keys(teamDataMap).forEach((teamName) => {
        if (teamDataMap[teamName][date] !== undefined) {
          row[teamName] = teamDataMap[teamName][date];
        } else {
          // Find the last date before this one that has data
          const prevDates = sortedDates.filter(d => d <= date && teamDataMap[teamName][d] !== undefined);
          const lastValue = prevDates.length > 0 ? teamDataMap[teamName][prevDates[prevDates.length - 1]] : 0;
          row[teamName] = lastValue;
        }
      });
      return row;
    });

    return result;
  };

  const topTeams = leaderboard.slice(0, 5);

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        <h1 className="text-2xl font-bold mb-4">🏆 Season Dashboard</h1>

        <StatsCards stats={stats} />

        {/* ================= MAIN SPLIT ================= */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          <PerformanceGraph
            graphData={graphData}
            topTeams={topTeams}
            isLoading={isLoading}
          />

          <DashboardLeaderboard leaderboard={leaderboard} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
}
