from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
import psutil

app = FastAPI()

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analytics")
def analytics(authorization: str = Header(None)):
    if authorization != "Bearer mysecrettoken":
        return {"error": "Unauthorized"}

    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "cpu": cpu,
        "ram": memory.percent,
        "total_ram": round(memory.total / (1024**3), 2),
        "used_ram": round(memory.used / (1024**3), 2),
        "disk": disk.percent
    }