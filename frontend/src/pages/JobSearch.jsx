import "./JobSearch.css";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { Search, MapPin, BriefcaseBusiness } from "lucide-react";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
  "ML Engineer",
  "AI Research Engineer",
  "Business Analyst",
  "QA Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Product Manager",
  "UI/UX Designer",
];

const locations = [
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Delhi NCR",
  "Ahmedabad",
  "Kochi",
  "Kolkata",
  "Remote",
];

export default function JobSearch() {
  const [role, setRole] = useState("Data Scientist");
  const [location, setLocation] = useState("Bengaluru");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchJobs() {
    try {
      setLoading(true);

      const res = await api.get("/jobs/search", {
        params: {
          role,
          location,
          limit: 20,
        },
      });

      console.log("Jobs:", res.data);
      console.log("Skills:", res.data[0]?.skills);

      setJobs(res.data);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch jobs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <div className="job-page">
          <div className="job-card">
            <h1>
              <Search size={34} />
              Job Search
            </h1>

            <p>Search jobs from the analyzed dataset.</p>

            <div className="search-grid">
              <div>
                <label>Role</label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Location</label>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {locations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="search-btn"
              onClick={searchJobs}
              disabled={loading}
            >
              <Search size={18} />
              {loading ? "Searching..." : "Search Jobs"}
            </button>

            {!loading && jobs.length === 0 && (
              <div className="no-jobs">
                <h2>📭 No Jobs Found</h2>
                <p>Select a role and location, then click Search Jobs.</p>
              </div>
            )}

            {jobs.length > 0 && (
              <>
                <div className="jobs-found">
                  {jobs.length} Jobs Found
                </div>

                <div className="jobs-list">
                  {jobs.map((job) => {
                    const rawSkills = String(job.skills ?? "")
                      .replace(/[\[\]'"]/g, "");

                    const skills = rawSkills
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0);

                       console.log("Parsed Skills:", skills);

                    return (
                      <div
                        key={job.job_id}
                        className="job-item"
                      >
                        <div className="job-top">
                          <div>
                            <h2>{job.company}</h2>
                            <h3>{job.role}</h3>
                          </div>

                          <div className="salary-tag">
                            ₹
                            {(
                              ((job.salary_min + job.salary_max) / 2) /
                              100000
                            ).toFixed(1)}
                            {" "}LPA
                          </div>
                        </div>

                        <div className="job-details">
                          <span>
                            <MapPin size={16} />
                            {job.location}
                          </span>

                          <span>
                            <BriefcaseBusiness size={16} />
                            {job.min_experience}-{job.max_experience} Years
                          </span>
                        </div>

                        <div className="skills">
                          {skills.length > 0 ? (
                            skills.map((skill, index) => (
                              <span
                                key={index}
                                className="skill-chip"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="skill-chip">
                              No Skills Listed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}