export default function EndWarPopup({
  tieTeams,
  selectedWinner,
  setSelectedWinner,
  confirmEndWar,
  setShowEndPopup,
  war,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-slate-800 p-6 rounded-2xl w-96 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          ⚠️ End War Confirmation
        </h2>

        {tieTeams.length > 1 && war.type !== "wins" ? (
          <>
            <p className="text-sm text-gray-300 mb-3 text-center">
              Multiple teams have same points. Select winner:
            </p>

            <select
              className="w-full p-2 mb-4 bg-slate-900 border border-white rounded"
              value={selectedWinner}
              onChange={(e) => setSelectedWinner(e.target.value)}
            >
              <option value="">Select Team</option>
              {tieTeams.map((t) => (
                <option key={t.teamId} value={t.teamName}>
                  {t.teamName} ({t.points} pts)
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="text-center text-gray-300 mb-4">
            Are you sure you want to end the war?
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowEndPopup(false)}
            className="w-full bg-gray-600 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={confirmEndWar}
            disabled={war.type !== "wins" && !selectedWinner}
            className={`w-full py-2 rounded ${
              selectedWinner ? "bg-red-600 hover:bg-red-700" : "bg-gray-500"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}