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

export default function TopSkills() {

  const [data,setData]=useState([]);

  useEffect(()=>{

    api
      .get("/skills/top")
      .then(res=>setData(res.data.slice(0,10)))
      .catch(console.error);

  },[]);

  return(

<div className="analytics-card">

<h2>Top Skills Demand</h2>

<ResponsiveContainer width="100%" height={340}>

<BarChart data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis
dataKey="skill"
angle={-20}
textAnchor="end"
interval={0}
height={80}
/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="count"
fill="#7C3AED"
radius={[8,8,0,0]}
/>

</BarChart>

</ResponsiveContainer>

</div>

);

}