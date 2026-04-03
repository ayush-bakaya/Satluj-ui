from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 In-memory DB
USER_DB = []

class User(BaseModel):
    username: str
    password: str


# ✅ SIGNUP API
@app.post("/signup")
def signup(user: User):
    # check if user exists
    for u in USER_DB:
        if u["username"] == user.username:
            raise HTTPException(status_code=400, detail="User already exists")

    USER_DB.append({
        "username": user.username,
        "password": user.password
    })

    return {"message": "User created successfully"}


# ✅ LOGIN API
@app.post("/login")
def login(user: User):
    for u in USER_DB:
        if u["username"] == user.username and u["password"] == user.password:
            return {"token": f"token-{user.username}"}

    raise HTTPException(status_code=401, detail="Invalid credentials")


# ✅ DASHBOARD
@app.get("/dashboard")
def dashboard(token: str):
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")

    return {
        "users": len(USER_DB),
        "servers": 15,
        "uptime": "99.9%"
    }