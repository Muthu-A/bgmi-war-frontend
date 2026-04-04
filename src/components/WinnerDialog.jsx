export default function WinnerDialog({ winnerTeam, setShowWinnerDialog }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-slate-800 p-6 rounded-2xl w-96 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-center mb-4">🏆 Winner</h2>

        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🥇</div>
          <span className="text-xl font-semibold">
            {winnerTeam.teamName}
          </span>
        </div>

        {winnerTeam.players.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {winnerTeam.players.map((p, i) => (
              <div
                key={i}
                className="bg-slate-900 p-3 rounded-lg flex flex-col items-center shadow-md"
              >
                <div className="text-white font-semibold">{p}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mb-4">
            No players found
          </div>
        )}

        <div className="text-center mt-2">
          <button
            className="bg-green-500 px-4 py-2 rounded-lg"
            onClick={() => setShowWinnerDialog(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}