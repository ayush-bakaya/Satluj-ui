from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import subprocess
import psutil
import json

# ─────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────
DATABASE_URL = "sqlite:///./satluj_servers.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────────
# DATABASE MODELS
# ─────────────────────────────────────────────
class ServerModel(Base):
    __tablename__ = "servers"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    ip_address = Column(String, unique=True, index=True)
    port = Column(String, default="22")
    username = Column(String)
    status = Column(String, default="offline")  # online, offline
    cpu_usage = Column(Float, default=0.0)
    ram_usage = Column(Float, default=0.0)
    disk_usage = Column(Float, default=0.0)
    temperature = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="Satluj Servers API")

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
class ServerCreate(BaseModel):
    name: str
    ip_address: str
    port: str = "22"
    username: str = "root"

class ServerUpdate(BaseModel):
    name: str
    status: str
    cpu_usage: float
    ram_usage: float
    disk_usage: float
    temperature: float = 0.0

# ─────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────
def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ping_server(ip_address: str) -> bool:
    """Ping a server to check if it's online"""
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "1", ip_address],
            capture_output=True,
            timeout=2
        )
        return result.returncode == 0
    except:
        return False

def get_server_metrics(ip_address: str) -> dict:
    """Get server metrics (mock data for now, can be enhanced with SSH)"""
    # For demo: return mock data
    # In production: SSH into server and get actual metrics using psutil
    return {
        "cpu": 45.2,
        "ram": 62.5,
        "disk": 78.3,
        "temperature": 58.0
    }

# ─────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────

