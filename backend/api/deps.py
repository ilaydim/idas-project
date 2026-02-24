from fastapi import Header, HTTPException
from backend.infrastructure.supabase.jwt_verify import verify_token

def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "").strip()

    try:
        payload = verify_token(token)
        return payload  # içinde "sub" user id olacak
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")