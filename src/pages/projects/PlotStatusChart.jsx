import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";

const COLORS = {
  Available: "#28a745",
  Booked: "#ffc107",
  Sold: "#0d6efd",
  Cancelled: "#6c757d"
};

export default function PlotStatusChart({ data }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name]}
              />
            ))}

            {/* VALUE LABELS */}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fontSize: 12, fill: "#000", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
