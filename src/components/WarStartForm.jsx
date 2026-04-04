export default function WarStartForm({ form, setForm, startWar }) {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full">
        <h2 className="mb-4 text-lg font-semibold text-center">
          Start New War
        </h2>

        {form.type === "wins"
          ? ["title", "prize", "sponsors"].map((field, i) => (
              <input
                key={i}
                type={field.includes("Prize") ? "number" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full mb-3 p-2 bg-slate-900 rounded"
                value={form[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field]: field.includes("Prize")
                      ? Number(e.target.value)
                      : e.target.value,
                  })
                }
              />
            ))
          : ["title", "warPoints", "prize", "sponsors"].map((field, i) => (
              <input
                key={i}
                type={
                  field.includes("Points") || field.includes("Prize")
                    ? "number"
                    : "text"
                }
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full mb-3 p-2 bg-slate-900 rounded"
                value={form[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field]:
                      field.includes("Points") || field.includes("Prize")
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
              />
            ))}

        <select
          className="w-full mb-3 p-2 bg-slate-900 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="placement">Placement</option>
          <option value="placement_kills">Placement + Kills</option>
          <option value="highest_wins">Highest Wins</option>
          <option value="highest_kills">Highest Kills</option>
          <option value="wins">Wins</option>
        </select>

        <select
          className="w-full mb-3 p-2 bg-slate-900 rounded"
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        >
          <option value="solo">Solo</option>
          <option value="duo">Duo</option>
          <option value="squad">Squad</option>
        </select>

        <button
          onClick={startWar}
          className="bg-green-500 px-4 py-2 rounded w-full"
        >
          Start War
        </button>
      </div>
    </div>
  );
}