from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
from datetime import datetime, timedelta

app = FastAPI()

# 🔥 CORS CONFIG (VERY IMPORTANT)
origins = [
    "http://localhost:3000",   # React
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # frontend URLs
    allow_credentials=True,
    allow_methods=["*"],          # allow all (GET, POST, etc.)
    allow_headers=["*"],          # allow headers (Authorization)
)

# 🔥 ANALYTICS API
@app.get("/analytics")
def get_analytics(authorization: str = Header(default=None)):

    # TEMP: allow browser + frontend
    if authorization and authorization != "Bearer mysecrettoken":
        return {"error": "Unauthorized"}

    # Get CPU temperature
    try:
        if hasattr(psutil, "sensors_temperatures"):
            temps = psutil.sensors_temperatures()
            if temps:
                # Get the first sensor temperature (usually coretemp on Linux)
                first_sensor = list(temps.values())[0][0]
                cpu_temp = first_sensor.current
            else:
                cpu_temp = None
        else:
            cpu_temp = None
    except:
        cpu_temp = None

    # Get system uptime
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    
    # Convert to readable format (e.g., "2d 5h 30m")
    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    uptime_str = f"{days}d {hours}h {minutes}m"

    # Calculate health status based on system metrics
    cpu_percent = psutil.cpu_percent()
    ram_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage('/').percent
    
    # Create health logs for each metric
    logs = []
    
    # CPU check
    if cpu_percent > 90:
        logs.append({"level": "critical", "metric": "CPU", "message": f"CPU usage is CRITICAL at {cpu_percent:.1f}%", "value": cpu_percent})
    elif cpu_percent > 75:
        logs.append({"level": "warning", "metric": "CPU", "message": f"CPU usage is WARNING at {cpu_percent:.1f}%", "value": cpu_percent})
    else:
        logs.append({"level": "healthy", "metric": "CPU", "message": f"CPU usage is normal at {cpu_percent:.1f}%", "value": cpu_percent})
    
    # RAM check
    if ram_percent > 90:
        logs.append({"level": "critical", "metric": "RAM", "message": f"RAM usage is CRITICAL at {ram_percent:.1f}%", "value": ram_percent})
    elif ram_percent > 80:
        logs.append({"level": "warning", "metric": "RAM", "message": f"RAM usage is WARNING at {ram_percent:.1f}%", "value": ram_percent})
    else:
        logs.append({"level": "healthy", "metric": "RAM", "message": f"RAM usage is normal at {ram_percent:.1f}%", "value": ram_percent})
    
    # Disk check
    if disk_percent > 95:
        logs.append({"level": "critical", "metric": "DISK", "message": f"Disk usage is CRITICAL at {disk_percent:.1f}%", "value": disk_percent})
    elif disk_percent > 85:
        logs.append({"level": "warning", "metric": "DISK", "message": f"Disk usage is WARNING at {disk_percent:.1f}%", "value": disk_percent})
    else:
        logs.append({"level": "healthy", "metric": "DISK", "message": f"Disk usage is normal at {disk_percent:.1f}%", "value": disk_percent})
    
    # Determine overall health status
    if cpu_percent > 90 or ram_percent > 90 or disk_percent > 95:
        health_status = "Critical"
        health_color = "critical"
    elif cpu_percent > 75 or ram_percent > 80 or disk_percent > 85:
        health_status = "Warning"
        health_color = "warning"
    else:
        health_status = "Healthy"
        health_color = "healthy"

    return {
        "cpu": cpu_percent,
        "ram": ram_percent,
        "total_ram": round(psutil.virtual_memory().total / (1024**3), 2),
        "used_ram": round(psutil.virtual_memory().used / (1024**3), 2),
        "disk": disk_percent,
        "temperature": cpu_temp,
        "uptime": uptime_str,
        "health_status": health_status,
        "health_color": health_color,
        "logs": logs
    }