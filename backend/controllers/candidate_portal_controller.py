from fastapi import HTTPException
from config.db import candidates_col, jobs_col, interviews_col, users_col, notifications_col
from bson import ObjectId
from datetime import datetime, timezone


def serialize(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def _resolve_email(user_token: dict) -> str:
    """
    Return the canonical email for a logged-in candidate.
    New accounts store email explicitly; legacy demo account uses username.
    """
    return user_token.get("email") or user_token.get("username", "")


def _get_user_doc(email: str, company_id: str = None):
    """Find user in users_col by email OR legacy username."""
    query1 = {"email": email, "role": "candidate"}
    query2 = {"username": email, "role": "candidate"}
    if company_id:
        query1["company_id"] = company_id
        query2["company_id"] = company_id
    user = users_col.find_one(query1)
    if not user:
        user = users_col.find_one(query2)
    return user


# ── Stats ─────────────────────────────────────────────────────

def get_candidate_stats(user_token: dict) -> dict:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    query = {"email": email}
    if company_id: query["company_id"] = company_id
    
    apps = list(candidates_col.find(query))
    total_apps = len(apps)
    shortlisted = len([a for a in apps if a.get("stage") == "Shortlisted"])

    cand = candidates_col.find_one(query)
    upcoming_interviews = 0
    if cand:
        int_query = {
            "candidate_id": str(cand["_id"]),
            "date": {"$gte": datetime.now().strftime("%Y-%m-%d")}
        }
        if company_id: int_query["company_id"] = company_id
        upcoming_interviews = interviews_col.count_documents(int_query)

    return {
        "totalApplications": total_apps,
        "shortlisted": shortlisted,
        "upcomingInterviews": upcoming_interviews
    }


# ── Profile ───────────────────────────────────────────────────

def get_candidate_profile(user_token: dict) -> dict:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    user = _get_user_doc(email, company_id)
    if not user:
        raise HTTPException(404, "User not found")

    return {
        "username": user.get("username"),
        "email": user.get("email", email),
        "full_name": user.get("full_name", user.get("username", "")),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "bio": user.get("bio", ""),
        "skills": user.get("skills", []),
        "experience": user.get("experience", []),
        "education": user.get("education", []),
        "resume": user.get("resume", ""),
        "role": user.get("role", "candidate"),
    }


def update_candidate_profile(user_token: dict, data: dict) -> dict:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    allowed = ["skills", "experience", "education", "resume", "bio", "location", "phone", "full_name"]
    update_data = {k: v for k, v in data.items() if k in allowed}

    query1 = {"email": email, "role": "candidate"}
    query2 = {"username": email, "role": "candidate"}
    if company_id:
        query1["company_id"] = company_id
        query2["company_id"] = company_id

    # Update by email first; fall back to username key
    res = users_col.update_one(query1, {"$set": update_data})
    if res.matched_count == 0:
        users_col.update_one(query2, {"$set": update_data})

    return {"message": "Profile updated successfully"}


# ── Notifications ─────────────────────────────────────────────

def get_notifications(user_token: dict) -> list:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    query = {"recipient": email}
    if company_id: query["company_id"] = company_id
    notifs = list(
        notifications_col.find(query)
        .sort("createdAt", -1)
        .limit(30)
    )
    return [serialize(n) for n in notifs]


def mark_notification_read(notif_id: str, user_token: dict) -> dict:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    try:
        query = {"_id": ObjectId(notif_id), "recipient": email}
        if company_id: query["company_id"] = company_id
        notifications_col.update_one(query, {"$set": {"read": True}})
    except Exception:
        pass
    return {"message": "Marked as read"}


# ── Job Application ───────────────────────────────────────────

def apply_to_job(user_token: dict, data: dict) -> dict:
    email = _resolve_email(user_token)
    company_id = user_token.get("company_id")
    job_id = data.get("job_id")
    if not job_id:
        raise HTTPException(400, "Job ID is required")

    # Duplicate check
    cand_query = {"email": email, "job_id": job_id}
    if company_id: cand_query["company_id"] = company_id
    existing = candidates_col.find_one(cand_query)
    if existing:
        raise HTTPException(400, "You have already applied for this position")

    try:
        job_query = {"_id": ObjectId(job_id)}
        if company_id: job_query["company_id"] = company_id
        job = jobs_col.find_one(job_query)
    except Exception:
        raise HTTPException(400, "Invalid job ID")
    if not job:
        raise HTTPException(404, "Job not found")

    # Pull full_name from users_col for a friendlier display
    user_doc = _get_user_doc(email, company_id)
    display_name = (user_doc or {}).get("full_name", email) if user_doc else email

    application = {
        "name": display_name,
        "email": email,
        "job_title": job["title"],
        "job_id": job_id,
        "stage": "Applied",
        "applied_date": datetime.now().strftime("%Y-%m-%d"),
        "resume": data.get("resume", (user_doc or {}).get("resume", "")),
        "createdAt": datetime.now().isoformat()
    }
    if company_id: application["company_id"] = company_id
    candidates_col.insert_one(application)

    notif = {
        "recipient": email,
        "title": "Application Submitted ✅",
        "message": f"You successfully applied for {job['title']}. We'll keep you updated!",
        "type": "success",
        "read": False,
        "createdAt": datetime.now().isoformat()
    }
    if company_id: notif["company_id"] = company_id
    notifications_col.insert_one(notif)

    return {"message": "Application submitted successfully", "job_title": job["title"]}
