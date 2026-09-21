export const PYTHON_APP_SCRIPT = `"""
Project VANGUARD: Stage 1 High-Fidelity Digital Twin & Operations Ground Station
System Problem ID: 26026 — Smart India Hackathon (Ministry of Railways / RPF)
Autonomous Quadruped Inspection & Explosive Detection System for GPS-Denied Railway Infrastructure
"""

import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import hashlib
import json
import time
from datetime import datetime, timezone

# -----------------------------------------------------------------------------
# PAGE CONFIGURATION & CRITICAL VIEWPORT METRICS
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Project VANGUARD | Ground Station",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -----------------------------------------------------------------------------
# ENTERPRISE STYLING & RESPONSIVE VIEWPORT CSS
# -----------------------------------------------------------------------------
CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;600;700&display=swap');

    :root {
        --bg-dark: #080c14;
        --card-bg: #121926;
        --card-border: #1e293b;
        --accent-cyan: #00f2fe;
        --accent-blue: #4facfe;
        --alert-red: #ff3366;
        --alert-amber: #f59e0b;
        --safe-green: #10b981;
        --text-main: #f1f5f9;
        --text-muted: #94a3b8;
    }

    .stApp {
        background-color: var(--bg-dark);
        color: var(--text-main);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    section[data-testid="stSidebar"] {
        background-color: #0b111e;
        border-right: 1px solid #1e293b;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: -0.02em;
        color: #f8fafc;
    }

    .vanguard-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 14px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .sl-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        margin: 2px 4px 2px 0;
        background: rgba(18, 25, 38, 0.9);
        border: 1px solid #334155;
        color: #cbd5e1;
    }
    .sl-badge-active {
        border-color: var(--accent-cyan);
        color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.08);
    }

    .telemetry-pill {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: 6px;
        background: #0d1422;
        border: 1px solid #1f293d;
        margin-bottom: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
    }
    .telemetry-label { color: var(--text-muted); }
    .telemetry-val { color: var(--accent-cyan); font-weight: 700; }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# SESSION STATE & PRESET INJECTION
# -----------------------------------------------------------------------------
def init_session_state():
    defaults = {
        "regime": "Crawl Mode (Hazard Ballast Stance)",
        "ballast_roughness": 0.45,
        "pitch_deg": 4.5,
        "roll_deg": -3.2,
        "z_offset": 0.0,
        "visual_conf": 0.12,
        "thermal_c": 32.5,
        "chemical_ppm": 14.0,
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

init_session_state()

# -----------------------------------------------------------------------------
# SIDEBAR: DYNAMIC TELEMETRY INJECTION BUS
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### ⚡ VANGUARD HIL BUS")
    st.markdown("SIH-26026 Hardware-in-the-Loop Telemetry Harness")
    st.markdown("---")

    # 1. Operational Regime
    regime_mode = st.radio(
        "Operational Regime",
        ["Trot Mode (Station Transit)", "Crawl Mode (Hazard Ballast Stance)"],
        index=1 if st.session_state["regime"] == "Crawl Mode (Hazard Ballast Stance)" else 0
    )
    st.session_state["regime"] = regime_mode

    ballast_roughness = st.slider(
        "Ballast Roughness / Dispersion Coeff (μ)",
        0.00, 1.00, float(st.session_state["ballast_roughness"]), 0.01
    )
    st.session_state["ballast_roughness"] = ballast_roughness

    st.markdown("---")
    # 2. Virtual IMU
    pitch_angle = st.slider("Chassis Pitch Angle θ (°)", -30.0, 30.0, float(st.session_state["pitch_deg"]), 0.5)
    st.session_state["pitch_deg"] = pitch_angle

    roll_angle = st.slider("Chassis Roll Angle ϕ (°)", -30.0, 30.0, float(st.session_state["roll_deg"]), 0.5)
    st.session_state["roll_deg"] = roll_angle

    z_clearance = st.slider("Ground Clearance Z-Offset (m)", -0.10, 0.10, float(st.session_state["z_offset"]), 0.01)
    st.session_state["z_offset"] = z_clearance

    st.markdown("---")
    # 3. Tri-Sensor Influx
    vis_conf = st.slider("Visual AI Confidence (Hailo-8)", 0.00, 1.00, float(st.session_state["visual_conf"]), 0.01)
    st.session_state["visual_conf"] = vis_conf

    if vis_conf < 0.30:
        detected_class = "Track Clearance / Debris Clear"
    elif vis_conf < 0.65:
        detected_class = "Unattended Baggage (Sub-Ballast)"
    elif vis_conf < 0.85:
        detected_class = "Concealed Bogie Compartment Void"
    else:
        detected_class = "Taped Ordnance / Military PE4 / RDX"

    st.caption(f"Detected Class: {detected_class}")

    thermal_val = st.slider("Radiometric Thermal Core (°C)", 15.0, 110.0, float(st.session_state["thermal_c"]), 0.5)
    st.session_state["thermal_c"] = thermal_val

    chem_val = st.slider("Forced-Air Chemical Trace (PPM)", 0.0, 150.0, float(st.session_state["chemical_ppm"]), 1.0)
    st.session_state["chemical_ppm"] = chem_val

    st.markdown("---")
    # 4. Mission Presets
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Clear Track Sweep"):
            st.session_state["visual_conf"] = 0.08
            st.session_state["thermal_c"] = 28.0
            st.session_state["chemical_ppm"] = 8.0
            st.rerun()
    with col2:
        if st.button("Bogie Ordnance"):
            st.session_state["visual_conf"] = 0.92
            st.session_state["thermal_c"] = 78.4
            st.session_state["chemical_ppm"] = 94.0
            st.rerun()

    if st.button("Brake Disc False Pos"):
        st.session_state["visual_conf"] = 0.05
        st.session_state["thermal_c"] = 92.0
        st.session_state["chemical_ppm"] = 5.0
        st.rerun()

# -----------------------------------------------------------------------------
# THREAT FORMULATION & KINEMATICS ENGINE
# -----------------------------------------------------------------------------
norm_thermal = float(np.clip((st.session_state["thermal_c"] - 25.0) / (85.0 - 25.0), 0.0, 1.0))
norm_chem = float(np.clip((st.session_state["chemical_ppm"] - 10.0) / (100.0 - 10.0), 0.0, 1.0))
threat_score = float(np.clip((0.45 * st.session_state["visual_conf"]) + (0.35 * norm_thermal) + (0.20 * norm_chem), 0.0, 1.0))

st.title("🛡️ PROJECT VANGUARD: GROUND STATION")
st.markdown("Stage 1 High-Fidelity Digital Twin & Operations Ground Station (SIH-26026)")

# 6 System Layer Badges
st.markdown("""
<div style="margin-bottom: 15px;">
    <span class="sl-badge sl-badge-active">SL-0: POWER & E-STOP (OK)</span>
    <span class="sl-badge sl-badge-active">SL-1: 12-DOF HIGH-G ACTUATION (1 kHz)</span>
    <span class="sl-badge sl-badge-active">SL-2: TEENSY 4.1 RT KINEMATICS (600 MHz)</span>
    <span class="sl-badge sl-badge-active">SL-3: HAILO-8 26 TOPS AI CORE (ACTIVE)</span>
    <span class="sl-badge sl-badge-active">SL-4: ROS 2 LIO-SAM GPS-DENIED (SYNC)</span>
    <span class="sl-badge sl-badge-active">SL-5: SHA-256 FORENSIC VAULT (LOCKED)</span>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "📐 3D Kinematics Digital Twin",
    "🧠 Neurosymbolic Threat Fusion",
    "🗺️ GPS-Denied SLAM & Costmap",
    "🔐 Cryptographic Audit Vault",
    "📋 BOM & SIH Defense Matrix",
    "🎮 Virtual-Simulation"
])

# [TAB 1: 3D KINEMATICS]
with tab1:
    st.subheader("Analytical Kinematics & Active Stabilization")
    pitch_rad = np.radians(st.session_state["pitch_deg"])
    roll_rad = np.radians(st.session_state["roll_deg"])
    
    # 3D Plotly Render of Chassis, Articulated Legs and Ballast Mesh
    fig_3d = go.Figure()
    # Terrain mesh
    gx = np.linspace(-0.6, 0.6, 20)
    gy = np.linspace(-0.5, 0.5, 18)
    GX, GY = np.meshgrid(gx, gy)
    GZ = np.sin(GX * 8.0) * np.cos(GY * 6.0) * (st.session_state["ballast_roughness"] * 0.035)
    fig_3d.add_trace(go.Surface(x=GX, y=GY, z=GZ, colorscale="Darkmint", showscale=False, opacity=0.75))
    
    # Chassis COM
    com_z = 0.35 + st.session_state["z_offset"]
    fig_3d.add_trace(go.Scatter3d(x=[0], y=[0], z=[com_z], mode="markers+text", marker=dict(size=8, color="#ff3366"), text=["COM"]))
    
    # Four Legs
    leg_coords = {
        "FL": ([0.25, 0.28, 0.28], [0.14, 0.20, 0.20], [com_z, com_z*0.5, 0.0]),
        "FR": ([0.25, 0.28, 0.28], [-0.14, -0.20, -0.20], [com_z, com_z*0.5, 0.0]),
        "RL": ([-0.25, -0.28, -0.28], [0.14, 0.20, 0.20], [com_z, com_z*0.5, 0.0]),
        "RR": ([-0.25, -0.28, -0.28], [-0.14, -0.20, -0.20], [com_z, com_z*0.5, 0.0]),
    }
    for lid, (lx, ly, lz) in leg_coords.items():
        fig_3d.add_trace(go.Scatter3d(x=lx, y=ly, z=lz, mode="lines+markers", line=dict(color="#00f2fe", width=6), marker=dict(size=5)))
        
    fig_3d.update_layout(paper_bgcolor="#080c14", plot_bgcolor="#080c14", height=500, margin=dict(l=0, r=0, t=10, b=0))
    st.plotly_chart(fig_3d, use_container_width=True)

# [TAB 2: THREAT FUSION]
with tab2:
    st.subheader("Cognitive Tri-Sensor Fusion")
    fig_gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=threat_score,
        title={'text': "Threat Escalation Index"},
        gauge={'axis': {'range': [0, 1]}, 'bar': {'color': "#00f2fe" if threat_score < 0.7 else "#ff3366"}}
    ))
    fig_gauge.update_layout(paper_bgcolor="#080c14", height=300)
    st.plotly_chart(fig_gauge, use_container_width=True)

# [TAB 3: SLAM COSTMAP]
with tab3:
    st.subheader("ROS 2 Nav2 Costmap & Evasion Vector")
    st.info("Dynamic Voronoi clearance active under train bogie undercarriages.")

# [TAB 4: CRYPTOGRAPHIC VAULT]
with tab4:
    st.subheader("Sec. 65B Indian Evidence Act Forensic Vault")
    payload = {
        "device_id": "VANGUARD-QUAD-UNIT-04",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "threat_index": threat_score,
        "visual_conf": st.session_state["visual_conf"],
        "thermal_c": st.session_state["thermal_c"],
        "chemical_ppm": st.session_state["chemical_ppm"]
    }
    dumped = json.dumps(payload, indent=2)
    sig = hashlib.sha256(dumped.encode()).hexdigest()
    st.code(dumped, language="json")
    st.success(f"SHA-256 Digest: {sig}")
    st.download_button("Download Signed Forensic Record", dumped, file_name="forensic_report.json")

# [TAB 5: BOM & DEFENSE]
with tab5:
    st.subheader("Bill of Materials (Total: ₹1,94,500 INR)")
    st.markdown("- Hailo-8 M.2 AI Acceleration Module (26 TOPS)\\n- FLIR Lepton 3.5 Radiometric Thermal Core\\n- Teensy 4.1 600MHz ARM Cortex-M7 Real-Time IK\\n- 12x Custom High-G Planetary Brushless Servos")

# [TAB 6: 🎮 VIRTUAL-SIMULATION]
with tab6:
    st.subheader("🎮 Virtual-Simulation Ground Station & Freight Sweep Zone")
    st.markdown("Full 3D Station Environment: Dual Tracks, Sleepers, Raised Platform, Freight Bogie Undercarriage & Dark Tunnel")
    
    rx = float(st.session_state.get("sim_robot_x", 0.0))
    ry = float(st.session_state.get("sim_robot_y", -0.4))
    rz = 0.14 if st.session_state.get("sim_crouch", False) else 0.28
    yaw_deg = float(st.session_state.get("sim_robot_yaw", 0.0))
    crouched = bool(st.session_state.get("sim_crouch", False))
    
    target_x, target_y = 3.8, 1.4
    dist = float(np.sqrt((rx - target_x)**2 + (ry - target_y)**2))
    in_range = dist <= 2.2
    
    if in_range:
        st.error(f"🚨 TARGET IN SCANNING RANGE — THREAT FUSION ENGAGED! Distance: {dist:.2f} m")
        if st.button("Execute Deep Undercarriage Diagnostic", type="primary"):
            st.session_state["sim_crouch"] = True
            st.session_state["sim_diagnostic_done"] = True
            st.rerun()
            
    if st.session_state.get("sim_diagnostic_done", False):
        st.success("🔬 DIAGNOSTIC READOUT: YOLOv8 PE4 Explosive (94.2%), 58.4°C Hotspot, 88 PPM Nitrate Trace! CoC Sealed.")
        
    # Teleop Controls
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        if st.button("⬆️ FWD"):
            rad = np.radians(yaw_deg)
            st.session_state["sim_robot_x"] = rx + np.cos(rad)*0.7
            st.session_state["sim_robot_y"] = ry + np.sin(rad)*0.7
            st.rerun()
    with c2:
        if st.button("⬇️ BACK"):
            rad = np.radians(yaw_deg)
            st.session_state["sim_robot_x"] = rx - np.cos(rad)*0.7
            st.session_state["sim_robot_y"] = ry - np.sin(rad)*0.7
            st.rerun()
    with c3:
        if st.button("🧎 CROUCH" if not crouched else "🧎 STAND"):
            st.session_state["sim_crouch"] = not crouched
            st.rerun()
    with c4:
        if st.button("🔄 Yaw +25°"):
            st.session_state["sim_robot_yaw"] = (yaw_deg + 25.0) % 360.0
            st.rerun()
`;
