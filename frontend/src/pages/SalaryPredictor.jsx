import "./SalaryPredictor.css";
import { useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { IndianRupee, BriefcaseBusiness } from "lucide-react";

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

const companySizes = [
  "Startup",
  "Mid",
  "Large",
  "Enterprise",
];

const remoteTypes = [
  "On-site",
  "Hybrid",
  "Remote",
];

const education = [
  "B.E/B.Tech",
  "B.Sc",
  "M.Sc",
  "MCA",
  "M.Tech",
  "MBA",
  "PhD",
];

const industries = [
  "IT Services",
  "Fintech",
  "Healthtech",
  "EdTech",
  "E-commerce",
  "Logistics",
  "SaaS",
  "Consulting",
];

const employmentTypes = [
  "Full-time",
  "Internship",
  "Contract",
  "Part-time",
];

export default function SalaryPredictor() {
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState(null);

  const [form, setForm] = useState({
    role: "Data Scientist",
    location: "Bengaluru",
    min_experience: 2,
    max_experience: 4,
    company_size: "Large",
    remote_type: "Hybrid",
    education: "B.E/B.Tech",
    industry: "IT Services",
    employment_type: "Full-time",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function predictSalary() {
    try {
      setLoading(true);

      const res = await api.post("/salary/predict", form);

      console.log(res.data);

      setSalary(res.data.predicted_avg_salary_inr);
    } catch (err) {
      alert("Prediction failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <div className="predictor-page">
          <div className="predictor-card">
            <h1>
              <IndianRupee size={34} />
              Salary Predictor
            </h1>

            <p>
              Predict salaries using the trained Machine Learning model.
            </p>

            <div className="form-grid">
              <div>
                <label>Role</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Location</label>

                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                >
                  {locations.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Minimum Experience</label>

                <input
                  type="number"
                  name="min_experience"
                  value={form.min_experience}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Maximum Experience</label>

                <input
                  type="number"
                  name="max_experience"
                  value={form.max_experience}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Company Size</label>

                <select
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                >
                  {companySizes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Remote Type</label>

                <select
                  name="remote_type"
                  value={form.remote_type}
                  onChange={handleChange}
                >
                  {remoteTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Education</label>

                <select
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                >
                  {education.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Industry</label>

                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                >
                  {industries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Employment Type</label>

                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                >
                  {employmentTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="predict-btn"
              onClick={predictSalary}
              disabled={loading}
            >
              <BriefcaseBusiness size={20} />

              {loading ? "Predicting..." : "Predict Salary"}
            </button>

            {salary && (
              <div className="salary-result">
                <h3>Predicted Salary</h3>

                <h2>
                  ₹ {Number(salary).toLocaleString("en-IN")}
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}