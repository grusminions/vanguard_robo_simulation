import React, { useState } from 'react';
import { Cpu, HelpCircle, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';

export const ArchitectureBomDefense: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const bomItems = [
    { category: 'Perception', component: 'Hailo-8 M.2 AI Acceleration Module (26 TOPS)', qty: 1, costInr: 22500, detail: 'YOLOv8x 45 FPS @ 2.5W low-power edge tensor acceleration' },
    { category: 'Perception', component: 'FLIR Lepton 3.5 Radiometric Thermal Core', qty: 1, costInr: 24000, detail: '160x120 radiometric thermal LWIR sensor with absolute temperature calibrated' },
    { category: 'Perception', component: 'Solid-State LiDAR (Livox Mid-360 / SLAMtec)', qty: 1, costInr: 38000, detail: '360° FOV, 40m range, non-repetitive scanning for GPS-denied Cartographer' },
    { category: 'Compute', component: 'Teensy 4.1 600MHz ARM Cortex-M7 (Real-Time IK)', qty: 1, costInr: 4200, detail: 'Dedicated micro-ROS 1000 Hz closed-loop kinematics & reflex impedance loop' },
    { category: 'Compute', component: 'Raspberry Pi 5 (8GB) / Compute Module 4 Host', qty: 1, costInr: 7800, detail: 'High-level ROS 2 Nav2 orchestrator and cryptographic vault manager' },
    { category: 'Actuation', component: 'Custom Brushless Planetary Servos (12 Nm torque)', qty: 12, costInr: 64800, detail: '12-DOF high-G dynamic response with integrated 14-bit absolute magnetic encoders' },
    { category: 'Chassis', component: 'Carbon Fiber Body Plates & CNC Titanium Links', qty: 1, costInr: 16500, detail: 'Torsional rigidity exceeding 320 Nm/rad, weight under 6.8 kg bare chassis' },
    { category: 'Power', component: '6S 22.2V LiFePO4 Battery with Dual Buck Converters', qty: 1, costInr: 11200, detail: 'Isolated logic (5V) & motor (8.4V-24V) rails with redundant emergency E-Stop relay' },
    { category: 'Perception', component: 'Forced-Air Semiconductor Vapor Detector', qty: 1, costInr: 5500, detail: 'Micro-suction ducting for volatile nitrate/peroxide oxidizer chemical precursor sampling' },
  ];

  const filteredItems = activeCategory === 'ALL'
    ? bomItems
    : bomItems.filter((item) => item.category === activeCategory);

  const totalCost = bomItems.reduce((acc, item) => acc + item.costInr, 0);

  const juryQuestions = [
    {
      q: 'Q1: How does VANGUARD prevent slipping on loose, shifting railway ballast (Granite 40-65mm)?',
      answer: `
        1. High-Compliance Soft Footpads: Custom hemispherical molded silicone footpads (Shore 50A) with internal micro-cleat geometry that mechanically key into the angular facets of 40-65mm crushed granite ballast.
        2. Reflex Impedance Control: The Teensy 4.1 micro-controller executes virtual spring-damper compliance at 1,000 Hz. If normal ground contact force deviates by >15% during foot touchdown, the stance leg instantaneously yields rather than skidding, maintaining dynamic three-point polygon stability without slipping.
      `,
    },
    {
      q: 'Q2: How does the system survive extreme 45°C - 50°C Indian summer ambient temperatures without thermal throttling?',
      answer: `
        1. Hailo-8 Low-Power Architecture: The Hailo-8 M.2 module consumes only 2.5W running 26 TOPS of INT8 inference (compared to Nvidia Jetson Orin's 15-25W TDP), producing drastically lower waste heat.
        2. Conductive Aluminum Skeleton: The CNC aluminum structural chassis serves as a distributed passive heatsink, supplemented by twin micro-turbofans ducted strictly outwards, isolating sensitive thermal camera optics from internal convection currents.
      `,
    },
    {
      q: 'Q3: How do you reject false alarms caused by hot train wheel bearings and friction brake discs?',
      answer: `
        1. Neurosymbolic Dual-Filter Arbitration: As demonstrated in Tab 2, a hot thermal signature alone NEVER triggers an ordnance lockdown.
        2. Volatile Precursor Corroboration: A train brake disc generates friction heat (>90°C) but produces zero explosive chemical vapor and lacks the rectangular casing geometry of an IED. The system requires simultaneous visual affirmative, thermal signature, AND chemical precursor trace before initiating critical lockdown.
      `,
    },
    {
      q: 'Q4: What occurs if the RF communication link is severed deep inside GPS-denied tunnels or under heavy train bogies?',
      answer: `
        1. Autonomous Fail-Safe Search Pattern: When RF link loss is detected by the ROS 2 Cartographer/LIO-SAM stack, the quadruped autonomously transitions from teleoperation to a pre-computed topological search route.
        2. Non-Volatile Evidentiary Queue: All telemetry snapshots and LiDAR point clouds are hashed via SHA-256 and queued in onboard non-volatile NVMe storage. Upon exiting the tunnel or establishing line-of-sight mesh connection, the synchronized packets transmit to the ground station with certified chain-of-custody.
      `,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6 System Layers Architecture Map */}
      <div className="p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-cyan-400">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>VANGUARD 6-LAYER EMBEDDED SYSTEM ARCHITECTURE (SL-0 TO SL-5)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">SIH-26026 Defense Stack</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-0: POWER &amp; SAFETY</div>
            <div className="font-semibold text-slate-200">Isolated Dual-Rail</div>
            <div className="text-[11px] text-slate-400 mt-1">Opto-isolated E-Stop, 5V logic &amp; 8.4V motor bus</div>
          </div>
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-1: ACTUATION</div>
            <div className="font-semibold text-slate-200">12-DOF High-G</div>
            <div className="text-[11px] text-slate-400 mt-1">Brushless planetary servos with CAN-FD bus</div>
          </div>
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-2: REAL-TIME RT</div>
            <div className="font-semibold text-slate-200">Teensy 4.1 600MHz</div>
            <div className="text-[11px] text-slate-400 mt-1">1000 Hz analytical IK &amp; reflex stabilization</div>
          </div>
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-3: EDGE NEURAL</div>
            <div className="font-semibold text-slate-200">Hailo-8 26 TOPS</div>
            <div className="text-[11px] text-slate-400 mt-1">YOLOv8x inference + FLIR Lepton 3.5 thermal</div>
          </div>
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-4: AUTONOMY</div>
            <div className="font-semibold text-slate-200">ROS 2 LIO-SAM</div>
            <div className="text-[11px] text-slate-400 mt-1">GPS-denied Cartographer, 3D LiDAR SLAM, Nav2</div>
          </div>
          <div className="p-3 bg-[#0d1422] rounded border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="text-[10px] text-cyan-400 font-bold mb-1">SL-5: FORENSICS</div>
            <div className="font-semibold text-slate-200">SHA-256 Vault</div>
            <div className="text-[11px] text-slate-400 mt-1">Sec. 65B compliance, RPF forensic evidentiary log</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bill of Materials (BOM) */}
        <div className="lg:col-span-7 p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="font-mono text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>ENTERPRISE BILL OF MATERIALS (BOM)</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Cost-optimized procurement for Indian Railways</div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1 font-mono text-[11px]">
              {['ALL', 'Compute', 'Perception', 'Actuation', 'Chassis', 'Power'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded transition-colors ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="p-2">Category</th>
                  <th className="p-2">Component Name</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold text-slate-200">{item.component}</div>
                      <div className="text-[10px] text-slate-500">{item.detail}</div>
                    </td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2 text-right text-cyan-400 font-bold">
                      ₹{item.costInr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center font-mono">
            <span className="text-xs text-slate-400">TOTAL ESTIMATED PROTOTYPE BOM:</span>
            <span className="text-base text-cyan-300 font-bold">
              ₹{totalCost.toLocaleString('en-IN')}{' '}
              <span className="text-xs text-slate-400 font-normal">(~$2,350 USD)</span>
            </span>
          </div>
        </div>

        {/* SIH Grand Finale Jury Defense Matrix */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="font-mono text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>SIH GRAND FINALE JURY DEFENSE MATRIX</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Engineered answers for high-difficulty technical questioning
            </div>
          </div>

          <div className="space-y-3 font-mono">
            {juryQuestions.map((q, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-md border border-slate-800 bg-[#0d1422] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-3 flex justify-between items-start gap-2 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-200 leading-snug">{q.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-3 pt-0 text-xs text-slate-300 border-t border-slate-800/80 bg-[#080c14]/60 leading-relaxed whitespace-pre-line">
                      <div className="flex items-start gap-2 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>{q.answer.trim()}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
