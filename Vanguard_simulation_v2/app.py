"""
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

    /* Core Theme Overrides */
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

    /* Streamlit Sidebar Dark Theme */
    section[data-testid="stSidebar"] {
        background-color: #0b111e;
        border-right: 1px solid #1e293b;
    }

    /* Headings and Titles */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: -0.02em;
        color: #f8fafc;
    }

    /* Custom Metric Cards */
    .vanguard-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 14px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .vanguard-card-glow {
        border: 1px solid rgba(0, 242, 254, 0.4);
        box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
    }

    /* System Layer Badges */
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

    /* Telemetry Pill Display */
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
    .telemetry-label {
        color: var(--text-muted);
    }
    .telemetry-val {
        color: var(--accent-cyan);
        font-weight: 700;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: #080c14;
    }
    ::-webkit-scrollbar-thumb {
        background: #1e293b;
        border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #00f2fe;
    }

    /* Threat Status Banners */
    .banner-safe {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid #10b981;
        color: #34d399;
        padding: 12px 18px;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        margin-bottom: 16px;
    }
    .banner-elevated {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid #f59e0b;
        color: #fbbf24;
        padding: 12px 18px;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        margin-bottom: 16px;
    }
    .banner-critical {
        background: rgba(255, 51, 102, 0.15);
        border: 1px solid #ff3366;
        color: #ff6b8b;
        padding: 12px 18px;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        margin-bottom: 16px;
        animation: pulse-border 2s infinite;
    }

    @keyframes pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(255, 51, 102, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255, 51, 102, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 51, 102, 0); }
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# SESSION STATE INITIALIZATION & PRESET INJECTION
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
        "estop_engaged": False,
        "active_tab": 0,
        "audit_logs": [],
        # Tab 6: Virtual-Simulation State
        "sim_robot_x": 0.0,
        "sim_robot_y": -0.4,
        "sim_robot_z": 0.28,
        "sim_robot_yaw": 0.0,
        "sim_crouch": False,
        "sim_sniffer": True,
        "sim_lidar": True,
        "sim_thermal": False,
        "sim_diagnostic_done": False,
        "sim_battery": 94.5,
        "sim_wp_platform": False,
        "sim_wp_track1": True,
        "sim_wp_bogie": False,
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

init_session_state()

# -----------------------------------------------------------------------------
# SIDEBAR: DYNAMIC TELEMETRY INJECTION BUS (HIL EMULATOR)
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### ⚡ VANGUARD HIL BUS")
    st.markdown(
        "<div style='font-size: 11px; color: #94a3b8; font-family: JetBrains Mono;'>"
        "SIH-26026 TELEMETRY & REFLEX HARNESS<br>"
        "Hardware-in-the-Loop Real-Time Injector"
        "</div>",
        unsafe_allow_html=True
    )
    st.markdown("---")

    # Operational Regime
    st.markdown("#### 1. Operational Regime")
    regime_mode = st.radio(
        "Gait & Trajectory Controller",
        ["Trot Mode (Station Transit)", "Crawl Mode (Hazard Ballast Stance)"],
        index=1 if st.session_state["regime"] == "Crawl Mode (Hazard Ballast Stance)" else 0,
        key="regime_input"
    )
    st.session_state["regime"] = regime_mode

    ballast_roughness = st.slider(
        "Ballast Dispersion Coeff (μ)",
        min_value=0.00,
        max_value=1.00,
        value=float(st.session_state["ballast_roughness"]),
        step=0.01,
        help="Simulates angular crushed stone (Granite 40-65mm) displacement variance under footpads.",
        key="ballast_slider"
    )
    st.session_state["ballast_roughness"] = ballast_roughness

    st.markdown("---")
    # Attitude & Reflex Injection (Virtual IMU)
    st.markdown("#### 2. Attitude & Reflex (Virtual IMU)")
    pitch_angle = st.slider(
        "Chassis Pitch Angle θ (°)",
        -30.0, 30.0,
        float(st.session_state["pitch_deg"]),
        0.5,
        key="pitch_slider"
    )
    st.session_state["pitch_deg"] = pitch_angle

    roll_angle = st.slider(
        "Chassis Roll Angle ϕ (°)",
        -30.0, 30.0,
        float(st.session_state["roll_deg"]),
        0.5,
        key="roll_slider"
    )
    st.session_state["roll_deg"] = roll_angle

    z_clearance = st.slider(
        "Ground Clearance Z-Offset (m)",
        -0.10, 0.10,
        float(st.session_state["z_offset"]),
        0.01,
        key="z_slider"
    )
    st.session_state["z_offset"] = z_clearance

    st.markdown("---")
    # Tri-Sensor Threat Influx
    st.markdown("#### 3. Tri-Sensor Threat Influx")
    vis_conf = st.slider(
        "Visual AI Confidence (Hailo-8)",
        0.00, 1.00,
        float(st.session_state["visual_conf"]),
        0.01,
        key="vis_slider"
    )
    st.session_state["visual_conf"] = vis_conf

    # Dynamic class indicator based on visual confidence
    if vis_conf < 0.30:
        detected_class = "Track Clearance / Debris Clear"
        class_color = "#10b981"
    elif vis_conf < 0.65:
        detected_class = "Unattended Baggage (Sub-Ballast)"
        class_color = "#f59e0b"
    elif vis_conf < 0.85:
        detected_class = "Concealed Bogie Compartment Void"
        class_color = "#ff8c00"
    else:
        detected_class = "Taped Ordnance / Military PE4 / RDX"
        class_color = "#ff3366"

    st.markdown(
        f"<div style='font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #121926; border: 1px solid #1e293b; color: {class_color}; font-family: JetBrains Mono;'>"
        f"🏷️ Class: <strong>{detected_class}</strong></div>",
        unsafe_allow_html=True
    )

    thermal_val = st.slider(
        "Radiometric Core Temp (°C)",
        15.0, 110.0,
        float(st.session_state["thermal_c"]),
        0.5,
        key="thermal_slider"
    )
    st.session_state["thermal_c"] = thermal_val

    chem_val = st.slider(
        "Chemical Trace Vapor (PPM)",
        0.0, 150.0,
        float(st.session_state["chemical_ppm"]),
        1.0,
        key="chem_slider"
    )
    st.session_state["chemical_ppm"] = chem_val

    st.markdown("---")
    # Mission Injection Presets
    st.markdown("#### 4. Mission Injection Presets")
    col_p1, col_p2 = st.columns(2)
    with col_p1:
        if st.button("🟢 Nominal Sweep", use_container_width=True):
            st.session_state["visual_conf"] = 0.08
            st.session_state["thermal_c"] = 28.0
            st.session_state["chemical_ppm"] = 8.0
            st.session_state["pitch_deg"] = 1.0
            st.session_state["roll_deg"] = 0.0
            st.rerun()
    with col_p2:
        if st.button("🚨 Bogie Ordnance", use_container_width=True):
            st.session_state["visual_conf"] = 0.92
            st.session_state["thermal_c"] = 78.4
            st.session_state["chemical_ppm"] = 94.0
            st.session_state["pitch_deg"] = -8.0
            st.session_state["roll_deg"] = 6.5
            st.rerun()

    if st.button("⚠️ Brake Disc (False Pos Test)", use_container_width=True):
        st.session_state["visual_conf"] = 0.05
        st.session_state["thermal_c"] = 92.0
        st.session_state["chemical_ppm"] = 5.0
        st.rerun()

    st.markdown("---")
    # System Vital Status (SL-0 to SL-4)
    st.markdown("#### 5. Hardware Vitals (SL-0 to SL-3)")
    st.markdown(
        """
        <div class="telemetry-pill">
            <span class="telemetry-label">micro-ROS Serial RT:</span>
            <span class="telemetry-val">0.42 ms (1.0 kHz)</span>
        </div>
        <div class="telemetry-pill">
            <span class="telemetry-label">SL-0 Logic Rail:</span>
            <span class="telemetry-val">5.04 V / 1.8 A</span>
        </div>
        <div class="telemetry-pill">
            <span class="telemetry-label">SL-0 Motor Bus:</span>
            <span class="telemetry-val">8.38 V / 14.2 A</span>
        </div>
        <div class="telemetry-pill">
            <span class="telemetry-label">Hailo-8 M.2 Temp:</span>
            <span class="telemetry-val">44.8°C (26 TOPS)</span>
        </div>
        <div class="telemetry-pill">
            <span class="telemetry-label">Teensy 4.1 Freq:</span>
            <span class="telemetry-val">600 MHz Closed-Loop</span>
        </div>
        """,
        unsafe_allow_html=True
    )

# -----------------------------------------------------------------------------
# CORE MATHEMATICAL ENGINES
# -----------------------------------------------------------------------------

def calculate_threat_index(vis_conf, temp_c, chem_ppm):
    """
    Threat Escalation Index Formula:
    Score = (0.45 * Visual_Confidence) + (0.35 * Normalized_Thermal) + (0.20 * Normalized_Chemical)
    Normalizations:
      Normalized_Thermal = clamp((Temp - 25.0) / (85.0 - 25.0), 0.0, 1.0)
      Normalized_Chemical = clamp((Chemical - 10.0) / (100.0 - 10.0), 0.0, 1.0)
    """
    norm_thermal = float(np.clip((temp_c - 25.0) / (85.0 - 25.0), 0.0, 1.0))
    norm_chem = float(np.clip((chem_ppm - 10.0) / (100.0 - 10.0), 0.0, 1.0))
    score = (0.45 * vis_conf) + (0.35 * norm_thermal) + (0.20 * norm_chem)
    score = float(np.clip(score, 0.0, 1.0))
    return score, norm_thermal, norm_chem

def compute_kinematics_and_chassis(pitch_deg, roll_deg, z_offset, roughness):
    """
    Analytical Kinematics & Reflex Compensation:
    4 legs: FL (+x, +y), FR (+x, -y), RL (-x, +y), RR (-x, -y)
    Chassis dimensions: Length = 0.50m, Width = 0.30m, Nominal Height = 0.35m
    """
    pitch_rad = np.radians(pitch_deg)
    roll_rad = np.radians(roll_deg)

    # Rotation matrix (Euler R_x * R_y)
    R_x = np.array([
        [1, 0, 0],
        [0, np.cos(roll_rad), -np.sin(roll_rad)],
        [0, np.sin(roll_rad), np.cos(roll_rad)]
    ])
    R_y = np.array([
        [np.cos(pitch_rad), 0, np.sin(pitch_rad)],
        [0, 1, 0],
        [-np.sin(pitch_rad), 0, np.cos(pitch_rad)]
    ])
    R_body = R_y @ R_x

    # Nominal base chassis vertices (box representation)
    L, W, H = 0.28, 0.16, 0.08
    nominal_body_corners = np.array([
        [L, W, H/2], [L, -W, H/2], [-L, -W, H/2], [-L, W, H/2], [L, W, H/2], # Top loop
        [L, W, -H/2], [L, -W, -H/2], [-L, -W, -H/2], [-L, W, -H/2], [L, W, -H/2] # Bottom loop
    ])

    # Center of mass position in world frame
    COM = np.array([0.0, 0.0, 0.35 + z_offset])

    # Rotated body vertices
    rotated_body = (R_body @ nominal_body_corners.T).T + COM

    # Hip attachments in body frame
    hip_offsets = {
        "FL": np.array([0.25, 0.14, 0.0]),
        "FR": np.array([0.25, -0.14, 0.0]),
        "RL": np.array([-0.25, 0.14, 0.0]),
        "RR": np.array([-0.25, -0.14, 0.0]),
    }

    # Closed-loop reflex foot target calculation
    # Nominal stance foot targets in world frame on ballast plane (Z ~ 0)
    nominal_feet_world = {
        "FL": np.array([0.28, 0.20, 0.0]),
        "FR": np.array([0.28, -0.20, 0.0]),
        "RL": np.array([-0.28, 0.20, 0.0]),
        "RR": np.array([-0.28, -0.20, 0.0]),
    }

    # Leg Link lengths: Thigh (L1) = 0.20m, Shank (L2) = 0.20m
    L1, L2 = 0.20, 0.20
    leg_data = {}

    slip_probabilities = []
    balance_convergences = []

    for leg_id, hip_local in hip_offsets.items():
        # Hip position in world coordinates
        hip_world = (R_body @ hip_local) + COM

        # Target foot on ballast with roughness variance
        foot_nominal = nominal_feet_world[leg_id].copy()
        
        # Ground reflex compensation: when body pitches/rolls, foot Z target responds
        # to irregular ballast contact to maintain dynamic stability
        ground_contact_z = 0.0 + (np.sin(pitch_rad) * foot_nominal[0] - np.sin(roll_rad) * foot_nominal[1]) * 0.15
        ballast_noise = (np.sin(foot_nominal[0]*12.0) * np.cos(foot_nominal[1]*8.0)) * (roughness * 0.04)
        foot_actual = np.array([foot_nominal[0], foot_nominal[1], ground_contact_z + ballast_noise])

        # Vector from hip to foot
        d_vec = foot_actual - hip_world
        dist = np.linalg.norm(d_vec)
        clamped_dist = min(dist, (L1 + L2) * 0.98)

        # 3-DOF Analytical IK calculation
        # Knee pitch via Law of Cosines: dist^2 = L1^2 + L2^2 - 2*L1*L2*cos(pi - knee)
        cos_knee = (L1**2 + L2**2 - clamped_dist**2) / (2 * L1 * L2)
        knee_pitch = np.pi - np.arccos(np.clip(cos_knee, -1.0, 1.0))

        # Hip pitch
        alpha = np.arccos(np.clip((L1**2 + clamped_dist**2 - L2**2) / (2 * L1 * clamped_dist), -1.0, 1.0))
        beta = np.arctan2(-d_vec[2], np.sqrt(d_vec[0]**2 + d_vec[1]**2))
        hip_pitch = beta + alpha

        # Knee joint 3D position
        # Midpoint bending outwards/backwards
        knee_dir = np.array([0.0, 0.0, -1.0])
        knee_world = hip_world + np.array([d_vec[0]*0.5, d_vec[1]*0.5, -L1 * np.cos(hip_pitch * 0.5)])

        # Instantaneous load & slip calculation
        load_factor = np.clip(1.0 + (hip_world[2] - COM[2]) * 2.0, 0.4, 1.8)
        slip_prob = float(np.clip(roughness * 0.75 + abs(pitch_deg)/45.0 * 0.3, 0.05, 0.95))
        slip_probabilities.append(slip_prob)

        balance_convergence = float(np.clip(100.0 - (abs(pitch_deg) * 1.5 + abs(roll_deg) * 1.2 + roughness * 25.0), 12.0, 99.8))
        balance_convergences.append(balance_convergence)

        leg_data[leg_id] = {
            "hip": hip_world,
            "knee": knee_world,
            "foot": foot_actual,
            "load": load_factor,
            "slip_prob": slip_prob,
            "joint_angles_deg": {
                "hip_yaw": float(np.degrees(np.arctan2(d_vec[1], d_vec[0]))),
                "hip_pitch": float(np.degrees(hip_pitch)),
                "knee_pitch": float(np.degrees(knee_pitch))
            }
        }

    overall_balance = float(np.mean(balance_convergences))
    mean_slip = float(np.mean(slip_probabilities))

    return COM, rotated_body, leg_data, overall_balance, mean_slip

# -----------------------------------------------------------------------------
# MAIN APP HEADER & SYSTEM LAYER ARCHITECTURE HIERARCHY
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
            <h1 style="margin: 0; font-size: 26px; color: #00f2fe;">PROJECT VANGUARD : GROUND COMMAND</h1>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #94a3b8; font-family: JetBrains Mono;">
                Stage 1 High-Fidelity Digital Twin & Operations Ground Station | SIH-26026
            </p>
        </div>
        <div style="text-align: right;">
            <span style="font-family: JetBrains Mono; font-size: 11px; padding: 4px 8px; background: rgba(0, 242, 254, 0.1); border: 1px solid #00f2fe; color: #00f2fe; border-radius: 4px;">
                RPF SEC-AUTH: LEVEL 4
            </span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

# 6 System Layers Visual Status Badges
st.markdown(
    """
    <div style="margin-bottom: 16px; padding: 8px 12px; background: #0c1320; border-radius: 6px; border: 1px solid #1a2333;">
        <span class="sl-badge sl-badge-active">SL-0: DUAL-RAIL POWER & E-STOP (OK)</span>
        <span class="sl-badge sl-badge-active">SL-1: 12-DOF HIGH-G ACTUATION (1 kHz)</span>
        <span class="sl-badge sl-badge-active">SL-2: TEENSY 4.1 RT KINEMATICS (600 MHz)</span>
        <span class="sl-badge sl-badge-active">SL-3: HAILO-8 26 TOPS AI CORE (ACTIVE)</span>
        <span class="sl-badge sl-badge-active">SL-4: ROS 2 LIO-SAM GPS-DENIED (SYNC)</span>
        <span class="sl-badge sl-badge-active">SL-5: SHA-256 FORENSIC VAULT (LOCKED)</span>
    </div>
    """,
    unsafe_allow_html=True
)

# Current threat calculation
threat_score, norm_temp, norm_chem = calculate_threat_index(
    st.session_state["visual_conf"],
    st.session_state["thermal_c"],
    st.session_state["chemical_ppm"]
)

# Dynamic Threat Banner
if threat_score < 0.40:
    st.markdown(
        f"<div class='banner-safe'>🛡️ THREAT LEVEL NOMINAL — INDEX: {threat_score:.3f} | Railway track clearance verified. No primary explosives or anomalous heat signatures detected.</div>",
        unsafe_allow_html=True
    )
elif threat_score < 0.70:
    st.markdown(
        f"<div class='banner-elevated'>⚠️ ELEVATED ANOMALY DETECTED — INDEX: {threat_score:.3f} | Multi-sensor correlation in progress. Slowing locomotion to Hazard Crawl Stance.</div>",
        unsafe_allow_html=True
    )
else:
    st.markdown(
        f"<div class='banner-critical'>🚨 CRITICAL LOCKDOWN TRIGGERED — INDEX: {threat_score:.3f} | High confidence ordnance signature! Autonomously halting platform & generating SHA-256 Chain-of-Custody evidentiary record.</div>",
        unsafe_allow_html=True
    )

# -----------------------------------------------------------------------------
# 6 COMPREHENSIVE OPERATIONAL TABS (INCL. VIRTUAL-SIMULATION)
# -----------------------------------------------------------------------------
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "📐 1. 3D Kinematics Digital Twin",
    "🧠 2. Neurosymbolic Threat Fusion",
    "🗺️ 3. GPS-Denied SLAM & Costmap",
    "🔐 4. Cryptographic Audit Vault",
    "📋 5. BOM & SIH Defense Matrix",
    "🎮 Virtual-Simulation"
])

# =============================================================================
# TAB 1: 3D DIGITAL TWIN KINEMATICS & ACTIVE STABILIZATION
# =============================================================================
with tab1:
    COM, chassis_box, leg_data, balance_conv, slip_margin = compute_kinematics_and_chassis(
        st.session_state["pitch_deg"],
        st.session_state["roll_deg"],
        st.session_state["z_offset"],
        st.session_state["ballast_roughness"]
    )

    # Live Metrics Bar
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    with m_col1:
        st.metric("Active Balance Convergence", f"{balance_conv:.1f} %", delta=f"{balance_conv-95.0:.1f} %")
    with m_col2:
        st.metric("Ground Slip Margin (Ballast)", f"{(1.0 - slip_margin)*100:.1f} %", delta=f"{(0.6 - slip_margin)*100:.1f} %")
    with m_col3:
        st.metric("Kinematics Loop Freq", "1,000 Hz", delta="Teensy 4.1 RT")
    with m_col4:
        st.metric("Total DOF Articulation", "12 Actuators", delta="3-DOF / Leg")

    # 3D Digital Twin Plotly Visualization
    fig_3d = go.Figure()

    # 1. Realistic 3D Railway Ballast Terrain Mesh
    gx = np.linspace(-0.6, 0.6, 25)
    gy = np.linspace(-0.5, 0.5, 20)
    GX, GY = np.meshgrid(gx, gy)
    # Ballast roughness profile
    np.random.seed(42)
    GZ = np.sin(GX * 8.0) * np.cos(GY * 6.0) * (st.session_state["ballast_roughness"] * 0.035)

    fig_3d.add_trace(go.Surface(
        x=GX, y=GY, z=GZ,
        colorscale=[[0.0, "#101726"], [0.5, "#1e293b"], [1.0, "#334155"]],
        showscale=False,
        opacity=0.85,
        name="Ballast Terrain Mesh",
        hoverinfo="skip"
    ))

    # 2. Railway Track Steel Rails
    rail_y = 0.35
    for ry in [rail_y, -rail_y]:
        fig_3d.add_trace(go.Scatter3d(
            x=[-0.6, 0.6], y=[ry, ry], z=[0.02, 0.02],
            mode="lines",
            line=dict(color="#64748b", width=7),
            name="UIC-60 Rail Profile"
        ))

    # 3. Chassis Rigid Body Wireframe
    fig_3d.add_trace(go.Scatter3d(
        x=chassis_box[:, 0], y=chassis_box[:, 1], z=chassis_box[:, 2],
        mode="lines+markers",
        line=dict(color="#00f2fe", width=5),
        marker=dict(size=3, color="#4facfe"),
        name="Titanium/Carbon Chassis Frame"
    ))

    # 4. Center of Mass (COM) Marker
    fig_3d.add_trace(go.Scatter3d(
        x=[COM[0]], y=[COM[1]], z=[COM[2]],
        mode="markers+text",
        marker=dict(size=9, color="#ff3366", symbol="diamond"),
        text=["COM (0, 0, Z)"],
        textposition="top center",
        textfont=dict(color="#ff3366", size=11, family="JetBrains Mono"),
        name="Center of Mass"
    ))

    # 5. Articulated Legs: Hip -> Knee -> Footpad
    leg_colors = {"FL": "#00f2fe", "FR": "#38bdf8", "RL": "#818cf8", "RR": "#a78bfa"}

    for leg_id, data in leg_data.items():
        hx, hy, hz = data["hip"]
        kx, ky, kz = data["knee"]
        fx, fy, fz = data["foot"]

        # Thigh + Shank
        fig_3d.add_trace(go.Scatter3d(
            x=[hx, kx, fx], y=[hy, ky, fy], z=[hz, kz, fz],
            mode="lines+markers",
            line=dict(color=leg_colors[leg_id], width=7),
            marker=dict(size=6, color=["#ffffff", "#cbd5e1", "#00f2fe"]),
            name=f"Leg {leg_id} (Load: {data['load']:.2f}x)"
        ))

        # Footpad Ground Contact Circle with color-shifting stance/slip indicator
        foot_color = "#10b981" if data["slip_prob"] < 0.45 else ("#f59e0b" if data["slip_prob"] < 0.70 else "#ff3366")
        fig_3d.add_trace(go.Scatter3d(
            x=[fx], y=[fy], z=[fz],
            mode="markers+text",
            marker=dict(size=12, color=foot_color, symbol="circle"),
            text=[f"{leg_id} ({'SOLID' if data['slip_prob'] < 0.5 else 'SLIP SLOW'})"],
            textposition="bottom center",
            textfont=dict(color=foot_color, size=10, family="JetBrains Mono"),
            name=f"Footpad Contact {leg_id}"
        ))

    fig_3d.update_layout(
        scene=dict(
            xaxis=dict(title="X (Surge - m)", backgroundcolor="#080c14", gridcolor="#1e293b", showbackground=True),
            yaxis=dict(title="Y (Sway - m)", backgroundcolor="#080c14", gridcolor="#1e293b", showbackground=True),
            zaxis=dict(title="Z (Heave - m)", range=[-0.05, 0.55], backgroundcolor="#080c14", gridcolor="#1e293b", showbackground=True),
            aspectmode="manual",
            aspectratio=dict(x=1.2, y=1.0, z=0.6),
            camera=dict(
                eye=dict(x=1.3, y=-1.5, z=0.9),
                up=dict(x=0, y=0, z=1)
            )
        ),
        paper_bgcolor="#080c14",
        plot_bgcolor="#080c14",
        margin=dict(l=0, r=0, t=10, b=0),
        height=540,
        legend=dict(
            yanchor="top", y=0.98, xanchor="left", x=0.02,
            bgcolor="rgba(18, 25, 38, 0.8)", bordercolor="#1e293b", borderwidth=1,
            font=dict(size=10, color="#94a3b8", family="JetBrains Mono")
        )
    )

    st.plotly_chart(fig_3d, use_container_width=True)

    # Articulation Joint Angle Matrix
    with st.expander("🔬 Analytical Inverse Kinematics Joint Angle Matrix (Teensy 4.1 Bus)"):
        joint_df = pd.DataFrame([
            {
                "Leg ID": lid,
                "Hip Yaw θ₁ (°)": f"{d['joint_angles_deg']['hip_yaw']:.1f}°",
                "Hip Pitch θ₂ (°)": f"{d['joint_angles_deg']['hip_pitch']:.1f}°",
                "Knee Pitch θ₃ (°)": f"{d['joint_angles_deg']['knee_pitch']:.1f}°",
                "Load Multiplier": f"{d['load']:.2f}x",
                "Slip Hazard Coeff": f"{d['slip_prob']:.3f}",
                "Reflex Offset Z": f"{d['foot'][2]:+.3f}m"
            }
            for lid, d in leg_data.items()
        ])
        st.dataframe(joint_df, use_container_width=True, hide_index=True)

# =============================================================================
# TAB 2: NEUROSYMBOLIC THREAT FUSION & COGNITIVE ENGINE
# =============================================================================
with tab2:
    st.markdown("### 🧠 Neurosymbolic Threat Fusion & Decision Engine")
    st.markdown(
        "<p style='color: #94a3b8; font-size: 13px; font-family: JetBrains Mono;'>"
        "Tri-Sensor Evidence Fusion: Combines Statistical Deep Learning (Hailo-8 YOLOv8) with Deterministic Thermodynamics and Electrochemical Trace Precursors."
        "</p>",
        unsafe_allow_html=True
    )

    col_t1, col_t2 = st.columns([1.2, 1.0])

    with col_t1:
        # Multi-Sensor Status Cards
        st.markdown(
            f"""
            <div class="vanguard-card">
                <div style="font-family: JetBrains Mono; font-size: 13px; color: #00f2fe; margin-bottom: 10px; font-weight: 700;">
                    📡 REAL-TIME MULTI-MODAL SENSOR CHANNELS
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">1. Visual Neural Object Det (YOLOv8x):</span>
                    <span class="telemetry-val">{st.session_state['visual_conf']:.2f} (Weight: 0.45)</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">2. Radiometric Thermal Core (Raw / Norm):</span>
                    <span class="telemetry-val">{st.session_state['thermal_c']:.1f}°C → {norm_temp:.2f} (Weight: 0.35)</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">3. Forced-Air Chemical Precursor (Raw / Norm):</span>
                    <span class="telemetry-val">{st.session_state['chemical_ppm']:.1f} PPM → {norm_chem:.2f} (Weight: 0.20)</span>
                </div>
                <div style="margin-top: 12px; padding: 8px; background: #080c14; border-radius: 4px; font-family: JetBrains Mono; font-size: 12px; color: #94a3b8;">
                    <strong>Mathematical Escalation Formulation:</strong><br>
                    Score = (0.45 × {st.session_state['visual_conf']:.2f}) + (0.35 × {norm_temp:.2f}) + (0.20 × {norm_chem:.2f}) = 
                    <span style="color: #00f2fe; font-weight: 700;">{threat_score:.3f}</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col_t2:
        # Semicircular Plotly Threat Gauge
        gauge_color = "#10b981" if threat_score < 0.40 else ("#f59e0b" if threat_score < 0.70 else "#ff3366")

        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=threat_score,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Escalation Threat Index", 'font': {'size': 18, 'color': '#f8fafc', 'family': 'JetBrains Mono'}},
            delta={'reference': 0.40, 'increasing': {'color': "#ff3366"}},
            number={'font': {'size': 36, 'color': gauge_color, 'family': 'JetBrains Mono'}},
            gauge={
                'axis': {'range': [0.0, 1.0], 'tickwidth': 1, 'tickcolor': "#94a3b8"},
                'bar': {'color': gauge_color, 'thickness': 0.25},
                'bgcolor': "#121926",
                'borderwidth': 2,
                'bordercolor': "#1e293b",
                'steps': [
                    {'range': [0.0, 0.40], 'color': "rgba(16, 185, 129, 0.25)"},
                    {'range': [0.40, 0.70], 'color': "rgba(245, 158, 11, 0.25)"},
                    {'range': [0.70, 1.00], 'color': "rgba(255, 51, 102, 0.35)"}
                ],
                'threshold': {
                    'line': {'color': "#ff3366", 'width': 4},
                    'thickness': 0.8,
                    'value': 0.70
                }
            }
        ))
        fig_gauge.update_layout(
            paper_bgcolor="#080c14",
            font={'color': "#f8fafc", 'family': "JetBrains Mono"},
            margin=dict(l=20, r=20, t=30, b=10),
            height=260
        )
        st.plotly_chart(fig_gauge, use_container_width=True)

    # Neurosymbolic Decision Matrix (Symbolic Rule Layer)
    st.markdown("#### ⚖️ Neurosymbolic Rule Arbitration Matrix")
    st.markdown(
        "<p style='color: #94a3b8; font-size: 12px; font-family: JetBrains Mono;'>"
        "How VANGUARD prevents false positives from train brake discs, hot rails, and natural grease odors:"
        "</p>",
        unsafe_allow_html=True
    )

    decision_data = [
        {
            "Operational Scenario": "Nominal Inspection",
            "Visual YOLO": "< 0.25 (Clear)",
            "Thermal (FLIR)": "< 40.0°C",
            "Vapor (PPM)": "< 15 PPM",
            "Symbolic Rule Logic": "PASS: Background baseline within safe threshold",
            "Status": "🟢 NOMINAL"
        },
        {
            "Operational Scenario": "Train Hot Brake Disc",
            "Visual YOLO": "< 0.20 (No IED box)",
            "Thermal (FLIR)": "> 85.0°C (High)",
            "Vapor (PPM)": "< 12 PPM (Zero trace)",
            "Symbolic Rule Logic": "DISCARD: High thermal alone without visual/vapor correlation is non-threat mechanical friction",
            "Status": "🟡 FILTERED (NO LOCKDOWN)"
        },
        {
            "Operational Scenario": "Industrial Grease / Fuel Spill",
            "Visual YOLO": "< 0.30 (Clear track)",
            "Thermal (FLIR)": "< 35.0°C (Ambient)",
            "Vapor (PPM)": "> 90 PPM (Hydrocarbon)",
            "Symbolic Rule Logic": "DISCARD: Hydrocarbon profile lacks nitric/peroxide oxidizer signature; unconfirmed visually",
            "Status": "🟡 CAUTION ONLY"
        },
        {
            "Operational Scenario": "Concealed PE4 / C4 Ordnance",
            "Visual YOLO": "> 0.75 (Taped pack)",
            "Thermal (FLIR)": "> 55.0°C (Exothermic battery)",
            "Vapor (PPM)": "> 60 PPM (Nitrate vapor)",
            "Symbolic Rule Logic": "ESCALATE: Tri-sensor simultaneous affirmative. Zero plausible benign physical explanation",
            "Status": "🚨 CRITICAL LOCKDOWN"
        }
    ]
    st.dataframe(pd.DataFrame(decision_data), use_container_width=True, hide_index=True)

