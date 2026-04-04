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
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        {/* Left: Header */}
        <h1 className="text-2xl font-bold">📊 Match History</h1>

        {/* Right: Filters */}
        <div className="flex gap-2 relative z-20">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setFilters({ ...filters, date });
            }}
            highlightDates={highlightedDates}
            placeholderText="Select a date"
            className="bg-slate-900 text-white p-2 rounded w-48 border border-white"
            isClearable
          >
            <div className="border-t border-gray-200 mt-2 p-2 text-xs flex flex-row gap-1 bg-white">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-gray-700">Solo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-700">Duo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-700">Squad</span>
              </div>
            </div>
          </DatePicker>
          <select
            className="bg-slate-900 text-white p-2 rounded border border-white"
            value={filters.team}
            onChange={(e) => setFilters({ ...filters, team: e.target.value })}
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t._id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-900 text-white p-2 rounded border border-white"
            value={filters.matchType}
            onChange={(e) =>
              setFilters({ ...filters, matchType: e.target.value })
            }
          >
            <option value="all">All Match Types</option>
            <option value="solo">Solo</option>
            <option value="duo">Duo</option>
            <option value="squad">Squad</option>
          </select>

          <select
            className="bg-slate-900 text-white p-2 rounded border border-white"
            value={filters.warType}
            onChange={(e) =>
              setFilters({ ...filters, warType: e.target.value })
            }
          >
            <option value="all">All War Types</option>
            <option value="placement">Placement</option>
            <option value="placement_kills">Placement + Kills</option>
            <option value="highest_wins">Highest Wins</option>
            <option value="highest_kills">Highest Kills</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-6 text-gray-400 p-3 border-b border-gray-700 sticky top-0 bg-slate-800 z-10">
          <div>Title</div>
          <div>War Type</div>
          <div>Match Type</div>
          <div>Prize</div>
          <div>Winner</div>
          <div>Date</div>
        </div>

        {isLoading ? (
          <Loader message={"Loading Matches..."} />
        ) : (
          <div className="overflow-y-auto flex-1">
            {filteredWars.length > 0 ? (
              filteredWars.map((war) => (
                <div
                  key={war._id}
                  className="grid grid-cols-6 p-3 border-b border-gray-700 items-center text-left"
                >
                  <div>{war.warTitle}</div>
                  <div>{warTypeNames[war.type] || war.type}</div>
                  <div>{matchTypeNames[war.mode] || war.mode}</div>
                  <div>₹{war.prize}</div>
                  <div className="text-green-400">
                    {war?.type === "wins"
                      ? [...new Set(war?.results?.map((el) => el.teamName))].join(", ")
                      : war.winner?.teamName}
                  </div>
                  <div>
                    {new Date(war.endDate).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 p-4">No matches found</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
