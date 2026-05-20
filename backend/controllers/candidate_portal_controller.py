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


def _get_user_doc(email: str):
    """Find user in users_col by email OR legacy username."""
    user = users_col.find_one({"email": email, "role": "candidate"})
    if not user:
        user = users_col.find_one({"username": email, "role": "candidate"})
    return user


# ── Stats ─────────────────────────────────────────────────────

def get_candidate_stats(user_token: dict) -> dict:
    email = _resolve_email(user_token)
    apps = list(candidates_col.find({"email": email}))
    total_apps = len(apps)
    shortlisted = len([a for a in apps if a.get("stage") == "Shortlisted"])

    cand = candidates_col.find_one({"email": email})
    upcoming_interviews = 0
    if cand:
        upcoming_interviews = interviews_col.count_documents({
            "candidate_id": str(cand["_id"]),
            "date": {"$gte": datetime.now().strftime("%Y-%m-%d")}
        })

    return {
        "totalApplications": total_apps,
        "shortlisted": shortlisted,
        "upcomingInterviews": upcoming_interviews
    }


# ── Profile ───────────────────────────────────────────────────

def get_candidate_profile(user_token: dict) -> dict:
    email = _resolve_email(user_token)
    user = _get_user_doc(email)
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
    allowed = ["skills", "experience", "education", "resume", "bio", "location", "phone", "full_name"]
    update_data = {k: v for k, v in data.items() if k in allowed}

    # Update by email first; fall back to username key
    res = users_col.update_one({"email": email, "role": "candidate"}, {"$set": update_data})
    if res.matched_count == 0:
        users_col.update_one({"username": email, "role": "candidate"}, {"$set": update_data})

    return {"message": "Profile updated successfully"}


# ── Notifications ─────────────────────────────────────────────

def get_notifications(user_token: dict) -> list:
    email = _resolve_email(user_token)
    notifs = list(
        notifications_col.find({"recipient": email})
        .sort("createdAt", -1)
        .limit(30)
    )
    return [serialize(n) for n in notifs]


def mark_notification_read(notif_id: str, user_token: dict) -> dict:
    email = _resolve_email(user_token)
    try:
        notifications_col.update_one(
            {"_id": ObjectId(notif_id), "recipient": email},
            {"$set": {"read": True}}
        )
    except Exception:
        pass
    return {"message": "Marked as read"}


# ── Job Application ───────────────────────────────────────────

def apply_to_job(user_token: dict, data: dict) -> dict:
    email = _resolve_email(user_token)
    job_id = data.get("job_id")
    if not job_id:
        raise HTTPException(400, "Job ID is required")

    # Duplicate check
    existing = candidates_col.find_one({"email": email, "job_id": job_id})
    if existing:
        raise HTTPException(400, "You have already applied for this position")

    try:
        job = jobs_col.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(400, "Invalid job ID")
    if not job:
        raise HTTPException(404, "Job not found")

    # Pull full_name from users_col for a friendlier display
    user_doc = _get_user_doc(email)
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
    candidates_col.insert_one(application)

    notifications_col.insert_one({
        "recipient": email,
        "title": "Application Submitted ✅",
        "message": f"You successfully applied for {job['title']}. We'll keep you updated!",
        "type": "success",
        "read": False,
        "createdAt": datetime.now().isoformat()
    })

    return {"message": "Application submitted successfully", "job_title": job["title"]}
