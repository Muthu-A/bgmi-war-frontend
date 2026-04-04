import { Trophy, User, Users, Swords, Flame, Handshake } from "lucide-react";

const TEAM_COLORS = [
  "#22c55e", // green (1st)
  "#eab308", // yellow (2nd)
  "#3b82f6", // blue (3rd)
  "#ef4444", // red (4th)
  "#a855f7", // purple (5th)
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-6 gap-4 mb-4">
      {[
        {
          label: "Total Wars",
          value: stats.totalWars,
          icon: <Trophy size={26} className="text-yellow-400" />,
        },
        {
          label: "Total Matches",
          value: stats.totalMatches,
          icon: <Trophy size={26} className="text-yellow-400" />,
        },
        {
          label: "Solo",
          value: stats.solo,
          icon: <Flame size={26} className="text-red-400" />,
        },
        {
          label: "Duo",
          value: stats.duo,
          icon: <Handshake size={26} className="text-purple-400" />,
        },
        {
          label: "Squad",
          value: stats.squad,
          icon: <Swords size={26} className="text-red-400" />,
        },
        { label: "Total Prize", value: `₹${stats.totalPrize}`, icon: "💰" },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-slate-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"
        >
          <div>
            <p className="text-gray-400">{item.label}</p>
            <h2 className="text-2xl font-bold text-green-400">
              {item.value}
            </h2>
          </div>

          <div className="text-3xl opacity-80">{item.icon}</div>
        </div>
      ))}
    </div>
  );
}