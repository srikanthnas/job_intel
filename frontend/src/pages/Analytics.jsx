import { useState } from "react";
import "./Analytics.css";

import Sidebar from "../components/Sidebar";

import SalaryByRole from "../components/analytics/SalaryByRole";
import ExperienceSalary from "../components/analytics/ExperienceSalary";
import TopCities from "../components/analytics/TopCities";
import TopCompanies from "../components/analytics/TopCompanies";
import MonthlyTrend from "../components/analytics/MonthlyTrend";
import TopSkills from "../components/analytics/TopSkills";
import ModelMetrics from "../components/analytics/ModelMetrics";
import SkillForecast from "../components/charts/SkillForecast";

export default function Analytics() {

    const [filters] = useState({
        city: "All",
        company: "All",
        role: "All",
        skill: "All",
        workMode: "All",
    });

    const [search] = useState("");

    return (
        <div className="analytics-layout">

            <Sidebar />

            <div className="analytics-content">

                <div className="analytics-header">
                    <h1>📊 Analytics Dashboard</h1>

                    <p>
                        AI-powered market intelligence and hiring analytics.
                    </p>
                </div>

                <div className="analytics-grid">

                    <SalaryByRole />

                    <ExperienceSalary />

                    <TopCities />

                    <TopCompanies />

                    <MonthlyTrend
                        filters={filters}
                        search={search}
                    />

                    <TopSkills />

                    <ModelMetrics />

                    <SkillForecast
                        filters={filters}
                        search={search}
                    />

                </div>

            </div>

        </div>
    );
}