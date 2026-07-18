"""
ML Pipeline for Job Market Intelligence
-----------------------------------------
1. Salary prediction (regression) - RandomForest vs GradientBoosting, evaluated
2. Skill extraction & trend analysis (TF-IDF based keyword extraction over postings)
3. Resume <-> Job skill-gap matcher (TF-IDF cosine similarity)
4. Simple demand forecasting (linear trend per skill, month-bucketed)

Outputs:
 - models/salary_model.joblib
 - data/model_metrics.json
 - data/dashboard_data.json   (all aggregates the dashboard consumes)
"""
import pandas as pd
import numpy as np
import json
import joblib
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "data", "job_postings.csv")
df = pd.read_csv(DATA_PATH, parse_dates=["date_posted"])
df["avg_salary"] = (df.salary_min + df.salary_max) / 2

# ---------------------------------------------------------------------------
# 1. SALARY PREDICTION MODEL
# ---------------------------------------------------------------------------
features = ["role", "location", "min_experience", "max_experience", "company_size",
            "remote_type", "education", "industry", "employment_type"]
X = df[features].copy()
y = df["avg_salary"]

cat_cols = ["role", "location", "company_size", "remote_type", "education", "industry", "employment_type"]
num_cols = ["min_experience", "max_experience"]

preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
], remainder="passthrough")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

candidates = {
    "RandomForest": RandomForestRegressor(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1),
    "GradientBoosting": GradientBoostingRegressor(n_estimators=200, max_depth=4, learning_rate=0.08, random_state=42),
}

results = {}
best_name, best_pipe, best_r2 = None, None, -np.inf
for name, model in candidates.items():
    pipe = Pipeline([("prep", preprocess), ("model", model)])
    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    results[name] = {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)}
    if r2 > best_r2:
        best_name, best_pipe, best_r2 = name, pipe, r2

joblib.dump(best_pipe, os.path.join(BASE, "models", "salary_model.joblib"))

