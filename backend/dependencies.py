from fastapi import Header, HTTPException
import base64, json

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        # No auth provided — return a dummy guest role or raise 401
        # For public access (like getting jobs), we might want to not raise an error.
        # But for protected routes, we need it. Let's return None if not present, 
        # and endpoints can enforce it.
        return None
    try:
        token = authorization.split(" ")[1]
        decoded = json.loads(base64.b64decode(token).decode())
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_required(authorization: str = Header(None)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
