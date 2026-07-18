import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../services/api";

const COLORS = [
  "#118DFF",
  "#0F5CBD",
  "#5B8FF9",
  "#8AB8FF",
  "#4E79A7",
];

export default function CityAnalysis({ filters, search }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get("/cities", {
          params: {
            city: filters.city,
            company: filters.company,
            role: filters.role,
            skill: filters.skill,
            workMode: filters.workMode,
            search: search,
          },
        });

        console.log("City API Response:", res.data);

        if (Array.isArray(res.data)) {
          setData([...res.data.slice(0, 5)]);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCities();
  }, [filters, search]);

  console.log("Chart Data:", data);

  return (
    <div className="chart-card">
      <h2>Top Hiring Cities</h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            key={JSON.stringify(data)}
            data={data}
            dataKey="postings"
            nameKey="location"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.location}-${entry.postings}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}