# feature importance (only meaningful for tree models; approximate via RF if best is RF, else refit RF for interpretability)
rf_for_importance = candidates["RandomForest"] if best_name == "RandomForest" else RandomForestRegressor(
    n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
imp_pipe = Pipeline([("prep", preprocess), ("model", rf_for_importance)])
if best_name != "RandomForest":
    imp_pipe.fit(X_train, y_train)
else:
    imp_pipe = best_pipe

ohe = imp_pipe.named_steps["prep"].named_transformers_["cat"]
cat_feature_names = list(ohe.get_feature_names_out(cat_cols))
all_feature_names = cat_feature_names + num_cols
importances = imp_pipe.named_steps["model"].feature_importances_
imp_df = pd.DataFrame({"feature": all_feature_names, "importance": importances}).sort_values(
    "importance", ascending=False).head(15)

model_metrics = {
    "best_model": best_name,
    "results": results,
    "top_features": imp_df.to_dict(orient="records"),
    "train_size": len(X_train),
    "test_size": len(X_test),
}
with open(os.path.join(BASE, "data", "model_metrics.json"), "w") as f:
    json.dump(model_metrics, f, indent=2)

print("Salary model results:", json.dumps(results, indent=2))
print("Best model:", best_name)

# ---------------------------------------------------------------------------
# 2. SKILL TREND ANALYSIS
# ---------------------------------------------------------------------------
skill_rows = df[["date_posted", "skills", "role", "location", "avg_salary"]].copy()
skill_rows["month"] = skill_rows["date_posted"].dt.to_period("M").astype(str)
skill_rows["skill_list"] = skill_rows["skills"].apply(lambda s: [x.strip() for x in s.split(",") if x.strip()])

exploded = skill_rows.explode("skill_list").rename(columns={"skill_list": "skill"})
skill_counts = exploded["skill"].value_counts()
top_skills = skill_counts.head(20)

# trend: count per month for top 10 skills, compute % change first-half vs second-half
months_sorted = sorted(exploded["month"].unique())
half = len(months_sorted) // 2
first_half, second_half = months_sorted[:half], months_sorted[half:]

trend_records = []
for skill in top_skills.index[:15]:
    sub = exploded[exploded.skill == skill]
    c1 = sub[sub.month.isin(first_half)].shape[0]
    c2 = sub[sub.month.isin(second_half)].shape[0]
    pct_change = ((c2 - c1) / c1 * 100) if c1 > 0 else 0
    avg_sal = sub["avg_salary"].mean()
    trend_records.append({
        "skill": skill, "total_postings": int(skill_counts[skill]),
        "first_half": c1, "second_half": c2,
        "pct_change": round(pct_change, 1), "avg_salary": round(avg_sal, -3),
    })
trend_df = pd.DataFrame(trend_records).sort_values("pct_change", ascending=False)

# monthly overall demand (postings per month) for hiring trend chart
monthly_demand = skill_rows.groupby("month").size().reset_index(name="postings")

# city comparison
city_stats = df.groupby("location").agg(
    postings=("job_id", "count"), avg_salary=("avg_salary", "mean")
).reset_index().sort_values("postings", ascending=False)
city_stats["avg_salary"] = city_stats["avg_salary"].round(-3)

# company comparison (top 12 by postings)
company_stats = df.groupby("company").agg(
    postings=("job_id", "count"), avg_salary=("avg_salary", "mean"), rating=("company_rating", "first")
).reset_index().sort_values("postings", ascending=False).head(12)
company_stats["avg_salary"] = company_stats["avg_salary"].round(-3)

# role comparison
role_stats = df.groupby("role").agg(
    postings=("job_id", "count"), avg_salary=("avg_salary", "mean"), avg_min_exp=("min_experience", "mean")
).reset_index().sort_values("postings", ascending=False)
role_stats["avg_salary"] = role_stats["avg_salary"].round(-3)
role_stats["avg_min_exp"] = role_stats["avg_min_exp"].round(1)

# experience -> salary trend
exp_salary = df.groupby("min_experience").agg(avg_salary=("avg_salary", "mean")).reset_index().sort_values("min_experience")
exp_salary["avg_salary"] = exp_salary["avg_salary"].round(-3)

# ---------------------------------------------------------------------------
# 3. SKILL-GAP RESUME MATCHER (demo function + saved vectorizer)
# ---------------------------------------------------------------------------
tfidf = TfidfVectorizer(stop_words="english", max_features=500)
job_desc_corpus = df["job_description"].tolist()
tfidf.fit(job_desc_corpus)
joblib.dump(tfidf, os.path.join(BASE, "models", "tfidf_vectorizer.joblib"))

sys.path.append(os.path.dirname(__file__))
from skill_gap import analyze_skill_gap  # noqa: E402  (inference-only module, reloads the vectorizer just saved above)

# demo run for the report
demo = analyze_skill_gap(
    resume_text="Experienced with Python, SQL, Pandas, Excel, and building dashboards in Power BI. "
                "Familiar with statistics and basic machine learning using Scikit-learn.",
    target_role="Data Scientist",
)
print("\nDemo skill-gap analysis (Data Scientist):")
print(json.dumps(demo, indent=2))

# ---------------------------------------------------------------------------
# 4. SIMPLE FORECAST: next-3-month demand projection per top skill (linear trend)
# ---------------------------------------------------------------------------
forecast_records = []
for skill in top_skills.index[:10]:
    sub = exploded[exploded.skill == skill].groupby("month").size().reindex(months_sorted, fill_value=0)
    y_vals = sub.values.astype(float)
    x_vals = np.arange(len(y_vals))
    if len(x_vals) > 1:
        slope, intercept = np.polyfit(x_vals, y_vals, 1)
    else:
        slope, intercept = 0, y_vals[0] if len(y_vals) else 0
    next_3 = [max(0, round(intercept + slope * (len(x_vals) + i))) for i in range(1, 4)]
    forecast_records.append({"skill": skill, "next_3_months_projection": next_3,
                              "trend_slope": round(float(slope), 2)})

# ---------------------------------------------------------------------------
# Save everything the dashboard needs
# ---------------------------------------------------------------------------
dashboard_data = {
    "kpis": {
        "total_postings": int(len(df)),
        "avg_salary": int(df.avg_salary.mean()),
        "unique_companies": int(df.company.nunique()),
        "unique_cities": int(df.location.nunique()),
        "unique_roles": int(df.role.nunique()),
        "remote_pct": round((df.remote_type == "Remote").mean() * 100, 1),
    },
    "top_skills": [{"skill": k, "count": int(v)} for k, v in top_skills.items()],
    "skill_trends": trend_df.to_dict(orient="records"),
    "monthly_demand": monthly_demand.to_dict(orient="records"),
    "city_stats": city_stats.to_dict(orient="records"),
    "company_stats": company_stats.to_dict(orient="records"),
    "role_stats": role_stats.to_dict(orient="records"),
    "exp_salary": exp_salary.to_dict(orient="records"),
    "forecast": forecast_records,
    "model_metrics": model_metrics,
    "skill_gap_demo": demo,
}

with open(os.path.join(BASE, "data", "dashboard_data.json"), "w") as f:
    json.dump(dashboard_data, f, indent=2, default=str)

print("\nSaved dashboard_data.json, model_metrics.json, salary_model.joblib, tfidf_vectorizer.joblib")