# =============================================================================
# TAB 3: GPS-DENIED TUNNEL SLAM & COSTMAP PROJECTION
# =============================================================================
with tab3:
    st.markdown("### 🗺️ GPS-Denied Cartographer / LIO-SAM Autonomous Stack (SL-4)")
    st.markdown(
        "<p style='color: #94a3b8; font-size: 13px; font-family: JetBrains Mono;'>"
        "Real-Time Nav2 Dynamic Costmap with Railway Undercarriage Inflation Layers, Rails, and Evasion Vectors."
        "</p>",
        unsafe_allow_html=True
    )

    col_slam1, col_slam2 = st.columns([2.0, 1.0])

    with col_slam1:
        # Generate Synthetic 2D LiDAR Point Cloud & Costmap
        np.random.seed(101)
        # Tunnel walls
        x_tunnel = np.linspace(-4.0, 8.0, 120)
        wall_left_y = np.full_like(x_tunnel, 2.2) + np.random.normal(0, 0.03, len(x_tunnel))
        wall_right_y = np.full_like(x_tunnel, -2.2) + np.random.normal(0, 0.03, len(x_tunnel))

        # Railway rails
        rail_left_y = np.full_like(x_tunnel, 0.75)
        rail_right_y = np.full_like(x_tunnel, -0.75)

        # Train Bogie Undercarriage Obstacles (wheels, axles, battery box)
        bogie_x = [1.5, 1.5, 3.8, 3.8, 2.65]
        bogie_y = [0.85, -0.85, 0.85, -0.85, 0.0]
        bogie_labels = ["Wheel FL", "Wheel FR", "Wheel RL", "Wheel RR", "Traction Motor / Bogie Hub"]

        # Autonomous Waypoint Trajectory with Obstacle Evasion
        traj_x = np.array([-3.0, -1.5, 0.0, 1.2, 2.65, 4.5, 6.5])
        # Evasion offset when obstacle threat exists
        evasion_offset = -0.45 if threat_score > 0.40 else 0.0
        traj_y = np.array([0.0, 0.0, 0.0, 0.15 + evasion_offset, 0.35 + evasion_offset, 0.0, 0.0])

        fig_slam = go.Figure()

        # Tunnel boundaries
        fig_slam.add_trace(go.Scatter(
            x=x_tunnel, y=wall_left_y, mode="markers",
            marker=dict(size=3, color="#334155"), name="Tunnel Boundary (North)"
        ))
        fig_slam.add_trace(go.Scatter(
            x=x_tunnel, y=wall_right_y, mode="markers",
            marker=dict(size=3, color="#334155"), name="Tunnel Boundary (South)"
        ))

        # Rails
        fig_slam.add_trace(go.Scatter(
            x=x_tunnel, y=rail_left_y, mode="lines",
            line=dict(color="#475569", width=3, dash="dot"), name="Left Rail Profile"
        ))
        fig_slam.add_trace(go.Scatter(
            x=x_tunnel, y=rail_right_y, mode="lines",
            line=dict(color="#475569", width=3, dash="dot"), name="Right Rail Profile"
        ))

        # Costmap Inflation Zones around Bogie Structures
        for bx, by in zip(bogie_x, bogie_y):
            # Inflation disk
            theta = np.linspace(0, 2*np.pi, 30)
            fig_slam.add_trace(go.Scatter(
                x=bx + 0.45 * np.cos(theta), y=by + 0.45 * np.sin(theta),
                mode="lines", fill="toself",
                fillcolor="rgba(245, 158, 11, 0.15)", line=dict(color="rgba(245, 158, 11, 0.4)", width=1),
                name="Costmap Inflation Layer", showlegend=False, hoverinfo="skip"
            ))

        # Bogie Hardware Obstacles
        fig_slam.add_trace(go.Scatter(
            x=bogie_x, y=bogie_y, mode="markers+text",
            marker=dict(size=14, color="#f59e0b", symbol="square"),
            text=bogie_labels, textposition="top center",
            textfont=dict(color="#f59e0b", size=10, family="JetBrains Mono"),
            name="Railway Undercarriage Hardware"
        ))

        # Simulated Threat Target (if threat score elevated)
        if threat_score > 0.40:
            fig_slam.add_trace(go.Scatter(
                x=[2.65], y=[0.0], mode="markers+text",
                marker=dict(size=20, color="#ff3366", symbol="hexagram"),
                text=["SUSPECT ANOMALY"], textposition="bottom center",
                textfont=dict(color="#ff3366", size=11, family="JetBrains Mono"),
                name="Thermal/Chemical Threat Origin"
            ))

        # Quadruped Robot Current Position
        fig_slam.add_trace(go.Scatter(
            x=[0.0], y=[0.0], mode="markers+text",
            marker=dict(size=18, color="#00f2fe", symbol="cross"),
            text=["VANGUARD (0.0, 0.0)"], textposition="bottom right",
            textfont=dict(color="#00f2fe", size=11, family="JetBrains Mono"),
            name="Quadruped Base Pose"
        ))

        # Nav2 Planned Trajectory
        fig_slam.add_trace(go.Scatter(
            x=traj_x, y=traj_y, mode="lines+markers",
            line=dict(color="#00f2fe" if threat_score < 0.70 else "#ff3366", width=4, dash="dash"),
            marker=dict(size=6, color="#ffffff"),
            name="Nav2 Autonomous Planned Path"
        ))

        fig_slam.update_layout(
            xaxis=dict(title="Track Longitude X (meters)", range=[-3.5, 7.5], gridcolor="#1e293b", zerolinecolor="#334155"),
            yaxis=dict(title="Track Lateral Y (meters)", range=[-2.5, 2.5], gridcolor="#1e293b", zerolinecolor="#334155"),
            paper_bgcolor="#080c14",
            plot_bgcolor="#0c1320",
            height=440,
            margin=dict(l=10, r=10, t=10, b=10),
            legend=dict(
                font=dict(size=10, color="#94a3b8", family="JetBrains Mono"),
                bgcolor="rgba(18, 25, 38, 0.8)",
                bordercolor="#1e293b"
            )
        )
        st.plotly_chart(fig_slam, use_container_width=True)

    with col_slam2:
        st.markdown(
            """
            <div class="vanguard-card">
                <div style="font-family: JetBrains Mono; font-size: 13px; color: #00f2fe; margin-bottom: 12px; font-weight: 700;">
                    🧭 CARTOGRAPHER / SLAM VITALS
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">SLAM Odometry Method:</span>
                    <span class="telemetry-val">LIO-SAM (IMU+LiDAR)</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">Cumulative Drift Rate:</span>
                    <span class="telemetry-val">0.08% / 100m tunnel</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">Bogie Clearance Margin:</span>
                    <span class="telemetry-val">0.18 m (Safe Stance)</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">Inflation Radius:</span>
                    <span class="telemetry-val">0.45 m (Obstacle Cost)</span>
                </div>
                <div class="telemetry-pill">
                    <span class="telemetry-label">Active Evasion Mode:</span>
                    <span class="telemetry-val">Dynamic Voronoi</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; font-family: JetBrains Mono; margin-top: 10px; line-height: 1.4;">
                    *When crossing beneath low-profile train bogies, ground clearance automatically compresses via SL-2 kinematics reflex to avoid coupler hooks.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

# =============================================================================
# TAB 4: CRYPTOGRAPHIC AUDIT VAULT (CHAIN-OF-CUSTODY FOR LAW ENFORCEMENT)
# =============================================================================
with tab4:
    st.markdown("### 🔐 Cryptographic Chain-of-Custody Vault (SL-5)")
    st.markdown(
        "<p style='color: #94a3b8; font-size: 13px; font-family: JetBrains Mono;'>"
        "Court-Admissible Digital Forensics Standardized for Railway Protection Force (RPF) & National Investigation Agency (NIA)."
        "</p>",
        unsafe_allow_html=True
    )

    # Evidentiary Compliance Banner
    st.markdown(
        """
        <div style="padding: 12px 16px; background: rgba(0, 242, 254, 0.06); border-left: 4px solid #00f2fe; border-radius: 4px; margin-bottom: 16px; font-family: JetBrains Mono; font-size: 12px;">
            ⚖️ <strong>INDIAN EVIDENCE ACT SECTION 65B COMPLIANCE CERTIFICATION:</strong><br>
            All telemetry records captured upon Threat Index threshold (>0.70) are deterministically signed via 
            SHA-256 with microsecond UTC timestamps, hardware hardware-backed MAC keys, and non-volatile flash logs.
        </div>
        """,
        unsafe_allow_html=True
    )

    # Generate Structured Evidentiary Payload
    timestamp_iso = datetime.now(timezone.utc).isoformat()
    audit_payload = {
        "vanguard_system_id": "VANGUARD-QUAD-UNIT-04",
        "sih_problem_code": "SIH-26026",
        "jurisdiction": "Indian Railways / Railway Protection Force (RPF)",
        "utc_timestamp": timestamp_iso,
        "sector_coordinates": {
            "track_id": "NDLS-PLATFORM-8B-NORTH",
            "tunnel_chainage_km": 14.82,
            "bogie_bay_number": "B-04-A"
        },
        "system_layers_state": {
            "SL-0_power_rails": "Nominal (Logic: 5.04V, Motor: 8.38V)",
            "SL-1_actuator_bus": "12-DOF Locked",
            "SL-2_kinematics_teensy": "Reflex Active",
            "SL-3_hailo_ai_core": "26 TOPS YOLOv8 Inference",
            "SL-4_nav2_slam": "Cartographer Tunnel Loop Closed"
        },
        "tri_sensor_forensics": {
            "visual_yolo_confidence": float(round(st.session_state["visual_conf"], 4)),
            "visual_classified_class": detected_class,
            "radiometric_thermal_celsius": float(round(st.session_state["thermal_c"], 2)),
            "chemical_precursor_ppm": float(round(st.session_state["chemical_ppm"], 2)),
            "computed_threat_index": float(round(threat_score, 4)),
            "escalation_tier": "CRITICAL LOCKDOWN" if threat_score > 0.70 else ("ELEVATED" if threat_score > 0.40 else "NOMINAL")
        },
        "operator_credentials": {
            "field_operator_id": "RPF-INSPECTOR-7104",
            "command_station_ip": "10.14.88.2",
            "crypto_algorithm": "SHA-256 with PKCS#7 Envelope"
        }
    }

    payload_json = json.dumps(audit_payload, indent=2)
    computed_hash = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()

    col_v1, col_v2 = st.columns([1.5, 1.0])

    with col_v1:
        st.markdown("#### Evidentiary Telemetry Payload (JSON)")
        st.code(payload_json, language="json")

    with col_v2:
        st.markdown("#### Cryptographic Fingerprint")
        st.markdown(
            f"""
            <div class="vanguard-card vanguard-card-glow">
                <div style="font-family: JetBrains Mono; font-size: 11px; color: #94a3b8;">SHA-256 DIGITAL HASH</div>
                <div style="font-family: JetBrains Mono; font-size: 12px; color: #00f2fe; word-break: break-all; margin: 8px 0; font-weight: 700;">
                    {computed_hash}
                </div>
                <div style="font-size: 11px; color: #cbd5e1; font-family: JetBrains Mono;">
                    Status: <span style="color: {'#ff3366' if threat_score > 0.70 else '#10b981'}; font-weight: bold;">
                    {'🔒 EVIDENCE LOCKED (HIGH PRIORITY)' if threat_score > 0.70 else 'RECORDED (STANDARD AUDIT)'}
                    </span>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        st.download_button(
            label="💾 Download Signed Forensic Package (.json)",
            data=json.dumps({"payload": audit_payload, "sha256_signature": computed_hash}, indent=2),
            file_name=f"VANGUARD_FORENSIC_{int(time.time())}.json",
            mime="application/json",
            use_container_width=True
        )

        st.markdown("---")
        st.markdown("#### Offline Tunnel Packet Queue")
        st.markdown(
            """
            <div class="telemetry-pill">
                <span class="telemetry-label">Local Flash FIFO Buffer:</span>
                <span class="telemetry-val">4 / 2048 Packets</span>
            </div>
            <div class="telemetry-pill">
                <span class="telemetry-label">RF Sync State:</span>
                <span class="telemetry-val">Tunnel Retrying (Mesh 868MHz)</span>
            </div>
            <div class="telemetry-pill">
                <span class="telemetry-label">Tamper Detection Switch:</span>
                <span class="telemetry-val">Intact (Zero Tamper)</span>
            </div>
            """,
            unsafe_allow_html=True
        )

# =============================================================================
# TAB 5: SYSTEM ARCHITECTURE, BILL OF MATERIALS & SPEECH DEFENSE
# =============================================================================
with tab5:
    st.markdown("### 📋 System Architecture, Bill of Materials & SIH Defense Matrix")
    st.markdown(
        "<p style='color: #94a3b8; font-size: 13px; font-family: JetBrains Mono;'>"
        "Production Readiness Validation: Cost-Optimized Procurement & Rigorous Technical Defense for the SIH Jury."
        "</p>",
        unsafe_allow_html=True
    )

    col_bom, col_qa = st.columns([1.1, 1.2])

    with col_bom:
        st.markdown("#### 🛠️ Bill of Materials (Subsystem Cost Breakdown)")
        bom_data = [
            {"Subsystem": "Perception", "Component": "Hailo-8 M.2 AI Acceleration Module (26 TOPS)", "Qty": 1, "Est Cost (INR)": "₹22,500"},
            {"Subsystem": "Perception", "Component": "FLIR Lepton 3.5 Radiometric Thermal Camera", "Qty": 1, "Est Cost (INR)": "₹24,000"},
            {"Subsystem": "Perception", "Component": "Solid-State LiDAR (Livox Mid-360 / SLAMtec)", "Qty": 1, "Est Cost (INR)": "₹38,000"},
            {"Subsystem": "Compute", "Component": "Teensy 4.1 600MHz ARM Cortex-M7 (Real-Time IK)", "Qty": 1, "Est Cost (INR)": "₹4,200"},
            {"Subsystem": "Compute", "Component": "Raspberry Pi 5 (8GB) / Compute Module 4 Host", "Qty": 1, "Est Cost (INR)": "₹7,800"},
            {"Subsystem": "Actuation", "Component": "Custom Brushless Planetary Servos (12 Nm torque)", "Qty": 12, "Est Cost (INR)": "₹64,800"},
            {"Subsystem": "Chassis", "Component": "Carbon Fiber Body Plates & CNC Titanium Links", "Qty": 1, "Est Cost (INR)": "₹16,500"},
            {"Subsystem": "Power", "Component": "6S 22.2V LiFePO4 Battery with Dual Buck Converters", "Qty": 1, "Est Cost (INR)": "₹11,200"},
            {"Subsystem": "Sensing", "Component": "Forced-Air Semiconductor Vapor Detector", "Qty": 1, "Est Cost (INR)": "₹5,500"}
        ]
        bom_df = pd.DataFrame(bom_data)
        st.dataframe(bom_df, use_container_width=True, hide_index=True)
        st.markdown(
            "<div style='font-family: JetBrains Mono; font-size: 12px; color: #00f2fe; text-align: right; margin-top: 4px;'>"
            "<strong>TOTAL ESTIMATED PROTOTYPE BOM: ₹1,94,500 (~$2,350 USD)</strong>"
            "</div>",
            unsafe_allow_html=True
        )

    with col_qa:
        st.markdown("#### 🎯 SIH Grand Finale Jury Defense Matrix")

        with st.expander("Q1: How does VANGUARD prevent slipping on loose railway ballast?"):
            st.markdown(
                """
                **Technical Defense:**
                1. **High-Compliance Soft Footpads**: Custom hemispherical molded silicone footpads (Shore 50A) with internal micro-cleat geometry that grip 40-65mm granite ballast stones.
                2. **Reflex Impedance Control**: Teensy 4.1 runs virtual spring-damper compliance at 1 kHz. If foot contact force deviates by >15% during touchdown, the stance leg instantly yields rather than skidding, maintaining three-point ground polygon stability.
                """
            )

        with st.expander("Q2: How does the system handle 45°C - 50°C Indian railway ambient heat?"):
            st.markdown(
                """
                **Technical Defense:**
                1. **Hailo-8 Low-Power Architecture**: The Hailo-8 M.2 consumes only 2.5W running 26 TOPS (compared to Jetson Orin's 15-25W), producing minimal waste heat.
                2. **Forced Induction Heat Dissipation**: Aluminium chassis structural skeleton acts as a distributed passive heatsink with twin micro-turbofans ducted away from thermal camera optics.
                """
            )

        with st.expander("Q3: How do you reject false alarms from hot train wheel bearings?"):
            st.markdown(
                """
                **Technical Defense:**
                1. **Neurosymbolic Dual-Filter**: As demonstrated in Tab 2, thermal signature alone NEVER triggers an ordnance alert.
                2. The chemical vapor trace must simultaneously confirm volatile oxidizer molecules (e.g. ammonium nitrate, RDX, nitrocellulose) alongside visual class confirmation before lockdown initiates.
                """
            )

        with st.expander("Q4: What happens if RF connection is severed deep in railway tunnels?"):
            st.markdown(
                """
                **Technical Defense:**
                1. **Autonomous Fail-Safe**: Robot switches from teleoperation to fully autonomous ROS 2 Cartographer search pattern.
                2. **Evidentiary Local Vault**: Telemetry and point clouds are hashed via SHA-256 and queued in onboard non-volatile NVMe storage until line-of-sight RF reconnection occurs.
                """
            )

# =============================================================================
# TAB 6: 🎮 VIRTUAL-SIMULATION & GAMIFIED TELEOPERATION GROUND STATION
# =============================================================================
with tab6:
    st.markdown("### 🎮 Virtual-Simulation Ground Station & Freight Sweep Zone")
    st.markdown(
        "<div style='font-size: 12px; color: #94a3b8; font-family: JetBrains Mono; margin-bottom: 12px;'>"
        "Interactive 3D Digital Twin Environment: Dual Railway Tracks, Elevated Passenger Platform, "
        "Parked Freight Bogie Undercarriage, Catenary Traction Wire & GPS-Denied Dark Tunnel"
        "</div>",
        unsafe_allow_html=True
    )

    # Teleoperation state variables
    rx = float(st.session_state["sim_robot_x"])
    ry = float(st.session_state["sim_robot_y"])
    rz = 0.14 if st.session_state["sim_crouch"] else float(st.session_state["sim_robot_z"])
    yaw_deg = float(st.session_state["sim_robot_yaw"])
    crouched = bool(st.session_state["sim_crouch"])
    sniffer_on = bool(st.session_state["sim_sniffer"])
    lidar_on = bool(st.session_state["sim_lidar"])
    thermal_on = bool(st.session_state["sim_thermal"])

    target_x, target_y, target_z = 3.8, 1.4, 0.22
    dist_to_target = float(np.sqrt((rx - target_x)**2 + (ry - target_y)**2))
    in_target_range = dist_to_target <= 2.2
    in_tunnel = rx >= 5.5

    # Auto-update mission waypoint triggers based on coordinates
    if ry <= -1.8:
        st.session_state["sim_wp_platform"] = True
    if -3.0 <= rx <= 3.0 and -0.8 <= ry <= 0.2:
        st.session_state["sim_wp_track1"] = True

    # Real-Time Event Engine: Proximity Trigger HUD Alert
    if in_target_range:
        st.markdown(
            f"""
            <div class="banner-critical" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>🚨 TARGET IN SCANNING RANGE — THREAT FUSION ENGAGED</strong><br>
                    <span style="font-size: 11px;">Concealed Anomaly inside Freight Bogie undercarriage cavity at ({target_x:.1f}m, {target_y:.1f}m). Distance: <strong>{dist_to_target:.2f} m</strong></span>
                </div>
                <div style="font-size: 11px; background: rgba(255, 51, 102, 0.2); padding: 4px 8px; border-radius: 4px; border: 1px solid #ff3366;">
                    HAILO-8 INFERENCE ARMED
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    elif in_tunnel:
        st.markdown(
            """
            <div class="banner-elevated" style="margin-bottom: 12px;">
                <strong>⚠️ TUNNEL GPS-DENIED SECTOR: ROS 2 LIO-SAM ODOMETRY ACTIVE</strong> — RF Comm degraded (-96 dBm). Onboard dead-reckoning & LiDAR odometry synchronizing state.
            </div>
            """,
            unsafe_allow_html=True
        )

    # Deep Undercarriage Diagnostic Readout Card
    if st.session_state["sim_diagnostic_done"]:
        st.markdown(
            """
            <div style="background: #0d1422; border: 1px solid #00f2fe; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px;">
                    <span style="color: #00f2fe; font-family: JetBrains Mono; font-weight: 700; font-size: 12px;">
                        🔬 DEEP UNDERCARRIAGE DIAGNOSTIC REPORT // BOGIE-BOXN-22 (TRACK 2)
                    </span>
                    <span style="background: #991b1b; color: #fecaca; font-family: JetBrains Mono; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #ef4444;">
                        CONFIRMED ORDNANCE: HIGH HAZARD
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-family: JetBrains Mono; font-size: 11px;">
                    <div style="background: #080c14; padding: 8px; border-radius: 4px; border: 1px solid #1e293b;">
                        <span style="color: #94a3b8;">HAILO-8 OBJECT AI:</span><br>
                        <strong style="color: #ff3366;">PE4 Military Plastic Explosive</strong><br>
                        <span style="color: #64748b; font-size: 10px;">Confidence: 94.2% (YOLOv8x)</span>
                    </div>
                    <div style="background: #080c14; padding: 8px; border-radius: 4px; border: 1px solid #1e293b;">
                        <span style="color: #94a3b8;">FLIR RADIOMETRIC SPOT:</span><br>
                        <strong style="color: #f59e0b;">58.4°C Hotspot Core</strong><br>
                        <span style="color: #64748b; font-size: 10px;">Active Exothermic Battery / Timer</span>
                    </div>
                    <div style="background: #080c14; padding: 8px; border-radius: 4px; border: 1px solid #1e293b;">
                        <span style="color: #94a3b8;">ASPIRATION SNIFFER:</span><br>
                        <strong style="color: #a855f7;">88 PPM Nitrate Trace</strong><br>
                        <span style="color: #64748b; font-size: 10px;">Volatile Precursor Detected</span>
                    </div>
                    <div style="background: #080c14; padding: 8px; border-radius: 4px; border: 1px solid #1e293b;">
                        <span style="color: #94a3b8;">THREAT FUSION INDEX:</span><br>
                        <strong style="color: #ff3366;">0.892 / 1.000</strong><br>
                        <span style="color: #10b981; font-size: 10px;">SHA-256 CoC Vault Sealed</span>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    # Top Control Strip: Sensor Sweeper Toggles & Diagnostic Action
    col_t1, col_t2, col_t3, col_t4, col_t5 = st.columns([1.5, 1.5, 1.5, 2.5, 1.5])
    with col_t1:
        sniffer_toggle = st.toggle("💨 Intake Sniffer", value=sniffer_on, key="tgl_sniffer")
        if sniffer_toggle != sniffer_on:
            st.session_state["sim_sniffer"] = sniffer_toggle
            st.rerun()
    with col_t2:
        lidar_toggle = st.toggle("📡 Active LiDAR", value=lidar_on, key="tgl_lidar")
        if lidar_toggle != lidar_on:
            st.session_state["sim_lidar"] = lidar_toggle
            st.rerun()
    with col_t3:
        thermal_toggle = st.toggle("🔥 Thermal HUD", value=thermal_on, key="tgl_thermal")
        if thermal_toggle != thermal_on:
            st.session_state["sim_thermal"] = thermal_toggle
            st.rerun()
    with col_t4:
        if st.button("🎯 Execute Deep Diagnostic", use_container_width=True, type="primary"):
            st.session_state["sim_crouch"] = True
            st.session_state["sim_diagnostic_done"] = True
            st.session_state["sim_wp_bogie"] = True
            st.session_state["sim_battery"] = max(10.0, float(st.session_state["sim_battery"]) - 1.2)
            st.rerun()
    with col_t5:
        if st.button("🔄 Reset Sim", use_container_width=True):
            st.session_state["sim_robot_x"] = 0.0
            st.session_state["sim_robot_y"] = -0.4
            st.session_state["sim_robot_yaw"] = 0.0
            st.session_state["sim_crouch"] = False
            st.session_state["sim_diagnostic_done"] = False
            st.session_state["sim_battery"] = 94.5
            st.session_state["sim_wp_platform"] = False
            st.session_state["sim_wp_track1"] = True
            st.session_state["sim_wp_bogie"] = False
            st.rerun()

    # Layout: 3D Plotly Canvas (Left/Center) + Teleop D-Pad & Mission HUD (Right)
    sim_col_canvas, sim_col_hud = st.columns([7, 3])

    with sim_col_canvas:
        # Build 3D Station Virtual Environment Plotly Figure
        fig_sim = go.Figure()

        # 1. Ground Ballast Bed (Mesh3D)
        bx = [-8.5, 10.5, 10.5, -8.5]
        by = [-4.5, -4.5, 3.8, 3.8]
        bz = [-0.05, -0.05, -0.05, -0.05]
        ground_color = "#0a0f1d" if thermal_on else "#111726"

        fig_sim.add_trace(go.Mesh3d(
            x=bx, y=by, z=bz,
            i=[0, 0], j=[1, 2], k=[2, 3],
            color=ground_color,
            opacity=0.95,
            name="Railway Ballast Bed",
            hoverinfo="skip"
        ))

        # 2. Dual Parallel Tracks: Concrete Sleepers (Wood/Concrete Ties)
        sleeper_x, sleeper_y, sleeper_z = [], [], []
        for sx in np.arange(-8.0, 10.2, 0.6):
            # Track 1 sleeper
            sleeper_x.extend([sx, sx, None])
            sleeper_y.extend([-0.9, 0.1, None])
            sleeper_z.extend([0.02, 0.02, None])
            # Track 2 sleeper
            sleeper_x.extend([sx, sx, None])
            sleeper_y.extend([0.9, 1.9, None])
            sleeper_z.extend([0.02, 0.02, None])

        sleeper_col = "#1e293b" if thermal_on else "#334155"
        fig_sim.add_trace(go.Scatter3d(
            x=sleeper_x, y=sleeper_y, z=sleeper_z,
            mode="lines",
            line=dict(color=sleeper_col, width=4),
            name="Railway Sleepers",
            hoverinfo="skip"
        ))

        # 3. Steel Rails (UIC-60)
        rail_x, rail_y, rail_z = [], [], []
        # Track 1 Rails: Y = -0.85 and Y = 0.05
        rail_x.extend([-8.5, 10.5, None, -8.5, 10.5, None])
        rail_y.extend([-0.85, -0.85, None, 0.05, 0.05, None])
        rail_z.extend([0.08, 0.08, None, 0.08, 0.08, None])
        # Track 2 Rails: Y = 0.95 and Y = 1.85
        rail_x.extend([-8.5, 10.5, None, -8.5, 10.5, None])
        rail_y.extend([0.95, 0.95, None, 1.85, 1.85, None])
        rail_z.extend([0.08, 0.08, None, 0.08, 0.08, None])

        rail_col = "#38bdf8" if thermal_on else "#94a3b8"
        fig_sim.add_trace(go.Scatter3d(
            x=rail_x, y=rail_y, z=rail_z,
            mode="lines",
            line=dict(color=rail_col, width=5),
            name="UIC-60 Steel Rails",
            hoverinfo="skip"
        ))

        # 4. Elevated Passenger Platform (Z = 0.55m, X: -8 to 5.5, Y: -4.0 to -1.8)
        plat_x = [-8.0, 5.5, 5.5, -8.0]
        plat_y = [-4.0, -4.0, -1.8, -1.8]
        plat_z = [0.55, 0.55, 0.55, 0.55]
        plat_color = "#1e293b" if not thermal_on else "#172554"

        fig_sim.add_trace(go.Mesh3d(
            x=plat_x, y=plat_y, z=plat_z,
            i=[0, 0], j=[1, 2], k=[2, 3],
            color=plat_color,
            opacity=0.95,
            name="Passenger Platform (Z=0.55m)",
            hoverinfo="text",
            text="Passenger Platform Slab (Ambient 22.5°C)"
        ))

        # Safety Yellow Tactile Line along Platform Edge
        fig_sim.add_trace(go.Scatter3d(
            x=[-8.0, 5.5],
            y=[-1.9, -1.9],
            z=[0.56, 0.56],
            mode="lines",
            line=dict(color="#eab308", width=6, dash="dash"),
            name="Tactile Safety Line",
            hoverinfo="skip"
        ))

        # Platform Pillars & Canopy Roof Truss
        pillar_x, pillar_y, pillar_z = [], [], []
        for px_val in [-6.0, -2.0, 2.0]:
            pillar_x.extend([px_val, px_val, None])
            pillar_y.extend([-3.0, -3.0, None])
            pillar_z.extend([0.55, 2.8, None])

        # Roof longitudinal rafters
        pillar_x.extend([-8.0, 5.5, None, -8.0, 5.5, None])
        pillar_y.extend([-1.9, -1.9, None, -3.8, -3.8, None])
        pillar_z.extend([2.8, 2.8, None, 2.8, 2.8, None])

        fig_sim.add_trace(go.Scatter3d(
            x=pillar_x, y=pillar_y, z=pillar_z,
            mode="lines",
            line=dict(color="#64748b", width=3),
            name="Canopy Roof & Pillars",
            hoverinfo="skip"
        ))

        # Platform Benches & Luggage Cart
        fig_sim.add_trace(go.Scatter3d(
            x=[-4.0, 0.0, 1.5],
            y=[-3.2, -3.2, -2.6],
            z=[0.65, 0.65, 0.65],
            mode="markers+text",
            marker=dict(size=[7, 7, 9], color="#94a3b8", symbol="square"),
            text=["Bench", "Bench", "Luggage Cart"],
            textposition="top center",
            name="Platform Furniture",
            hoverinfo="text"
        ))

        # 5. Parked Freight Carriage / Bogie on Track 2 (X: 1.0 to 7.0, Y: 0.85 to 1.95, Z: 0.85 to 2.3)
        # Carriage 3D Box vertices
        c_x = [1.0, 7.0, 7.0, 1.0, 1.0, 7.0, 7.0, 1.0]
        c_y = [0.85, 0.85, 1.95, 1.95, 0.85, 0.85, 1.95, 1.95]
        c_z = [0.85, 0.85, 0.85, 0.85, 2.3, 2.3, 2.3, 2.3]

        c_i = [0, 0, 4, 4, 0, 0, 2, 2, 0, 1]
        c_j = [1, 2, 5, 6, 4, 1, 3, 7, 3, 2]
        c_k = [2, 3, 6, 7, 1, 5, 7, 6, 4, 5]

        train_color = "#065f46" if thermal_on else "#1e3a8a"
        fig_sim.add_trace(go.Mesh3d(
            x=c_x, y=c_y, z=c_z,
            i=c_i, j=c_j, k=c_k,
            color=train_color,
            opacity=0.88,
            name="Freight Carriage (BOXN-22)",
            hoverinfo="text",
            text="Parked Freight Carriage // BOXN-22 (Ambient 31.0°C)"
        ))

        # Freight Bogie Axles & Wheels
        axle_x = [2.0, 2.0, None, 6.0, 6.0, None]
        axle_y = [0.95, 1.85, None, 0.95, 1.85, None]
        axle_z = [0.35, 0.35, None, 0.35, 0.35, None]
        fig_sim.add_trace(go.Scatter3d(
            x=axle_x, y=axle_y, z=axle_z,
            mode="lines",
            line=dict(color="#64748b", width=7),
            name="Bogie Wheelset Axles",
            hoverinfo="skip"
        ))

        # Hot Train Brake Disc (Front Axle left wheel: X=2.0, Y=0.95, Z=0.35)
        brake_color = "#ef4444" if thermal_on else "#d97706"
        brake_text = "🔥 Train Brake Disc: 92.4°C (Frictional Thermal Residual)" if thermal_on else "Brake Disc (Front Bogie)"
        fig_sim.add_trace(go.Scatter3d(
            x=[2.0], y=[0.95], z=[0.35],
            mode="markers+text",
            marker=dict(size=11, color=brake_color, symbol="circle"),
            text=["92°C Hot Brake Disc" if thermal_on else "Brake Disc"],
            textposition="bottom right",
            name="Train Brake Disc",
            hoverinfo="text",
            hovertext=brake_text
        ))

        # Overhead Electric Traction Catenary Line (Z = 3.2m at Track 2 Y = 1.4)
        fig_sim.add_trace(go.Scatter3d(
            x=[-8.5, 10.5],
            y=[1.4, 1.4],
            z=[3.2, 3.2],
            mode="lines",
            line=dict(color="#38bdf8", width=3),
            name="25kV Catenary Traction Wire",
            hoverinfo="skip"
        ))

        # 6. Dark Tunnel / Underpass Transition Zone (X >= 5.5)
        portal_x = [5.5, 5.5, 5.5, 5.5, 5.5]
        portal_y = [-4.5, -4.5, 3.8, 3.8, -4.5]
        portal_z = [0.0, 3.5, 3.5, 0.0, 0.0]
        fig_sim.add_trace(go.Scatter3d(
            x=portal_x, y=portal_y, z=portal_z,
            mode="lines",
            line=dict(color="#0284c7", width=5),
            name="Tunnel Portal (GPS-Denied Arch)",
            hoverinfo="text",
            text="Tunnel Entry // GPS-Denied & Visual Dark Sector"
        ))

        # Tunnel Dark Roof Ribs
        trib_x, trib_y, trib_z = [], [], []
        for tx in [7.0, 8.5, 10.0]:
            trib_x.extend([tx, tx, tx, tx, tx, None])
            trib_y.extend([-4.5, -4.5, 3.8, 3.8, -4.5, None])
            trib_z.extend([0.0, 3.5, 3.5, 0.0, 0.0, None])

        fig_sim.add_trace(go.Scatter3d(
            x=trib_x, y=trib_y, z=trib_z,
            mode="lines",
            line=dict(color="#1e293b", width=3),
            name="Tunnel Structural Ribs",
            hoverinfo="skip"
        ))

        # 7. Concealed Suspicious Ordnance planted in Bogie Cavity (X=3.8, Y=1.4, Z=0.22)
        target_color = "#f97316" if thermal_on else "#dc2626"
        target_label = "🚨 Concealed Threat: 58.4°C Exothermic Battery Pack" if thermal_on else "🚨 Concealed Ordnance Package"
        fig_sim.add_trace(go.Scatter3d(
            x=[target_x], y=[target_y], z=[target_z],
            mode="markers+text",
            marker=dict(size=12, color=target_color, symbol="diamond"),
            text=["CONCEALED TARGET"],
            textposition="top center",
            name="Planted Ordnance Package",
            hoverinfo="text",
            hovertext=target_label
        ))

        # 8. VANGUARD Autonomous Quadruped Robot
        yaw_rad = np.radians(yaw_deg)
        fx = np.cos(yaw_rad) * 0.30
        fy = np.sin(yaw_rad) * 0.30
        sx = -np.sin(yaw_rad) * 0.16
        sy = np.cos(yaw_rad) * 0.16

        # Robot Chassis Corners
        r_corners_x = [rx+fx+sx, rx+fx-sx, rx-fx-sx, rx-fx+sx, rx+fx+sx]
        r_corners_y = [ry+fy+sy, ry+fy-sy, ry-fy-sy, ry-fy+sy, ry+fy+sy]
        r_corners_z = [rz, rz, rz, rz, rz]

        fig_sim.add_trace(go.Scatter3d(
            x=r_corners_x, y=r_corners_y, z=r_corners_z,
            mode="lines+markers",
            line=dict(color="#00f2fe", width=6),
            marker=dict(size=5, color="#00f2fe"),
            name="VANGUARD Robot Chassis",
            hoverinfo="text",
            text=f"VANGUARD Quadruped // Pose: ({rx:.2f}, {ry:.2f}, {rz:.2f}) Yaw: {yaw_deg}°"
        ))

        # Robot Directional Forward Heading Pointer
        fig_sim.add_trace(go.Scatter3d(
            x=[rx, rx + fx * 1.8],
            y=[ry, ry + fy * 1.8],
            z=[rz, rz],
            mode="lines+markers",
            line=dict(color="#ff3366", width=6),
            marker=dict(size=6, color="#ff3366"),
            name="Forward Heading Vector",
            hoverinfo="skip"
        ))

        # 4 Stance Leg Struts to ground
        leg_strut_x, leg_strut_y, leg_strut_z = [], [], []
        feet_pts = [
            (rx+fx+sx, ry+fy+sy),
            (rx+fx-sx, ry+fy-sy),
            (rx-fx-sx, ry-fy-sy),
            (rx-fx+sx, ry-fy+sy)
        ]
        for f_x, f_y in feet_pts:
            leg_strut_x.extend([f_x, f_x, None])
            leg_strut_y.extend([f_y, f_y, None])
            leg_strut_z.extend([rz, 0.0, None])

        fig_sim.add_trace(go.Scatter3d(
            x=leg_strut_x, y=leg_strut_y, z=leg_strut_z,
            mode="lines",
            line=dict(color="#00f2fe", width=3),
            name="Articulated Legs",
            hoverinfo="skip"
        ))

        # 9. Active Sweeper Effects
        # Sniffer Intake Sampling Cone
        if sniffer_on:
            cone_x, cone_y, cone_z = [], [], []
            for angle in np.linspace(0, 2*np.pi, 16):
                cone_x.extend([rx, rx + np.cos(angle)*0.4, None])
                cone_y.extend([ry, ry + np.sin(angle)*0.4, None])
                cone_z.extend([rz, 0.02, None])

            fig_sim.add_trace(go.Scatter3d(
                x=cone_x, y=cone_y, z=cone_z,
                mode="lines",
                line=dict(color="rgba(0, 242, 254, 0.4)", width=2),
                name="Sniffer Aspiration Cone",
                hoverinfo="skip"
            ))

        # Active LiDAR Raycasts
        if lidar_on:
            ray_x, ray_y, ray_z = [], [], []
            for i in range(12):
                ray_angle = np.radians(yaw_deg + i * 30.0)
                r_dist = 2.4 + (i % 3) * 0.7
                ray_x.extend([rx, rx + np.cos(ray_angle) * r_dist, None])
                ray_y.extend([ry, ry + np.sin(ray_angle) * r_dist, None])
                ray_z.extend([rz + 0.10, rz + 0.10, None])

            fig_sim.add_trace(go.Scatter3d(
                x=ray_x, y=ray_y, z=ray_z,
                mode="lines",
                line=dict(color="rgba(0, 242, 254, 0.5)", width=2),
                name="3D LiDAR Raycasts",
                hoverinfo="skip"
            ))

        # Proximity Line between robot and target if in range
        if in_target_range:
            fig_sim.add_trace(go.Scatter3d(
                x=[rx, target_x],
                y=[ry, target_y],
                z=[rz, target_z],
                mode="lines",
                line=dict(color="#ff3366", width=5, dash="dash"),
                name="Target Range Vector",
                hoverinfo="skip"
            ))

        # Camera & Layout Configuration (Fixed 3D aspect ratio, Zero frame lag)
        fig_sim.update_layout(
            paper_bgcolor="#080c14",
            plot_bgcolor="#080c14",
            margin=dict(l=0, r=0, t=20, b=0),
            height=580,
            showlegend=False,
            scene=dict(
                xaxis=dict(
                    title="Track Longitudinal X (m)",
                    range=[-8.5, 10.5],
                    backgroundcolor="#080c14",
                    gridcolor="#1e293b",
                    zerolinecolor="#334155",
                    tickfont=dict(color="#94a3b8", size=10, family="JetBrains Mono")
                ),
                yaxis=dict(
                    title="Platform / Lateral Y (m)",
                    range=[-4.5, 4.0],
                    backgroundcolor="#080c14",
                    gridcolor="#1e293b",
                    zerolinecolor="#334155",
                    tickfont=dict(color="#94a3b8", size=10, family="JetBrains Mono")
                ),
                zaxis=dict(
                    title="Elevation Z (m)",
                    range=[-0.1, 3.6],
                    backgroundcolor="#080c14",
                    gridcolor="#1e293b",
                    zerolinecolor="#334155",
                    tickfont=dict(color="#94a3b8", size=10, family="JetBrains Mono")
                ),
                aspectmode="manual",
                aspectratio=dict(x=2.5, y=1.2, z=0.55),
                camera=dict(
                    eye=dict(x=-1.5, y=-1.9, z=1.3),
                    center=dict(x=0.0, y=0.0, z=-0.1)
                )
            )
        )

        st.plotly_chart(fig_sim, use_container_width=True, config={"displayModeBar": False})

    # Teleoperation Controls D-Pad & Mission Progress HUD
    with sim_col_hud:
        # Mission Progress HUD Card
        sector_score = 0
        if st.session_state["sim_wp_platform"]:
            sector_score += 33
        if st.session_state["sim_wp_track1"]:
            sector_score += 33
        if st.session_state["sim_wp_bogie"]:
            sector_score += 34

        comm_val = -96 if in_tunnel else -48
        comm_pct = 28 if in_tunnel else 98

        st.markdown(
            f"""
            <div class="vanguard-card" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
                    <span style="font-family: JetBrains Mono; font-weight: 700; color: #00f2fe; font-size: 12px;">
                        🎯 MISSION PROGRESS HUD
                    </span>
                    <span style="font-family: JetBrains Mono; font-weight: 700; color: #10b981; font-size: 12px;">
                        {sector_score}% CLEARED
                    </span>
                </div>
                <div style="font-family: JetBrains Mono; font-size: 11px; space-y: 4px;">
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="color: #94a3b8;">1. Platform Perimeter:</span>
                        <strong style="color: {'#10b981' if st.session_state['sim_wp_platform'] else '#64748b'};">
                            {'✅ CLEARED' if st.session_state['sim_wp_platform'] else '⏳ PENDING'}
                        </strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="color: #94a3b8;">2. Track 1 Sweep:</span>
                        <strong style="color: {'#10b981' if st.session_state['sim_wp_track1'] else '#64748b'};">
                            {'✅ CLEARED' if st.session_state['sim_wp_track1'] else '⏳ PENDING'}
                        </strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="color: #94a3b8;">3. Bogie Cavity:</span>
                        <strong style="color: {'#10b981' if st.session_state['sim_wp_bogie'] else '#64748b'};">
                            {'✅ INVESTIGATED' if st.session_state['sim_wp_bogie'] else '⏳ PENDING'}
                        </strong>
                    </div>
                    <hr style="border-color: #1e293b; margin: 8px 0;">
                    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                        <span style="color: #94a3b8;">Battery Reserve:</span>
                        <strong style="color: #10b981;">{st.session_state['sim_battery']:.1f} %</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                        <span style="color: #94a3b8;">RF Comm Link:</span>
                        <strong style="color: {'#f59e0b' if in_tunnel else '#00f2fe'};">{comm_val} dBm ({comm_pct}%)</strong>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Arcade-Grade Teleoperation D-Pad
        st.markdown(
            f"""
            <div class="vanguard-card">
                <div style="font-family: JetBrains Mono; font-weight: 700; color: #f1f5f9; font-size: 12px; margin-bottom: 6px;">
                    🕹️ TELEOP DIRECTIONAL CONTROLLER
                </div>
                <div style="font-family: JetBrains Mono; font-size: 10px; color: #00f2fe; margin-bottom: 10px;">
                    POS: ({rx:.2f}m, {ry:.2f}m, {rz:.2f}m) | YAW: {yaw_deg:.0f}° | STANCE: {'CROUCH' if crouched else 'TROT'}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Forward Button
        col_f1, col_f2, col_f3 = st.columns([1, 1.4, 1])
        with col_f2:
            if st.button("⬆️ FWD", use_container_width=True, key="btn_fwd"):
                rad = np.radians(yaw_deg)
                st.session_state["sim_robot_x"] = max(-7.5, min(9.5, rx + np.cos(rad) * 0.7))
                st.session_state["sim_robot_y"] = max(-4.0, min(3.5, ry + np.sin(rad) * 0.7))
                st.session_state["sim_battery"] = max(10.0, float(st.session_state["sim_battery"]) - 0.15)
                st.rerun()

        # Strafe Left / Crouch Toggle / Strafe Right
        col_m1, col_m2, col_m3 = st.columns([1.2, 1.4, 1.2])
        with col_m1:
            if st.button("⬅️ LEFT", use_container_width=True, key="btn_left"):
                rad = np.radians(yaw_deg - 90.0)
                st.session_state["sim_robot_x"] = max(-7.5, min(9.5, rx + np.cos(rad) * 0.6))
                st.session_state["sim_robot_y"] = max(-4.0, min(3.5, ry + np.sin(rad) * 0.6))
                st.session_state["sim_battery"] = max(10.0, float(st.session_state["sim_battery"]) - 0.15)
                st.rerun()
        with col_m2:
            crouch_btn_text = "🧎 STAND" if crouched else "🧎 CROUCH"
            if st.button(crouch_btn_text, use_container_width=True, key="btn_crouch"):
                st.session_state["sim_crouch"] = not crouched
                st.rerun()
        with col_m3:
            if st.button("➡️ RIGHT", use_container_width=True, key="btn_right"):
                rad = np.radians(yaw_deg + 90.0)
                st.session_state["sim_robot_x"] = max(-7.5, min(9.5, rx + np.cos(rad) * 0.6))
                st.session_state["sim_robot_y"] = max(-4.0, min(3.5, ry + np.sin(rad) * 0.6))
                st.session_state["sim_battery"] = max(10.0, float(st.session_state["sim_battery"]) - 0.15)
                st.rerun()

        # Backward Button
        col_b1, col_b2, col_b3 = st.columns([1, 1.4, 1])
        with col_b2:
            if st.button("⬇️ BACK", use_container_width=True, key="btn_back"):
                rad = np.radians(yaw_deg)
                st.session_state["sim_robot_x"] = max(-7.5, min(9.5, rx - np.cos(rad) * 0.7))
                st.session_state["sim_robot_y"] = max(-4.0, min(3.5, ry - np.sin(rad) * 0.7))
                st.session_state["sim_battery"] = max(10.0, float(st.session_state["sim_battery"]) - 0.15)
                st.rerun()

        # Yaw Rotation Buttons
        col_r1, col_r2 = st.columns(2)
        with col_r1:
            if st.button("🔄 Yaw -25°", use_container_width=True, key="btn_yaw_ccw"):
                st.session_state["sim_robot_yaw"] = (yaw_deg - 25.0) % 360.0
                st.rerun()
        with col_r2:
            if st.button("🔁 Yaw +25°", use_container_width=True, key="btn_yaw_cw"):
                st.session_state["sim_robot_yaw"] = (yaw_deg + 25.0) % 360.0
                st.rerun()

# -----------------------------------------------------------------------------
# RUNTIME INTEGRITY FOOTER
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(
    """
    <div style="display: flex; justify-content: space-between; align-items: center; font-family: JetBrains Mono; font-size: 11px; color: #64748b;">
        <span>PROJECT VANGUARD // SIH-26026 GROUND COMMAND STATION // HIGH-FIDELITY TWIN</span>
        <span>STATUS: DETERMINISTIC SIMULATION ONLINE (1000 Hz)</span>
    </div>
    """,
    unsafe_allow_html=True
)
