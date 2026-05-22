from fastapi import Header, HTTPException, Depends
import base64, json, time

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        decoded = json.loads(base64.b64decode(token).decode())
        if "exp" in decoded and decoded["exp"] < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_required(user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

def check_admin(user: dict = Depends(get_current_user_required)):
    if user.get("role") not in ["admin", "hr"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def check_super_admin(user: dict = Depends(get_current_user_required)):
    if user.get("role") not in ["admin", "hr"] or user.get("isDemoUser") is True:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user

def check_demo_limit(resource: str):
    def _check(user: dict = Depends(get_current_user_required)):
        if user.get("isDemoUser"):
            from config.db import users_col
            from bson import ObjectId
            # Fetch fresh limits from DB
            user_doc = users_col.find_one({"username": user.get("username")})
            if not user_doc:
                return user
                
            limits = user_doc.get("usageLimits", {})
            current = user_doc.get("currentUsage", {})
            
            if resource in limits:
                if current.get(resource, 0) >= limits[resource]:
                    raise HTTPException(status_code=403, detail=f"demo_limit_reached:{resource}")
        return user
    return _check