# ✅ ADD SERVER
@app.post("/servers")
def add_server(server: ServerCreate, db: Session = Depends(get_db)):
    """Add a new server"""
    try:
        # Check if server already exists
        existing = db.query(ServerModel).filter(ServerModel.ip_address == server.ip_address).first()
        if existing:
            raise HTTPException(status_code=400, detail="Server with this IP already exists")
        
        # Generate unique ID
        server_id = f"{server.name}_{server.ip_address}".replace(".", "_")
        
        # Ping server to check status
        is_online = ping_server(server.ip_address)
        
        # Get metrics
        metrics = get_server_metrics(server.ip_address)
        
        # Create new server
        db_server = ServerModel(
            id=server_id,
            name=server.name,
            ip_address=server.ip_address,
            port=server.port,
            username=server.username,
            status="online" if is_online else "offline",
            cpu_usage=metrics["cpu"] if is_online else 0.0,
            ram_usage=metrics["ram"] if is_online else 0.0,
            disk_usage=metrics["disk"] if is_online else 0.0,
            temperature=metrics["temperature"] if is_online else 0.0,
            created_at=datetime.utcnow()
        )
        db.add(db_server)
        db.commit()
        db.refresh(db_server)
        
        return {
            "message": "Server added successfully",
            "server": {
                "id": db_server.id,
                "name": db_server.name,
                "ip_address": db_server.ip_address,
                "status": db_server.status,
                "cpu": db_server.cpu_usage,
                "ram": db_server.ram_usage,
                "disk": db_server.disk_usage
            }
        }
    except Exception as e:
        db.rollback()
        print(f"Add server error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET ALL SERVERS
@app.get("/servers")
def get_servers(db: Session = Depends(get_db)):
    """Get all servers"""
    servers = db.query(ServerModel).all()
    return {
        "total": len(servers),
        "servers": [
            {
                "id": s.id,
                "name": s.name,
                "ip_address": s.ip_address,
                "status": s.status,
                "cpu": s.cpu_usage,
                "ram": s.ram_usage,
                "disk": s.disk_usage,
                "temperature": s.temperature,
                "last_updated": s.last_updated.isoformat() if s.last_updated else None,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in servers
        ]
    }


# ✅ GET SERVER BY ID
@app.get("/servers/{server_id}")
def get_server(server_id: str, db: Session = Depends(get_db)):
    """Get specific server details"""
    server = db.query(ServerModel).filter(ServerModel.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    return {
        "id": server.id,
        "name": server.name,
        "ip_address": server.ip_address,
        "port": server.port,
        "username": server.username,
        "status": server.status,
        "cpu": server.cpu_usage,
        "ram": server.ram_usage,
        "disk": server.disk_usage,
        "temperature": server.temperature,
        "last_updated": server.last_updated.isoformat(),
        "created_at": server.created_at.isoformat()
    }


# ✅ UPDATE SERVER STATUS & METRICS
@app.post("/servers/{server_id}/update")
def update_server(server_id: str, update: ServerUpdate, db: Session = Depends(get_db)):
    """Update server metrics"""
    server = db.query(ServerModel).filter(ServerModel.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    server.status = update.status
    server.cpu_usage = update.cpu_usage
    server.ram_usage = update.ram_usage
    server.disk_usage = update.disk_usage
    server.temperature = update.temperature
    server.last_updated = datetime.utcnow()
    db.commit()
    
    return {"message": "Server updated successfully"}


# ✅ PING SERVER
@app.post("/servers/{server_id}/ping")
def ping_server_endpoint(server_id: str, db: Session = Depends(get_db)):
    """Ping a server to check status"""
    server = db.query(ServerModel).filter(ServerModel.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    is_online = ping_server(server.ip_address)
    
    # Update status
    server.status = "online" if is_online else "offline"
    server.last_updated = datetime.utcnow()
    db.commit()
    
    return {
        "server_id": server_id,
        "ip_address": server.ip_address,
        "status": server.status,
        "online": is_online
    }


# ✅ REFRESH SERVER METRICS
@app.post("/servers/{server_id}/refresh")
def refresh_metrics(server_id: str, db: Session = Depends(get_db)):
    """Refresh server metrics"""
    server = db.query(ServerModel).filter(ServerModel.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Check if online
    is_online = ping_server(server.ip_address)
    
    if is_online:
        metrics = get_server_metrics(server.ip_address)
        server.cpu_usage = metrics["cpu"]
        server.ram_usage = metrics["ram"]
        server.disk_usage = metrics["disk"]
        server.temperature = metrics["temperature"]
    
    server.status = "online" if is_online else "offline"
    server.last_updated = datetime.utcnow()
    db.commit()
    
    return {
        "id": server.id,
        "status": server.status,
        "cpu": server.cpu_usage,
        "ram": server.ram_usage,
        "disk": server.disk_usage
    }


# ✅ DELETE SERVER
@app.delete("/servers/{server_id}")
def delete_server(server_id: str, db: Session = Depends(get_db)):
    """Delete a server"""
    server = db.query(ServerModel).filter(ServerModel.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.delete(server)
    db.commit()
    
    return {"message": f"Server {server_id} deleted successfully"}


# ✅ EXPORT SERVERS DATA (JSON)
@app.get("/servers-export/json")
def export_servers_json(db: Session = Depends(get_db)):
    """Export all servers data as JSON"""
    servers = db.query(ServerModel).all()
    
    return {
        "exported_at": datetime.utcnow().isoformat(),
        "total_servers": len(servers),
        "servers": [
            {
                "id": s.id,
                "name": s.name,
                "ip": s.ip_address,
                "status": s.status,
                "cpu": s.cpu_usage,
                "ram": s.ram_usage,
                "disk": s.disk_usage,
                "temp": s.temperature,
                "created": s.created_at.isoformat()
            }
            for s in servers
        ]
    }


# ✅ EXPORT SERVERS DATA (CSV)
@app.get("/servers-export/csv")
def export_servers_csv(db: Session = Depends(get_db)):
    """Export all servers data as CSV format"""
    servers = db.query(ServerModel).all()
    
    csv_content = "Name,IP Address,Status,CPU (%),RAM (%),Disk (%),Temperature (°C),Created\n"
    for s in servers:
        csv_content += f'"{s.name}",{s.ip_address},{s.status},{s.cpu_usage},{s.ram_usage},{s.disk_usage},{s.temperature},{s.created_at.strftime("%Y-%m-%d %H:%M:%S")}\n'
    
    return {
        "format": "csv",
        "filename": "servers_data.csv",
        "content": csv_content
    }


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Satluj Servers API running"}
