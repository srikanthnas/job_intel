"""
Inference-only skill-gap matcher.

Loads the trained TF-IDF vectorizer and job postings dataset.
Compares an uploaded resume against the selected target role.
"""

import os
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity


# -------------------------------------------------------
# Skill aliases
# -------------------------------------------------------

SKILL_ALIASES = {
    "Python": ["python"],
    "SQL": ["sql", "mysql", "postgresql", "sqlite"],
    "Power BI": ["power bi", "powerbi"],
    "Tableau": ["tableau"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Scikit-learn": ["scikit-learn", "scikit learn", "sklearn"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch", "torch"],
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "deep-learning", "dl"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "React": ["react", "reactjs"],
    "Node.js": ["node", "nodejs", "node.js"],
    "Flask": ["flask"],
    "FastAPI": ["fastapi"],
    "MongoDB": ["mongodb", "mongo"],
    "Git": ["git"],
    "GitHub": ["github", "github.com"],
    "Docker": ["docker"],
    "AWS": ["aws", "amazon web services"],
    "Excel": ["excel", "microsoft excel"],
    "Statistics": ["statistics", "statistical analysis"]
}


BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_df = pd.read_csv(
    os.path.join(BASE, "data", "job_postings.csv")
)

_tfidf = joblib.load(
    os.path.join(BASE, "models", "tfidf_vectorizer.joblib")
)


def analyze_skill_gap(
    resume_text: str,
    target_role: str,
    top_n_jobs: int = 50
):

    role_jobs = _df[_df.role == target_role].head(top_n_jobs)

    if role_jobs.empty:
        return {
            "error": f"No postings found for role '{target_role}'"
        }

    # ---------------------------------------------
    # Required skills for selected role
    # ---------------------------------------------

    role_skill_pool = set()

    for skills in role_jobs["skills"]:

        if pd.notna(skills):

            role_skill_pool.update(

                skill.strip()

                for skill in skills.split(",")

            )

    role_skill_pool = sorted(role_skill_pool)

    resume_lower = resume_text.lower()

    matched_skills = []
    missing_skills = []

        # ---------------------------------------------
    # Smart Skill Matching
    # ---------------------------------------------

    for skill in role_skill_pool:

        aliases = SKILL_ALIASES.get(skill, [skill.lower()])

        found = any(
            alias.lower() in resume_lower
            for alias in aliases
        )

        if found:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    # ---------------------------------------------
    # Semantic Similarity
    # ---------------------------------------------

    resume_vec = _tfidf.transform([resume_text])

    job_vecs = _tfidf.transform(
        role_jobs["job_description"]
    )

    similarities = cosine_similarity(
        resume_vec,
        job_vecs
    ).flatten()

    semantic_fit_score = round(
        float(np.mean(similarities)) * 100,
        1
    )

    # ---------------------------------------------
    # Scores
    # ---------------------------------------------

    skill_score = round(
        len(matched_skills)
        / max(1, len(role_skill_pool))
        * 100,
        1,
    )

    confidence = round(
        (skill_score * 0.6)
        + (semantic_fit_score * 0.4),
        1,
    )

    # ---------------------------------------------
    # Recommendations
    # ---------------------------------------------

    suggestions = []

    recommendation_map = {
        "Python": "Add Python projects or certifications if you have them.",
        "SQL": "Mention SQL queries, joins, and database projects.",
        "Power BI": "Include Power BI dashboards or business intelligence projects.",
        "Tableau": "Show Tableau dashboards if you have created them.",
        "Pandas": "Mention Pandas for data cleaning and preprocessing.",
        "NumPy": "Include NumPy for numerical computing work.",
        "Scikit-learn": "Mention Scikit-learn models used in ML projects.",
        "TensorFlow": "Include TensorFlow if you've built deep learning models.",
        "PyTorch": "Mention PyTorch if you've worked on neural networks.",
        "Machine Learning": "Highlight Machine Learning projects and algorithms.",
        "Deep Learning": "Mention Deep Learning models if applicable.",
        "React": "Include React projects demonstrating frontend skills.",
        "Node.js": "Mention Node.js backend development experience.",
        "Flask": "Highlight Flask APIs or backend applications.",
        "FastAPI": "Mention FastAPI if you've built REST APIs with it.",
        "MongoDB": "Include MongoDB database projects.",
        "Git": "Mention Git version control experience.",
        "GitHub": "Add GitHub repository links to your resume.",
        "Docker": "Include Docker if you've containerized applications.",
        "AWS": "Mention AWS cloud services if you've used them.",
        "Excel": "Highlight Excel for analysis and reporting.",
        "Statistics": "Mention statistical analysis in projects or coursework."
    }

    for skill in missing_skills:

        if skill in recommendation_map:
            suggestions.append(recommendation_map[skill])

    if "%" not in resume_text:
        suggestions.append(
            "Quantify your achievements using numbers (accuracy, users, performance improvements, etc.)."
        )

    if "github.com" not in resume_lower:
        suggestions.append(
            "Add GitHub repository links for your major projects."
        )

    if len(matched_skills) < 8:
        suggestions.append(
            "Expand the Skills section by including technologies used in your projects."
        )
           # ---------------------------------------------
    # Top Job Recommendations
    # ---------------------------------------------

    recommendations = []

    top_jobs = role_jobs.copy()

    top_jobs["similarity"] = similarities

    top_jobs = (
        top_jobs
        .sort_values("similarity", ascending=False)
        .head(3)
    )

    for _, row in top_jobs.iterrows():

        salary_min = row.get("salary_min", 0)
        salary_max = row.get("salary_max", 0)

        if (
            pd.notna(salary_min)
            and pd.notna(salary_max)
            and salary_min > 0
            and salary_max > 0
        ):
            avg_salary = (salary_min + salary_max) / 2
            salary_display = f"₹{round(avg_salary / 100000, 1)} LPA"
        else:
            salary_display = "Not Available"

        recommendations.append({
            "role": row.get("role", ""),
            "company": row.get("company", ""),
            "city": row.get("location", ""),
            "salary": salary_display,
            "match": round(float(row["similarity"]) * 100, 1)
        })

    # ---------------------------------------------
    # Final Response
    # ---------------------------------------------

    return {
        "target_role": target_role,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "skill_score": skill_score,

        "semantic_fit_score": semantic_fit_score,

        "confidence": confidence,

        "suggestions": suggestions,

        "recommendations": recommendations
    }