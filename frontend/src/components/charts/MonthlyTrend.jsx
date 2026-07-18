import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../../services/api";

export default function MonthlyTrend({
    filters = {
        city: "All",
        company: "All",
        role: "All",
        skill: "All",
        workMode: "All",
    },
    search = "",
}) {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
        .get("/trends/monthly", {
            params: {
                city: filters.city,
                company: filters.company,
                role: filters.role,
                skill: filters.skill,
                workMode: filters.workMode,
                search: search,
            },
        })
        .then((res) => {
            console.table(res.data);
            setData(res.data);
        })
        .catch(console.error);
}, [filters, search]);

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
        Monthly Hiring Trend
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="postings"
            stroke="#118DFF"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}