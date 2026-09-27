import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Flame,
  HelpCircle,
  X,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { playAlertSiren, playTacticalBlip } from '../utils/audio';

interface JudgesDemoBarProps {
  onSelectScenario: (scenario: 'nominal' | 'ordnance' | 'narcotics') => void;
  activeThreat: string;
  threatIndex: number;
  onSwitchTab: (tab: 'kinematics' | 'flir' | 'fusion' | 'vault') => void;
  onAdvancePatrol: () => void;
}

export const JudgesDemoBar: React.FC<JudgesDemoBarProps> = ({
  onSelectScenario,
  activeThreat,
  threatIndex,
  onSwitchTab,
  onAdvancePatrol,
}) => {
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [autoTourRunning, setAutoTourRunning] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Auto-tour guided timer
  useEffect(() => {
    if (!autoTourRunning) return;

    const timer = setInterval(() => {
      setTourStep((prev) => {
        const next = prev + 1;
        if (next === 1) {
          // Step 1: Normal Patrol
          onSelectScenario('nominal');
          onSwitchTab('kinematics');
          onAdvancePatrol();
        } else if (next === 2) {
          // Step 2: Ordnance detected!
          onSelectScenario('ordnance');
          onSwitchTab('flir');
          onAdvancePatrol();
        } else if (next === 3) {
          // Step 3: View AI fusion formula
          onSwitchTab('fusion');
        } else if (next === 4) {
          // Step 4: View Cryptographic audit log
          onSwitchTab('vault');
        } else if (next >= 5) {
          // End tour
          setAutoTourRunning(false);
          return 0;
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [autoTourRunning, onSelectScenario, onSwitchTab, onAdvancePatrol]);

  const handleStartAutoTour = () => {
    playTacticalBlip(950, 0.12, 'sine');
    setAutoTourRunning(true);
    setTourStep(1);
    onSelectScenario('nominal');
    onSwitchTab('kinematics');
  };

  const handleStopAutoTour = () => {
    setAutoTourRunning(false);
    setTourStep(0);
  };

  return (
    <div className="w-full bg-[#070e1c] border-b border-[#1e293b] px-4 py-2 text-xs font-mono">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Quick Scenario Selectors for Busy Judges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#00f3ff] font-bold tracking-wider font-['Chakra_Petch']">
            <Sparkles className="w-4 h-4 text-[#ffaa00]" />
            <span>JUDGES 1-CLICK TEST SCENARIOS:</span>
          </div>

          {/* Scenario 1: Normal */}
          <button
            onClick={() => {
              onSelectScenario('nominal');
              onSwitchTab('kinematics');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeThreat === 'Nominal'
                ? 'bg-[#00ff66] text-[#050b14] shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                : 'bg-[#0b1626] text-[#00ff66] border border-[#00ff66]/40 hover:bg-[#00ff66]/15'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            1. NORMAL PATROL
          </button>

          {/* Scenario 2: Ordnance Threat */}
          <button
            onClick={() => {
              onSelectScenario('ordnance');
              onSwitchTab('flir');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeThreat === 'Explosive Class 1.1'
                ? 'bg-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.6)] animate-pulse'
                : 'bg-[#0b1626] text-[#ff0055] border border-[#ff0055]/50 hover:bg-[#ff0055]/15'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            2. IED BOMB FOUND (ALERT!)
          </button>

          {/* Scenario 3: Narcotics */}
          <button
            onClick={() => {
              onSelectScenario('narcotics');
              onSwitchTab('flir');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeThreat === 'Narcotics'
                ? 'bg-[#ffaa00] text-[#050b14] shadow-[0_0_12px_rgba(255,170,0,0.4)]'
                : 'bg-[#0b1626] text-[#ffaa00] border border-[#ffaa00]/40 hover:bg-[#ffaa00]/15'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            3. NARCOTICS VAPOR
          </button>
        </div>

        {/* Right: Auto-Tour & Executive Brief Button */}
        <div className="flex items-center gap-2">
          {/* 15-Second Guided Demo */}
          {autoTourRunning ? (
            <button
              onClick={handleStopAutoTour}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffaa00] text-[#050b14] rounded font-bold text-xs shadow-lg animate-pulse"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>STOP TOUR (STEP {tourStep}/4)</span>
            </button>
          ) : (
            <button
              onClick={handleStartAutoTour}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1626] border border-[#00f3ff] hover:bg-[#00f3ff] hover:text-[#050b14] text-[#00f3ff] rounded font-bold text-xs transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>15-SEC GUIDED TOUR</span>
            </button>
          )}

          {/* Executive Brief Button */}
          <button
            onClick={() => setBriefModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#ffffff] rounded font-bold text-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span>EXECUTIVE BRIEF</span>
          </button>
        </div>
      </div>

      {/* Auto-Tour Live Subtitle Banner */}
      {autoTourRunning && (
        <div className="mt-2 py-1 px-3 rounded bg-[#00f3ff]/15 border border-[#00f3ff]/40 text-[#00f3ff] text-xs flex items-center justify-between animate-fadeIn">
          <span>
            {tourStep === 1 && '▶ Step 1: Autonomous Trot along Indian Railways Broad Gauge track (1676mm).'}
            {tourStep === 2 && '▶ Step 2: Sabotage IED detected under train bogie axle! Thermal FLIR locked on.'}
            {tourStep === 3 && '▶ Step 3: Neurosymbolic Sensor Fusion Engine computes Master Threat Index (94/100).'}
            {tourStep === 4 && '▶ Step 4: Cryptographic SHA-256 seal logged to audit vault for judicial evidence.'}
          </span>
          <span className="text-[10px] text-[#94a3b8]">Auto-Playing Demo</span>
        </div>
      )}

      {/* EXECUTIVE BRIEF MODAL FOR JUDGES */}
      {briefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#091220] border-2 border-[#00f3ff] rounded-lg shadow-2xl p-6 text-xs text-[#d1d5db] font-mono space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#00f3ff]" />
                <div>
                  <h3 className="text-base font-bold text-[#ffffff] font-['Chakra_Petch']">
                    PROJECT VANGUARD: EXECUTIVE BRIEF FOR JUDGES
                  </h3>
                  <div className="text-[11px] text-[#00f3ff]">
                    Quadruped Security &amp; Threat Detection Robot for Indian Railways
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBriefModalOpen(false)}
                className="p-1 text-[#94a3b8] hover:text-[#ffffff] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Crisp Value Pillars */}
            <div className="space-y-3">
              <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded">
                <div className="text-[#ff0055] font-bold text-xs uppercase mb-1">
                  1. The Life-Critical Problem
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  Indian Railways spans <b>68,000+ km of tracks</b> carrying 23 million daily passengers. Sabotage (IED explosives attached to coach bogies, fishplate removal) is fatal and physically impossible to manually inspect under every train carriage at speed.
                </p>
              </div>

              <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded">
                <div className="text-[#00f3ff] font-bold text-xs uppercase mb-1">
                  2. The Robotic Solution
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  VANGUARD is a rugged 4-legged robotic ground station. It <b>trots directly along the rails</b> and <b>crawls under low-clearance LHB passenger bogies</b> with zero risk to human Railway Protection Force (RPF) personnel.
                </p>
              </div>

              <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded">
                <div className="text-[#ffaa00] font-bold text-xs uppercase mb-1">
                  3. Multi-Spectral Neurosymbolic AI
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  Standard cameras fail in the dark, rain, and dust. VANGUARD fuses <b>Radiometric FLIR Thermal ΔT</b> + <b>Electrochemical Vapor Sniffer (PPM)</b> + <b>Visual CNN</b>. When heat &amp; nitro vapor spike together, a synergistic penalty instantly raises the alarm.
                </p>
              </div>

              <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded">
                <div className="text-[#00ff66] font-bold text-xs uppercase mb-1">
                  4. Tamper-Proof Legal Evidence
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  Every scan step is cryptographically hashed with <b>SHA-256</b>, tying timestamp, GPS track chainage, and threat telemetry into an immutable chain admissible under Indian Evidence Act Section 60.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px]">
              <span className="text-[#94a3b8]">Ready for field deployment on Broad Gauge (1676mm)</span>
              <button
                onClick={() => setBriefModalOpen(false)}
                className="px-4 py-2 bg-[#00f3ff] text-[#050b14] font-bold rounded hover:bg-[#38bdf8] transition-colors"
              >
                GOT IT, LET'S EVALUATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
