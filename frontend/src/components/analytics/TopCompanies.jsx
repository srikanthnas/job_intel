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

export default function TopCompanies() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("/companies")
      .then(res => setData(res.data))
      .catch(console.error);

  }, []);

  return (

    <div className="analytics-card">

      <h2>Top Companies</h2>

      <ResponsiveContainer width="100%" height={340}>

        <BarChart data={data.slice(0,10)}>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis
            dataKey="company"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={90}
          />

          <YAxis/>

          <Tooltip/>

          <Bar
            dataKey="postings"
            fill="#F59E0B"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}