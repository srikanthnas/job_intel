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

export default function MonthlyTrend({ filters, search }) {

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
    console.log(JSON.stringify(res.data.slice(0, 3)));
    setData(res.data);
    })
    .catch(console.error);
}, [filters, search]);

  return (

    <div className="analytics-card">

      <h2 style={{ color: "red" }}>
          MONTHLY CHART CHANGED
      </h2>

      <ResponsiveContainer width="100%" height={340}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis
            dataKey="month"
          />

          <YAxis/>

          <Tooltip/>

          <Line
            type="monotone"
            dataKey="postings"
            stroke="#2563EB"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}