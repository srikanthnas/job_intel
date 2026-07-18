"""
Synthetic Job Market Dataset Generator
---------------------------------------
Generates realistic job posting records with correlated fields (role -> skills,
experience -> salary, city -> cost-of-living salary multiplier, time -> hiring trend).
No scraping is performed (ToS-compliant); distributions are hand-calibrated to
resemble real Indian + global tech job market patterns.
"""
import numpy as np
import pandas as pd
import random
import json
from datetime import datetime, timedelta

rng = np.random.default_rng(42)
random.seed(42)

N = 25000  # records

# ---------------------------------------------------------------------------
# Reference taxonomies
# ---------------------------------------------------------------------------
ROLES = {
    "Data Scientist": {"base": 900000, "dept": "Data Science", "family": "Data"},
    "Data Analyst": {"base": 550000, "dept": "Analytics", "family": "Data"},
    "ML Engineer": {"base": 1100000, "dept": "AI/ML", "family": "Data"},
    "Data Engineer": {"base": 950000, "dept": "Data Engineering", "family": "Data"},
    "Business Analyst": {"base": 600000, "dept": "Business Ops", "family": "Data"},
    "AI Research Engineer": {"base": 1400000, "dept": "AI/ML", "family": "Data"},
    "Backend Developer": {"base": 700000, "dept": "Engineering", "family": "SWE"},
    "Frontend Developer": {"base": 650000, "dept": "Engineering", "family": "SWE"},
    "Full Stack Developer": {"base": 750000, "dept": "Engineering", "family": "SWE"},
    "DevOps Engineer": {"base": 950000, "dept": "Infrastructure", "family": "SWE"},
    "Cloud Engineer": {"base": 1000000, "dept": "Infrastructure", "family": "SWE"},
    "QA Engineer": {"base": 550000, "dept": "Quality", "family": "SWE"},
    "Product Manager": {"base": 1300000, "dept": "Product", "family": "Product"},
    "UI/UX Designer": {"base": 650000, "dept": "Design", "family": "Product"},
}

ROLE_SKILLS = {
    "Data Scientist": ["Python", "SQL", "Pandas", "Scikit-learn", "Statistics", "Machine Learning",
                       "Deep Learning", "TensorFlow", "PyTorch", "A/B Testing", "Tableau", "Power BI"],
    "Data Analyst": ["SQL", "Excel", "Power BI", "Tableau", "Python", "Statistics", "Data Visualization",
                     "Google Analytics", "Pandas"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Kubernetes", "AWS",
                    "Scikit-learn", "Feature Engineering", "Model Deployment", "SQL"],
    "Data Engineer": ["SQL", "Python", "Spark", "Airflow", "Kafka", "AWS", "Azure", "ETL",
                      "Data Warehousing", "Snowflake", "Hadoop"],
    "Business Analyst": ["SQL", "Excel", "Power BI", "Requirements Gathering", "Stakeholder Management",
                         "Tableau", "Business Process Modeling"],
    "AI Research Engineer": ["Python", "PyTorch", "NLP", "Transformers", "Deep Learning", "Research",
                             "LLM", "Computer Vision", "Mathematics"],
    "Backend Developer": ["Java", "Python", "Node.js", "SQL", "REST API", "Microservices", "Spring Boot",
                          "MongoDB", "Docker"],
    "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Redux", "Next.js"],
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "SQL", "MongoDB", "Python", "REST API",
                             "Docker", "AWS"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins", "Terraform", "Linux",
                        "Ansible", "Azure"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker", "Linux", "Networking"],
    "QA Engineer": ["Selenium", "Manual Testing", "Automation Testing", "Python", "Java", "API Testing",
                    "JIRA", "Test Planning"],
    "Product Manager": ["Product Strategy", "Roadmapping", "Agile", "Stakeholder Management",
                        "SQL", "Analytics", "User Research", "JIRA"],
    "UI/UX Designer": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping",
                      "Design Systems", "Sketch"],
}

SOFT_SKILLS = ["Communication", "Teamwork", "Problem Solving", "Leadership", "Time Management",
               "Adaptability", "Critical Thinking"]

CITIES = {
    "Bengaluru": 1.25, "Hyderabad": 1.10, "Pune": 1.05, "Mumbai": 1.20, "Delhi NCR": 1.15,
    "Chennai": 1.00, "Kolkata": 0.85, "Remote": 1.10, "Ahmedabad": 0.90, "Kochi": 0.85,
}

