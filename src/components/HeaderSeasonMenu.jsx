import { useState } from "react";
import API from "../services/api";
import { useSeason } from "../context/SeasonContext";
import toast from "react-hot-toast";

export default function HeaderSeasonMenu({ isOpen }) {
  const { season, setSeason, seasons, loadSeasons } = useSeason();

  const [seasonName, setSeasonName] = useState("");
  const [loading, setLoading] = useState(false);

  const activeSeason = seasons.find((s) => s.status === "active");

  // 🔥 START SEASON
  const handleStart = async () => {
    if (!seasonName.trim()) {
      return toast.error("Enter season name");
    }

    const exists = seasons.some(
      (s) => s.name.toLowerCase() === seasonName.toLowerCase()
    );
    if (exists) {
      return toast.error("Season already exists");
    }

    if (activeSeason) {
      return toast.error("End current season first");
    }

    try {
      setLoading(true);

      const res = await API.post("/seasons/start", {
        name: seasonName,
      });

      const newSeason = res.data;

      setSeason(newSeason);
      localStorage.setItem("season", JSON.stringify(newSeason));

      setSeasonName("");
      await loadSeasons();

      toast.success("Season started 🚀");
    } catch (err) {
      toast.error("Failed to start season");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 END SEASON
  const handleEnd = async () => {
    if (!activeSeason) {
      return toast.error("No active season");
    }

    try {
      setLoading(true);

      await API.post("/seasons/end");
      await loadSeasons();

      toast.success("Season ended 🛑");
    } catch (err) {
      toast.error("Failed to end season");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SWITCH SEASON
  const handleChange = (id) => {
    const selected = seasons.find((s) => s._id === id);

    setSeason(selected);
    localStorage.setItem("season", JSON.stringify(selected));

    toast.success(`Switched to ${selected.name}`);
  };

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-gray-700 rounded-xl p-4 z-50 shadow-lg">

          {/* Dropdown */}
          <select
            className="w-full mb-3 p-2 bg-slate-900 text-white border border-white rounded"
            value={season?._id || ""}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select Season</option>
            {seasons.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} {s.status === "active" ? "(Active)" : ""}
              </option>
            ))}
          </select>

          {/* Input ONLY if no active season */}
          {!activeSeason && (
            <input
              type="text"
              placeholder="Enter season name"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
              className="w-full mb-3 p-2 bg-slate-900 text-white border border-white rounded placeholder-gray-400"
            />
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            {/* ✅ Show START only if NO active season */}
            {!activeSeason && (
              <button
                onClick={handleStart}
                disabled={loading}
                className={`w-full px-3 py-1 rounded ${
                  loading
                    ? "bg-gray-500"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Start Season
              </button>
            )}

            {/* ✅ Show END only if active season exists */}
            {activeSeason && (
              <button
                onClick={handleEnd}
                disabled={loading}
                className={`w-full px-3 py-1 rounded ${
                  loading
                    ? "bg-gray-500"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                End Season
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}