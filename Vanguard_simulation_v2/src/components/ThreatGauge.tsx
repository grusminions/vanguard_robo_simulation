import React from 'react';
import { ThreatIndexResult } from '../types';
import { ShieldCheck, AlertTriangle, Flame, ShieldAlert, Cpu, Activity } from 'lucide-react';

interface Props {
  threatData: ThreatIndexResult;
  visualConf: number;
  thermalC: number;
  chemicalPpm: number;
}

export const ThreatGauge: React.FC<Props> = ({ threatData, visualConf, thermalC, chemicalPpm }) => {
  const { score, normThermal, normChemical, tier, detectedClass, classColor } = threatData;

  // Semicircular gauge angle: 180 degrees arc (from -180 deg to 0 deg or 0 to 180)
  // Value 0.0 -> -90 deg, Value 1.0 -> +90 deg
  const needleAngle = -90 + score * 180;

  return (
    <div className="space-y-6">
      {/* Top Banner: Dynamic Escalation Status */}
      <div
        className={`p-4 rounded-lg border font-mono transition-all duration-300 ${
          tier === 'SAFE'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : tier === 'ELEVATED'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-300 critical-pulse'
        }`}
      >
        <div className="flex items-center gap-3">
          {tier === 'SAFE' && <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />}
          {tier === 'ELEVATED' && <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />}
          {tier === 'CRITICAL' && <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />}
          <div>
            <div className="font-bold text-sm tracking-wider">
              {tier === 'SAFE' && 'NOMINAL PATROL REGIME — THREAT INDEX SAFE'}
              {tier === 'ELEVATED' && 'ELEVATED ANOMALY CORRELATION — HAZARD CRAWL ENGAGED'}
              {tier === 'CRITICAL' && 'CRITICAL ORDNANCE LOCKDOWN TRIGGERED — RPF EVIDENTIARY VAULT ACTIVATED'}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              Score: <span className="font-bold underline">{score.toFixed(3)}</span> | Identified Object Target: <span className="font-semibold">{detectedClass}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Multi-sensor status cards and mathematical formulation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-semibold text-cyan-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                TRI-SENSOR TELEMETRY INFLUX CHANNELS
              </span>
              <span className="text-[11px] font-mono text-slate-400">Hailo-8 26 TOPS Pipeline</span>
            </div>

            {/* Channel 1: Visual YOLO */}
            <div className="p-3 bg-[#0d1422] rounded-md border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">1. Visual Object Detection (Hailo-8)</div>
                  <div className="text-sm font-semibold text-slate-200">
                    Confidence: <span className="text-cyan-400 font-mono">{(visualConf * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="inline-block text-[11px] font-mono px-2 py-0.5 rounded border"
                  style={{ color: classColor, borderColor: `${classColor}40`, backgroundColor: `${classColor}15` }}
                >
                  {detectedClass}
                </span>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Weight: 0.45</div>
              </div>
            </div>

            {/* Channel 2: Thermal Lepton */}
            <div className="p-3 bg-[#0d1422] rounded-md border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">2. FLIR Radiometric Thermal Core</div>
                  <div className="text-sm font-semibold text-slate-200">
                    Raw: <span className="text-amber-400 font-mono">{thermalC.toFixed(1)}°C</span>
                    <span className="text-slate-500 mx-2">→</span>
                    Norm: <span className="text-cyan-400 font-mono">{normThermal.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-300">Norm [25°C - 85°C]</span>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Weight: 0.35</div>
              </div>
            </div>

            {/* Channel 3: Chemical Trace */}
            <div className="p-3 bg-[#0d1422] rounded-md border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">3. Forced-Air Chemical Precursor</div>
                  <div className="text-sm font-semibold text-slate-200">
                    Raw: <span className="text-purple-400 font-mono">{chemicalPpm.toFixed(1)} PPM</span>
                    <span className="text-slate-500 mx-2">→</span>
                    Norm: <span className="text-cyan-400 font-mono">{normChemical.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-300">Norm [10 - 100 PPM]</span>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Weight: 0.20</div>
              </div>
            </div>

            {/* Formula calculation box */}
            <div className="p-3 bg-[#080c14] rounded-md border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
              <div className="text-slate-400 font-semibold mb-1 text-[11px] text-cyan-400">THREAT ESCALATION INDEX FORMULATION:</div>
              <div>Score = (0.45 × {visualConf.toFixed(2)}) + (0.35 × {normThermal.toFixed(2)}) + (0.20 × {normChemical.toFixed(2)})</div>
              <div className="mt-1 text-slate-400">
                = {(0.45 * visualConf).toFixed(3)} + {(0.35 * normThermal).toFixed(3)} + {(0.20 * normChemical).toFixed(3)}
                = <span className="text-cyan-300 font-bold text-sm ml-1">{score.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Semicircular Plotly/SVG Gauge */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl flex flex-col items-center justify-between">
          <div className="w-full text-center border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-semibold text-slate-300">COGNITIVE THREAT DIAL</span>
          </div>

          <div className="relative my-4 flex flex-col items-center">
            {/* SVG Semicircular Dial */}
            <svg viewBox="0 0 240 140" className="w-72 h-44 overflow-visible">
              <defs>
                <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="elevatedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="criticalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ff3366" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="#1e293b"
                strokeWidth="22"
                strokeLinecap="round"
              />

              {/* Segment 1: Safe 0.0 to 0.40 (0 to 72 deg) */}
              <path
                d="M 20 120 A 100 100 0 0 1 89.1 40.9"
                fill="none"
                stroke="url(#safeGrad)"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Segment 2: Elevated 0.40 to 0.70 (72 to 126 deg) */}
              <path
                d="M 89.1 40.9 A 100 100 0 0 1 178.8 61.2"
                fill="none"
                stroke="url(#elevatedGrad)"
                strokeWidth="20"
                opacity="0.85"
              />

              {/* Segment 3: Critical 0.70 to 1.0 (126 to 180 deg) */}
              <path
                d="M 178.8 61.2 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="url(#criticalGrad)"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.95"
              />

              {/* Center Pivot */}
              <circle cx="120" cy="120" r="10" fill="#080c14" stroke="#00f2fe" strokeWidth="2.5" />

              {/* Needle Indicator */}
              <g transform={`rotate(${needleAngle}, 120, 120)`}>
                <line x1="120" y1="120" x2="120" y2="28" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
                <polygon points="120,20 115,36 125,36" fill="#00f2fe" />
              </g>

              {/* Labels on dial */}
              <text x="30" y="136" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">0.0 SAFE</text>
              <text x="100" y="24" fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">0.40 ELEVATED</text>
              <text x="175" y="136" fill="#ff3366" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">0.70 CRIT</text>
            </svg>

            {/* Main digital readout */}
            <div className="text-center mt-1">
              <div
                className="font-mono text-3xl font-bold tracking-tight"
                style={{ color: tier === 'SAFE' ? '#10b981' : tier === 'ELEVATED' ? '#f59e0b' : '#ff3366' }}
              >
                {score.toFixed(3)}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-0.5">
                TIER: <span className="font-bold text-slate-200">{tier}</span>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-[11px]">
            <div className="p-1.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-500/20">
              Safe: 0.0 - 0.4
            </div>
            <div className="p-1.5 rounded bg-amber-950/20 text-amber-400 border border-amber-500/20">
              Elevated: 0.4 - 0.7
            </div>
            <div className="p-1.5 rounded bg-rose-950/20 text-rose-400 border border-rose-500/20">
              Lockdown: &gt; 0.7
            </div>
          </div>
        </div>
      </div>

      {/* Neurosymbolic Decision Matrix (Symbolic Rule Layer) */}
      <div className="p-5 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-mono text-xs font-semibold text-cyan-400">
            ⚖️ NEUROSYMBOLIC RULE ARBITRATION MATRIX (FALSE-POSITIVE REJECTION ENGINE)
          </span>
          <span className="text-[11px] font-mono text-slate-400">Symbolic Logic &gt; Pure Statistics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="p-2.5">Operational Scenario</th>
                <th className="p-2.5">Visual AI (YOLO)</th>
                <th className="p-2.5">Thermal (FLIR)</th>
                <th className="p-2.5">Chemical (PPM)</th>
                <th className="p-2.5">Symbolic Constraint Logic</th>
                <th className="p-2.5">System Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-2.5 font-semibold text-emerald-400">1. Nominal Track Sweep</td>
                <td className="p-2.5">&lt; 0.25 (Clear)</td>
                <td className="p-2.5">&lt; 40.0°C</td>
                <td className="p-2.5">&lt; 15 PPM</td>
                <td className="p-2.5 text-slate-400">Ambient baselines within nominal margin</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    PASS NOMINAL
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20 transition-colors bg-slate-900/30">
                <td className="p-2.5 font-semibold text-amber-400">2. Train Brake Disc (Hot)</td>
                <td className="p-2.5">&lt; 0.20 (No pack)</td>
                <td className="p-2.5 text-rose-400 font-bold">&gt; 85.0°C (Hot)</td>
                <td className="p-2.5">&lt; 12 PPM (Zero)</td>
                <td className="p-2.5 text-slate-400">
                  <strong>DISCARD AS FALSE POSITIVE:</strong> Pure friction heat without explosive nitrate vapor or visual casing
                </td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[10px]">
                    FILTERED (NO ALARM)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-2.5 font-semibold text-purple-400">3. Rail Grease / Diesel Spill</td>
                <td className="p-2.5">&lt; 0.30 (Surface slick)</td>
                <td className="p-2.5">&lt; 35.0°C</td>
                <td className="p-2.5 text-purple-400 font-bold">&gt; 90 PPM</td>
                <td className="p-2.5 text-slate-400">
                  Hydrocarbon fuel signature lacks explosive oxidizer radical; uncorroborated thermally
                </td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-500/30 text-[10px]">
                    LOG CAUTION
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20 transition-colors bg-rose-950/10">
                <td className="p-2.5 font-semibold text-rose-400">4. Hidden Bogie Ordnance</td>
                <td className="p-2.5 text-rose-400 font-bold">&gt; 0.75 (Taped pack)</td>
                <td className="p-2.5 text-rose-400 font-bold">&gt; 55.0°C (Exothermic)</td>
                <td className="p-2.5 text-rose-400 font-bold">&gt; 60 PPM (Nitrate)</td>
                <td className="p-2.5 text-rose-300">
                  <strong>AFFIRMATIVE ESCALATION:</strong> Simultaneous physical tri-sensor convergence. Zero plausible benign physical explanation
                </td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/60 text-[10px] font-bold">
                    LOCKDOWN & VAULT
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
