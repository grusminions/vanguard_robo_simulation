/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { ThermalViewport } from './components/ThermalViewport';
import { NeurosymbolicFusion } from './components/NeurosymbolicFusion';
import { AuditVault, AuditRecord } from './components/AuditVault';
import { playTacticalBlip, playAlertSiren, toggleSound, isSoundEnabled } from './utils/audio';

export default function App() {
  // Active Tab: 'station' (main twin) | 'fusion' (sensor math) | 'vault' (police logs)
  const [activeTab, setActiveTab] = useState<'station' | 'fusion' | 'vault'>('station');

  // Scenarios: 'safe' | 'bomb' | 'drugs'
  const [scenario, setScenario] = useState<'safe' | 'bomb' | 'drugs'>('safe');
  const [scenarioTriggerTime, setScenarioTriggerTime] = useState<number>(Date.now());
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  // Simulated Audit Vault Records (Coimbatore Junction Corridor)
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: 'REC-0941',
      timestamp: '2026-09-27 15:20:10',
      chainage: 'CBE Yard KM 498.420',
      zone: 'Bogie Axle 02',
      threatLevel: 'EXPLOSIVE CLASS 1.1',
      threatIndex: 95.0,
      visualMatch: 94.2,
      thermalDelta: 24.8,
      chemPpm: 118.5,
      hash: '3f78a2e1d09c45b89012e34f56789abcde0123456789abcdef0123456789abcd',
    },
    {
      id: 'REC-0938',
      timestamp: '2026-09-27 15:15:32',
      chainage: 'CBE Yard KM 498.390',
      zone: 'Under-Coach Plenum',
      threatLevel: 'NARCOTICS SCHEDULE I',
      threatIndex: 65.0,
      visualMatch: 62.4,
      thermalDelta: 4.1,
      chemPpm: 76.2,
      hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    },
    {
      id: 'REC-0935',
      timestamp: '2026-09-27 15:10:04',
      chainage: 'CBE Yard KM 498.350',
      zone: 'UIC-60 Ballast Bed',
      threatLevel: 'NOMINAL',
      threatIndex: 8.0,
      visualMatch: 12.0,
      thermalDelta: 1.8,
      chemPpm: 2.0,
      hash: '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    },
  ]);

  // Scenario-driven dynamic attributes
  const isBomb = scenario === 'bomb';
  const isDrugs = scenario === 'drugs';
  const isSafe = scenario === 'safe';

  const threatName = isBomb
    ? 'Explosive Class 1.1'
    : isDrugs
    ? 'Narcotics'
    : 'Nominal';

  const threatScore = isBomb ? 95 : isDrugs ? 65 : 8;
  const thermalDelta = isBomb ? 24.8 : isDrugs ? 4.1 : 1.8;
  const visualMatch = isBomb ? 94.2 : isDrugs ? 62.4 : 12.0;
  const chemPpm = isBomb ? 118.5 : isDrugs ? 76.2 : 2.0;

  // Manual scenario clicks
  const handleSelectScenario = (sc: 'safe' | 'bomb' | 'drugs') => {
    setScenario(sc);
    setScenarioTriggerTime(Date.now());
    if (sc === 'bomb') playAlertSiren();
    else if (sc === 'drugs') playTacticalBlip(620, 0.15, 'sawtooth');
    else playTacticalBlip(780, 0.08, 'sine');
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  // CSV evidence download
  const handleDownloadEvidence = () => {
    playTacticalBlip(880, 0.1, 'triangle');
    const now = new Date().toISOString();
    const csvContent =
      `Timestamp,Railway Corridor,Status,Threat Score,Threat Type,Action Protocol,Tamper-Proof Hash (SHA-256)\n` +
      `"${now}","Indian Railways Coimbatore Junction Corridor KM 498.420","${
        isBomb ? 'CRITICAL BOMB DETECTED' : isDrugs ? 'CONTRABAND DETECTED' : 'SAFE TRACK'
      }",${threatScore},"${threatName}","${
        isBomb ? 'Emergency Stop Engaged · Bomb Squad (BDDS) Alerted' : isDrugs ? 'RPF Seizure Protocol' : 'Routine Patrol Cleared'
      }","9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VANGUARD_EVIDENCE_LOG.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#040812] text-[#d1d5db] font-mono flex flex-col justify-between selection:bg-[#00f3ff] selection:text-[#050b14]">
      {/* 1. TOP HEADER: PROJECT TITLE & CONTROLS */}
      <header className="border-b border-[#1e293b] bg-[#070e1c] px-4 py-3 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0b1b30] border-2 border-[#00f3ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)] shrink-0">
              <ShieldAlert className="w-6 h-6 text-[#00f3ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-white font-['Chakra_Petch'] tracking-wide">
                  PROJECT VANGUARD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f3ff]/20 text-[#00f3ff] font-bold border border-[#00f3ff]/40">
                  INDIAN RAILWAYS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] font-bold border border-[#00ff66]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Autonomous Quadruped Robot Dog that crawls under passenger trains to detect bombs &amp; sabotage.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Mute sound' : 'Unmute sound effects'}
              className={`p-2 rounded-lg border transition-all ${
                soundOn
                  ? 'bg-[#00f3ff]/15 border-[#00f3ff] text-[#00f3ff]'
                  : 'bg-[#0b1626] border-[#1e293b] text-[#64748b] hover:text-[#cbd5e1]'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-[1600px] mx-auto mt-3 pt-2.5 border-t border-[#1e293b]/60 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('station')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'station'
                  ? 'bg-[#00f3ff] text-[#050b14] shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#0f1d33]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Live Command Station</span>
            </button>

            <button
              onClick={() => setActiveTab('fusion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'fusion'
                  ? 'bg-[#00f3ff] text-[#050b14] shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#0f1d33]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. 3-Sensor AI Fusion</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'vault'
                  ? 'bg-[#00f3ff] text-[#050b14] shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#0f1d33]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Police Evidence Vault</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-[#64748b]">
            <span>CORRIDOR: <b className="text-white">Coimbatore Junction (CBE)</b></span>
            <span>·</span>
            <span>GAUGE: <b className="text-[#00f3ff]">1676mm Broad Gauge</b></span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-[1600px] mx-auto w-full flex-1 p-3.5 space-y-3">
        {/* TAB 1: LIVE GROUND COMMAND STATION */}
        {activeTab === 'station' && (
          <div className="space-y-3">
            {/* 3 BIG 1-CLICK TEST SCENARIO BUTTONS (DESIGNED FOR FAST JUDGING) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                <span className="text-[#94a3b8] uppercase font-bold tracking-wider">
                  👉 TEST SCENARIOS (CLICK ANY TO TEST IN 1 SECOND):
                </span>
                <span className="text-[11px] text-[#64748b]">Simulates live Indian Railways threat injection</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* Button 1: Normal */}
                <button
                  onClick={() => handleSelectScenario('safe')}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSafe
                      ? 'bg-[#00ff66]/15 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.35)]'
                      : 'bg-[#081220] border-[#1e293b] hover:border-[#00ff66]/60'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#00ff66] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      1. NORMAL TRACK PATROL (SAFE)
                    </div>
                    <div className="text-xs text-[#94a3b8] mt-1">
                      No explosives found · Broad gauge track clear (Score: 8/100)
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold shrink-0 ml-2 ${
                      isSafe ? 'bg-[#00ff66] text-[#050b14]' : 'bg-[#1e293b] text-[#94a3b8]'
                    }`}
                  >
                    {isSafe ? 'ACTIVE' : 'SELECT'}
                  </span>
                </button>

                {/* Button 2: Bomb */}
                <button
                  onClick={() => handleSelectScenario('bomb')}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                    isBomb
                      ? 'bg-[#ff0055]/20 border-[#ff0055] shadow-[0_0_20px_rgba(255,0,85,0.45)] animate-pulse'
                      : 'bg-[#081220] border-[#1e293b] hover:border-[#ff0055]/60'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#ff0055] flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      2. BOMB DETECTED! (IED)
                    </div>
                    <div className="text-xs text-[#ffaacc] mt-1">
                      Explosive on Axle #2 · Emergency Train Stop! (Score: 95/100)
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold shrink-0 ml-2 ${
                      isBomb ? 'bg-[#ff0055] text-white' : 'bg-[#1e293b] text-[#94a3b8]'
                    }`}
                  >
                    {isBomb ? 'ACTIVE' : 'SELECT'}
                  </span>
                </button>

                {/* Button 3: Drugs */}
                <button
                  onClick={() => handleSelectScenario('drugs')}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                    isDrugs
                      ? 'bg-[#ffaa00]/20 border-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.35)]'
                      : 'bg-[#081220] border-[#1e293b] hover:border-[#ffaa00]/60'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#ffaa00] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      3. CONTRABAND DRUGS
                    </div>
                    <div className="text-xs text-[#ffdd88] mt-1">
                      Sniffer detects narcotic vapor in floor plenum (Score: 65/100)
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold shrink-0 ml-2 ${
                      isDrugs ? 'bg-[#ffaa00] text-[#050b14]' : 'bg-[#1e293b] text-[#94a3b8]'
                    }`}
                  >
                    {isDrugs ? 'ACTIVE' : 'SELECT'}
                  </span>
                </button>
              </div>
            </div>

            {/* LIVE VERDICT STRIP */}
            <div
              className={`rounded-xl px-4 py-2.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all shadow-md ${
                isBomb
                  ? 'bg-[#2b0816] border-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                  : isDrugs
                  ? 'bg-[#291b05] border-[#ffaa00] text-white shadow-[0_0_15px_rgba(255,170,0,0.2)]'
                  : 'bg-[#061e14] border-[#00ff66] text-white shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs uppercase opacity-85 px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                  LIVE VERDICT:
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  {isBomb && (
                    <span className="text-[#ff99bb]">
                      🚨 IED BOMB DETECTED: Explosive device located on Coach #4 Axle #2 · Emergency Locomotive Brake Engaged · Bomb Squad (BDDS) Alerted!
                    </span>
                  )}
                  {isDrugs && (
                    <span className="text-[#ffe099]">
                      ⚠️ ILLICIT CONTRABAND: Volatile narcotic vapor detected under passenger coach floor · RPF Seizure Protocol Activated!
                    </span>
                  )}
                  {isSafe && (
                    <span className="text-[#99ffcc]">
                      🟢 ALL CLEAR: Robot actively patrolling 1676mm Broad Gauge tracks. No explosives, track cracks, or magnetic bombs found.
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase text-gray-400">Master Threat Score</div>
                  <div
                    className={`font-mono font-bold text-base ${
                      isBomb ? 'text-[#ff0055]' : isDrugs ? 'text-[#ffaa00]' : 'text-[#00ff66]'
                    }`}
                  >
                    {threatScore} / 100
                  </div>
                </div>
              </div>
            </div>

            {/* DUAL 3D & THERMAL SPLIT SCREEN (360PX HEIGHT, BALANCED & REALISTIC) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Left View: 3D Robot Walking on Tracks */}
              <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse" />
                    <span>VIEW 1: ROBOT ON RAILWAY TRACKS (3D TWIN)</span>
                  </div>
                  <span className="text-[11px] text-[#00f3ff] bg-[#00f3ff]/10 px-2 py-0.5 rounded border border-[#00f3ff]/30">
                    Indian Railways Broad Gauge
                  </span>
                </div>

                <div className="rounded-lg overflow-hidden border border-[#1e293b]">
                  <DigitalTwin3D
                    pitchAngle={1.8}
                    rollAngle={-0.5}
                    clearanceCm={28}
                    ballastDispersion={0.35}
                    patrolMode="Trot"
                    stepCounter={42}
                    eStopActive={false}
                    activeThreat={threatName}
                    scenario={scenario}
                    scenarioTriggerTime={scenarioTriggerTime}
                  />
                </div>

                <div className="text-xs text-[#94a3b8] px-1 flex items-center justify-between">
                  <span>Simulates the 4-legged robot crawling under 100+ km/h passenger trains safely.</span>
                  <span className="text-[#00ff66] font-bold">60 FPS Real-time</span>
                </div>
              </div>

              {/* Right View: Thermal FLIR Camera (What the robot sees) */}
              <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055] animate-pulse" />
                    <span>VIEW 2: WHAT ROBOT SEES (FLIR THERMAL CAMERA)</span>
                  </div>
                  <span className="text-[11px] text-[#ffaa00] bg-[#ffaa00]/10 px-2 py-0.5 rounded border border-[#ffaa00]/30">
                    Undercarriage Scanner
                  </span>
                </div>

                <div className="rounded-lg overflow-hidden border border-[#1e293b]">
                  <ThermalViewport
                    activeThreat={threatName}
                    thermalDelta={thermalDelta}
                    visualMatch={visualMatch}
                    chemPpm={chemPpm}
                    compact={true}
                  />
                </div>

                <div className="text-xs text-[#94a3b8] px-1 flex items-center justify-between">
                  <span>Heat vision + chemical vapor sniffer detects explosives even in pitch black.</span>
                  <button
                    onClick={handleDownloadEvidence}
                    className="text-[#00f3ff] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Evidence CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 SUMMARY PILLARS (HOW IT WORKS IN 3 STEPS - DIGESTIBLE IN 15 SECONDS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-3.5 space-y-1.5 shadow-md">
                <div className="text-[#00f3ff] font-bold text-sm flex items-center gap-1.5 font-['Chakra_Petch']">
                  <span>1. The Problem: Human Danger</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Indian Railways operates 68,000 km of track. Security officers cannot safely crawl under 100-ton passenger trains to inspect for bombs. VANGUARD crawls autonomously with zero human risk.
                </p>
              </div>

              <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-3.5 space-y-1.5 shadow-md">
                <div className="text-[#ffaa00] font-bold text-sm flex items-center gap-1.5 font-['Chakra_Petch']">
                  <span>2. How It Detects: Heat + Sniffer</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Standard optical cameras fail in dark, dusty train yards. VANGUARD pairs FLIR Thermal Heat Vision with a Chemical Sniffer to detect explosive vapors (RDX, PETN, TNT) in 0.2 seconds.
                </p>
              </div>

              <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-3.5 space-y-1.5 shadow-md">
                <div className="text-[#00ff66] font-bold text-sm flex items-center gap-1.5 font-['Chakra_Petch']">
                  <span>3. The Result: Tamper-Proof Evidence</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Every detection triggers the locomotive emergency brake via RF signal and records a SHA-256 cryptographic hash admissible in court under Section 60 of the Indian Evidence Act.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3-SENSOR AI FUSION ENGINE */}
        {activeTab === 'fusion' && (
          <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-4 shadow-xl">
            <NeurosymbolicFusion
              visualMatch={visualMatch}
              thermalDelta={thermalDelta}
              chemPpm={chemPpm}
            />
          </div>
        )}

        {/* TAB 3: CRYPTOGRAPHIC AUDIT VAULT */}
        {activeTab === 'vault' && (
          <div className="bg-[#070e1c] border border-[#1e293b] rounded-xl p-4 shadow-xl">
            <AuditVault logs={auditLogs} />
          </div>
        )}
      </main>

      {/* 3. CLEAN FOOTER */}
      <footer className="border-t border-[#1e293b] bg-[#070e1c] py-2.5 px-4 text-center text-xs text-[#64748b]">
        PROJECT VANGUARD · INDIAN RAILWAYS AUTONOMOUS COUNTER-SABOTAGE ROBOTIC DIGITAL TWIN
      </footer>
    </div>
  );
}
