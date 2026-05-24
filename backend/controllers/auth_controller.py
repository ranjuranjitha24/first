import hashlib
import time
import base64
import json
import secrets
import re
from datetime import datetime
from config.db import users_col, notifications_col
from models.user_model import UserCreate, UserLogin, CandidateRegister, CandidateLogin, SetupPasswordRequest
from fastapi import HTTPException
import bcrypt
import os
from utils.email_utils import send_reset_email

# ── Helpers ──────────────────────────────────────────────────

def hash_pw(pw: str) -> str:
    # Legacy SHA-256 for older passwords (DO NOT USE for new setups)
    return hashlib.sha256(pw.encode()).hexdigest()

def verify_password(plain_pw: str, stored_pw: str) -> bool:
    """Supports both legacy SHA-256 and new Bcrypt."""
    if stored_pw.startswith("$2b$"):
        return bcrypt.checkpw(plain_pw.encode(), stored_pw.encode())
    return stored_pw == hash_pw(plain_pw)

def hash_pw_secure(pw: str) -> str:
    """New secure bcrypt hashing."""
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def make_token(identifier: str, role: str, employee_id: str = None,
               full_name: str = None, email: str = None, company_id: str = None, **kwargs) -> str:
    payload = {
        "username": identifier,   # kept as 'username' key for backward-compat
        "role": role,
        "exp": int(time.time()) + 3153600000   # 100 years
    }
    if employee_id:
        payload["employee_id"] = employee_id
    if full_name:
        payload["full_name"] = full_name
    if email:
        payload["email"] = email
    if company_id:
        payload["company_id"] = company_id
        
    for k, v in kwargs.items():
        if v is not None:
            payload[k] = v
            
    return base64.b64encode(json.dumps(payload).encode()).decode()


def verify_token(token: str) -> dict:
    try:
        payload = json.loads(base64.b64decode(token).decode())
        if "exp" in payload and payload["exp"] < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Admin / HR authentication (username-based) ───────────────

