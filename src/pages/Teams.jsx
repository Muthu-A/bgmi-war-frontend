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

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/teams");
      setTeams(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

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
      } catch (err) {
        console.error(err);
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl p-8 border border-blue-500/20 mb-6">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-3xl font-bold text-green-400">
            Team Management Hub
          </h2>
          <p className="text-xl text-gray-300">
            "Build Elite Squads - Manage Players & Formations"
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{teams.length}</div>
              <div className="text-sm text-gray-400">Active Teams</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{teams.reduce((acc, team) => acc + team.players.length, 0)}</div>
              <div className="text-sm text-gray-400">Total Players</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{teams.filter(team => team.backup).length}</div>
              <div className="text-sm text-gray-400">Backup Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Tools */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="text-sm font-semibold text-blue-400 mb-1">Team Creation</h3>
          <p className="text-gray-400 text-xs">
            Register new teams with player rosters and backup members.
          </p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-sm font-semibold text-green-400 mb-1">Player Management</h3>
          <p className="text-gray-400 text-xs">
            Update squad compositions and track player assignments.
          </p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-gray-700">
          <div className="text-2xl mb-2">📤</div>
          <h3 className="text-sm font-semibold text-purple-400 mb-1">Bulk Operations</h3>
          <p className="text-gray-400 text-xs">
            Import teams via Excel and manage multiple registrations.
          </p>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">👥 Elite Squads</h1>
          <p className="text-gray-400 text-sm">Manage tournament participants and player rosters</p>
        </div>

        <div className="flex gap-3">
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="bulkUpload"
          />

          <label
            htmlFor="bulkUpload"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            📤 Bulk Import
          </label>
          <Button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ➕ New Team
          </Button>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="bg-slate-800/30 p-4 rounded-xl border border-gray-700 mb-6">
        <div className="flex gap-4 items-center">
          <div className="text-2xl">🔍</div>
          <input
            type="text"
            placeholder="Search teams by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <div className="text-sm text-gray-400">
            {filteredTeams.length} of {teams.length} teams
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-5 text-gray-400 p-4 border-b border-gray-700 bg-slate-900 sticky top-0 z-10 font-semibold">
          <div>Team Name</div>
          <div>Players</div>
          <div>Backup</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader message={"Loading Elite Squads..."} />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Teams Found</h3>
            <p className="text-gray-500">Start building your championship squads!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredTeams.map((team) => (
              <div
                key={team._id}
                className="grid grid-cols-5 p-4 items-center hover:bg-slate-700/50 transition-colors"
              >
                <div className="text-blue-400 font-semibold">{team.name}</div>
                <div className="text-sm text-gray-300">{team.players.join(", ")}</div>
                <div className="text-sm text-gray-300">{team.backup || "—"}</div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    team.players.filter(p => p.trim()).length === 4 && team.backup
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {team.players.filter(p => p.trim()).length === 4 && team.backup ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex gap-3 justify-center">
                  <Pencil
                    onClick={() => openEdit(team)}
                    className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
                    size={18}
                  />
                  <Trash2
                    onClick={() => handleDelete(team._id)}
                    className="cursor-pointer text-red-400 hover:text-red-300 transition-colors"
                    size={18}
                  />
                </div>
              </div>
            ))}
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
