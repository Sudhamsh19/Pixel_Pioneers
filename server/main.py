from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import random
import time
import asyncio
from datetime import datetime
import os
import threading

# --- CONFIGURATION ---
MODEL_FILE = 'multiclass_xgboost_ids.joblib'
LABEL_ENCODER_FILE = 'label_encoder.joblib'
FEATURE_FILE = 'feature_columns.json'
SIMULATED_FILE = 'large_simulation_log.csv'

# --- COUNTRY MAPPING (For Portal A Map) ---
COUNTRY_COORDS = {
    "USA": [37.0902, -95.7129], "China": [35.8617, 104.1954],
    "Russia": [61.5240, 105.3188], "Germany": [51.1657, 10.4515],
    "Brazil": [-14.2350, -51.9253], "India": [20.5937, 78.9629],
    "North Korea": [40.3399, 127.5101], "Unknown": [0, 0]
}

# --- GLOBAL STATE (In-Memory Database) ---
# Since this is a hackathon, we use global variables instead of a SQL DB.
class SystemState:
    def __init__(self):
        self.history = []         # Stores last 100 packets
        self.active_incidents = [] # Threats waiting for Portal B review
        self.audit_log = []       # Permanent log of all actions
        self.stats = {
            "scanned": 0,
            "threats_detected": 0,
            "auto_blocked": 0,
            "manual_blocked": 0,
            "uptime_start": time.time()
        }
        self.config = {
            "auto_block_threshold": 0.95, # 95% confidence
            "simulation_speed": 1.0       # Seconds per packet
        }
        self.is_running = True

state = SystemState()

# --- LOAD ASSETS ---
print("Loading AI Models...")
model = joblib.load(MODEL_FILE)
label_encoder = joblib.load(LABEL_ENCODER_FILE)
with open(FEATURE_FILE, 'r') as f:
    feature_columns = json.load(f)

# Load Traffic Data
if os.path.exists(SIMULATED_FILE):
    traffic_df = pd.read_csv(SIMULATED_FILE)
    traffic_df.columns = traffic_df.columns.str.strip()
    print(f"Loaded {len(traffic_df)} rows of traffic data.")
else:
    raise FileNotFoundError(f"Run 'mine_all_attacks.py' first!")

# --- BACKGROUND SIMULATOR ---
# This thread mimics live traffic coming into the router
def traffic_simulator():
    index = 0
    while True:
        if state.is_running:
            try:
                # 1. Get Next Packet
                row = traffic_df.iloc[index % len(traffic_df)]
                index += 1

                # 2. Predict
                features = pd.DataFrame([row[feature_columns]])
                pred_numeric = model.predict(features)[0]
                pred_text = label_encoder.inverse_transform([pred_numeric])[0]
                
                # 3. Enrich Data (Fake Metadata)
                fake_ip = f"192.168.1.{random.randint(10, 200)}"
                fake_country = random.choice(list(COUNTRY_COORDS.keys()))
                timestamp = datetime.now().isoformat()
                
                # Fake Confidence
                if pred_text == "Normal Traffic":
                    confidence = random.uniform(0.90, 0.99)
                else:
                    confidence = random.uniform(0.75, 0.99)

                packet = {
                    "id": index,
                    "timestamp": timestamp,
                    "src_ip": fake_ip,
                    "country": fake_country,
                    "lat": COUNTRY_COORDS[fake_country][0],
                    "lon": COUNTRY_COORDS[fake_country][1],
                    "type": pred_text,
                    "confidence": confidence,
                    "destination_port": int(row.get("Destination Port", 0)),
                    "action": "MONITOR"
                }

                # 4. SOAR Logic (The Brain)
                state.stats["scanned"] += 1
                
                if pred_text != "Normal Traffic":
                    state.stats["threats_detected"] += 1
                    
                    # Check Auto-Block Policy
                    if confidence >= state.config["auto_block_threshold"]:
                        packet["action"] = "AUTO_BLOCKED"
                        state.stats["auto_blocked"] += 1
                        # Log to audit trail immediately
                        state.audit_log.append({**packet, "handled_by": "SYSTEM_AUTOMATION"})
                    else:
                        # Send to Portal B (Human Review)
                        packet["action"] = "PENDING_REVIEW"
                        # Only add if not already flooding the queue
                        if len(state.active_incidents) < 10: 
                            state.active_incidents.append(packet)

                # 5. Update History (Rolling Buffer)
                state.history.insert(0, packet)
                if len(state.history) > 100:
                    state.history.pop()

            except Exception as e:
                print(f"Simulation Error: {e}")

        # Wait based on config speed
        time.sleep(state.config["simulation_speed"])

# Start Simulation in Background Thread
sim_thread = threading.Thread(target=traffic_simulator, daemon=True)
sim_thread.start()

# --- API ENDPOINTS ---
app = FastAPI(title="Pixel Pioneers SOAR API")

# Allow Frontend (React/Next.js) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PORTAL A ENDPOINTS (Read-Only / Monitoring) ===

@app.get("/api/system/health")
def get_system_health():
    """For Page A0: System Overview"""
    uptime_seconds = int(time.time() - state.stats["uptime_start"])
    return {
        "status": "HEALTHY" if len(state.active_incidents) < 5 else "DEGRADED",
        "uptime_seconds": uptime_seconds,
        "traffic_processed": f"{state.stats['scanned'] / 1000:.1f}k",
        "automation_rate": f"{100 * (state.stats['auto_blocked'] / (state.stats['threats_detected'] + 1)):.1f}%"
    }

@app.get("/api/traffic/live")
def get_live_traffic():
    """For Page A1: Command Center & A4: Event Stream"""
    return state.history[:20] # Return last 20 packets

@app.get("/api/threats/map")
def get_threat_map():
    """For Page A3: Global Map"""
    # Filter only threats
    threats = [p for p in state.history if p["type"] != "Normal Traffic"]
    return threats

# === PORTAL B ENDPOINTS (Admin / Action) ===

@app.get("/api/incidents/pending")
def get_pending_incidents():
    """For Page B1 & B2: Analyst Queue"""
    return state.active_incidents

class ActionRequest(BaseModel):
    action: str # "BLOCK" or "IGNORE"
    analyst_id: str = "admin_user"

@app.post("/api/incidents/{packet_id}/resolve")
def resolve_incident(packet_id: int, req: ActionRequest):
    """For Page B2: Take Action"""
    # Find the incident
    incident = next((i for i in state.active_incidents if i["id"] == packet_id), None)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found or already resolved")

    # Remove from active queue
    state.active_incidents.remove(incident)

    # Update Stats & Audit Log
    if req.action == "BLOCK":
        state.stats["manual_blocked"] += 1
        incident["action"] = "MANUAL_BLOCK"
    else:
        incident["action"] = "FALSE_POSITIVE"
    
    # Log it
    state.audit_log.append({
        **incident,
        "handled_by": req.analyst_id,
        "resolved_at": datetime.now().isoformat()
    })
    
    return {"status": "success", "action_taken": req.action}

@app.get("/api/logs/audit")
def get_audit_log():
    """For Page B3: Audit Logs"""
    return state.audit_log

@app.post("/api/config/update")
def update_config(threshold: float):
    """For Page B5: Admin Config"""
    if 0.0 <= threshold <= 1.0:
        state.config["auto_block_threshold"] = threshold
        return {"status": "updated", "new_threshold": threshold}
    raise HTTPException(status_code=400, detail="Invalid threshold")