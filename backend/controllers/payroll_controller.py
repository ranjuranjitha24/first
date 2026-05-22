from bson import ObjectId
from config.db import payroll_col, employees_col
from models.payroll_model import PayrollCreate, PayrollUpdate
from fastapi import HTTPException
from datetime import datetime

def serialize(doc, company_id=None) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    if "employee_id" in doc and "employee_name" not in doc:
        emp_query = {"_id": ObjectId(doc["employee_id"])}
        if company_id: emp_query["company_id"] = company_id
        emp = employees_col.find_one(emp_query)
        doc["employee_name"] = emp["name"] if emp else "Unknown"
        doc["employee_role"] = emp["role"] if emp else "N/A"
    return doc

def get_all_payroll(month: str = "", employee_id: str = "", company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if month: query["month"] = month
    if employee_id: query["employee_id"] = employee_id
    
    docs = list(payroll_col.find(query).sort("month", -1))
    return [serialize(d, company_id) for d in docs]

def create_payroll(data: PayrollCreate, company_id: str = None):
    payload = data.model_dump()
    # Auto-calculate net salary
    payload["net_salary"] = payload["base_salary"] + payload["bonuses"] - payload["deductions"] - payload["tax"]
    payload["createdAt"] = datetime.now().isoformat()
    if company_id: payload["company_id"] = company_id
    
    res = payroll_col.insert_one(payload)
    return serialize(payroll_col.find_one({"_id": res.inserted_id}), company_id)

def update_payroll(pid: str, data: PayrollUpdate, company_id: str = None):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = {"_id": ObjectId(pid)}
    if company_id: query["company_id"] = company_id
    # Re-calculate net if bonuses/deductions change
    existing = payroll_col.find_one(query)
    if not existing: raise HTTPException(status_code=404, detail="Payroll not found")
    if "bonuses" in update_data or "deductions" in update_data:
        base = update_data.get("base_salary", existing.get("base_salary", 0))
        bon  = update_data.get("bonuses", existing.get("bonuses", 0))
        ded  = update_data.get("deductions", existing.get("deductions", 0))
        tax  = update_data.get("tax", existing.get("tax", 0))
        update_data["net_salary"] = base + bon - ded - tax

    payroll_col.update_one(query, {"$set": update_data})
    return serialize(payroll_col.find_one(query), company_id)

def get_payroll_stats(company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    total_paid = list(payroll_col.aggregate([
        {"$match": {**query, "status": "Paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$net_salary"}}}
    ]))
    avg_salary = list(payroll_col.aggregate([
        {"$match": query} if company_id else {"$match": {}},
        {"$group": {"_id": None, "avg": {"$avg": "$net_salary"}}}
    ]))
    
    return {
        "totalExpense": total_paid[0]["total"] if total_paid else 0,
        "averageSalary": avg_salary[0]["avg"] if avg_salary else 0,
        "pendingPayments": payroll_col.count_documents({**query, "status": "Pending"}),
        "byMonth": list(payroll_col.aggregate([
            {"$match": query} if company_id else {"$match": {}},
            {"$group": {"_id": "$month", "total": {"$sum": "$net_salary"}}},
            {"$sort": {"_id": 1}}
        ]))
    }
