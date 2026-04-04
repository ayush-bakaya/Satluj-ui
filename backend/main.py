from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import hashlib

# ─────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────
DATABASE_URL = "sqlite:///./satluj_users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────────
# DATABASE MODELS
# ─────────────────────────────────────────────
class UserModel(Base):
    __tablename__ = "users"
    
    username = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    role = Column(String, default="user")  # admin, user, viewer
    is_active = Column(String, default="offline")  # online, offline, idle

# Create tables
Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────
class User(BaseModel):
    username: str
    email: str
    password: str

class LoginCredentials(BaseModel):
    username: str
    password: str

# ─────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────

# ✅ SIGNUP API
@app.post("/signup")
def signup(user: User, db: Session = Depends(get_db)):
    """Create a new user account"""
    try:
        # Check if user exists
        existing_user = db.query(UserModel).filter(UserModel.username == user.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Check if email already exists
        existing_email = db.query(UserModel).filter(UserModel.email == user.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user with email, default role and status
        db_user = UserModel(
            username=user.username,
            email=user.email,
            password_hash=hash_password(user.password),
            created_at=datetime.utcnow(),
            role="user",  # Default role
            is_active="offline"  # Default status
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {
            "message": "User created successfully",
            "username": db_user.username,
            "email": db_user.email,
            "created_at": db_user.created_at.isoformat(),
            "role": db_user.role
        }
    except Exception as e:
        db.rollback()
        print(f"Signup error: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))


# ✅ LOGIN API
@app.post("/login")
def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    # Find user by username
    db_user = db.query(UserModel).filter(UserModel.username == credentials.username).first()
    
    if not db_user:
        print(f"User not found: {credentials.username}")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if db_user.password_hash != hash_password(credentials.password):
        print(f"Password mismatch for {credentials.username}")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login and set status to online
    db_user.last_login = datetime.utcnow()
    db_user.is_active = "online"
    db.commit()
    
    return {
        "token": f"token-{db_user.username}",
        "username": db_user.username,
        "email": db_user.email,
        "created_at": db_user.created_at.isoformat(),
        "last_login": db_user.last_login.isoformat(),
        "role": db_user.role
    }


# ✅ LOGOUT API
@app.post("/logout")
def logout(token: str, db: Session = Depends(get_db)):
    """Logout user and set status to offline"""
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    username = token.replace("token-", "")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    
    if user:
        user.is_active = "offline"
        db.commit()
    
    return {"message": f"User {username} logged out successfully"}


# ✅ DASHBOARD API
@app.get("/dashboard")
def dashboard(token: str, db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    total_users = db.query(UserModel).count()
    
    return {
        "users": total_users,
        "servers": 15,
        "uptime": "99.9%"
    }


# ✅ GET ALL USERS (for admin)
@app.get("/users")
def get_users(token: str, db: Session = Depends(get_db)):
    """Get all registered users"""
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = db.query(UserModel).all()
    return [
        {
            "username": u.username,
            "created_at": u.created_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


# ✅ GET ACTIVE USERS WITH ROLES
@app.get("/active-users")
def get_active_users(token: str, db: Session = Depends(get_db)):
    """Get all active users with roles and status"""
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = db.query(UserModel).filter(UserModel.is_active != "offline").all()
    
    return {
        "active_users": [
            {
                "name": u.username,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "status": u.is_active,
                "loginTime": u.last_login.strftime("%H:%M:%S") if u.last_login else "N/A",
                "ip": "192.168.1.1",  # Mock IP
                "lastActive": "Just now" if u.is_active == "online" else "5 mins ago"
            }
            for u in users
        ]
    }


# ✅ UPDATE USER STATUS
@app.post("/update-user-status/{username}")
def update_user_status(username: str, status: str, db: Session = Depends(get_db)):
    """Update user online/offline status"""
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if status not in ["online", "offline", "idle"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    user.is_active = status
    db.commit()
    return {"message": f"User {username} status updated to {status}"}


# ✅ GET ACTIVITY LOGS
@app.get("/activity-logs")
def get_activity_logs(token: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get recent activity logs"""
    if not token.startswith("token-"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = db.query(UserModel).order_by(UserModel.last_login.desc()).limit(limit).all()
    
    activity_logs = []
    for u in users:
        activity_logs.append({
            "user": u.username,
            "type": "login",
            "timestamp": u.last_login.isoformat() if u.last_login else datetime.utcnow().isoformat(),
            "role": u.role,
            "details": f"User {u.username} logged in"
        })
    
    return {
        "activity_logs": activity_logs
    }


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Satluj Auth API running"}


# ─────────────────────────────────────────────
# DEBUG ENDPOINT
# ─────────────────────────────────────────────
@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    """Debug endpoint to see all users in database"""
    users = db.query(UserModel).all()
    return {
        "total_users": len(users),
        "users": [
            {
                "username": u.username,
                "password_hash": u.password_hash[:20] + "...",
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None
            }
            for u in users
        ]
    }