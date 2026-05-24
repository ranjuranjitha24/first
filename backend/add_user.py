import bcrypt
from datetime import datetime
from pymongo import MongoClient

def hash_pw(pw: str) -> str:
    # Use the same hashing as the new backend
    import hashlib
    return hashlib.sha256(pw.encode()).hexdigest()

client = MongoClient('mongodb://localhost:27017/')
db = client['test'] # HR database name might be test or hr_recruiter
# let's try hr_recruiter first, if not we will check the config
import sys
import os
sys.path.append(os.path.dirname(__file__))
try:
    from config.db import users_col, employees_col
    
    # 1. Add employee record
    emp_res = employees_col.insert_one({
        "name": "Ranjitha Gowda",
        "email": "ranjithagowda9801@gmail.com",
        "role": "admin",
        "department": "Management",
        "company_id": "master_company",
        "createdAt": datetime.now().isoformat()
    })
    
    # 2. Add user record
    users_col.insert_one({
        "username": "ranjithagowda9801@gmail.com",
        "password": hash_pw("Ranju2005"),
        "role": "admin",
        "employee_id": str(emp_res.inserted_id),
        "company_id": "master_company",
        "createdAt": datetime.now().isoformat()
    })
    
    print("User ranjithagowda9801@gmail.com added successfully!")
except Exception as e:
    print("Error:", e)
