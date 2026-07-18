"""
Job Market Intelligence - Backend API (Flask)
------------------------------------------------
Real, runnable REST API serving the trained salary model and precomputed
market-intelligence aggregates. Run with:  python3 app.py
Then visit http://localhost:5000/api/kpis etc.

(Flask was used instead of FastAPI because this environment has no internet
access to pip-install FastAPI/uvicorn. The code is written in a way that
ports to FastAPI in ~10 minutes if you have network access locally - see
README for the FastAPI equivalent skeleton.)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_parser import extract_resume_text
import pandas as pd
import joblib
import json
import os
import sys

import os

print("=" * 60)
print("RUNNING APP:", os.path.abspath(__file__))
print("=" * 60)

sys.path.append(os.path.dirname(__file__))
from skill_gap import analyze_skill_gap  # inference-only, loads saved TF-IDF (no retraining)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app)

df = pd.read_csv(os.path.join(BASE, "data", "job_postings.csv"), parse_dates=["date_posted"])
df["avg_salary"] = (df.salary_min + df.salary_max) / 2

with open(os.path.join(BASE, "data", "dashboard_data.json")) as f:
    DASH = json.load(f)

salary_model = joblib.load(os.path.join(BASE, "models", "salary_model.joblib"))
def apply_filters(data):
    filtered = data.copy()

    city = request.args.get("city")
    company = request.args.get("company")
    role = request.args.get("role")
    skill = request.args.get("skill")
    work_mode = request.args.get("workMode")
    search = request.args.get("search")

    if city and city != "All":
        filtered = filtered[filtered["location"] == city]

    if company and company != "All":
        filtered = filtered[filtered["company"] == company]

    if role and role != "All":
        filtered = filtered[filtered["role"] == role]

    if work_mode and work_mode != "All":
        filtered = filtered[filtered["remote_type"] == work_mode]

    if skill and skill != "All":
        filtered = filtered[
            filtered["skills"].str.contains(skill, case=False, na=False)
        ]

    if search and search.strip():
        search = search.strip().lower()

        print("SEARCH =", search)

        before = len(filtered)

        filtered = filtered[
            filtered["company"].astype(str).str.lower().str.contains(search, na=False)
            | filtered["role"].astype(str).str.lower().str.contains(search, na=False)
            | filtered["skills"].astype(str).str.lower().str.contains(search, na=False)
            | filtered["location"].astype(str).str.lower().str.contains(search, na=False)
        ]

        print("BEFORE =", before)
        print("AFTER =", len(filtered))

    return filtered

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "records_loaded": len(df)})


@app.route("/api/kpis")
def kpis():
    print("=" * 50)
    print("KPIS ENDPOINT CALLED")
    print(request.args)
    print("=" * 50)

    filtered = apply_filters(df)

    print("KPI rows:", len(filtered))

    total_jobs = len(filtered)

    # Average salary = midpoint of min & max salary
    if total_jobs > 0:
        avg_salary = round(
            (
                filtered["salary_min"] +
                filtered["salary_max"]
            ).mean() / 2,
            2
        )
    else:
        avg_salary = 0

    unique_companies = filtered["company"].nunique()
    unique_cities = filtered["location"].nunique()
    unique_roles = filtered["role"].nunique()

    if total_jobs > 0:
        remote_pct = round(
            filtered["remote_type"]
            .astype(str)
            .str.lower()
            .eq("remote")
            .mean() * 100,
            1,
        )
    else:
        remote_pct = 0

    return jsonify({
        "total_postings": total_jobs,
        "avg_salary": avg_salary,
        "unique_companies": unique_companies,
        "unique_cities": unique_cities,
        "unique_roles": unique_roles,
        "remote_pct": remote_pct,
    })


@app.route("/api/skills/top")
def top_skills():
    return jsonify(DASH["top_skills"])


@app.route("/api/skills/trends")
def skill_trends():
    return jsonify(DASH["skill_trends"])


@app.route("/api/skills/forecast")
def forecast():

    filtered = apply_filters(df)

    skill_counts = {}

    for row in filtered["skills"].dropna():

        for skill in str(row).split(","):

            skill = skill.strip()

            if skill == "":
                continue

            skill_counts[skill] = skill_counts.get(skill, 0) + 1

    forecast = []

    for skill, count in skill_counts.items():

        forecast.append({
            "skill": skill,
            "next_3_months_projection": [
                count,
                round(count * 1.10),
                round(count * 1.20),
            ],
        })

    forecast.sort(
        key=lambda x: x["next_3_months_projection"][2],
        reverse=True,
    )

    return jsonify(forecast[:20])

@app.route("/api/skills")
def skills():
    skills = [item["skill"] for item in DASH["top_skills"]]
    return jsonify(skills)


@app.route("/api/trends/monthly")
def monthly():

    filtered = apply_filters(df)

    print("Rows after filter:", len(filtered))

    monthly = (
        filtered.groupby(filtered["date_posted"].dt.to_period("M"))
        .size()
        .reset_index(name="postings")
    )

    print(monthly)

    monthly["month"] = monthly["date_posted"].astype(str)

    return jsonify(
        monthly[["month", "postings"]].to_dict(orient="records")
    )


@app.route("/api/cities")
def cities():
    filtered = apply_filters(df)

    city_stats = (
        filtered.groupby("location")
        .size()
        .reset_index(name="postings")
        .sort_values("postings", ascending=False)
    )

    print("CITY STATS")
    print(city_stats)

    return jsonify(
        city_stats.to_dict(orient="records")
    )


@app.route("/api/companies")
def companies():
    print("=" * 50)
    print("COMPANIES ENDPOINT")
    print(request.args)
    print("=" * 50)

    filtered = apply_filters(df)

    print("Rows after filter:", len(filtered))

    company_stats = (
        filtered.groupby("company")
        .size()
        .reset_index(name="postings")
        .sort_values("postings", ascending=False)
    )

    print(company_stats.head(10))

    return jsonify(company_stats.to_dict(orient="records"))

@app.route("/api/roles")
def roles():

    filtered = apply_filters(df)

    role_stats = (
        filtered.groupby("role")["avg_salary"]
        .mean()
        .reset_index()
        .sort_values("avg_salary", ascending=False)
    )

    return jsonify(
        role_stats.to_dict(orient="records")
    )


@app.route("/api/salary/experience-trend")
def exp_trend():

    filtered = apply_filters(df)

    filtered = filtered.copy()

    filtered["experience"] = (
        filtered["min_experience"] +
        filtered["max_experience"]
    ) / 2

    exp = (
        filtered.groupby("experience")["avg_salary"]
        .mean()
        .reset_index()
        .sort_values("experience")
    )

    exp.rename(
        columns={"avg_salary": "salary"},
        inplace=True,
    )

    return jsonify(
        exp.to_dict(orient="records")
    )


@app.route("/api/model/metrics")
def model_metrics():
    return jsonify(DASH["model_metrics"])


@app.route("/api/salary/predict", methods=["POST"])
def predict_salary():
    """
    Body JSON: {role, location, min_experience, max_experience, company_size,
                remote_type, education, industry, employment_type}
    """
    payload = request.get_json(force=True)
    required = ["role", "location", "min_experience", "max_experience", "company_size",
                "remote_type", "education", "industry", "employment_type"]
    missing = [k for k in required if k not in payload]
    if missing:
        return jsonify({"error": f"missing fields: {missing}"}), 400

    row = pd.DataFrame([payload])[required]

    row["min_experience"] = pd.to_numeric(row["min_experience"], errors="coerce")
    row["max_experience"] = pd.to_numeric(row["max_experience"], errors="coerce")

    print("\n===== ROW =====")
    print(row)

    print("\n===== DTYPES =====")
    print(row.dtypes)

    pred = salary_model.predict(row)[0]
    return jsonify({"predicted_avg_salary_inr": round(float(pred), -3)})


@app.route("/api/skill-gap", methods=["POST"])
def skill_gap():
    """
    Body JSON: {resume_text: str, target_role: str}
    """
    payload = request.get_json(force=True)
    resume_text = payload.get("resume_text", "")
    target_role = payload.get("target_role", "")
    if not resume_text or not target_role:
        return jsonify({"error": "resume_text and target_role are required"}), 400
    if target_role not in df.role.unique():
        return jsonify({"error": f"unknown role. choose from: {sorted(df.role.unique().tolist())}"}), 400

    result = analyze_skill_gap(resume_text, target_role)
    return jsonify(result)
import traceback
@app.route("/api/skill-gap/upload", methods=["POST"])
def skill_gap_upload():
    """
    Multipart Form Data:
        resume : PDF or DOCX
        target_role : string
    """

    try:

        if "resume" not in request.files:
            return jsonify({"error": "Resume file is required"}), 400

        resume = request.files["resume"]

        target_role = request.form.get("target_role", "")

        if not target_role:
            return jsonify({"error": "target_role is required"}), 400

        if target_role not in df.role.unique():
            return jsonify({
                "error": f"unknown role. choose from: {sorted(df.role.unique().tolist())}"
            }), 400

        resume_text = extract_resume_text(resume)

        result = analyze_skill_gap(
            resume_text=resume_text,
            target_role=target_role
        )

        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("ERROR:", repr(e))
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs/search")
def search_jobs():
    role = request.args.get("role")
    city = request.args.get("location")
    limit = int(request.args.get("limit", 20))
    sub = df
    if role:
        sub = sub[sub.role == role]
    if city:
        sub = sub[sub.location == city]
    cols = ["job_id", "company", "role", "location", "salary_min", "salary_max",
            "skills", "min_experience", "max_experience", "date_posted"]
    return jsonify(sub[cols].head(limit).to_dict(orient="records"))


@app.route("/")
def home():
    return jsonify({
        "message": "Job Market Intelligence API is running",
        "available_endpoints": [
            "/api/health",
            "/api/kpis",
            "/api/skills/top",
            "/api/skills/trends",
            "/api/skills/forecast",
            "/api/trends/monthly",
            "/api/cities",
            "/api/companies",
            "/api/roles",
            "/api/model/metrics",
            "/api/salary/predict",
            "/api/skill-gap",
            "/api/skill-gap/upload",
            "/api/jobs/search"
        ]
    })
@app.route("/hello")
def hello():
    return "HELLO FROM THIS APP"
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
