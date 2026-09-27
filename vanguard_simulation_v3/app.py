"""
Project VANGUARD: Quadruped Security & Threat Detection Robot
Digital Twin Ground Command Station for Indian Railways
Author: Principal Robotics Software Engineer & Streamlit Ground Station Lead
Framework: Streamlit + Plotly + NumPy + Pandas + Hashlib + Datetime
Target Environment: Streamlit Community Cloud & AI Studio Local Host
"""

import datetime
import hashlib
import math
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

# ==============================================================================
# 1. STREAMLIT PAGE CONFIGURATION & TACTICAL CSS
# ==============================================================================
st.set_page_config(
    page_title="PROJECT VANGUARD // Ground Command Station",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Tactical / Cyberpunk Defense Theme Styling
st.markdown(
    """
    <style>
        /* Base page tone */
        .stApp {
            background: linear-gradient(180deg, #050b14 0%, #0e1117 100%);
            color: #d1d5db;
            font-family: 'JetBrains Mono', 'Segoe UI Mono', monospace;
        }

        /* Top ribbon and headers */
        h1, h2, h3, h4 {
            color: #00f3ff !important;
            font-weight: 700 !important;
            letter-spacing: 0.05em;
            text-shadow: 0 0 12px rgba(0, 243, 255, 0.4);
        }

        /* Metric cards styling */
        div[data-testid="stMetric"] {
            background-color: #0b1322 !important;
            border: 1px solid #1e293b !important;
            border-left: 4px solid #00f3ff !important;
            border-radius: 4px !important;
            padding: 12px 16px !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
        }
        div[data-testid="stMetricLabel"] {
            font-size: 0.78rem !important;
            text-transform: uppercase !important;
            color: #94a3b8 !important;
            letter-spacing: 0.08em;
        }
        div[data-testid="stMetricValue"] {
            font-size: 1.6rem !important;
            font-weight: 700 !important;
            color: #ffffff !important;
        }

        /* Tactical buttons */
        .stButton>button {
            width: 100%;
            background-color: #0b1626 !important;
            color: #00f3ff !important;
            border: 1px solid #00f3ff !important;
            border-radius: 4px !important;
            font-weight: 600 !important;
            letter-spacing: 0.06em;
            text-transform: uppercase !important;
            transition: all 0.2s ease-in-out;
        }
        .stButton>button:hover {
            background-color: #00f3ff !important;
            color: #050b14 !important;
            box-shadow: 0 0 16px rgba(0, 243, 255, 0.6) !important;
        }

        /* Primary action button highlight */
        .stButton>button[kind="primary"] {
            background-color: #ff0055 !important;
            color: #ffffff !important;
            border: 1px solid #ff0055 !important;
        }
        .stButton>button[kind="primary"]:hover {
            background-color: #ff3377 !important;
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.8) !important;
        }

        /* Tabs custom styling */
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
            background-color: #080f1d;
            border-bottom: 2px solid #1e293b;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .stTabs [data-baseweb="tab"] {
            border-radius: 4px !important;
            color: #94a3b8 !important;
            background-color: transparent !important;
            padding: 8px 18px !important;
            font-size: 0.85rem !important;
            font-weight: 600 !important;
        }
        .stTabs [aria-selected="true"] {
            color: #00f3ff !important;
            border-bottom: 2px solid #00f3ff !important;
            background-color: rgba(0, 243, 255, 0.08) !important;
        }

        /* Tactical HUD panel box */
        .hud-panel {
            background: #091220;
            border: 1px solid #1c2b42;
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .hud-tag {
            display: inline-block;
            padding: 2px 8px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            border-radius: 3px;
            margin-right: 6px;
        }
        .hud-tag-cyan { background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; }
        .hud-tag-red { background: rgba(255, 0, 85, 0.2); color: #ff0055; border: 1px solid #ff0055; }
        .hud-tag-green { background: rgba(0, 255, 102, 0.15); color: #00ff66; border: 1px solid #00ff66; }
        .hud-tag-amber { background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid #ffaa00; }
    </style>
    """,
    unsafe_allow_html=True,
)


# ==============================================================================
# 2. STATE MANAGEMENT & MISSION INITIALIZATION
# ==============================================================================
def generate_audit_hash(timestamp_str, location_tag, threat_level, threat_idx):
    """Generates an immutable SHA-256 cryptographic audit record hash."""
    seed_str = f"{timestamp_str}|{location_tag}|{threat_level}|{threat_idx:.2f}|IR_SECURITY_PROTOCOL_60"
    return hashlib.sha256(seed_str.encode("utf-8")).hexdigest()


if "initialized" not in st.session_state:
    st.session_state.initialized = True
    st.session_state.patrol_mode = "Trot"  # Options: Trot, Crawl / Hazard Ballast
    st.session_state.battery = 89.4
    st.session_state.pitch_angle = 1.8  # degrees
    st.session_state.roll_angle = -0.5  # degrees
    st.session_state.chassis_clearance = 28.0  # cm
    st.session_state.ballast_dispersion = 0.35  # coefficient 0.0 to 1.0
    st.session_state.active_threat = "Nominal"  # Nominal, Narcotics, Explosive Class 1.1
    st.session_state.step_counter = 42
    st.session_state.track_chainage = 118.420  # km on Indian Railways Delhi-Agra UIC-60 track
    st.session_state.e_stop_active = False

    # Sensor values
    st.session_state.visual_match = 14.2  # %
    st.session_state.thermal_delta = 1.8  # °C differential
    st.session_state.chem_ppm = 2.4  # PPM VOC/Nitro

    # Initial Audit Trail
    t_now = datetime.datetime.now(datetime.timezone.utc)
    st.session_state.audit_logs = [
        {
            "Timestamp": (t_now - datetime.timedelta(seconds=240)).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "Chainage": "KM 118.360 UIC-60",
            "Zone": "Track Sleepers 040-080",
            "Threat Level": "Nominal",
            "Threat Index": 8.4,
            "Visual %": 12.1,
            "Thermal ΔT": 1.4,
            "Chem PPM": 1.8,
            "SHA-256 Hash": generate_audit_hash(
                (t_now - datetime.timedelta(seconds=240)).isoformat(), "KM 118.360", "Nominal", 8.4
            ),
        },
        {
            "Timestamp": (t_now - datetime.timedelta(seconds=120)).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "Chainage": "KM 118.390 UIC-60",
            "Zone": "Bogie Undercarriage Axle 2",
            "Threat Level": "Nominal",
            "Threat Index": 11.2,
            "Visual %": 15.3,
            "Thermal ΔT": 2.1,
            "Chem PPM": 2.2,
            "SHA-256 Hash": generate_audit_hash(
                (t_now - datetime.timedelta(seconds=120)).isoformat(), "KM 118.390", "Nominal", 11.2
            ),
        },
    ]


# ==============================================================================
# 3. KINEMATIC & THREAT SIMULATION LOGIC
# ==============================================================================
def compute_master_threat_index(visual_match, thermal_delta, chem_ppm):
    """
    Neurosymbolic Sensor Fusion Engine:
    Weighted aggregation with cross-modality reinforcement for Indian Railways
    counter-sabotage detection.
    - Weights: Visual (0.25), Thermal (0.35), Chemical Sniffer (0.40)
    - Non-linear cross-activation penalty when both thermal and vapor spike together.
    """
    v_norm = np.clip(visual_match / 100.0, 0.0, 1.0)
    t_norm = np.clip(thermal_delta / 30.0, 0.0, 1.0)  # 30°C delta max
    c_norm = np.clip(chem_ppm / 150.0, 0.0, 1.0)  # 150 ppm max

    base_score = (0.25 * v_norm + 0.35 * t_norm + 0.40 * c_norm) * 100.0

    # Cross-modality synergistic multiplier (Thermal anomaly + Chemical nitro plume)
    if thermal_delta > 8.0 and chem_ppm > 25.0:
        synergy_boost = 18.0 * (t_norm * c_norm)
        base_score += synergy_boost

    master_threat_index = float(np.clip(base_score, 0.0, 100.0))
    return master_threat_index


def step_patrol_sweep():
    """Advances the quadruped patrol by one inspection step (game turn)."""
    if st.session_state.e_stop_active:
        st.warning("CANNOT ADVANCE: EMERGENCY STOP INTERLOCK ENGAGED")
        return

    st.session_state.step_counter += 1
    # Advance along track by 15 meters
    st.session_state.track_chainage = round(st.session_state.track_chainage + 0.015, 3)
    st.session_state.battery = max(5.0, round(st.session_state.battery - np.random.uniform(0.1, 0.3), 1))

    # Dynamic gait noise
    if st.session_state.patrol_mode == "Trot":
        st.session_state.pitch_angle = round(st.session_state.pitch_angle + np.random.uniform(-1.2, 1.2), 1)
        st.session_state.roll_angle = round(np.random.uniform(-2.5, 2.5), 1)
    else:  # Crawl / Hazard Ballast
        st.session_state.pitch_angle = round(st.session_state.pitch_angle + np.random.uniform(-0.4, 0.4), 1)
        st.session_state.roll_angle = round(np.random.uniform(-0.8, 0.8), 1)

    # Sensor readings based on current active threat scenario
    if st.session_state.active_threat == "Explosive Class 1.1":
        st.session_state.visual_match = round(min(98.5, 82.0 + np.random.uniform(-4.0, 8.0)), 1)
        st.session_state.thermal_delta = round(min(28.0, 18.5 + np.random.uniform(-2.0, 4.5)), 1)
        st.session_state.chem_ppm = round(min(145.0, 92.0 + np.random.uniform(-8.0, 14.0)), 1)
    elif st.session_state.active_threat == "Narcotics":
        st.session_state.visual_match = round(min(85.0, 58.0 + np.random.uniform(-5.0, 6.0)), 1)
        st.session_state.thermal_delta = round(min(12.0, 3.2 + np.random.uniform(-0.5, 1.2)), 1)
        st.session_state.chem_ppm = round(min(90.0, 64.0 + np.random.uniform(-5.0, 10.0)), 1)
    else:  # Nominal
        st.session_state.visual_match = round(max(2.0, 12.0 + np.random.uniform(-4.0, 5.0)), 1)
        st.session_state.thermal_delta = round(max(0.5, 1.9 + np.random.uniform(-0.6, 0.8)), 1)
        st.session_state.chem_ppm = round(max(0.2, 2.1 + np.random.uniform(-0.7, 0.9)), 1)

    # Compute threat score
    mti = compute_master_threat_index(
        st.session_state.visual_match,
        st.session_state.thermal_delta,
        st.session_state.chem_ppm,
    )

    # Append to cryptographic audit log
    t_now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    location_str = f"KM {st.session_state.track_chainage:.3f} UIC-60"
    audit_hash = generate_audit_hash(
        t_now_str, location_str, st.session_state.active_threat, mti
    )

    new_log_entry = {
        "Timestamp": t_now_str,
        "Chainage": location_str,
        "Zone": f"Bogie Stanchion Track Post #{st.session_state.step_counter}",
        "Threat Level": st.session_state.active_threat,
        "Threat Index": round(mti, 1),
        "Visual %": st.session_state.visual_match,
        "Thermal ΔT": st.session_state.thermal_delta,
        "Chem PPM": st.session_state.chem_ppm,
        "SHA-256 Hash": audit_hash,
    }
    st.session_state.audit_logs.insert(0, new_log_entry)
    if len(st.session_state.audit_logs) > 50:
        st.session_state.audit_logs.pop()


# ==============================================================================
# 4. SIDEBAR CONTROLS & MISSION INJECTION
# ==============================================================================
with st.sidebar:
    st.markdown("### ⚙️ VANGUARD GROUND STATION")
    st.caption("INDIAN RAILWAYS INFRASTRUCTURE SECURITY DIRECTIVE // RPF-TECH-88")

    st.markdown("---")
    st.markdown("#### 🎮 PATROL CYCLE CONTROL")
    col_step1, col_step2 = st.columns([2, 1])
    with col_step1:
        if st.button("▶ STEP PATROL / SCAN SWEEP", use_container_width=True):
            step_patrol_sweep()
    with col_step2:
        if st.button("↺ RESET", use_container_width=True):
            st.session_state.active_threat = "Nominal"
            st.session_state.e_stop_active = False
            st.session_state.visual_match = 12.0
            st.session_state.thermal_delta = 1.8
            st.session_state.chem_ppm = 2.0
            st.rerun()

    st.markdown("---")
    st.markdown("#### 🦾 GAIT & KINEMATICS CONTROL")
    st.session_state.patrol_mode = st.selectbox(
        "Locomotion Gait Mode",
        options=["Trot", "Crawl / Hazard Ballast"],
        index=0 if st.session_state.patrol_mode == "Trot" else 1,
    )

    st.session_state.pitch_angle = st.slider(
        "Chassis Pitch Trim (°)",
        min_value=-15.0,
        max_value=15.0,
        value=float(st.session_state.pitch_angle),
        step=0.5,
        help="Adjusts torso tilt relative to rail gradient",
    )

    st.session_state.chassis_clearance = st.slider(
        "Chassis Clearance (cm)",
        min_value=10.0,
        max_value=45.0,
        value=float(st.session_state.chassis_clearance),
        step=1.0,
        help="Ground standoff height above UIC-60 rail head",
    )

    st.session_state.ballast_dispersion = st.slider(
        "Ballast Dispersion Coeff",
        min_value=0.0,
        max_value=1.0,
        value=float(st.session_state.ballast_dispersion),
        step=0.05,
        help="Terrain compliance damping for loose gravel/ballast",
    )

    st.markdown("---")
    st.markdown("#### 🚨 MISSION INJECTION PRESETS")
    st.caption("Simulate real-time field threat events:")

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        if st.button("🟢 Nominal Sweep", use_container_width=True):
            st.session_state.active_threat = "Nominal"
            st.session_state.e_stop_active = False
            st.session_state.visual_match = 11.5
            st.session_state.thermal_delta = 1.7
            st.session_state.chem_ppm = 1.9
            step_patrol_sweep()
            st.rerun()

    with col_btn2:
        if st.button("🔴 Bogie Ordnance", use_container_width=True):
            st.session_state.active_threat = "Explosive Class 1.1"
            st.session_state.visual_match = 94.2
            st.session_state.thermal_delta = 24.8
            st.session_state.chem_ppm = 118.5
            step_patrol_sweep()
            st.rerun()

    col_btn3, col_btn4 = st.columns(2)
    with col_btn3:
        if st.button("🟡 Vapor Spike", use_container_width=True):
            st.session_state.active_threat = "Narcotics"
            st.session_state.visual_match = 62.4
            st.session_state.thermal_delta = 4.1
            st.session_state.chem_ppm = 76.2
            step_patrol_sweep()
            st.rerun()

    with col_btn4:
        e_stop_label = "🔴 DISENGAGE E-STOP" if st.session_state.e_stop_active else "⛔ E-STOP (HALT)"
        if st.button(e_stop_label, kind="primary", use_container_width=True):
            st.session_state.e_stop_active = not st.session_state.e_stop_active
            st.rerun()

    if st.session_state.e_stop_active:
        st.error("⚠️ SYSTEM LOCKED: EMERGENCY STOP ACTIVE")

    st.markdown("---")
    st.markdown(
        """
        <div style="font-size:0.75rem; color:#64748b; line-height:1.4;">
            SYSTEM: VANGUARD-Q4 MK-III<br>
            PLATFORM: Broad Gauge (1676mm)<br>
            ENCRYPTION: SHA-256 Hardened Vault<br>
            TELEMETRY LINK: 5.8GHz Tactical Mesh
        </div>
        """,
        unsafe_allow_html=True,
    )


# ==============================================================================
# 5. TOP TELEMETRY RIBBON
# ==============================================================================
current_threat_index = compute_master_threat_index(
    st.session_state.visual_match,
    st.session_state.thermal_delta,
    st.session_state.chem_ppm,
)

st.title("PROJECT VANGUARD // GROUND COMMAND TWIN")
st.caption("AUTONOMOUS RAILWAY SECURITY & COUNTER-SABOTAGE QUADRUPED GROUND SYSTEM")

m_col1, m_col2, m_col3, m_col4, m_col5, m_col6 = st.columns(6)

with m_col1:
    st.metric(
        label="SYS STATUS",
        value="E-STOP ACTIVE" if st.session_state.e_stop_active else "OPERATIONAL",
        delta="HALTED" if st.session_state.e_stop_active else "NOMINAL GAIT",
        delta_color="inverse" if st.session_state.e_stop_active else "normal",
    )

with m_col2:
    st.metric(
        label="PATROL CHAINAGE",
        value=f"KM {st.session_state.track_chainage:.3f}",
        delta=f"STEP #{st.session_state.step_counter}",
    )

with m_col3:
    st.metric(
        label="BATTERY BUS",
        value=f"{st.session_state.battery:.1f} %",
        delta="-0.2%/step",
        delta_color="normal",
    )

with m_col4:
    st.metric(
        label="CHASSIS TRIM",
        value=f"{st.session_state.pitch_angle:+.1f}°",
        delta=f"CLR: {st.session_state.chassis_clearance:.0f}cm",
    )

with m_col5:
    st.metric(
        label="THREAT LEVEL",
        value=st.session_state.active_threat.upper(),
        delta=f"SCORE: {current_threat_index:.1f}/100",
        delta_color="inverse" if current_threat_index > 40 else "normal",
    )

with m_col6:
    st.metric(
        label="GAIT MODE",
        value=st.session_state.patrol_mode.split()[0].upper(),
        delta=f"BALLAST: {st.session_state.ballast_dispersion:.2f}",
    )


# ==============================================================================
# 6. TAB NAVIGATION & CORE WORKSTATION MODULES
# ==============================================================================
tab_kinematics, tab_ar_hud, tab_fusion, tab_vault = st.tabs(
    [
        "🦾 3D KINEMATICS TWIN",
        "🎯 AR VIEWPORT & THERMAL FLIR",
        "🧠 NEUROSYMBOLIC SENSOR FUSION",
        "🔐 CRYPTOGRAPHIC AUDIT VAULT",
    ]
)


# ==============================================================================
# TAB 1: 3D KINEMATICS DIGITAL TWIN (PLOTLY 3D GRAPHICS)
# ==============================================================================
with tab_kinematics:
    st.markdown("#### REAL-TIME 3D QUADRUPED DIGITAL TWIN ON UIC-60 RAIL INFRASTRUCTURE")
    st.caption("Live forward kinematic posture reconstruction on Indian Railways 1676mm Broad Gauge tracks.")

    # Calculate 3D coordinates based on pitch, roll, and clearance
    pitch_rad = math.radians(st.session_state.pitch_angle)
    clearance_m = st.session_state.chassis_clearance / 100.0  # convert cm to m

    # Quadruped Body Geometry Specifications (Meters)
    body_length = 0.90
    body_width = 0.45
    body_height = 0.22

    # Center of mass coordinates
    cx, cy, cz = 0.0, 0.0, clearance_m + (body_height / 2.0)

    # 8 Vertices of Chassis Box with pitch transformation
    dx = body_length / 2.0
    dy = body_width / 2.0
    dz = body_height / 2.0

    raw_box = np.array(
        [
            [-dx, -dy, -dz],
            [dx, -dy, -dz],
            [dx, dy, -dz],
            [-dx, dy, -dz],
            [-dx, -dy, dz],
            [dx, -dy, dz],
            [dx, dy, dz],
            [-dx, dy, dz],
        ]
    )

    # Pitch rotation matrix around Y-axis
    rot_y = np.array(
        [
            [math.cos(pitch_rad), 0, math.sin(pitch_rad)],
            [0, 1, 0],
            [-math.sin(pitch_rad), 0, math.cos(pitch_rad)],
        ]
    )

    rotated_box = np.dot(raw_box, rot_y.T)
    chassis_vertices = rotated_box + np.array([cx, cy, cz])

    # 12 Edges connecting vertices of the chassis box
    box_lines_x, box_lines_y, box_lines_z = [], [], []
    edges = [
        (0, 1), (1, 2), (2, 3), (3, 0),  # bottom square
        (4, 5), (5, 6), (6, 7), (7, 4),  # top square
        (0, 4), (1, 5), (2, 6), (3, 7),  # vertical pillars
        (4, 2), (5, 3),                  # internal cross-braces
    ]
    for e1, e2 in edges:
        box_lines_x.extend([chassis_vertices[e1, 0], chassis_vertices[e2, 0], None])
        box_lines_y.extend([chassis_vertices[e1, 1], chassis_vertices[e2, 1], None])
        box_lines_z.extend([chassis_vertices[e1, 2], chassis_vertices[e2, 2], None])

    # Leg Shoulders & Articulated Kinematic 2-Link Segments (FL, FR, RL, RR)
    # Broad Gauge Rail center is y = +/- 0.838m (Total 1.676m gauge)
    rail_gauge_half = 1.676 / 2.0

    hip_offsets = {
        "FL": (dx * 0.85, dy, 0.0),
        "FR": (dx * 0.85, -dy, 0.0),
        "RL": (-dx * 0.85, dy, 0.0),
        "RR": (-dx * 0.85, -dy, 0.0),
    }

    # Footpad Contact Positions on Track Surface (z = 0.0)
    foot_targets = {
        "FL": (dx * 1.05, rail_gauge_half * 0.65, 0.0),
        "FR": (dx * 1.05, -rail_gauge_half * 0.65, 0.0),
        "RL": (-dx * 1.05, rail_gauge_half * 0.65, 0.0),
        "RR": (-dx * 1.05, -rail_gauge_half * 0.65, 0.0),
    }

    # If trotting, alternate leg lifts based on step counter
    trot_phase = st.session_state.step_counter % 2
    if st.session_state.patrol_mode == "Trot" and not st.session_state.e_stop_active:
        if trot_phase == 0:
            foot_targets["FL"] = (foot_targets["FL"][0] + 0.12, foot_targets["FL"][1], 0.07)
            foot_targets["RR"] = (foot_targets["RR"][0] + 0.12, foot_targets["RR"][1], 0.07)
        else:
            foot_targets["FR"] = (foot_targets["FR"][0] + 0.12, foot_targets["FR"][1], 0.07)
            foot_targets["RL"] = (foot_targets["RL"][0] + 0.12, foot_targets["RL"][1], 0.07)

    leg_x, leg_y, leg_z = [], [], []
    knee_x, knee_y, knee_z = [], [], []
    foot_x, foot_y, foot_z = [], [], []

    for leg_id, hip_off in hip_offsets.items():
        # Rotate hip position with chassis
        rotated_hip = np.dot(np.array(hip_off), rot_y.T) + np.array([cx, cy, cz])
        foot_pos = np.array(foot_targets[leg_id])

        # Compute mid knee joint (inverse kinematic 2-bar inflection)
        mid_knee = (rotated_hip + foot_pos) / 2.0
        # Knee elbow outward flare
        mid_knee[1] += 0.12 if hip_off[1] > 0 else -0.12
        mid_knee[2] += 0.08  # raised knee apex

        # Construct leg lines: Hip -> Knee -> Foot
        leg_x.extend([rotated_hip[0], mid_knee[0], foot_pos[0], None])
        leg_y.extend([rotated_hip[1], mid_knee[1], foot_pos[1], None])
        leg_z.extend([rotated_hip[2], mid_knee[2], foot_pos[2], None])

        knee_x.append(mid_knee[0])
        knee_y.append(mid_knee[1])
        knee_z.append(mid_knee[2])

        foot_x.append(foot_pos[0])
        foot_y.append(foot_pos[1])
        foot_z.append(foot_pos[2])

    # UIC-60 Rail Profile lines & Concrete Sleepers
    rail_x = np.linspace(-2.2, 2.2, 50)
    left_rail_y = np.full_like(rail_x, rail_gauge_half)
    right_rail_y = np.full_like(rail_x, -rail_gauge_half)
    rail_z = np.zeros_like(rail_x)

    # Railway Sleepers (Cross ties underneath rails spaced every 0.6m)
    sleepers_x, sleepers_y, sleepers_z = [], [], []
    for sx in np.arange(-2.0, 2.2, 0.55):
        sleepers_x.extend([sx, sx, None])
        sleepers_y.extend([-1.1, 1.1, None])
        sleepers_z.extend([-0.04, -0.04, None])

    # Ballast Bed Base Grid
    ballast_x = [-2.2, 2.2, 2.2, -2.2, -2.2]
    ballast_y = [-1.3, -1.3, 1.3, 1.3, -1.3]
    ballast_z = [-0.08, -0.08, -0.08, -0.08, -0.08]

    # Assemble Plotly 3D Figure
    fig_3d = go.Figure()

    # 1. Concrete Sleepers
    fig_3d.add_trace(
        go.Scatter3d(
            x=sleepers_x,
            y=sleepers_y,
            z=sleepers_z,
            mode="lines",
            line=dict(color="#475569", width=7),
            name="UIC-60 Sleepers (PSC)",
            hoverinfo="skip",
        )
    )

    # 2. Steel Rails (Indian Railways Broad Gauge 1676mm)
    fig_3d.add_trace(
        go.Scatter3d(
            x=rail_x,
            y=left_rail_y,
            z=rail_z,
            mode="lines",
            line=dict(color="#00f3ff", width=6),
            name="Left Rail (UIC-60)",
            hovertext="Left UIC-60 High-Tensile Steel Rail",
        )
    )
    fig_3d.add_trace(
        go.Scatter3d(
            x=rail_x,
            y=right_rail_y,
            z=rail_z,
            mode="lines",
            line=dict(color="#00f3ff", width=6),
            name="Right Rail (UIC-60)",
            hovertext="Right UIC-60 High-Tensile Steel Rail",
        )
    )

    # 3. Quadruped Chassis Box (Cybernetic Wireframe)
    fig_3d.add_trace(
        go.Scatter3d(
            x=box_lines_x,
            y=box_lines_y,
            z=box_lines_z,
            mode="lines",
            line=dict(color="#00ff66", width=5),
            name="VANGUARD Chassis Frame",
        )
    )

    # 4. Center of Mass & Payload Sensor Turret
    fig_3d.add_trace(
        go.Scatter3d(
            x=[cx],
            y=[cy],
            z=[cz + 0.12],
            mode="markers",
            marker=dict(size=8, color="#ff0055", symbol="diamond"),
            name="Radiometric Sensor Turret",
            hovertext="LiDAR + FLIR Gimbal Payload",
        )
    )

    # 5. Articulated Legs (Femur + Tibia Links)
    fig_3d.add_trace(
        go.Scatter3d(
            x=leg_x,
            y=leg_y,
            z=leg_z,
            mode="lines",
            line=dict(color="#38bdf8", width=5),
            name="Articulated 3-DoF Legs",
        )
    )

    # 6. Knee Joint Actuators
    fig_3d.add_trace(
        go.Scatter3d(
            x=knee_x,
            y=knee_y,
            z=knee_z,
            mode="markers",
            marker=dict(size=6, color="#00f3ff"),
            name="BLDC Harmonic Knee Actuators",
            hoverinfo="name",
        )
    )

    # 7. Footpad Tactile Contact Sensors
    fig_3d.add_trace(
        go.Scatter3d(
            x=foot_x,
            y=foot_y,
            z=foot_z,
            mode="markers",
            marker=dict(size=7, color="#ffaa00", symbol="circle"),
            name="Dynamic Ballast Footpads",
            hovertext="Piezoresistive Ground Contact Pads",
        )
    )

    # Dark tactical viewport layout styling
    fig_3d.update_layout(
        template="plotly_dark",
        paper_bgcolor="#050b14",
        plot_bgcolor="#050b14",
        height=540,
        margin=dict(l=0, r=0, t=10, b=0),
        scene=dict(
            xaxis=dict(
                title="Track Axis X (m)",
                backgroundcolor="#050b14",
                gridcolor="#1e293b",
                zerolinecolor="#334155",
                range=[-2.2, 2.2],
            ),
            yaxis=dict(
                title="Transverse Y (m)",
                backgroundcolor="#050b14",
                gridcolor="#1e293b",
                zerolinecolor="#334155",
                range=[-1.4, 1.4],
            ),
            zaxis=dict(
                title="Altitude Z (m)",
                backgroundcolor="#050b14",
                gridcolor="#1e293b",
                zerolinecolor="#334155",
                range=[-0.15, 0.75],
            ),
            camera=dict(
                eye=dict(x=-1.6, y=-1.8, z=1.2),
                center=dict(x=0, y=0, z=0.15),
            ),
            aspectratio=dict(x=2.2, y=1.4, z=0.8),
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=0.01,
            xanchor="center",
            x=0.5,
            font=dict(size=10, color="#94a3b8"),
            bgcolor="rgba(11, 19, 34, 0.8)",
            bordercolor="#1e293b",
            borderwidth=1,
        ),
    )

    st.plotly_chart(fig_3d, use_container_width=True)

    # Posture Telemetry Diagnostics Cards
    col_k1, col_k2, col_k3, col_k4 = st.columns(4)
    with col_k1:
        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag hud-tag-cyan">KINEMATICS</span><br>
                <b>Pitch Vector:</b> {st.session_state.pitch_angle:+.1f}°<br>
                <b>Roll Vector:</b> {st.session_state.roll_angle:+.1f}°<br>
                <b>Yaw Drift:</b> 0.04°/m
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col_k2:
        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag hud-tag-green">STANDOFF</span><br>
                <b>Clearance:</b> {st.session_state.chassis_clearance:.1f} cm<br>
                <b>Obstacle Margin:</b> {st.session_state.chassis_clearance - 12.0:.1f} cm<br>
                <b>Rail Crest Standoff:</b> +{(st.session_state.chassis_clearance / 100.0):.2f}m
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col_k3:
        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag hud-tag-amber">BALLAST CONTACT</span><br>
                <b>Grip Compliance:</b> {(1.0 - st.session_state.ballast_dispersion)*100:.0f}%<br>
                <b>Trot Slip Risk:</b> {'LOW' if st.session_state.ballast_dispersion < 0.5 else 'ELEVATED'}<br>
                <b>Ground Reaction:</b> 440 N/leg
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col_k4:
        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag hud-tag-red">INTERLOCK</span><br>
                <b>E-Stop Bus:</b> {'TRIPPED' if st.session_state.e_stop_active else 'CLEAR'}<br>
                <b>Motor Thermals:</b> 44.8 °C<br>
                <b>CAN-FD Health:</b> 100% NOMINAL
            </div>
            """,
            unsafe_allow_html=True,
        )


# ==============================================================================
# TAB 2: AR VIEWPORT & SENSOR HUD
# ==============================================================================
with tab_ar_hud:
    st.markdown("#### AUGMENTED REALITY (AR) TARGET HUD & RADIOMETRIC FLIR UNDERCARRIAGE SCAN")
    st.caption("Real-time forward thermal camera stream focused on passenger coach bogies, wheelsets, and brake discs.")

    col_viewport, col_hud_stats = st.columns([3, 1])

    with col_viewport:
        # Generate synthetic 2D thermal undercarriage heatmap
        # Grid dimensions representing the underside of a train bogie
        ny, nx = 40, 80
        x_mesh = np.linspace(-4, 4, nx)
        y_mesh = np.linspace(-2, 2, ny)
        X, Y = np.meshgrid(x_mesh, y_mesh)

        # Baseline ambient temperature profile (~32°C ambient railway track environment)
        thermal_matrix = 32.0 + 2.0 * np.sin(X * 0.8) * np.cos(Y * 1.2) + np.random.normal(0, 0.4, (ny, nx))

        # Train Bogie Geometry: Axles at X = -2.2 and X = +2.2 with hot brake discs (~55°C)
        thermal_matrix += 20.0 * np.exp(-((X + 2.2) ** 2 + (Y) ** 2) / 0.5)
        thermal_matrix += 20.0 * np.exp(-((X - 2.2) ** 2 + (Y) ** 2) / 0.5)

        # If a threat is injected, synthesize high thermal signature and explosive anomaly
        threat_detected = st.session_state.active_threat != "Nominal"
        if st.session_state.active_threat == "Explosive Class 1.1":
            # Compact concentrated explosive ordnance attached near center axle bolster (X=0.2, Y=0.1)
            thermal_matrix += 38.0 * np.exp(-((X - 0.2) ** 2 + (Y - 0.1) ** 2) / 0.18)
        elif st.session_state.active_threat == "Narcotics":
            # Mild temperature delta concealed package in side plenum (X=-1.0, Y=0.8)
            thermal_matrix += 8.5 * np.exp(-((X + 1.0) ** 2 + (Y - 0.8) ** 2) / 0.35)

        # Build Plotly Heatmap
        fig_flir = go.Figure()
        fig_flir.add_trace(
            go.Heatmap(
                z=thermal_matrix,
                x=x_mesh,
                y=y_mesh,
                colorscale="Inferno",
                colorbar=dict(
                    title="Temp (°C)",
                    titlefont=dict(color="#00f3ff", size=11),
                    tickfont=dict(color="#94a3b8"),
                ),
                zmin=28,
                zmax=75,
            )
        )

        # Add AR Tactical Crosshairs & Target Overlays
        # Center reticle lines
        fig_flir.add_shape(type="line", x0=-0.6, y0=0, x1=0.6, y1=0, line=dict(color="#00f3ff", width=1.5, dash="dash"))
        fig_flir.add_shape(type="line", x0=0, y0=-0.4, x1=0, y1=0.4, line=dict(color="#00f3ff", width=1.5, dash="dash"))

        # Target Bounding Box if Threat is Active
        if st.session_state.active_threat == "Explosive Class 1.1":
            fig_flir.add_shape(
                type="rect",
                x0=-0.35,
                y0=-0.35,
                x1=0.75,
                y1=0.55,
                line=dict(color="#ff0055", width=3),
                fillcolor="rgba(255, 0, 85, 0.15)",
            )
            fig_flir.add_annotation(
                x=0.2,
                y=0.75,
                text="⚠️ THREAT LOCK: EXPLOSIVE CLASS 1.1 (RDX/TNT BOOSTER)",
                showarrow=True,
                arrowhead=2,
                arrowcolor="#ff0055",
                font=dict(color="#ffffff", size=11, family="JetBrains Mono"),
                bgcolor="#ff0055",
                bordercolor="#ffffff",
                borderwidth=1,
            )
        elif st.session_state.active_threat == "Narcotics":
            fig_flir.add_shape(
                type="rect",
                x0=-1.5,
                y0=0.4,
                x1=-0.5,
                y1=1.2,
                line=dict(color="#ffaa00", width=2.5),
                fillcolor="rgba(255, 170, 0, 0.15)",
            )
            fig_flir.add_annotation(
                x=-1.0,
                y=1.35,
                text="⚠️ CONTRABAND PLUME: SCHEDULE I NARCOTICS",
                showarrow=True,
                arrowhead=2,
                arrowcolor="#ffaa00",
                font=dict(color="#000000", size=11, family="JetBrains Mono"),
                bgcolor="#ffaa00",
                bordercolor="#ffffff",
                borderwidth=1,
            )
        else:
            fig_flir.add_annotation(
                x=0,
                y=-1.6,
                text="[ TARGET RETICLE LOCKED: BOGIE UNDERCARRIAGE NOMINAL ]",
                showarrow=False,
                font=dict(color="#00ff66", size=10, family="JetBrains Mono"),
                bgcolor="rgba(0, 255, 102, 0.1)",
                bordercolor="#00ff66",
            )

        fig_flir.update_layout(
            template="plotly_dark",
            paper_bgcolor="#050b14",
            plot_bgcolor="#050b14",
            height=460,
            margin=dict(l=10, r=10, t=20, b=10),
            xaxis=dict(
                title="Bogie Lateral Span (m)",
                gridcolor="#1e293b",
                zeroline=False,
            ),
            yaxis=dict(
                title="Vertical Standoff (m)",
                gridcolor="#1e293b",
                zeroline=False,
            ),
        )

        st.plotly_chart(fig_flir, use_container_width=True)

    with col_hud_stats:
        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag {'hud-tag-red' if threat_detected else 'hud-tag-green'}">
                    {'TARGET DETECTED' if threat_detected else 'SECTOR CLEAR'}
                </span>
                <hr style="border-color:#1e293b; margin:10px 0;">
                <b>Optics Mode:</b> LWIR 640x512 Uncooled<br>
                <b>Spectral Range:</b> 8.0 - 14.0 μm<br>
                <b>NETD Sensitivity:</b> &lt; 30 mK<br>
                <b>FOV:</b> 45° H x 37° V<br>
                <b>Frame Rate:</b> 60 Hz Synchronized
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown(
            f"""
            <div class="hud-panel">
                <span class="hud-tag hud-tag-cyan">AR TELEMETRY MATRIX</span>
                <hr style="border-color:#1e293b; margin:10px 0;">
                <b>Bogie Axle #1 Temp:</b> 52.4 °C<br>
                <b>Bogie Axle #2 Temp:</b> 54.1 °C<br>
                <b>Peak Hotspot:</b> {32.0 + st.session_state.thermal_delta + 18.0:.1f} °C<br>
                <b>Thermal Differential ΔT:</b> +{st.session_state.thermal_delta:.1f} °C<br>
                <b>Laser Rangefinder:</b> 1.84 m
            </div>
            """,
            unsafe_allow_html=True,
        )


# ==============================================================================
# TAB 3: NEUROSYMBOLIC SENSOR FUSION ENGINE
# ==============================================================================
with tab_fusion:
    st.markdown("#### MULTI-MODAL NEUROSYMBOLIC SENSOR FUSION PIPELINE")
    st.caption("Empirical fusion combining Visual CNN matching, Radiometric Thermal ΔT, and Chemical Vapor sniffer readings.")

    col_g1, col_g2, col_g3 = st.columns(3)

    # Gauge 1: Visual Match %
    with col_g1:
        fig_g1 = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=st.session_state.visual_match,
                title={"text": "Visual CNN Match %", "font": {"color": "#00f3ff", "size": 14}},
                gauge={
                    "axis": {"range": [0, 100], "tickcolor": "#94a3b8"},
                    "bar": {"color": "#00f3ff"},
                    "steps": [
                        {"range": [0, 40], "color": "#062238"},
                        {"range": [40, 75], "color": "#123c52"},
                        {"range": [75, 100], "color": "#ff0055"},
                    ],
                    "threshold": {
                        "line": {"color": "#ff0055", "width": 3},
                        "thickness": 0.75,
                        "value": 75,
                    },
                },
            )
        )
        fig_g1.update_layout(
            template="plotly_dark",
            paper_bgcolor="#050b14",
            height=240,
            margin=dict(l=20, r=20, t=30, b=20),
        )
        st.plotly_chart(fig_g1, use_container_width=True)

    # Gauge 2: Thermal Delta T
    with col_g2:
        fig_g2 = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=st.session_state.thermal_delta,
                number={"suffix": " °C"},
                title={"text": "Thermal ΔT Above Ambient", "font": {"color": "#ffaa00", "size": 14}},
                gauge={
                    "axis": {"range": [0, 30], "tickcolor": "#94a3b8"},
                    "bar": {"color": "#ffaa00"},
                    "steps": [
                        {"range": [0, 6], "color": "#291e0a"},
                        {"range": [6, 15], "color": "#4a3512"},
                        {"range": [15, 30], "color": "#ff0055"},
                    ],
                    "threshold": {
                        "line": {"color": "#ff0055", "width": 3},
                        "thickness": 0.75,
                        "value": 15,
                    },
                },
            )
        )
        fig_g2.update_layout(
            template="plotly_dark",
            paper_bgcolor="#050b14",
            height=240,
            margin=dict(l=20, r=20, t=30, b=20),
        )
        st.plotly_chart(fig_g2, use_container_width=True)

    # Gauge 3: Chemical Vapor Sniffer (PPM)
    with col_g3:
        fig_g3 = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=st.session_state.chem_ppm,
                number={"suffix": " PPM"},
                title={"text": "Vapor Sniffer (Nitro / VOC)", "font": {"color": "#00ff66", "size": 14}},
                gauge={
                    "axis": {"range": [0, 150], "tickcolor": "#94a3b8"},
                    "bar": {"color": "#00ff66"},
                    "steps": [
                        {"range": [0, 20], "color": "#0a2618"},
                        {"range": [20, 60], "color": "#164d32"},
                        {"range": [60, 150], "color": "#ff0055"},
                    ],
                    "threshold": {
                        "line": {"color": "#ff0055", "width": 3},
                        "thickness": 0.75,
                        "value": 60,
                    },
                },
            )
        )
        fig_g3.update_layout(
            template="plotly_dark",
            paper_bgcolor="#050b14",
            height=240,
            margin=dict(l=20, r=20, t=30, b=20),
        )
        st.plotly_chart(fig_g3, use_container_width=True)

    # Mathematical Master Threat Index Display
    st.markdown("---")
    col_score_box, col_formula = st.columns([1, 2])

    with col_score_box:
        if current_threat_index > 65:
            box_border = "#ff0055"
            badge_text = "CRITICAL: EXPLOSIVE CLASS 1.1 THREAT"
            badge_bg = "rgba(255, 0, 85, 0.2)"
        elif current_threat_index > 30:
            box_border = "#ffaa00"
            badge_text = "ELEVATED: CONTRABAND / NARCOTICS DETECTED"
            badge_bg = "rgba(255, 170, 0, 0.2)"
        else:
            box_border = "#00ff66"
            badge_text = "NOMINAL: NO SABOTAGE HAZARD DETECTED"
            badge_bg = "rgba(0, 255, 102, 0.15)"

        st.markdown(
            f"""
            <div style="border: 2px solid {box_border}; background: #091220; padding: 20px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.8rem; letter-spacing: 0.1em; color: #94a3b8; text-transform: uppercase;">
                    MASTER THREAT INDEX (MTI)
                </div>
                <div style="font-size: 3.2rem; font-weight: 800; color: {box_border}; font-family: 'JetBrains Mono', monospace;">
                    {current_threat_index:.1f} <span style="font-size: 1.2rem; color: #64748b;">/ 100</span>
                </div>
                <div style="background: {badge_bg}; color: {box_border}; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 0.85rem; margin-top: 10px;">
                    {badge_text}
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_formula:
        st.markdown("##### 📐 NEUROSYMBOLIC ARBITRATION MATRIX")
        st.latex(
            r"\text{MTI} = \min\left(100, \; 100 \cdot \left[ 0.25 \frac{V}{100} + 0.35 \frac{\Delta T}{30} + 0.40 \frac{C_{\text{ppm}}}{150} \right] + \mathbb{I}_{\text{synergy}} \cdot 18.0 \left(\frac{\Delta T}{30} \cdot \frac{C_{\text{ppm}}}{150}\right)\right)"
        )
        st.markdown(
            f"""
            <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.5; margin-top: 8px;">
                <b>Active Term Breakdown:</b><br>
                • Visual CNN Component: {0.25 * (st.session_state.visual_match / 100.0) * 100.0:.2f} pts<br>
                • Radiometric Thermal Component: {0.35 * (st.session_state.thermal_delta / 30.0) * 100.0:.2f} pts<br>
                • Electrochemical Sniffer Component: {0.40 * (st.session_state.chem_ppm / 150.0) * 100.0:.2f} pts<br>
                • Cross-Coupling Synergistic Penalty: {'ENGAGED (+18% Joint Multiplier)' if st.session_state.thermal_delta > 8.0 and st.session_state.chem_ppm > 25.0 else 'INACTIVE (Uncorrelated Channels)'}
            </div>
            """,
            unsafe_allow_html=True,
        )


# ==============================================================================
# TAB 4: CRYPTOGRAPHIC AUDIT VAULT & FORENSIC MATRIX
# ==============================================================================
with tab_vault:
    st.markdown("#### FORENSIC COMPARISON MATRIX & IMMUTABLE SHA-256 EVENT AUDIT LOG")
    st.caption("Cryptographically verifiable security inspection chain compliant with Indian Railways Section 60 Evidence Standards.")

    # Forensic Matrix Table
    st.markdown("##### 🔬 THREAT CLASSIFICATION FORENSIC CRITERIA")
    forensic_data = {
        "Threat Parameter": [
            "Molecular Weight (g/mol)",
            "Typical Vapor Pressure (25°C)",
            "Thermal Signature Profile",
            "Spectrometric Target Marker",
            "Safe Standoff Distance",
            "Indian Railways Action Protocol",
        ],
        "Explosives (Class 1.1: RDX / PETN / TNT)": [
            "222.12 (RDX) / 316.14 (PETN)",
            "4.0 × 10⁻⁹ mmHg (Ultra-Low)",
            "High Exothermic Anomaly (ΔT > 15°C)",
            "NO₂ / Nitramine stretching modes",
            "Minimum 150 meters cordon",
            "Immediate E-Stop, Bomb Disposal Squad (BDDS) Dispatch",
        ],
        "Narcotics (Schedule I: Opioids / Synthetic)": [
            "285.34 (Morphine) / 336.43 (Heroin)",
            "1.2 × 10⁻⁶ mmHg (Trace Volatile)",
            "Negligible Exotherm (ΔT < 4°C)",
            "Alkaloid amine / Acetyl ion peaks",
            "Tactical physical containment (5 meters)",
            "RPF Seizure Protocol, NCB Chain of Custody",
        ],
    }
    df_forensic = pd.DataFrame(forensic_data)
    st.dataframe(df_forensic, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.markdown("##### 🛡️ CRYPTOGRAPHIC TELEMETRY AUDIT VAULT (SHA-256 CHAIN)")

    df_logs = pd.DataFrame(st.session_state.audit_logs)
    st.dataframe(
        df_logs,
        use_container_width=True,
        hide_index=True,
        column_config={
            "SHA-256 Hash": st.column_config.TextColumn(
                "SHA-256 Audit Verification Hash",
                help="Cryptographic checksum computed over timestamp, chainage, threat classification, and MTI.",
                width="large",
            ),
            "Threat Index": st.column_config.ProgressColumn(
                "Master Threat Index",
                format="%.1f",
                min_value=0,
                max_value=100,
            ),
        },
    )

    # Download CSV Export
    csv_bytes = df_logs.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 DOWNLOAD AUDIT VAULT EVENT LOG (CSV)",
        data=csv_bytes,
        file_name=f"VANGUARD_AUDIT_LOG_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv",
        use_container_width=False,
    )

# End of script
