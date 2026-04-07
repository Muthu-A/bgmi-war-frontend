import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSeason } from "../context/SeasonContext";
import Loader from "../components/Loader";

const warTypeNames = {
  placement: "Placement",
  placement_kills: "Placement + Kills",
  highest_wins: "Highest Wins",
  highest_kills: "Hishest Kills",
};

const matchTypeNames = {
  solo: "Solo",
  duo: "Duo",
  squad: "Squad",
};

export default function Matches() {
  const { season } = useSeason();
  const [wars, setWars] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredWars, setFilteredWars] = useState([]);
  const [filters, setFilters] = useState({
    matchType: "all",
    warType: "all",
    date: null,
    team: "all",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTeams = async () => {
    try {
      const res = await API.get("/teams");
      setTeams(res.data);
    } catch (err) {
      // ignore
    }
  };

  const loadWars = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/matches");
      setWars(res.data);
      setFilteredWars(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (wars && wars?.length > 0) {
      let updated = [...wars];

      if (filters.matchType !== "all") {
        updated = updated.filter((w) => w.mode === filters.matchType);
      }

      if (filters.warType !== "all") {
        updated = updated.filter((w) => w.type === filters.warType);
      }

      if (filters.date) {
        updated = updated.filter(
          (w) =>
            new Date(w.endDate).toDateString() ===
            new Date(filters.date).toDateString(),
        );
      }

      if (filters.team !== "all") {
        updated = updated.filter((w) =>
          w.winner?.teamName.toLowerCase().includes(filters.team.toLowerCase()),
        );
      }

      setFilteredWars(updated);
    }
  };

  useEffect(() => {
    loadWars();
    loadTeams();
  }, [season]);

  useEffect(() => {
    applyFilters();
  }, [filters, wars]);
  const highlightedDates = useMemo(() => {
    if (!wars.length) return [];

    // Helper to strip time from dates (crucial for matching)
    const getMidnightDate = (dateStr) => {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    return [
      {
        "match-solo": wars
          .filter((w) => w.mode === "solo")
          .map((w) => getMidnightDate(w.endDate)),
      },
      {
        "match-duo": wars
          .filter((w) => w.mode === "duo")
          .map((w) => getMidnightDate(w.endDate)),
      },
      {
        "match-squad": wars
          .filter((w) => w.mode === "squad")
          .map((w) => getMidnightDate(w.endDate)),
      },
    ];
  }, [wars]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-red-900/20 rounded-2xl p-8 border border-purple-500/20 mb-6">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-purple-400">
            Tournament History
          </h2>
          <p className="text-xl text-gray-300">
            "Track Victories - Analyze Performance - Celebrate Champions"
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{wars.length}</div>
              <div className="text-sm text-gray-400">Total Wars</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{wars.reduce((acc, war) => acc + (war?.matches?.length || 0), 0)}</div>
              <div className="text-sm text-gray-400">Matches Played</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">₹{wars.reduce((acc, war) => acc + parseInt(war.prize || 0), 0)}</div>
              <div className="text-sm text-gray-400">Prize Distributed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Management Tools */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="text-sm font-semibold text-purple-400 mb-1">Performance Analytics</h3>
          <p className="text-gray-400 text-xs">
            Analyze team performance, win rates, and tournament statistics.
          </p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="text-sm font-semibold text-red-400 mb-1">Match Tracking</h3>
          <p className="text-gray-400 text-xs">
            Monitor live matches, update results, and track progress.
          </p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-sm font-semibold text-blue-400 mb-1">Historical Data</h3>
          <p className="text-gray-400 text-xs">
            Access complete tournament history and championship records.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/30 p-6 rounded-xl border border-gray-700 mb-6 relative z-30">
        <h3 className="text-lg font-semibold mb-4 text-purple-400 flex items-center gap-2">
          🎯 Filter Tournaments
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative z-40">
            <label className="block text-sm text-gray-400 mb-2">📅 Date Range</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setFilters({ ...filters, date });
              }}
              highlightDates={highlightedDates}
              placeholderText="Select date"
              className="w-full bg-slate-900 text-white p-2 rounded border border-gray-600 focus:border-purple-500"
              isClearable
              popperClassName="!z-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">👥 Team</label>
            <select
              className="w-full bg-slate-900 text-white p-2 rounded border border-gray-600 focus:border-purple-500"
              value={filters.team}
              onChange={(e) => setFilters({ ...filters, team: e.target.value })}
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t._id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">🎮 Match Type</label>
            <select
              className="w-full bg-slate-900 text-white p-2 rounded border border-gray-600 focus:border-purple-500"
              value={filters.matchType}
              onChange={(e) => setFilters({ ...filters, matchType: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">🏆 War Type</label>
            <select
              className="w-full bg-slate-900 text-white p-2 rounded border border-gray-600 focus:border-purple-500"
              value={filters.warType}
              onChange={(e) => setFilters({ ...filters, warType: e.target.value })}
            >
              <option value="all">All Wars</option>
              <option value="placement">Placement</option>
              <option value="placement_kills">Placement + Kills</option>
              <option value="highest_wins">Highest Wins</option>
              <option value="highest_kills">Highest Kills</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing {filteredWars.length} of {wars.length} tournaments
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-6 text-gray-400 p-4 border-b border-gray-700 bg-slate-900 sticky top-0 z-10 font-semibold">
          <div>Title</div>
          <div>War Type</div>
          <div>Match Type</div>
          <div>Prize</div>
          <div>Winner</div>
          <div>Date</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader message={"Loading Tournament History..."} />
          </div>
        ) : filteredWars.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Tournaments Found</h3>
            <p className="text-gray-500">Start your first championship to see results here!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredWars.map((war) => (
              <div
                key={war._id}
                className="grid grid-cols-6 p-4 items-center hover:bg-slate-700/50 transition-colors text-sm"
              >
                <div className="text-purple-400 font-semibold">{war.warTitle}</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    war.type === 'highest_wins' ? 'bg-yellow-900/50 text-yellow-300' :
                    war.type === 'highest_kills' ? 'bg-red-900/50 text-red-300' :
                    'bg-blue-900/50 text-blue-300'
                  }`}>
                    {warTypeNames[war.type] || war.type}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    war.mode === 'solo' ? 'bg-amber-900/50 text-amber-300' :
                    war.mode === 'duo' ? 'bg-blue-900/50 text-blue-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {matchTypeNames[war.mode] || war.mode}
                  </span>
                </div>
                <div className="text-yellow-400 font-semibold">₹{war.prize}</div>
                <div className="text-green-400">
                  {war?.type === "wins"
                    ? [...new Set(war?.results?.map((el) => el.teamName))].join(", ")
                    : war.winner?.teamName || 'TBD'}
                </div>
                <div className="text-gray-300 text-xs">
                  {new Date(war.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric"
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
