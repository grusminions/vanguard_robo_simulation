import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Zap,
  Play,
  Pause,
  Download,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DigitalTwin3D } from './DigitalTwin3D';
import { ThermalViewport } from './ThermalViewport';
import { playDeployCountermeasure } from '../utils/audio';

interface JudgesSimpleViewProps {
  activeThreat: string;
  threatIndex: number;
  visualMatch: number;
  thermalDelta: number;
  chemPpm: number;
  pitchAngle: number;
  rollAngle: number;
  clearanceCm: number;
  ballastDispersion: number;
  patrolMode: 'Trot' | 'Crawl / Hazard Ballast';
  stepCounter: number;
  eStopActive: boolean;
  onSelectScenario: (scenario: 'nominal' | 'ordnance' | 'narcotics') => void;
  onToggleEStop: () => void;
  onSwitchToAdvanced: () => void;
  onDownloadCSV: () => void;
}

export const JudgesSimpleView: React.FC<JudgesSimpleViewProps> = ({
  activeThreat,
  threatIndex,
  visualMatch,
  thermalDelta,
  chemPpm,
  pitchAngle,
  rollAngle,
  clearanceCm,
  ballastDispersion,
  patrolMode,
  stepCounter,
  eStopActive,
  onSelectScenario,
  onToggleEStop,
  onSwitchToAdvanced,
  onDownloadCSV,
}) => {
  const isBomb = activeThreat === 'Explosive Class 1.1';
  const isNarcotics = activeThreat === 'Narcotics';
  const isSafe = activeThreat === 'Nominal';

  return (
    <div className="space-y-4 font-mono">
      {/* 1. BIG EASY SCENARIO SELECTOR (FOR BUSY JUDGES) */}
      <div className="bg-[#091220] border-2 border-[#00f3ff] rounded-xl p-4 shadow-[0_0_20px_rgba(0,243,255,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-[#00f3ff] text-[#050b14] font-bold">
                EASY 1-CLICK DEMO
              </span>
              <h2 className="text-base font-bold text-[#ffffff] font-['Chakra_Petch']">
                Choose a Test Scenario to See the Robot in Action:
              </h2>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Click any scenario below. The 3D robot, thermal cameras, and threat meters will update instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToAdvanced}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#00f3ff] rounded text-xs font-bold transition-all border border-[#1e293b] hover:border-[#00f3ff]"
            >
              ⚙️ Switch to Full Technical View
            </button>
          </div>
        </div>

        {/* 3 Huge Visual Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Scenario 1: SAFE */}
          <button
            onClick={() => onSelectScenario('nominal')}
            className={`p-3.5 rounded-lg border-2 text-left transition-all flex flex-col justify-between ${
              isSafe
                ? 'bg-[#00ff66]/15 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                : 'bg-[#0b1626] border-[#1e293b] hover:border-[#00ff66]/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#00ff66] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  SCENARIO 1: NORMAL
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isSafe ? 'bg-[#00ff66] text-[#050b14]' : 'bg-[#1e293b] text-[#94a3b8]'}`}>
                  {isSafe ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
              <div className="text-sm font-bold text-[#ffffff]">All Clear · Safe Track</div>
              <div className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">
                Robot patrols UIC-60 rail track. No heat spikes, no chemical vapor. Threat score low (8/100).
              </div>
            </div>
          </button>

          {/* Scenario 2: BOMB */}
          <button
            onClick={() => onSelectScenario('ordnance')}
            className={`p-3.5 rounded-lg border-2 text-left transition-all flex flex-col justify-between ${
              isBomb
                ? 'bg-[#ff0055]/20 border-[#ff0055] shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-pulse'
                : 'bg-[#0b1626] border-[#1e293b] hover:border-[#ff0055]/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#ff0055] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#ff0055]" />
                  SCENARIO 2: BOMB FOUND!
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isBomb ? 'bg-[#ff0055] text-white' : 'bg-[#1e293b] text-[#94a3b8]'}`}>
                  {isBomb ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
              <div className="text-sm font-bold text-[#ffffff]">IED Explosive on Wheel #2</div>
              <div className="text-[11px] text-[#ffaacc] mt-1 leading-relaxed">
                High thermal spike (+24.8°C) + Nitro explosive vapor (118 PPM). Threat: 94/100 DANGER!
              </div>
            </div>
          </button>

          {/* Scenario 3: NARCOTICS */}
          <button
            onClick={() => onSelectScenario('narcotics')}
            className={`p-3.5 rounded-lg border-2 text-left transition-all flex flex-col justify-between ${
              isNarcotics
                ? 'bg-[#ffaa00]/20 border-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.3)]'
                : 'bg-[#0b1626] border-[#1e293b] hover:border-[#ffaa00]/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#ffaa00] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#ffaa00]" />
                  SCENARIO 3: CONTRABAND
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isNarcotics ? 'bg-[#ffaa00] text-[#050b14]' : 'bg-[#1e293b] text-[#94a3b8]'}`}>
                  {isNarcotics ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
              <div className="text-sm font-bold text-[#ffffff]">Illegal Narcotics Plume</div>
              <div className="text-[11px] text-[#ffdd88] mt-1 leading-relaxed">
                Chemical sniffer detects volatile drug vapor (76 PPM) concealed in coach plenum.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. PLAIN-ENGLISH STATUS BANNER (IMMEDIATE VERDICT) */}
      <div
        className={`rounded-xl p-4 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isBomb
            ? 'bg-[#290714] border-[#ff0055] text-white shadow-xl'
            : isNarcotics
            ? 'bg-[#261906] border-[#ffaa00] text-white shadow-xl'
            : 'bg-[#051c11] border-[#00ff66] text-white shadow-xl'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isBomb ? 'bg-[#ff0055]' : isNarcotics ? 'bg-[#ffaa00] text-black' : 'bg-[#00ff66] text-black'
            }`}
          >
            {isBomb ? (
              <Flame className="w-7 h-7 text-white animate-bounce" />
            ) : isNarcotics ? (
              <AlertTriangle className="w-7 h-7 text-black" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-black" />
            )}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold opacity-80">
              CURRENT AI VERDICT &amp; ACTION PROTOCOL
            </div>
            <div className="text-lg font-bold font-['Chakra_Petch']">
              {isBomb && '🚨 CRITICAL BOMB THREAT: Explosive Ordnance Detected under Bogie Axle #2!'}
              {isNarcotics && '⚠️ CONTRABAND ALERT: Suspected Schedule I Narcotics Vapor Detected!'}
              {isSafe && '🟢 ALL SECTORS CLEAR: Normal Autonomous Patrol along UIC-60 Track.'}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {isBomb && 'Automated Action: Train Stopped via E-Stop Interlock · Bomb Disposal Squad (BDDS) Alerted.'}
              {isNarcotics && 'Automated Action: Railway Protection Force (RPF) Platform Seizure Protocol Initiated.'}
              {isSafe && 'Automated Action: Continuous 60 FPS undercarriage scan. All axles within safe thermal limit.'}
            </div>
          </div>
        </div>

        {/* Big Threat Gauge */}
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/10 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-gray-400">MASTER THREAT</div>
            <div
              className={`text-2xl font-black font-mono ${
                isBomb ? 'text-[#ff0055]' : isNarcotics ? 'text-[#ffaa00]' : 'text-[#00ff66]'
              }`}
            >
              {threatIndex.toFixed(0)} <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
          <div
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              isBomb
                ? 'bg-[#ff0055] text-white animate-pulse'
                : isNarcotics
                ? 'bg-[#ffaa00] text-black'
                : 'bg-[#00ff66] text-black'
            }`}
          >
            {isBomb ? 'CRITICAL' : isNarcotics ? 'SUSPECT' : 'SAFE'}
          </div>
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE VISUAL SIMULATOR: 3D ROBOT + LIVE THERMAL CAMERA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: 3D Robot Walking on Tracks */}
        <div className="bg-[#091220] border border-[#1e293b] rounded-xl p-3 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse" />
              <span className="font-bold text-[#ffffff] font-['Chakra_Petch']">
                VIEW 1: 3D ROBOT ON TRACKS
              </span>
            </div>
            <span className="text-[#38bdf8] text-[11px]">Indian Railways 1676mm Broad Gauge</span>
          </div>

          {/* 3D Component */}
          <div className="rounded-lg overflow-hidden border border-[#1e293b]">
            <DigitalTwin3D
              pitchAngle={pitchAngle}
              rollAngle={rollAngle}
              clearanceCm={clearanceCm}
              ballastDispersion={ballastDispersion}
              patrolMode={patrolMode}
              stepCounter={stepCounter}
              eStopActive={eStopActive}
              activeThreat={activeThreat}
            />
          </div>

          <div className="text-[11px] text-[#94a3b8] px-1 flex items-center justify-between">
            <span>Left-click &amp; drag to orbit camera around the robot.</span>
            <span className="text-[#00f3ff]">Status: Auto-Patrolling</span>
          </div>
        </div>

        {/* Right: Live Thermal FLIR Undercarriage View */}
        <div className="bg-[#091220] border border-[#1e293b] rounded-xl p-3 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055] animate-pulse" />
              <span className="font-bold text-[#ffffff] font-['Chakra_Petch']">
                VIEW 2: WHAT THE ROBOT SEES (THERMAL FLIR)
              </span>
            </div>
            <span className="text-[#ffaa00] text-[11px]">Passenger Coach Undercarriage</span>
          </div>

          {/* FLIR Component */}
          <div className="rounded-lg overflow-hidden border border-[#1e293b]">
            <ThermalViewport
              activeThreat={activeThreat}
              thermalDelta={thermalDelta}
              visualMatch={visualMatch}
              chemPpm={chemPpm}
            />
          </div>

          <div className="text-[11px] text-[#94a3b8] px-1 flex items-center justify-between">
            <span>Red/Yellow boxes highlight anomalies found under the train.</span>
            <button
              onClick={onDownloadCSV}
              className="text-[#00f3ff] hover:underline flex items-center gap-1 font-bold"
            >
              <Download className="w-3 h-3" />
              Download Tamper-Proof Audit Log (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* 4. "HOW IT WORKS IN 3 SIMPLE STEPS" (FOR NON-TECHNICAL JUDGES) */}
      <div className="bg-[#091220] border border-[#1e293b] rounded-xl p-4">
        <div className="text-xs font-bold text-[#00f3ff] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#00f3ff]" />
          HOW PROJECT VANGUARD PROTECTS INDIAN RAILWAYS IN 3 STEPS:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded-lg">
            <div className="text-sm font-bold text-[#00f3ff] mb-1">
              Step 1: Autonomous Crawler
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Human security officers cannot safely crawl under 100+ km/h train carriages. VANGUARD trots along Broad Gauge rails with 28cm clearance, scanning every axle and brake disc.
            </p>
          </div>

          <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded-lg">
            <div className="text-sm font-bold text-[#ffaa00] mb-1">
              Step 2: Dual Heat &amp; Sniffer AI
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Cameras alone fail in dark train yards. VANGUARD fuses <b>Radiometric FLIR Heat (+ΔT)</b> with an <b>Electrochemical Vapor Sniffer (PPM)</b> to pinpoint concealed explosives instantly.
            </p>
          </div>

          <div className="bg-[#050b14] border border-[#1e293b] p-3 rounded-lg">
            <div className="text-sm font-bold text-[#00ff66] mb-1">
              Step 3: Tamper-Proof Legal Evidence
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Every detection event is cryptographically sealed with a <b>SHA-256 hash</b>, creating an immutable court-admissible audit log under Section 60 of the Indian Evidence Act.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
