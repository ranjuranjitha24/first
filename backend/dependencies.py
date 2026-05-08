from fastapi import Header, HTTPException, Depends
import base64, json, time

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        decoded = json.loads(base64.b64decode(token).decode())
        if decoded.get("exp", 0) < time.time():
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
