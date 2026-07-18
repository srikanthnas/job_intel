import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import api from "../../services/api";

export default function CompanyAnalysis({ filters, search }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/companies", {
          params: {
            ...filters,
            search,
          },
        });

        if (Array.isArray(res.data)) {
          setData(res.data.slice(0, 10));
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };

    fetchCompanies();
  }, [filters, search]);

  const colors = [
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#2563EB",
    "#3B82F6",
  ];

  return (
    <div className="chart-card">
      <h2>Top Hiring Companies</h2>

      <ResponsiveContainer width="100%" height={430}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 35,
            left: 35,
            bottom: 10,
          }}
          barCategoryGap={14}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />

          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            type="category"
            dataKey="company"
            width={180}
            tick={{
              fontSize: 13,
              fill: "#374151",
            }}
          />

          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            formatter={(value) => [value, "Postings"]}
          />

          <Bar
            dataKey="postings"
            radius={[0, 8, 8, 0]}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.company}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}