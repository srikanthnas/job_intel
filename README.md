# AI-Powered Job Market Intelligence & Skill-Gap Analyzer

A real, working data-science pipeline: synthetic job-postings dataset → EDA →
trained salary-prediction model → skill-gap resume matcher → REST API →
interactive dashboard.

Scoped down from a full "SaaS platform" spec to what's actually buildable and
defensible in an interview: every number in the dashboard comes from a model
that really trained on this machine, not placeholder text.

## What's real vs. simplified

| Component | Status |
|---|---|
| 25,000-row synthetic dataset with correlated fields | ✅ Fully generated, reproducible via script |
| Salary prediction (RandomForest vs GradientBoosting, evaluated) | ✅ Real sklearn training, R²=0.888 on held-out data |
| Skill extraction & trend analysis | ✅ Real aggregation over the dataset |
| Skill-gap matcher (resume vs. role) | ✅ Real TF-IDF cosine similarity + keyword matching |
| Simple demand forecasting | ✅ Real linear-trend projection per skill |
| REST API | ✅ Flask (FastAPI code sketch in `backend/fastapi_note.md` — needs internet to `pip install fastapi uvicorn`, this sandbox had none) |
| Dashboard | ✅ Interactive React/Recharts artifact, reads the same JSON the API serves |
| LLM chatbot / mock interview / auth / Docker+cloud deploy | ❌ Cut — see note below |

**Why cut the rest:** the original spec (JWT+Google auth, Postgres/Mongo/Redis/
ElasticSearch/vector DB, Next.js, LSTM/Prophet forecasting, LLM career coach,
Docker+CI/CD+AWS/Azure deployment) is a multi-month, multi-engineer SaaS build.
Generating that as code today would mean thousands of lines nobody tested —
worse for an interview than a smaller project you can explain end-to-end.

## Folder structure

```
job_intel/
├── data/
│   ├── generate_dataset.py     # synthetic data generator (reproducible)
│   ├── job_postings.csv        # 25,000 records, 27 fields
│   ├── taxonomies.json         # role/skill/city/company reference data
│   ├── model_metrics.json      # evaluation results
│   └── dashboard_data.json     # precomputed aggregates the API/dashboard use
├── backend/
│   ├── ml_pipeline.py          # training script: salary model + skill trends + TF-IDF
│   ├── skill_gap.py            # inference-only module (loads saved model, no retraining)
│   └── app.py                  # Flask REST API
├── models/
│   ├── salary_model.joblib     # trained GradientBoostingRegressor pipeline
│   └── tfidf_vectorizer.joblib # trained TF-IDF vectorizer
└── README.md
```

## Running it locally

```bash
cd job_intel
pip install pandas numpy scikit-learn flask joblib

# 1. Regenerate the dataset (optional — job_postings.csv is already included)
python3 data/generate_dataset.py

# 2. Train models (optional — trained artifacts are already included)
python3 backend/ml_pipeline.py

# 3. Start the API
python3 backend/app.py
# -> http://localhost:5000/api/kpis, /api/salary/predict, /api/skill-gap, etc.
```

The dashboard (`.jsx` file) already has the real output embedded, so it works
standalone without the API running — good for a live demo where you don't
want to depend on a terminal window.

## API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/kpis` | GET | Headline stats |
| `/api/skills/top` | GET | Top skills by posting count |
| `/api/skills/trends` | GET | Growth/decline % by skill |
| `/api/skills/forecast` | GET | 3-month demand projection |
| `/api/trends/monthly` | GET | Postings per month |
| `/api/cities`, `/api/companies`, `/api/roles` | GET | Comparison tables |
| `/api/salary/experience-trend` | GET | Salary vs. experience |
| `/api/model/metrics` | GET | Model evaluation results |
| `/api/salary/predict` | POST | Predict salary from role/city/experience/etc. |
| `/api/skill-gap` | POST | Resume vs. role skill-gap analysis |
| `/api/jobs/search` | GET | Filter postings by role/city |

## Model details

**Salary prediction** — `role, location, min/max experience, company size, remote
type, education, industry, employment type` → one-hot encoding → GradientBoostingRegressor
(200 trees, depth 4, lr 0.08) beat RandomForest on held-out data:

| Model | R² | MAE | RMSE |
|---|---|---|---|
| RandomForest | 0.851 | ₹1.53L | ₹2.05L |
| **GradientBoosting (selected)** | **0.888** | **₹1.31L** | **₹1.78L** |

Top predictive feature: `min_experience` (37% importance), followed by role type.

**Skill-gap matching** — combines (a) exact/keyword skill overlap against the
role's required-skill pool and (b) TF-IDF cosine similarity between resume
text and real job descriptions for that role, giving both a literal match
score and a semantic "fit" score.

## Resume bullet points (ready to use)

- Built an end-to-end job-market intelligence pipeline on a 25,000-record
  synthetic dataset, covering EDA, feature engineering, and salary prediction
  (GradientBoostingRegressor, R²=0.89, MAE ≈ ₹1.3L) benchmarked against RandomForest.
- Designed a TF-IDF-based skill-gap matcher comparing resumes against role
  requirements, returning matched/missing skills and a semantic fit score.
- Exposed the pipeline via a Flask REST API (10 endpoints) and built an
  interactive React/Recharts dashboard for trend, city, company, and role
  comparisons plus live salary prediction.

## Honest talking points for interviews

- Be ready to explain *why* the dataset is synthetic (ToS/legal — real scraping
  of LinkedIn/Naukri postings without permission would violate terms of service)
  and how the generation logic mirrors real market correlations (experience →
  salary, city cost-of-living, trending-skill premiums).
- Be ready to explain why GradientBoosting beat RandomForest here (better bias-
  variance tradeoff on this feature set) rather than reciting the R² number.
- Be ready to walk through one skill-gap example end-to-end.
