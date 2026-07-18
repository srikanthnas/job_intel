import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";

export default function SalaryByRole() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("/roles")
      .then((res) => setData(res.data))
      .catch(console.error);

  }, []);

  return (

    <div className="analytics-card">

      <h2>Salary by Role</h2>

      <ResponsiveContainer width="100%" height={340}>

        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="role"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={80}
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

          <Bar
            dataKey="avg_salary"
            fill="#2563EB"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}