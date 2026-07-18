import "./FilterBar.css";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function FilterBar({
  filters,
  setFilters,
  setSearch,
}) {
  const [cities, setCities] =useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    api
      .get("/cities")
      .then((res) => setCities(res.data))
      .catch(console.error);

    api
      .get("/companies")
      .then((res) => setCompanies(res.data))
      .catch(console.error);

    api
      .get("/roles")
      .then((res) => setRoles(res.data))
      .catch(console.error);

    api
      .get("/skills/top")
      .then((res) => {
        const uniqueSkills = [
          ...new Set(res.data.map((item) => item.skill)),
        ];
        setSkills(uniqueSkills);
      })
      .catch(console.error);
  }, []);

  const handleReset = () => {
    setFilters({
      city: "All",
      company: "All",
      role: "All",
      skill: "All",
      workMode: "All",
    });

    setSearch("");
  };

  return (
    <div className="filter-card">
      <div className="filter-header">
        <h2>Dashboard Filters</h2>

        <button
          className="reset-btn"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div className="filter-grid">

        {/* CITY */}
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({
              ...filters,
              city: e.target.value,
            })
          }
        >
          <option value="" disabled>
            Select City
          </option>

          <option value="All">All Cities</option>

          {cities.map((city) => (
            <option
              key={city.location}
              value={city.location}
            >
              {city.location}
            </option>
          ))}
        </select>

        {/* COMPANY */}
        <select
          value={filters.company}
          onChange={(e) =>
            setFilters({
              ...filters,
              company: e.target.value,
            })
          }
        >
          <option value="" disabled>
            Select Company
          </option>

          <option value="All">All Companies</option>

          {companies.map((company) => (
            <option
              key={company.company}
              value={company.company}
            >
              {company.company}
            </option>
          ))}
        </select>

        {/* ROLE */}
        <select
          value={filters.role}
          onChange={(e) =>
            setFilters({
              ...filters,
              role: e.target.value,
            })
          }
        >
          <option value="" disabled>
            Select Role
          </option>

          <option value="All">All Roles</option>

          {roles.map((role) => (
            <option
              key={role.role}
              value={role.role}
            >
              {role.role}
            </option>
          ))}
        </select>

        {/* SKILL */}
        <select
          value={filters.skill}
          onChange={(e) =>
            setFilters({
              ...filters,
              skill: e.target.value,
            })
          }
        >
          <option value="" disabled>
            Select Skill
          </option>

          <option value="All">All Skills</option>

          {skills.map((skill) => (
            <option
              key={skill}
              value={skill}
            >
              {skill}
            </option>
          ))}
        </select>

        {/* WORK MODE */}
        <select
          value={filters.workMode}
          onChange={(e) =>
            setFilters({
              ...filters,
              workMode: e.target.value,
            })
          }
        >
          <option value="" disabled>
            Select Work Mode
          </option>

          <option value="All">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>

      </div>
    </div>
  );
}