COMPANIES = {
    "Infosys": {"size": "Enterprise", "rating": 3.9}, "TCS": {"size": "Enterprise", "rating": 3.8},
    "Wipro": {"size": "Enterprise", "rating": 3.7}, "Accenture": {"size": "Enterprise", "rating": 4.0},
    "Flipkart": {"size": "Large", "rating": 4.1}, "Swiggy": {"size": "Large", "rating": 3.9},
    "Zomato": {"size": "Large", "rating": 3.8}, "Razorpay": {"size": "Mid", "rating": 4.2},
    "Freshworks": {"size": "Large", "rating": 4.0}, "Zoho": {"size": "Large", "rating": 4.3},
    "Ola": {"size": "Large", "rating": 3.6}, "PhonePe": {"size": "Large", "rating": 4.1},
    "Meesho": {"size": "Mid", "rating": 3.9}, "CRED": {"size": "Mid", "rating": 4.0},
    "Amazon India": {"size": "Enterprise", "rating": 4.1}, "Microsoft India": {"size": "Enterprise", "rating": 4.4},
    "Google India": {"size": "Enterprise", "rating": 4.5}, "Goldman Sachs (Bengaluru)": {"size": "Enterprise", "rating": 4.2},
    "Sprinklr": {"size": "Mid", "rating": 3.9}, "Postman": {"size": "Mid", "rating": 4.2},
    "Darwinbox": {"size": "Mid", "rating": 4.0}, "Innovaccer": {"size": "Mid", "rating": 3.8},
    "Uber India": {"size": "Large", "rating": 4.0}, "Byju's": {"size": "Large", "rating": 3.3},
    "Cognizant": {"size": "Enterprise", "rating": 3.7}, "HCLTech": {"size": "Enterprise", "rating": 3.6},
    "Tech Mahindra": {"size": "Enterprise", "rating": 3.6}, "Startup-Stealth": {"size": "Startup", "rating": 3.9},
}

EDUCATION = ["B.E/B.Tech", "M.Tech", "MCA", "B.Sc", "M.Sc", "MBA", "PhD"]
EMPLOYMENT_TYPES = ["Full-time", "Contract", "Internship", "Part-time"]
SOURCES = ["Naukri", "LinkedIn(public)", "Indeed", "Glassdoor", "RemoteOK", "Wellfound", "CompanyCareerPage"]
CERTS = ["AWS Certified", "PMP", "Google Data Analytics", "Azure Fundamentals", "Scrum Master",
         "TensorFlow Developer Cert", "None"]

start_date = datetime(2024, 6, 1)
end_date = datetime(2025, 12, 31)
date_range_days = (end_date - start_date).days

# Skill trend weights: some skills grow over the window, some decline
TREND_BOOST = {"LLM": 3.0, "Transformers": 2.2, "MLOps": 1.8, "Kubernetes": 1.4, "AWS": 1.3,
               "React": 1.2, "Docker": 1.3, "TensorFlow": 0.85, "Hadoop": 0.5, "Manual Testing": 0.6}

