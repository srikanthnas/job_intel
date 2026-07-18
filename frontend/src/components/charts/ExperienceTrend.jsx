import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../../services/api";

export default function ExperienceTrend({ filters, search }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchExperienceTrend = async () => {
      try {
        const res = await api.get("/salary/experience-trend", {
          params: {
            ...filters,
            search,
          },
        });

        setData(res.data);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };

    fetchExperienceTrend();
  }, [filters, search]);

  return (
    <div className="chart-card">
      <h2>Average Salary vs Experience</h2>

      <ResponsiveContainer width="100%" height={430}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 35,
            left: 15,
            bottom: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.25}
          />

          <XAxis
            dataKey="experience"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />

          <YAxis
            tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            tick={{ fontSize: 12 }}
            width={60}
          />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Average Salary",
            ]}
            labelFormatter={(value) => `${value} Years`}
          />

          <Line
            type="monotone"
            dataKey="salary"
            stroke="#10B981"
            strokeWidth={4}
            dot={{
              r: 5,
              strokeWidth: 2,
              fill: "#ffffff",
            }}
            activeDot={{
              r: 8,
            }}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}