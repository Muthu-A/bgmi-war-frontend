import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const [season, setSeason] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const loadSeasons = async () => {
    try {
      const res = await API.get("/seasons");
      const data = res.data;

      setSeasons(data);

      // ✅ 1. Check localStorage FIRST
      const savedSeason = JSON.parse(localStorage.getItem("season"));

      if (savedSeason) {
        const exists = data.find((s) => s._id === savedSeason._id);

        if (exists) {
          setSeason(exists);
          return; // 🔥 STOP here
        }
      }

      // ✅ 2. fallback → active season
      const active = data.find((s) => s.status === "active");

      if (active) {
        setSeason(active);
        localStorage.setItem("season", JSON.stringify(active));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  return (
    <SeasonContext.Provider
      value={{ season, setSeason, seasons, loadSeasons }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => useContext(SeasonContext);