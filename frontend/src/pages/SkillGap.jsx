// SkillGap.jsx
import "./SkillGap.css";
import { useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Upload,
} from "lucide-react";

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

export default function SkillGap() {
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);

  async function analyzeResume() {
    if (!resumeFile) {
      alert("Please choose a PDF or DOCX resume.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("target_role", targetRole);

      const res = await api.post("/skill-gap/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Backend Response:", res.data);
      setResult(res.data);
    } catch (err) {
      console.error(err);

      console.log("Status:", err.response?.status);
      console.log("Response:", err.response?.data);

      alert(
        err.response?.data?.error || "Skill Gap Analysis failed."
      );
    }finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <div className="skill-page">
          <div className="skill-card">

            <div className="page-header">
              <BrainCircuit size={36} />
              <div>
                <h1>Skill Gap Analyzer</h1>
                <p>Upload your resume and compare it with industry requirements.</p>
              </div>
            </div>

            <div className="form-section">
              <div className="input-group">
                <label>Target Role</label>

                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Upload Resume</label>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />

                {resumeFile && (
                  <p style={{ marginTop: 12, color: "#2563EB", fontWeight: 600 }}>
                    📄 {resumeFile.name}
                  </p>
                )}
              </div>

              <button
                className="analyze-btn"
                onClick={analyzeResume}
                disabled={loading}
              >
                <Upload size={18} />
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
            </div>

            {result && (
              <>
                <div className="score-grid">
                  <div className="score-card">
                    <h3>Confidence</h3>
                    <h2>{result.confidence}%</h2>
                  </div>

                  <div className="score-card">
                    <h3>Skill Score</h3>
                    <h2>{result.skill_score}%</h2>
                  </div>

                  <div className="score-card">
                    <h3>Semantic Fit</h3>
                    <h2>{result.semantic_fit_score}%</h2>
                  </div>
                </div>

                <div className="skills-grid">
                  <div className="skills-box">
                    <h2>Matched Skills</h2>

                    {result?.matched_skills?.length ? (
                      result?.matched_skills?.map((skill) => (
                        <div key={skill} className="skill good">
                          <CheckCircle2 size={18} />
                          {skill}
                        </div>
                      ))
                    ) : (
                      <p>No matched skills.</p>
                    )}
                  </div>

                  <div className="skills-box">
                    <h2>Missing Skills</h2>

                    {result?.missing_skills?.length ? (
                      result?.missing_skills?.map((skill) => (
                        <div key={skill} className="skill bad">
                          <XCircle size={18} />
                          {skill}
                        </div>
                      ))
                    ) : (
                      <p>No missing skills.</p>
                    )}
                  </div>
                </div>

                {result?.suggestions?.length > 0 && (
                  <div className="skills-box" style={{ marginTop: 30 }}>
                    <h2>💡 Resume Improvement Suggestions</h2>

                    {result?.suggestions?.map((suggestion, index) => (
                      <div
                        key={index}
                        className="skill"
                        style={{
                          background: "#FFF9DB",
                          color: "#92400E",
                          borderLeft: "5px solid #F59E0B",
                          marginBottom: "12px",
                        }}
                      >
                        💡 {suggestion}
                      </div>
                    ))}
                  </div>
                )}

                {result?.recommendations?.length > 0 && (
                  <div className="skills-box" style={{ marginTop: 30 }}>
                    <h2>🎯 Top Job Recommendations</h2>

                    {result?.recommendations?.map((job, index) => {
                      const medal =
                        index === 0 ? "🥇" :
                        index === 1 ? "🥈" :
                        index === 2 ? "🥉" : "⭐";

                      return (
                        <div
                          key={index}
                          className="skill"
                          style={{
                            padding: "18px",
                            marginBottom: "16px",
                            background: "#F8FAFC",
                            display: "block",
                          }}
                        >
                          <h3>{medal} {job.role}</h3>
                          <p><strong>🏢 Company:</strong> {job.company}</p>
                          <p><strong>📍 City:</strong> {job.city}</p>
                          <p><strong>💰 Salary:</strong> {job.salary}</p>
                          <p><strong>🎯 Match:</strong> {job.match}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
