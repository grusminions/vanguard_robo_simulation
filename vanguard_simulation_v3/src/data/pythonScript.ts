// Complete raw content of app.py for ground command station deployment
export const APP_PY_CONTENT = `"""
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
    st.session_state.patrol_mode = "Trot"
    st.session_state.battery = 89.4
    st.session_state.pitch_angle = 1.8
    st.session_state.roll_angle = -0.5
    st.session_state.chassis_clearance = 28.0
    st.session_state.ballast_dispersion = 0.35
    st.session_state.active_threat = "Nominal"
    st.session_state.step_counter = 42
    st.session_state.track_chainage = 118.420
    st.session_state.e_stop_active = False

    st.session_state.visual_match = 14.2
    st.session_state.thermal_delta = 1.8
    st.session_state.chem_ppm = 2.4

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
    """
    v_norm = np.clip(visual_match / 100.0, 0.0, 1.0)
    t_norm = np.clip(thermal_delta / 30.0, 0.0, 1.0)
    c_norm = np.clip(chem_ppm / 150.0, 0.0, 1.0)

    base_score = (0.25 * v_norm + 0.35 * t_norm + 0.40 * c_norm) * 100.0

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
    st.session_state.track_chainage = round(st.session_state.track_chainage + 0.015, 3)
    st.session_state.battery = max(5.0, round(st.session_state.battery - np.random.uniform(0.1, 0.3), 1))

    if st.session_state.patrol_mode == "Trot":
        st.session_state.pitch_angle = round(st.session_state.pitch_angle + np.random.uniform(-1.2, 1.2), 1)
        st.session_state.roll_angle = round(np.random.uniform(-2.5, 2.5), 1)
    else:
        st.session_state.pitch_angle = round(st.session_state.pitch_angle + np.random.uniform(-0.4, 0.4), 1)
        st.session_state.roll_angle = round(np.random.uniform(-0.8, 0.8), 1)

    if st.session_state.active_threat == "Explosive Class 1.1":
        st.session_state.visual_match = round(min(98.5, 82.0 + np.random.uniform(-4.0, 8.0)), 1)
        st.session_state.thermal_delta = round(min(28.0, 18.5 + np.random.uniform(-2.0, 4.5)), 1)
        st.session_state.chem_ppm = round(min(145.0, 92.0 + np.random.uniform(-8.0, 14.0)), 1)
    elif st.session_state.active_threat == "Narcotics":
        st.session_state.visual_match = round(min(85.0, 58.0 + np.random.uniform(-5.0, 6.0)), 1)
        st.session_state.thermal_delta = round(min(12.0, 3.2 + np.random.uniform(-0.5, 1.2)), 1)
        st.session_state.chem_ppm = round(min(90.0, 64.0 + np.random.uniform(-5.0, 10.0)), 1)
    else:
        st.session_state.visual_match = round(max(2.0, 12.0 + np.random.uniform(-4.0, 5.0)), 1)
        st.session_state.thermal_delta = round(max(0.5, 1.9 + np.random.uniform(-0.6, 0.8)), 1)
        st.session_state.chem_ppm = round(max(0.2, 2.1 + np.random.uniform(-0.7, 0.9)), 1)

    mti = compute_master_threat_index(
        st.session_state.visual_match,
        st.session_state.thermal_delta,
        st.session_state.chem_ppm,
    )

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
    )

    st.session_state.chassis_clearance = st.slider(
        "Chassis Clearance (cm)",
        min_value=10.0,
        max_value=45.0,
        value=float(st.session_state.chassis_clearance),
        step=1.0,
    )

    st.session_state.ballast_dispersion = st.slider(
        "Ballast Dispersion Coeff",
        min_value=0.0,
        max_value=1.0,
        value=float(st.session_state.ballast_dispersion),
        step=0.05,
    )

    st.markdown("---")
    st.markdown("#### 🚨 MISSION INJECTION PRESETS")

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


# TAB 1: 3D KINEMATICS DIGITAL TWIN
with tab_kinematics:
    st.markdown("#### REAL-TIME 3D QUADRUPED DIGITAL TWIN ON UIC-60 RAIL INFRASTRUCTURE")
    pitch_rad = math.radians(st.session_state.pitch_angle)
    clearance_m = st.session_state.chassis_clearance / 100.0

    body_length, body_width, body_height = 0.90, 0.45, 0.22
    cx, cy, cz = 0.0, 0.0, clearance_m + (body_height / 2.0)
    dx, dy, dz = body_length / 2.0, body_width / 2.0, body_height / 2.0

    raw_box = np.array([
        [-dx, -dy, -dz], [dx, -dy, -dz], [dx, dy, -dz], [-dx, dy, -dz],
        [-dx, -dy, dz], [dx, -dy, dz], [dx, dy, dz], [-dx, dy, dz],
    ])
    rot_y = np.array([
        [math.cos(pitch_rad), 0, math.sin(pitch_rad)],
        [0, 1, 0],
        [-math.sin(pitch_rad), 0, math.cos(pitch_rad)],
    ])
    chassis_vertices = np.dot(raw_box, rot_y.T) + np.array([cx, cy, cz])

    box_lines_x, box_lines_y, box_lines_z = [], [], []
    edges = [
        (0, 1), (1, 2), (2, 3), (3, 0),
        (4, 5), (5, 6), (6, 7), (7, 4),
        (0, 4), (1, 5), (2, 6), (3, 7),
    ]
    for e1, e2 in edges:
        box_lines_x.extend([chassis_vertices[e1, 0], chassis_vertices[e2, 0], None])
        box_lines_y.extend([chassis_vertices[e1, 1], chassis_vertices[e2, 1], None])
        box_lines_z.extend([chassis_vertices[e1, 2], chassis_vertices[e2, 2], None])

    rail_gauge_half = 1.676 / 2.0
    hip_offsets = {
        "FL": (dx * 0.85, dy, 0.0),
        "FR": (dx * 0.85, -dy, 0.0),
        "RL": (-dx * 0.85, dy, 0.0),
        "RR": (-dx * 0.85, -dy, 0.0),
    }
    foot_targets = {
        "FL": (dx * 1.05, rail_gauge_half * 0.65, 0.0),
        "FR": (dx * 1.05, -rail_gauge_half * 0.65, 0.0),
        "RL": (-dx * 1.05, rail_gauge_half * 0.65, 0.0),
        "RR": (-dx * 1.05, -rail_gauge_half * 0.65, 0.0),
    }

    leg_x, leg_y, leg_z = [], [], []
    for leg_id, hip_off in hip_offsets.items():
        rotated_hip = np.dot(np.array(hip_off), rot_y.T) + np.array([cx, cy, cz])
        foot_pos = np.array(foot_targets[leg_id])
        mid_knee = (rotated_hip + foot_pos) / 2.0
        mid_knee[1] += 0.12 if hip_off[1] > 0 else -0.12
        mid_knee[2] += 0.08
        leg_x.extend([rotated_hip[0], mid_knee[0], foot_pos[0], None])
        leg_y.extend([rotated_hip[1], mid_knee[1], foot_pos[1], None])
        leg_z.extend([rotated_hip[2], mid_knee[2], foot_pos[2], None])

    fig_3d = go.Figure()
    fig_3d.add_trace(go.Scatter3d(x=[-2.2, 2.2], y=[rail_gauge_half, rail_gauge_half], z=[0, 0], mode="lines", line=dict(color="#00f3ff", width=6), name="Left Rail UIC-60"))
    fig_3d.add_trace(go.Scatter3d(x=[-2.2, 2.2], y=[-rail_gauge_half, -rail_gauge_half], z=[0, 0], mode="lines", line=dict(color="#00f3ff", width=6), name="Right Rail UIC-60"))
    fig_3d.add_trace(go.Scatter3d(x=box_lines_x, y=box_lines_y, z=box_lines_z, mode="lines", line=dict(color="#00ff66", width=5), name="VANGUARD Chassis"))
    fig_3d.add_trace(go.Scatter3d(x=leg_x, y=leg_y, z=leg_z, mode="lines", line=dict(color="#38bdf8", width=5), name="Articulated Legs"))
    fig_3d.update_layout(template="plotly_dark", paper_bgcolor="#050b14", plot_bgcolor="#050b14", height=500, margin=dict(l=0, r=0, t=10, b=0))
    st.plotly_chart(fig_3d, use_container_width=True)

# TAB 2: AR VIEWPORT
with tab_ar_hud:
    st.markdown("#### AUGMENTED REALITY (AR) TARGET HUD & RADIOMETRIC FLIR")
    ny, nx = 40, 80
    X, Y = np.meshgrid(np.linspace(-4, 4, nx), np.linspace(-2, 2, ny))
    thermal_matrix = 32.0 + 20.0 * np.exp(-((X + 2.2)**2 + Y**2)/0.5) + 20.0 * np.exp(-((X - 2.2)**2 + Y**2)/0.5)
    if st.session_state.active_threat == "Explosive Class 1.1":
        thermal_matrix += 38.0 * np.exp(-((X - 0.2)**2 + (Y - 0.1)**2)/0.18)
    fig_flir = go.Figure(go.Heatmap(z=thermal_matrix, colorscale="Inferno"))
    fig_flir.update_layout(template="plotly_dark", paper_bgcolor="#050b14", height=420)
    st.plotly_chart(fig_flir, use_container_width=True)

# TAB 3: NEUROSYMBOLIC SENSOR FUSION
with tab_fusion:
    st.markdown("#### MULTI-MODAL NEUROSYMBOLIC SENSOR FUSION PIPELINE")
    col1, col2, col3 = st.columns(3)
    col1.metric("Visual Match %", f"{st.session_state.visual_match:.1f}%")
    col2.metric("Thermal ΔT", f"+{st.session_state.thermal_delta:.1f} °C")
    col3.metric("Chemical Sniffer", f"{st.session_state.chem_ppm:.1f} PPM")
    st.subheader(f"Master Threat Index (MTI): {current_threat_index:.1f} / 100")

# TAB 4: CRYPTOGRAPHIC AUDIT VAULT
with tab_vault:
    st.markdown("#### FORENSIC COMPARISON MATRIX & IMMUTABLE SHA-256 EVENT AUDIT LOG")
    df_logs = pd.DataFrame(st.session_state.audit_logs)
    st.dataframe(df_logs, use_container_width=True)
    st.download_button(
        label="📥 DOWNLOAD AUDIT VAULT EVENT LOG (CSV)",
        data=df_logs.to_csv(index=False).encode("utf-8"),
        file_name="VANGUARD_AUDIT_LOG.csv",
        mime="text/csv",
    )
`;
