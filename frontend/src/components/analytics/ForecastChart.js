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

export default function ForecastChart(){

const [data,setData]=useState([]);

useEffect(()=>{

api
.get("/skills/forecast")
.then(res=>{

const chartData=res.data.map(item=>({

skill:item.skill,

projection:item.next_3_months_projection[2]

}));

setData(chartData);

})
.catch(console.error);

},[]);

return(

<div className="analytics-card">

<h2>Skill Demand Forecast</h2>

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
dataKey="projection"
fill="#F43F5E"
radius={[8,8,0,0]}
/>

</BarChart>

</ResponsiveContainer>

</div>

);

}