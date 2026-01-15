import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const COLORS = {
  Available: "#4caf50",
  Booked: "#ff9800",
  Sold: "#2196f3",
  Cancelled: "#9e9e9e"
};

export default function PlotStatusDonut({ stat }) {
  if (!stat) return null;

  const data = [
    { name: "Available", value: stat.available },
    { name: "Booked", value: stat.booked },
    { name: "Sold", value: stat.sold },
    { name: "Cancelled", value: stat.cancelled }
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius="65%"
          outerRadius="85%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map(entry => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name]}
            />
          ))}
        </Pie>

        {/* ✅ Tooltip on hover */}
        <Tooltip
          formatter={(value, name) => [`${value} plots`, name]}
        />

        {/* ✅ Center Total */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan
            x="50%"
            dy="-2"
            fontSize="20"
            fontWeight="600"
          >
            {stat.total}
          </tspan>
          <tspan
            x="50%"
            dy="18"
            fontSize="12"
            fill="#777"
          >
            Total Plots
          </tspan>
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
