from bson import ObjectId
from datetime import datetime
from config.db import demo_requests_col
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def serialize(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


def send_demo_emails(record):
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    
    if not email_user or not email_pass:
        print("SMTP Credentials not configured. Skipping emails.")
        return

    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(email_user, email_pass)

        # 1. Admin Alert Email
        admin_msg = MIMEMultipart()
        admin_msg["From"] = email_user
        admin_msg["To"] = email_user
        admin_msg["Subject"] = f"New Demo Request: {record['company_name']}"
        admin_body = f"""A new demo request has been submitted.
        
Name: {record['name']}
Company: {record['company_name']}
Email: {record['email']}
Phone: {record['phone']}
Message: {record.get('message', '')}
        """
        admin_msg.attach(MIMEText(admin_body, "plain"))
        server.send_message(admin_msg)

        # 2. Client Confirmation Email
        client_msg = MIMEMultipart()
        client_msg["From"] = email_user
        client_msg["To"] = record['email']
        client_msg["Subject"] = "Demo Request Received - HR Recruiter Pro"
        client_body = f"""Hi {record['name']},

Thank you for requesting a demo of HR Recruiter Pro! 
Our team has received your request and we will be in touch shortly to schedule a time that works for you.

Best regards,
The HR Recruiter Pro Team
        """
        client_msg.attach(MIMEText(client_body, "plain"))
        server.send_message(client_msg)

        server.quit()
        print(f"Emails sent successfully for demo request from {record['email']}")
    except Exception as e:
        print(f"Failed to send email notifications: {e}")

def create_demo_request(data):
    """Insert a new demo request (public, no auth)."""
    record = data.dict()
    record["status"] = "Pending"
    record["scheduled_date"] = None
    record["scheduled_time"] = None
    record["demo_duration_minutes"] = 30
    record["admin_notes"] = ""
    record["created_at"] = datetime.utcnow().isoformat()
    record["updated_at"] = datetime.utcnow().isoformat()
    result = demo_requests_col.insert_one(record)
    record["_id"] = str(result.inserted_id)
    
    # Trigger emails
    send_demo_emails(record)
    
    return record


def get_all_demo_requests(status_filter=None):
    """List all demo requests, optionally filtered by status."""
    query = {}
    if status_filter and status_filter != "All":
        query["status"] = status_filter
    docs = list(demo_requests_col.find(query).sort("created_at", -1))
    return [serialize(d) for d in docs]


def get_demo_request_by_id(req_id):
    """Get a single demo request by ID."""
    try:
        doc = demo_requests_col.find_one({"_id": ObjectId(req_id)})
        return serialize(doc)
    except Exception:
        return None


def update_demo_request(req_id, data):
    """Update a demo request (status, schedule, notes, approval)."""
    from controllers.auth_controller import hash_pw
    from config.db import users_col, employees_col
    import string
    import secrets
    from datetime import timedelta
    
    updates = {k: v for k, v in data.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow().isoformat()
    
    # Pre-fetch document if we need to provision
    doc = demo_requests_col.find_one({"_id": ObjectId(req_id)})
    
    # Handle auto-provisioning when status is set to Approved
    if updates.get("status") == "Approved" and doc and doc.get("status") != "Approved":
        plan_type = updates.get("planType") or doc.get("planType") or "Starter"
        duration = updates.get("trialDurationDays") or 7
        
        # Set usage limits based on plan
        limits = {"employees": 5, "leaves": 10, "interviews": 5}
        if plan_type == "Professional":
            limits = {"employees": 20, "leaves": 50, "interviews": 20}
        if plan_type == "Enterprise":
            limits = {"employees": 9999, "leaves": 9999, "interviews": 9999}
            
        # Generate a secure temporary password (e.g., HR@83Ks!2)
        chars = string.ascii_letters + string.digits
        specials = "!@#$%^&*"
        temp_password = "HR@" + "".join(secrets.choice(chars) for _ in range(5)) + secrets.choice(specials) + str(secrets.choice(string.digits))
        
        # Check if already provisioned (email exists)
        existing = users_col.find_one({"email": doc["email"]})
        if existing:
            # We could update the existing user, but let's assume it's new for now
            print("User with this email already exists.")
        else:
            now = datetime.now()
            end_date = now + timedelta(days=duration)
            
            # Generate a unique company ID
            company_id = secrets.token_hex(8)
            
            # Create employee record
            emp_res = employees_col.insert_one({
                "name": doc["name"],
                "email": doc["email"],
                "role": "hr",
                "department": "Demo",
                "company_id": company_id,
                "createdAt": now.isoformat()
            })
            
            # Create user record
            users_col.insert_one({
                "username": doc["email"],
                "email": doc["email"],
                "password": hash_pw(temp_password),
                "role": "hr",
                "employee_id": str(emp_res.inserted_id),
                "company_id": company_id,
                "isDemoUser": True,
                "planType": plan_type,
                "trialStatus": "Active",
                "trialStartDate": now.isoformat(),
                "trialEndDate": end_date.isoformat(),
                "usageLimits": limits,
                "currentUsage": {"employees": 0, "leaves": 0, "interviews": 0},
                "forcePasswordChange": True,
                "tempPasswordExpiresAt": (now + timedelta(hours=24)).isoformat(),
                "createdAt": now.isoformat()
            })
            
            # Send Email with credentials
            email_user = os.getenv("EMAIL_USER")
            email_pass = os.getenv("EMAIL_PASS")
            if email_user and email_pass:
                try:
                    server = smtplib.SMTP("smtp.gmail.com", 587)
                    server.starttls()
                    server.login(email_user, email_pass)
                    
                    msg = MIMEMultipart()
                    msg["From"] = email_user
                    msg["To"] = doc["email"]
                    msg["Subject"] = f"Your HR Recruiter Pro Demo is Ready!"
                    body = f"""Hello {doc['name']},

Your demo request for HR Recruiter Pro has been approved.

You can now access the demo portal using the credentials below:

Login URL:
http://localhost:5173/login

Email:
{doc['email']}

Temporary Password:
{temp_password}

Trial Plan:
{plan_type} Demo Plan

Trial Expiry:
{end_date.strftime('%Y-%m-%d')}

Please note:

* Demo access is temporary
* Some advanced features may be restricted
* You can upgrade anytime from the Pricing section

Thank you,
HR Recruiter Pro Team
"""
                    msg.attach(MIMEText(body, "plain"))
                    server.send_message(msg)
                    server.quit()
                    print(f"Demo credentials sent to {doc['email']}")
                except Exception as e:
                    print(f"Failed to send credentials: {e}")

    demo_requests_col.update_one(
        {"_id": ObjectId(req_id)},
        {"$set": updates}
    )
    return get_demo_request_by_id(req_id)


def delete_demo_request(req_id):
    """Delete a demo request."""
    demo_requests_col.delete_one({"_id": ObjectId(req_id)})
    return {"deleted": True}


def get_demo_stats():
    """Return counts by status."""
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    results = list(demo_requests_col.aggregate(pipeline))
    stats = {"Pending": 0, "Approved": 0, "Rejected": 0, "Cancelled": 0, "Expired": 0, "Total": 0}
    for r in results:
        if r["_id"] in stats:
            stats[r["_id"]] = r["count"]
        stats["Total"] += r["count"]
    return stats
