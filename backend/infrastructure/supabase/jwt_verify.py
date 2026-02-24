import os
import requests
import jwt
from jwt.algorithms import RSAAlgorithm

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_AUD = "authenticated"

def verify_token(token: str) -> dict:
    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is missing in env")

    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    jwks = requests.get(jwks_url, timeout=10).json()

    header = jwt.get_unverified_header(token)
    kid = header.get("kid")

    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if not key:
        raise Exception("JWKS key not found")

    public_key = RSAAlgorithm.from_jwk(key)

    payload = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience=SUPABASE_JWT_AUD,
    )

    return payload