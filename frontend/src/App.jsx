import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import SalaryPredictor from "./pages/SalaryPredictor";
import SkillGap from "./pages/SkillGap";
import JobSearch from "./pages/JobSearch";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/predictor" element={<SalaryPredictor />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/jobs" element={<JobSearch />} />
      </Routes>
    </BrowserRouter>
  );
}