records = []
for i in range(N):
    role = random.choices(list(ROLES.keys()),
                          weights=[3, 2.5, 1.8, 1.6, 1.4, 0.7, 2.2, 2.0, 2.4, 1.3, 1.1, 1.4, 0.9, 0.9])[0]
    role_info = ROLES[role]
    city = random.choices(list(CITIES.keys()),
                          weights=[3, 1.8, 1.6, 1.7, 1.6, 1.2, 1.0, 1.4, 0.8, 0.7])[0]
    company = random.choice(list(COMPANIES.keys()))
    comp_info = COMPANIES[company]

    min_exp = random.choices([0, 1, 2, 3, 5, 7, 10], weights=[15, 20, 20, 18, 14, 8, 5])[0]
    max_exp = min_exp + random.choice([1, 2, 3, 4])

    # posting date with mild growth trend over time (more postings recently) + seasonality
    day_offset = int(rng.beta(2, 1.3) * date_range_days)
    post_date = start_date + timedelta(days=day_offset)

    # skills: 4-8 from role pool with trend-based sampling weight, plus 0-2 soft skills
    pool = ROLE_SKILLS[role]
    weights = [TREND_BOOST.get(s, 1.0) for s in pool]
    k = min(len(pool), random.randint(4, 8))
    chosen_skills = list(np.random.choice(pool, size=k, replace=False,
                                          p=np.array(weights) / sum(weights)))
    n_soft = random.randint(0, 2)
    chosen_soft = random.sample(SOFT_SKILLS, n_soft) if n_soft else []

    programming = [s for s in chosen_skills if s in
                   ["Python", "Java", "JavaScript", "TypeScript", "SQL", "Node.js"]]
    frameworks = [s for s in chosen_skills if s in
                  ["React", "TensorFlow", "PyTorch", "Spring Boot", "Next.js", "Redux", "Scikit-learn"]]
    cloud = [s for s in chosen_skills if s in ["AWS", "Azure", "GCP"]]

    # salary model: base * experience multiplier * city multiplier * company size multiplier
    #               * skill premium (trending skills add premium) + noise
    exp_mult = 1 + 0.13 * min_exp
    size_mult = {"Startup": 0.85, "Mid": 1.0, "Large": 1.15, "Enterprise": 1.05}[comp_info["size"]]
    skill_premium = 1 + 0.02 * sum(1 for s in chosen_skills if TREND_BOOST.get(s, 1.0) > 1.5)
    base_salary = role_info["base"] * exp_mult * CITIES[city] * size_mult * skill_premium
    noise = rng.normal(1.0, 0.12)
    salary_min = max(300000, base_salary * noise * 0.85)
    salary_max = salary_min * random.uniform(1.15, 1.45)

    remote_type = random.choices(["On-site", "Hybrid", "Remote"], weights=[45, 40, 15])[0]
    edu = random.choices(EDUCATION, weights=[45, 20, 10, 8, 6, 9, 2])[0]
    emp_type = random.choices(EMPLOYMENT_TYPES, weights=[80, 10, 7, 3])[0]
    cert = random.choices(CERTS, weights=[10, 5, 8, 8, 6, 6, 57])[0]

    desc = (f"We are hiring a {role} with {min_exp}-{max_exp} years of experience to join our "
            f"{role_info['dept']} team in {city}. Required skills: {', '.join(chosen_skills)}. "
            f"Familiarity with {random.choice(chosen_skills)} preferred. "
            f"{'This is a remote-friendly role.' if remote_type=='Remote' else ''}")

    ats_score = round(min(100, max(30, rng.normal(70, 12))), 1)
    recruiter_rating = round(min(5, max(2, rng.normal(3.8, 0.5))), 1)

    records.append({
        "job_id": f"JOB{i+100000}",
        "company": company,
        "role": role,
        "designation": f"{role} - {'Senior' if min_exp>=5 else 'Mid' if min_exp>=2 else 'Junior'}",
        "department": role_info["dept"],
        "role_family": role_info["family"],
        "min_experience": min_exp,
        "max_experience": max_exp,
        "salary_min": round(salary_min, -3),
        "salary_max": round(salary_max, -3),
        "currency": "INR",
        "location": city,
        "remote_type": remote_type,
        "skills": ", ".join(chosen_skills),
        "soft_skills": ", ".join(chosen_soft),
        "programming_languages": ", ".join(programming),
        "frameworks": ", ".join(frameworks),
        "cloud_platforms": ", ".join(cloud),
        "education": edu,
        "job_description": desc,
        "industry": random.choice(["IT Services", "Fintech", "E-commerce", "Healthtech",
                                   "EdTech", "SaaS", "Consulting", "Logistics"]),
        "employment_type": emp_type,
        "date_posted": post_date.strftime("%Y-%m-%d"),
        "company_size": comp_info["size"],
        "company_rating": comp_info["rating"],
        "recruiter_rating": recruiter_rating,
        "required_certifications": cert,
        "ats_score": ats_score,
        "source": random.choice(SOURCES),
    })

df = pd.DataFrame(records)
df.to_csv("/home/claude/job_intel/data/job_postings.csv", index=False)

# save taxonomies for reuse in ML scripts / dashboard
with open("/home/claude/job_intel/data/taxonomies.json", "w") as f:
    json.dump({
        "roles": list(ROLES.keys()),
        "role_skills": ROLE_SKILLS,
        "cities": list(CITIES.keys()),
        "companies": list(COMPANIES.keys()),
    }, f, indent=2)

print(f"Generated {len(df):,} rows -> job_postings.csv")
print(df.head(3).to_string())
