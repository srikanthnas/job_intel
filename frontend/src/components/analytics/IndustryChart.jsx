import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";

import api from "../../services/api";

export default function IndustryChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/companies")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="analytics-card">
      <h2>Industry Distribution</h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="industry"
            outerRadius={110}
          />

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}