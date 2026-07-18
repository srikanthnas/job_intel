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

export default function TopCities() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("/cities")
      .then(res => setData(res.data))
      .catch(console.error);

  }, []);

  return (

    <div className="analytics-card">

      <h2>Top Hiring Cities</h2>

      <ResponsiveContainer width="100%" height={340}>

        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis
            dataKey="location"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={70}
          />

          <YAxis/>

          <Tooltip/>

          <Bar
            dataKey="postings"
            fill="#10B981"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}