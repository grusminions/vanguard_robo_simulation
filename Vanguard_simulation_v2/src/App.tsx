import React, { useState, useMemo } from 'react';
import { TelemetryState } from './types';
import { calculateThreatIndex, computeKinematics } from './utils/kinematics';
import { Kinematics3DCanvas } from './components/Kinematics3DCanvas';
import { ThreatGauge } from './components/ThreatGauge';
import { SlamCostmapCanvas } from './components/SlamCostmapCanvas';
import { AuditVault } from './components/AuditVault';
import { ArchitectureBomDefense } from './components/ArchitectureBomDefense';
import { VirtualSimulation } from './components/VirtualSimulation';
import { SidebarHilBus } from './components/SidebarHilBus';
import { PythonCodeModal } from './components/PythonCodeModal';
import { PYTHON_APP_SCRIPT } from './data/pythonScript';
import {
  ShieldAlert,
  SlidersHorizontal,
  Code2,
  OctagonAlert,
  Layers,
  Activity,
  Box,
  Brain,
  MapPin,
  Lock,
  FileSpreadsheet,
  Gamepad2,
} from 'lucide-react';

export default function App() {
  // Primary Telemetry State (HIL Bus)
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    regime: 'Crawl Mode (Hazard Ballast Stance)',
    ballastRoughness: 0.45,
    pitchDeg: 4.5,
    rollDeg: -3.2,
    zOffset: 0.0,
    visualConf: 0.12,
    thermalC: 32.5,
    chemicalPpm: 14.0,
    estopEngaged: false,
  });

  const [activeTab, setActiveTab] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [pythonModalOpen, setPythonModalOpen] = useState<boolean>(false);

  // Real-time analytical kinematics calculations
  const kinematics = useMemo(() => computeKinematics(telemetry), [telemetry]);

  // Real-time threat fusion calculations
  const threatData = useMemo(
    () => calculateThreatIndex(telemetry.visualConf, telemetry.thermalC, telemetry.chemicalPpm),
    [telemetry.visualConf, telemetry.thermalC, telemetry.chemicalPpm]
  );

  const toggleEstop = () => {
    setTelemetry((prev) => ({ ...prev, estopEngaged: !prev.estopEngaged }));
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Enterprise Command Header */}
      <header className="border-b border-slate-800 bg-[#0d1422] sticky top-0 z-30 shadow-lg">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors lg:hidden"
              title="Toggle Telemetry Sidebar"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-bold text-slate-950 shadow-md shadow-cyan-500/20">
              V
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-100 tracking-tight">
                  PROJECT VANGUARD
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  SIH-26026
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 hidden sm:block">
                Stage 1 High-Fidelity Digital Twin &amp; Operations Ground Station
              </div>
            </div>
          </div>

          {/* Center: System Layer Active Badges (SL-0 to SL-5) */}
          <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10px]">
            <div className={`px-2 py-1 rounded border flex items-center gap-1 ${
              telemetry.estopEngaged ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' : 'bg-[#121926] border-slate-800 text-slate-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${telemetry.estopEngaged ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <span>SL-0: POWER &amp; E-STOP</span>
            </div>
            <div className="px-2 py-1 rounded border bg-[#121926] border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SL-1: 12-DOF ACTUATION</span>
            </div>
            <div className="px-2 py-1 rounded border bg-[#121926] border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SL-2: TEENSY 4.1 RT (1kHz)</span>
            </div>
            <div className="px-2 py-1 rounded border bg-[#121926] border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SL-3: HAILO-8 26 TOPS</span>
            </div>
            <div className="px-2 py-1 rounded border bg-[#121926] border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SL-4: ROS 2 LIO-SAM</span>
            </div>
            <div className="px-2 py-1 rounded border bg-[#121926] border-slate-800 text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SL-5: FORENSIC VAULT</span>
            </div>
          </div>

          {/* Right: Actions & E-Stop */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPythonModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors"
              title="View & Download Streamlit Python Script (app.py)"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Streamlit Source (app.py)</span>
            </button>

            {/* Emergency E-Stop Button */}
            <button
              onClick={toggleEstop}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold transition-all shadow-md ${
                telemetry.estopEngaged
                  ? 'bg-rose-600 hover:bg-rose-500 text-white critical-pulse'
                  : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40'
              }`}
            >
              <OctagonAlert className="w-4 h-4" />
              <span>{telemetry.estopEngaged ? 'E-STOP ENGAGED' : 'E-STOP (SL-0)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto overflow-hidden">
        {/* Left Sidebar: Dynamic Telemetry Injection Bus (HIL Simulator) */}
        <aside
          className={`w-80 shrink-0 bg-[#0b111e] border-r border-slate-800 p-4 overflow-y-auto max-h-[calc(100vh-57px)] transition-all duration-200 ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <SidebarHilBus
            state={telemetry}
            onChange={setTelemetry}
            detectedClass={threatData.detectedClass}
            classColor={threatData.classColor}
          />
        </aside>

        {/* Main Operational Workspace */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-57px)] space-y-5">
          {/* E-Stop Banner if engaged */}
          {telemetry.estopEngaged && (
            <div className="p-3.5 rounded-lg bg-rose-950/70 border border-rose-500/80 critical-pulse flex items-center justify-between text-rose-200 font-mono text-xs">
              <div className="flex items-center gap-2">
                <OctagonAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                <span className="font-bold">SL-0 HARDWARE EMERGENCY E-STOP ENGAGED:</span>
                <span>Motor power rails severed. 12-DOF actuators held in passive damping stance.</span>
              </div>
              <button
                onClick={toggleEstop}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-colors"
              >
                DISENGAGE E-STOP
              </button>
            </div>
          )}

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0d1422] rounded-lg border border-slate-800 font-mono text-xs">
            {[
              { id: 0, label: '1. 3D Digital Twin Kinematics', icon: Box },
              { id: 1, label: '2. Neurosymbolic Threat Fusion', icon: Brain },
              { id: 2, label: '3. GPS-Denied SLAM & Costmap', icon: MapPin },
              { id: 3, label: '4. Cryptographic Audit Vault', icon: Lock },
              { id: 4, label: '5. BOM & SIH Defense Matrix', icon: FileSpreadsheet },
              { id: 5, label: '🎮 Virtual-Simulation', icon: Gamepad2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: 3D Digital Twin Kinematics */}
          {activeTab === 0 && (
            <div className="space-y-5">
              {/* Live Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-[#121926] rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">ACTIVE BALANCE CONVERGENCE</div>
                  <div className="text-xl font-bold text-cyan-400 mt-0.5">
                    {kinematics.balanceConvergence.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Closed-Loop Stable</div>
                </div>

                <div className="p-3 bg-[#121926] rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">GROUND SLIP MARGIN</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">
                    {(kinematics.meanSlipMargin * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">μ: {telemetry.ballastRoughness.toFixed(2)} Granite</div>
                </div>

                <div className="p-3 bg-[#121926] rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">KINEMATICS LOOP FREQ</div>
                  <div className="text-xl font-bold text-slate-200 mt-0.5">1,000 Hz</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Teensy 4.1 600MHz RT</div>
                </div>

                <div className="p-3 bg-[#121926] rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">ARTICULATED LEG SEGMENTS</div>
                  <div className="text-xl font-bold text-slate-200 mt-0.5">12 Actuators</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3-DOF per Leg (FL, FR, RL, RR)</div>
                </div>
              </div>

              {/* 3D Kinematics Canvas */}
              <Kinematics3DCanvas
                kinematics={kinematics}
                ballastRoughness={telemetry.ballastRoughness}
              />

              {/* Analytical Joint Angle Matrix Table */}
              <div className="p-4 bg-[#121926] rounded-lg border border-slate-800 shadow-xl space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-cyan-400">
                    ANALYTICAL INVERSE KINEMATICS JOINT MATRIX (TEENSY 4.1 CAN-FD BUS)
                  </span>
                  <span className="text-[11px] text-slate-400">Law of Cosines Closed-Form IK</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="p-2">Leg ID</th>
                        <th className="p-2">Hip Yaw θ₁ (°)</th>
                        <th className="p-2">Hip Pitch θ₂ (°)</th>
                        <th className="p-2">Knee Pitch θ₃ (°)</th>
                        <th className="p-2">Dynamic Load</th>
                        <th className="p-2">Slip Hazard Coeff</th>
                        <th className="p-2">Reflex Target Z</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {(['FL', 'FR', 'RL', 'RR'] as const).map((lid) => {
                        const leg = kinematics.legs[lid];
                        return (
                          <tr key={lid} className="hover:bg-slate-800/20">
                            <td className="p-2 font-bold text-cyan-400">{leg.name}</td>
                            <td className="p-2">{leg.jointAngles.hipYaw.toFixed(1)}°</td>
                            <td className="p-2">{leg.jointAngles.hipPitch.toFixed(1)}°</td>
                            <td className="p-2">{leg.jointAngles.kneePitch.toFixed(1)}°</td>
                            <td className="p-2">{leg.load.toFixed(2)}x</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  leg.slipProb > 0.65
                                    ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                    : leg.slipProb > 0.40
                                    ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {leg.slipProb.toFixed(3)}
                              </span>
                            </td>
                            <td className="p-2 text-slate-400">{leg.foot[2] > 0 ? `+${leg.foot[2].toFixed(3)}` : leg.foot[2].toFixed(3)}m</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Neurosymbolic Threat Fusion */}
          {activeTab === 1 && (
            <ThreatGauge
              threatData={threatData}
              visualConf={telemetry.visualConf}
              thermalC={telemetry.thermalC}
              chemicalPpm={telemetry.chemicalPpm}
            />
          )}

          {/* Tab 3: GPS-Denied SLAM & Costmap */}
          {activeTab === 2 && (
            <SlamCostmapCanvas threatScore={threatData.score} />
          )}

          {/* Tab 4: Cryptographic Audit Vault */}
          {activeTab === 3 && (
            <AuditVault
              telemetry={telemetry}
              threatData={threatData}
            />
          )}

          {/* Tab 5: BOM & SIH Defense Matrix */}
          {activeTab === 4 && (
            <ArchitectureBomDefense />
          )}

          {/* Tab 6: 🎮 Virtual-Simulation */}
          {activeTab === 5 && (
            <VirtualSimulation />
          )}
        </main>
      </div>

      {/* Python Code Viewer & Download Modal */}
      <PythonCodeModal
        isOpen={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
        pythonCode={PYTHON_APP_SCRIPT}
      />
    </div>
  );
}
