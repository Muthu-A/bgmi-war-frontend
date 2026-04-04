import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { Pencil, Trash2, X, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import Button from "../components/Button";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    players: ["", "", "", ""],
    backup: "",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/teams");
      setTeams(res.data);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      players: ["", "", "", ""],
      backup: "",
    });
    setIsEdit(false);
    setSelectedId(null);
  };

  const handleChange = (index, value) => {
    const updated = [...form.players];
    updated[index] = value;
    setForm({ ...form, players: updated });
  };

  // 🔹 OPEN ADD
  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // 🔹 OPEN EDIT
  const openEdit = (team) => {
    setForm({
      name: team.name,
      players: team.players,
      backup: team.backup,
    });
    setSelectedId(team._id);
    setIsEdit(true);
    setShowModal(true);
  };

  // SAVE (ADD / EDIT)
  const handleSave = async () => {
    try {
      //FE validation
      if (!form.name.trim()) {
        return toast.error("Team name is required");
      }

      if (form.players.some((p) => !p.trim())) {
        return toast.error("All 4 players are required");
      }

      const allPlayers = [...form.players, form.backup].filter(Boolean);
      const uniquePlayers = new Set(
        allPlayers.map((p) => p.toLowerCase().trim()),
      );

      if (uniquePlayers.size !== allPlayers.length) {
        return toast.error("Duplicate players not allowed");
      }

      const exists = teams.some(
        (t) =>
          t.name.toLowerCase().trim() === form.name.toLowerCase().trim() &&
          t._id !== selectedId,
      );

      if (exists) {
        return toast.error("Team name already exists");
      }
      setIsAddLoading(true);
      //API
      if (isEdit) {
        await API.put(`/teams/${selectedId}`, form);
        toast.success("Team updated successfully");
      } else {
        await API.post("/teams", form);
        toast.success("Team added successfully");
      }
      setIsAddLoading(false);
      loadTeams();
      resetForm();
      setShowModal(false);
    } catch (err) {
      //Backend error handling
      setIsAddLoading(false);
      const message = err.response?.data?.error || "Something went wrong";

      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/teams/${id}`);
      toast.success("Team deleted successfully");
      loadTeams();
    } catch (err) {
      const message = err.response?.data?.error || "Delete failed";

      toast.error(message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Transform data
      const teamsData = jsonData.map((row) => ({
        name: row.Team,
        players: [row.Player1, row.Player2, row.Player3, row.Player4],
        backup: row.Backup,
      }));

      // Send to backend
      setIsAddLoading(true);
      try {
        await API.post("/teams/bulk", teamsData);
        setIsAddLoading(false);
        loadTeams();
      } catch (e) {
        setIsAddLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👥 War Teams</h1>
        <div>
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="bulkUpload"
          />

          <label
            htmlFor="bulkUpload"
            className="bg-blue-500 px-4 py-2 rounded cursor-pointer ml-2"
          >
            Upload Excel
          </label>
          <Button
            onClick={openAdd}
            className="bg-green-500 px-4 py-2 rounded ml-2"
          >
            {"+ Add Team"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-2 bg-slate-800 rounded outline-none"
      />

      {/* Table */}
      <div className="bg-slate-800 rounded-xl h-[calc(100vh-240px)] flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-4 text-gray-400 p-3 border-b border-gray-700 sticky top-0 bg-slate-800 z-10">
          <div>Team</div>
          <div>Players</div>
          <div>Backup</div>
          <div className="text-center">Actions</div>
        </div>

        {isLoading ? (
          <Loader message={"Loading Teams..."} />
        ) : (
          <div className="overflow-y-auto flex-1">
            {filteredTeams.map((team) => (
              <div
                key={team._id}
                className="grid grid-cols-4 p-3 border-b border-gray-700 items-center"
              >
                <div>{team.name}</div>

                <div className="truncate">{team.players.join(", ")}</div>

                <div>{team.backup}</div>

                <div className="flex gap-3 justify-center">
                  <Pencil
                    onClick={() => openEdit(team)}
                    className="cursor-pointer text-blue-400"
                    size={18}
                  />

                  <Trash2
                    onClick={() => handleDelete(team._id)}
                    className="cursor-pointer text-red-400"
                    size={18}
                  />
                </div>
              </div>
            ))}

            {filteredTeams.length === 0 && (
              <p className="text-gray-400 p-4">No teams found</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl w-[400px] relative z-50">
            {/* Close */}
            <X
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setShowModal(false)}
            />

            {/* Title */}
            <h2 className="mb-4 text-lg font-semibold">
              {isEdit ? "Edit Team" : "Add Team"}
            </h2>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Team Name
                </label>
                <input
                  className="w-full p-2 bg-slate-900 rounded"
                  placeholder="Enter team name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Players */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Squad Members
                </label>

                {form.players.map((p, i) => (
                  <input
                    key={i}
                    className="w-full mb-2 p-2 bg-slate-900 rounded"
                    placeholder={`Player ${i + 1}`}
                    value={p}
                    onChange={(e) => handleChange(i, e.target.value)}
                  />
                ))}
              </div>

              {/* Backup */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Backup Player
                </label>
                <input
                  className="w-full p-2 bg-slate-900 rounded"
                  placeholder="Enter backup player"
                  value={form.backup}
                  onChange={(e) => setForm({ ...form, backup: e.target.value })}
                />
              </div>

              {/* Button */}
              <Button
                loading={isAddLoading}
                onClick={handleSave}
                className={`px-4 py-2 rounded w-full mt-2 ${
                  isEdit ? "bg-blue-500" : "bg-green-500"
                }`}
              >
                {isEdit ? "Update Team" : "Save Team"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
