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

export default function SkillForecast({ filters, search }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await api.get("/skills/forecast", {
          params: {
            ...filters,
            search,
          },
        });

        const chartData = res.data
          .map((item) => ({
            skill: item.skill,
            projection: item.next_3_months_projection[2],
          }))
          .sort((a, b) => b.projection - a.projection)
          .slice(0, 10);

        setData(chartData);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };

    fetchForecast();
  }, [filters, search]);

  const colors = [
    "#7C3AED",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#7C3AED",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#7C3AED",
    "#8B5CF6",
  ];

  return (
    <div className="chart-card">
      <h2>Top Skill Demand Forecast</h2>

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
            dataKey="skill"
            width={160}
            tick={{
              fontSize: 13,
              fill: "#374151",
            }}
          />

          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            formatter={(value) => [value, "Projected Demand"]}
          />

          <Bar
            dataKey="projection"
            radius={[0, 8, 8, 0]}
            isAnimationActive
          >
            {data.map((item, index) => (
              <Cell
                key={item.skill}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}