def register_user(data: UserCreate, company_id: str = "master_company") -> dict:
    if users_col.find_one({"username": data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    doc = {
        "username": data.username,
        "password": hash_pw_secure(data.password), # Use bcrypt for new regs
        "role": data.role,
        "company_id": company_id,
        "createdAt": datetime.now().isoformat()
    }
    users_col.insert_one(doc)
    return {"message": "User created"}


def login_user(data: UserLogin) -> dict:
    user = users_col.find_one({"username": data.username})

    # Auto-seed test accounts on first run
    if not user and data.username in ["admin", "user", "candidate"]:
        seed_admin()
        user = users_col.find_one({"username": data.username})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Wrong password")

    # Temp Password Expiry Check
    if user.get("forcePasswordChange") and user.get("tempPasswordExpiresAt"):
        try:
            temp_end = datetime.fromisoformat(user["tempPasswordExpiresAt"])
            if datetime.now() > temp_end:
                raise HTTPException(status_code=403, detail="temp_password_expired")
        except ValueError:
            pass

    # Trial Expiration Check
    if user.get("isDemoUser") and user.get("trialEndDate"):
        try:
            end_date = datetime.fromisoformat(user["trialEndDate"])
            if datetime.now() > end_date:
                raise HTTPException(status_code=403, detail="demo_expired")
        except ValueError:
            pass # In case format is broken

    role = user.get("role", "employee")
    employee_id = str(user.get("employee_id") or user.get("_id"))
    full_name = user.get("full_name", user.get("username"))
    email = user.get("email", "")
    
    # Extract demo info if available
    is_demo_user = user.get("isDemoUser")
    plan_type = user.get("planType")
    trial_end_date = user.get("trialEndDate")
    force_password_change = user.get("forcePasswordChange", False)
    company_id = user.get("company_id", "master_company")
    
    token = make_token(data.username, role, employee_id, full_name, email, company_id=company_id,
                       isDemoUser=is_demo_user, planType=plan_type, trialEndDate=trial_end_date)
    return {
        "token": token, 
        "username": data.username, 
        "role": role,
        "isDemoUser": is_demo_user,
        "planType": plan_type,
        "trialEndDate": trial_end_date,
        "forcePasswordChange": force_password_change,
        "company_id": company_id
    }

def setup_password(data: SetupPasswordRequest) -> dict:
    user = users_col.find_one({"username": data.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(data.temp_password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid temporary password")
        
    # Validate password complexity
    pw = data.new_password
    if len(pw) < 8 or not re.search(r"[A-Z]", pw) or not re.search(r"[a-z]", pw) or not re.search(r"[0-9]", pw) or not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", pw):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.")
        
    users_col.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hash_pw_secure(data.new_password),
                "forcePasswordChange": False
            },
            "$unset": {"tempPasswordExpiresAt": ""}
        }
    )
    return {"success": True, "message": "Password successfully updated."}


# ── Candidate self-registration (email-based) ────────────────

def register_candidate(data: CandidateRegister) -> dict:
    # Uniqueness: block duplicate emails
    if users_col.find_one({"email": data.email, "role": "candidate"}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    doc = {
        "username": data.email,          # email used as primary identifier
        "email": data.email,
        "full_name": data.full_name,
        "phone": data.phone,
        "resume": data.resume,
        "password": hash_pw_secure(data.password), # Bcrypt
        "role": "candidate",
        "skills": [],
        "experience": [],
        "education": [],
        "bio": "",
        "location": "",
        "createdAt": datetime.now().isoformat()
    }
    users_col.insert_one(doc)

    # Welcome notification
    notifications_col.insert_one({
        "recipient": data.email,
        "title": "Welcome to RecruiterPro!",
        "message": f"Hi {data.full_name}, your account is ready. Start exploring jobs!",
        "type": "success",
        "read": False,
        "createdAt": datetime.now().isoformat()
    })

    return {"message": "Account created successfully"}


def login_candidate(data: CandidateLogin) -> dict:
    user = users_col.find_one({"email": data.email, "role": "candidate"})

    # Fallback: also check legacy username-based candidate account
    if not user:
        user = users_col.find_one({"username": "candidate", "role": "candidate"})
        if user and data.email != "candidate":
            user = None   # not a match for this email

    if not user:
        raise HTTPException(status_code=401, detail="Candidate account not found")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Wrong password")

    email = user.get("email", user.get("username"))
    full_name = user.get("full_name", email)
    employee_id = str(user.get("_id"))
    company_id = user.get("company_id", "master_company")
    token = make_token(email, "candidate", employee_id, full_name, email, company_id=company_id)
    return {
        "token": token,
        "username": email,
        "email": email,
        "full_name": full_name,
        "role": "candidate",
        "company_id": company_id
    }


# ── Forgot / Reset password (email-based) ────────────────────
# Token is hashed before storing in DB for security.
# An email is sent to the user with the unhashed token in the reset link.

def forgot_password(email: str) -> dict:
    print(f"\n[AUTH CONTROLLER] Processing forgot_password for: {email}")
    user = users_col.find_one({"email": email, "role": "candidate"})
    if not user:
        print(f"[AUTH CONTROLLER WARNING] No candidate found with email: {email}")
        # Return generic message to avoid user enumeration
        return {"message": "If an account exists, a reset link has been sent to your email."}

    print("[AUTH CONTROLLER] User found. Generating token...")
    reset_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    expiry = int(time.time()) + 3600  # 1 hour

    users_col.update_one(
        {"email": email},
        {"$set": {"reset_token_hash": token_hash, "reset_token_exp": expiry}}
    )
    print("[AUTH CONTROLLER] Token hashed and stored in database successfully.")

    # Send email
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    print("[AUTH CONTROLLER] Initiating email delivery...")
    success = send_reset_email(email, reset_link)
    
    if success:
        print("[AUTH CONTROLLER] Forgot password flow completed successfully.")
    else:
        print("[AUTH CONTROLLER ERROR] Email delivery failed, but returning generic success message to client for security.")

    return {
        "message": "If an account exists, a reset link has been sent to your email."
    }


def reset_password(token: str, new_password: str) -> dict:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    user = users_col.find_one({"reset_token_hash": token_hash})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.get("reset_token_exp", 0) < time.time():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    users_col.update_one(
        {"username": user["username"]},
        {
            "$set": {"password": hash_pw_secure(new_password)},
            "$unset": {"reset_token_hash": "", "reset_token_exp": "", "reset_token": ""}
        }
    )
    return {"message": "Password successfully reset. You can now login."}


# ── Seed default users ────────────────────────────────────────

def seed_admin():
    from config.db import employees_col, jobs_col, candidates_col
    company_id = "master_company"

    # Admin
    if employees_col.count_documents({"email": "admin@hrpro.com"}) == 0:
        admin_res = employees_col.insert_one({
            "name": "Admin User",
            "email": "admin@hrpro.com",
            "role": "admin",
            "department": "Management",
            "company_id": company_id,
            "createdAt": datetime.now().isoformat()
        })
        users_col.insert_one({
            "username": "admin",
            "password": hash_pw("admin123"),
            "role": "admin",
            "employee_id": str(admin_res.inserted_id),
            "company_id": company_id,
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Admin created: admin / admin123")

    # Default employee
    if employees_col.count_documents({"email": "user@hrpro.com"}) == 0:
        user_res = employees_col.insert_one({
            "name": "Default Employee",
            "email": "user@hrpro.com",
            "role": "employee",
            "department": "Engineering",
            "company_id": company_id,
            "createdAt": datetime.now().isoformat()
        })
        users_col.insert_one({
            "username": "user",
            "password": hash_pw("user123"),
            "role": "employee",
            "employee_id": str(user_res.inserted_id),
            "company_id": company_id,
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Employee created: user / user123")

    # Demo candidate (legacy username account for demo button)
    if users_col.count_documents({"username": "candidate"}) == 0:
        users_col.insert_one({
            "username": "candidate",
            "email": "candidate@demo.com",
            "full_name": "Demo Candidate",
            "password": hash_pw("candidate123"),
            "role": "candidate",
            "skills": ["React", "Python"],
            "experience": ["2 years at TechCorp as Frontend Dev"],
            "education": ["B.Tech Computer Science, 2022"],
            "bio": "Passionate developer looking for opportunities.",
            "location": "Bangalore",
            "company_id": company_id,
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Demo candidate: candidate@demo.com / candidate123")

    # Sample jobs
    if jobs_col.count_documents({}) == 0:
        jobs = [
            {"title": "Frontend Developer", "department": "Engineering",
             "location": "Bangalore", "type": "Full-time", "status": "Open",
             "salary": "₹8-12 LPA", "required_skills": "React, CSS, JavaScript",
             "company_id": company_id, "createdAt": datetime.now().isoformat()},
            {"title": "Backend Developer", "department": "Engineering",
             "location": "Remote", "type": "Full-time", "status": "Open",
             "salary": "₹10-15 LPA", "required_skills": "Python, FastAPI, MongoDB",
             "company_id": company_id, "createdAt": datetime.now().isoformat()},
            {"title": "UI/UX Designer", "department": "Design",
             "location": "Bangalore", "type": "Contract", "status": "Open",
             "salary": "₹6-10 LPA", "required_skills": "Figma, Adobe XD",
             "company_id": company_id, "createdAt": datetime.now().isoformat()}
        ]
        jobs_col.insert_many(jobs)
        print("✅ Sample jobs seeded")

    # Sample candidates
    if candidates_col.count_documents({}) == 0:
        fe = jobs_col.find_one({"title": "Frontend Developer"}) or {"_id": "fe"}
        be = jobs_col.find_one({"title": "Backend Developer"}) or {"_id": "be"}
        ui = jobs_col.find_one({"title": "UI/UX Designer"}) or {"_id": "ui"}
        candidates_col.insert_many([
            {"name": "Aditya Verma", "email": "aditya@example.com",
             "job_id": str(fe["_id"]), "stage": "Applied", "company_id": company_id, "createdAt": datetime.now().isoformat()},
            {"name": "Sneha Rao",    "email": "sneha@example.com",
             "job_id": str(be["_id"]), "stage": "Shortlisted", "company_id": company_id, "createdAt": datetime.now().isoformat()},
            {"name": "John Doe",     "email": "john@example.com",
             "job_id": str(ui["_id"]), "stage": "Interview", "company_id": company_id, "createdAt": datetime.now().isoformat()},
        ])
        print("✅ Sample pipeline candidates seeded")
