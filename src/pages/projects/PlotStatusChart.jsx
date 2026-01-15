import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = {
  Available: "#28a745",
  Booked: "#ffc107",
  Sold: "#0d6efd",
  Cancelled: "#6c757d"
};

export default function PlotStatusDonut({ stat }) {
  const data = [
    { name: "Available", value: stat.available },
    { name: "Booked", value: stat.booked },
    { name: "Sold", value: stat.sold },
    { name: "Cancelled", value: stat.cancelled }
  ];

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
