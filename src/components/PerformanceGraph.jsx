import Chart from "react-apexcharts";
import Loader from "./Loader";

const TEAM_COLORS = [
  "#22c55e", // green (1st)
  "#eab308", // yellow (2nd)
  "#3b82f6", // blue (3rd)
  "#ef4444", // red (4th)
  "#a855f7", // purple (5th)
];

const OFFSET_STEP = 0.15;

function formatTooltipValue(value) {
  return Number.isFinite(value) ? value.toFixed(0) : value;
}

export default function PerformanceGraph({ graphData, topTeams, isLoading }) {
  const hasOverlap = graphData && graphData.length > 0 && topTeams.length > 1
    ? graphData.every((row) => {
        const baseValue = row[topTeams[0].teamName] ?? 0;
        return topTeams.every((team) => (row[team.teamName] ?? 0) === baseValue);
      })
    : false;

  const chartData = graphData && graphData.length > 0
    ? graphData.map((row) => {
        const formattedRow = { date: row.date };
        topTeams.forEach((team) => {
          const actualValue = row[team.teamName] ?? 0;
          formattedRow[team.teamName] = actualValue;
          formattedRow[`${team.teamName}_actual`] = actualValue;
        });
        return formattedRow;
      })
    : [];

  const displayData = chartData.length >= 1
    ? [
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          ...Object.fromEntries(topTeams.map((team) => [team.teamName, 0])),
          ...Object.fromEntries(topTeams.map((team) => [`${team.teamName}_actual`, 0])),
        },
        ...chartData,
      ]
    : chartData;

  const series = topTeams.map((team, index) => ({
    name: team.teamName,
    data: displayData.map((row) => {
      const dateObj = new Date(row.date);
      // Add IST offset (+5:30 hours) to display dates correctly
      return {
        x: dateObj.getTime(),
        y: parseFloat(row[team.teamName]) || 0,
        actual: parseFloat(row[`${team.teamName}_actual`]) || 0,
      };
    }),
  }));

  const options = {
    chart: {
      type: "area",
      stacked: false,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
      background: "transparent",
    },
    colors: TEAM_COLORS.slice(0, topTeams.length),
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
        shades: TEAM_COLORS.slice(0, topTeams.length),
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (value, { seriesIndex, dataPointIndex }) => {
          const rowData = displayData[dataPointIndex];
          const teamName = topTeams[seriesIndex].teamName;
          const actualValue = rowData[`${teamName}_actual`];
          return formatTooltipValue(actualValue ?? value);
        },
      },
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        style: {
          colors: '#ffffff'
        },
        formatter: (value) => {
          if (!value) return '';
          const date = new Date(parseInt(value));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },
      },
    },
    yaxis: {
      title: {
        text: "Points",
      },
      labels: {
        style: {
          colors: '#ffffff'
        },
      },
      min: 0,
      forceNiceScale: true,
    },
    grid: {
      borderColor: "#404040",
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: "#e2e8f0",
      },
    },
  };

  return (
    <div className="w-full bg-slate-800 p-4 rounded-xl border border-gray-700 flex flex-col lg:w-2/3">
      <h2 className="mb-2 text-lg font-semibold">
        📈 Top 5 Teams Performance
      </h2>

      <div className="flex-1 min-h-[320px]">
        {isLoading ? (
          <Loader />
        ) : displayData && displayData.length > 0 ? (
          <Chart
            options={options}
            series={series}
            type="area"
            height="100%"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}