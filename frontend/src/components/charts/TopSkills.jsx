import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../../services/api";

export default function TopSkills() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/skills/top")
      .then((res) => setData(res.data.slice(0, 10)))
      .catch(console.error);
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        marginTop: "30px",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#111827",
        }}
      >
        Top Skills in Demand
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" />

          <YAxis
            type="category"
            dataKey="skill"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#118DFF"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}