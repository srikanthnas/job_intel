import "./Dashboard.css";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import api from "../services/api";

import Sidebar from "../components/Sidebar";
import KPICard from "../components/KPICard";
import FilterBar from "../components/FilterBar";

import MonthlyTrend from "../components/charts/MonthlyTrend";
import SkillForecast from "../components/charts/SkillForecast";
import CityAnalysis from "../components/charts/CityAnalysis";
import CompanyAnalysis from "../components/charts/CompanyAnalysis";
import RoleAnalysis from "../components/charts/RoleAnalysis";
import ExperienceTrend from "../components/charts/ExperienceTrend";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);

  const [filters, setFilters] = useState({
    city: "All",
    company: "All",
    role: "All",
    skill: "All",
    workMode: "All",
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get("/kpis", {
          params: {
            ...filters,
            search,
          },
        });

        setKpis(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchKPIs();
  }, [filters, search]);

  const formatLPA = (salary) => {
    if (!salary) return "₹0 LPA";
    return `₹${(salary / 100000).toFixed(1)} LPA`;
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  if (!kpis) {
    return <h2 style={{ padding: 40 }}>Loading...</h2>;
  }

  const cards = [
    {
      title: "Total Jobs",
      value: kpis.total_postings,
    },
    {
      title: "Average Salary",
      value: formatLPA(kpis.avg_salary),
    },
    {
      title: "Companies",
      value: kpis.unique_companies,
    },
    {
      title: "Cities",
      value: kpis.unique_cities,
    },
    {
      title: "Roles",
      value: kpis.unique_roles,
    },
    {
      title: "Remote Jobs",
      value: `${kpis.remote_pct}%`,
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">

        <div className="dashboard-header">

          <div className="dashboard-title">
            <h1>Job Market Intelligence Dashboard</h1>
            <p>AI Powered Job Market Analytics Platform</p>
          </div>

          <div className="dashboard-actions">

            <div className="search-container">

              <Search
                size={18}
                style={{ cursor: "pointer" }}
                onClick={handleSearch}
              />

              <input
                className="search-box"
                placeholder="Search Company, Role, Skill or City..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

            </div>

            

            <div className="profile">S</div>

          </div>

        </div>

        <FilterBar
          filters={filters}
          setFilters={setFilters}
          setSearch={setSearch}
        />

        <div className="kpi-grid">
          {cards.map((card) => (
            <KPICard
              key={card.title}
              title={card.title}
              value={card.value}
            />
          ))}
        </div>

        <div className="chart-grid">

          <MonthlyTrend
            filters={filters}
            search={search}
          />

          <SkillForecast
            filters={filters}
            search={search}
          />

        </div>

        <div className="analysis-grid">

          <CityAnalysis
            filters={filters}
            search={search}
          />

          <CompanyAnalysis
            filters={filters}
            search={search}
          />

        </div>

        <div className="analysis-grid">

          <RoleAnalysis
            filters={filters}
            search={search}
          />

          <ExperienceTrend
            filters={filters}
            search={search}
          />

        </div>

      </div>
    </div>
  );
}