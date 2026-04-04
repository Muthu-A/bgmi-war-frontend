import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "./Loader";

const TEAM_COLORS = [
  "#22c55e", // green (1st)
  "#eab308", // yellow (2nd)
  "#3b82f6", // blue (3rd)
  "#ef4444", // red (4th)
  "#a855f7", // purple (5th)
];

export default function PerformanceGraph({ graphData, topTeams, isLoading }) {
  return (
    <div className="w-2/3 bg-slate-800 p-4 rounded-xl border border-gray-700 flex flex-col">
      <h2 className="mb-2 text-lg font-semibold">
        📈 Top 5 Teams Performance
      </h2>

      <div className="flex-1">
        {isLoading ? (
          <Loader />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              {topTeams.map((team, index) => (
                <Line
                  key={team.teamName}
                  type="natural"
                  dataKey={team.teamName}
                  stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}