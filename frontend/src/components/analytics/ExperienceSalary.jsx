import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";

export default function ExperienceSalary() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("/salary/experience-trend")
      .then((res) => setData(res.data))
      .catch(console.error);

  }, []);

  return (

    <div className="analytics-card">

      <h2>Salary vs Experience</h2>

      <ResponsiveContainer width="100%" height={340}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="min_experience"
            label={{
              value: "Experience (Years)",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            tickFormatter={(value) =>
              `₹${(value / 100000).toFixed(1)}L`
            }
          />

          <Tooltip
            formatter={(value) =>
              [`₹${Number(value).toLocaleString("en-IN")}`, "Average Salary"]
            }
          />

          <Line
            type="monotone"
            dataKey="avg_salary"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 5 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}