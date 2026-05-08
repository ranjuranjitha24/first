import random
import time

def analyze_resume(file_content: str = None, filename: str = "resume.pdf"):
    # Simulate AI processing delay
    time.sleep(1.5)
    
    # Simulated extraction logic
    skills_pool = ["React", "Python", "Node.js", "FastAPI", "MongoDB", "AWS", "Docker", "Tailwind CSS", "TypeScript", "Machine Learning"]
    education_pool = ["B.Tech in Computer Science", "M.Sc in Data Science", "MBA in HR Management", "B.Sc in Information Technology"]
    experience_pool = ["3 years as Software Engineer at TechCorp", "Senior Dev at Innovate Solutions (2 yrs)", "Junior Analyst at Global Data (1 yr)"]
    
    # Randomly pick some data for the simulation
    found_skills = random.sample(skills_pool, random.randint(4, 7))
    found_edu    = random.choice(education_pool)
    found_exp    = random.choice(experience_pool)
    
    # Generate ATS Score and Match Percentage
    ats_score = random.randint(65, 92)
    match_pct = random.randint(60, 98)
    
    summary = f"Highly motivated candidate with expertise in {', '.join(found_skills[:3])}. Demonstrated experience in {found_exp}. Strong academic background from {found_edu}."

    # Generate Interview Questions
    interview_questions = [
        f"Can you explain a complex project where you used {found_skills[0]}?",
        f"How did your degree from {found_edu.split(' in ')[-1]} prepare you for this role?",
        f"Tell me about a challenge you faced during your {found_exp.split(' at ')[0]}.",
        "Where do you see yourself in 3 years given your current skill trajectory?"
    ]
    
    # Suggested Job Roles
    job_pool = ["Senior Software Engineer", "Full-Stack Developer", "Data Scientist", "HR Business Partner", "Cloud Architect"]
    suggested_job = random.choice(job_pool)

    return {
        "filename": filename,
        "ats_score": ats_score,
        "match_percentage": match_pct,
        "summary": summary,
        "extracted_data": {
            "skills": found_skills,
            "education": found_edu,
            "experience": found_exp
        },
        "suggested_role": suggested_job,
        "interview_questions": interview_questions,
        "recommendation": "Shortlist" if ats_score > 80 else "Review Further"
    }
