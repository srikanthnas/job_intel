import { useEffect, useState } from "react";

import api from "../../services/api";

export default function ModelMetrics() {

  const [metrics,setMetrics]=useState(null);

  useEffect(()=>{

    api
      .get("/model/metrics")
      .then(res=>setMetrics(res.data))
      .catch(console.error);

  },[]);

  if(!metrics){

    return(

<div className="analytics-card">

Loading...

</div>

);

  }

  const gb=metrics.results.GradientBoosting;

  return(

<div className="analytics-card">

<h2>Model Performance</h2>

<h3>{metrics.best_model}</h3>

<p><b>R²</b> : {gb.R2}</p>

<p><b>MAE</b> : ₹{Number(gb.MAE).toLocaleString()}</p>

<p><b>RMSE</b> : ₹{Number(gb.RMSE).toLocaleString()}</p>

<p><b>Training Samples</b> : {metrics.train_size}</p>

<p><b>Testing Samples</b> : {metrics.test_size}</p>

</div>

);

}