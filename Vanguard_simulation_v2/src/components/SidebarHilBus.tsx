import React from 'react';
import { TelemetryState, OperationalRegime } from '../types';
import { Sliders, Zap, Shield, Flame, Activity, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  state: TelemetryState;
  onChange: (updater: (prev: TelemetryState) => TelemetryState) => void;
  detectedClass: string;
  classColor: string;
}

export const SidebarHilBus: React.FC<Props> = ({ state, onChange, detectedClass, classColor }) => {
  const setField = <K extends keyof TelemetryState>(field: K, value: TelemetryState[K]) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  // Mission Presets
  const applyPresetNominal = () => {
    onChange((prev) => ({
      ...prev,
      visualConf: 0.08,
      thermalC: 28.0,
      chemicalPpm: 8.0,
      pitchDeg: 1.0,
      rollDeg: 0.0,
    }));
  };

  const applyPresetOrdnance = () => {
    onChange((prev) => ({
      ...prev,
      visualConf: 0.92,
      thermalC: 78.4,
      chemicalPpm: 94.0,
      pitchDeg: -8.0,
      rollDeg: 6.5,
    }));
  };

  const applyPresetBrakeDisc = () => {
    onChange((prev) => ({
      ...prev,
      visualConf: 0.05,
      thermalC: 92.0,
      chemicalPpm: 5.0,
      pitchDeg: 0.0,
      rollDeg: 0.0,
    }));
  };

  return (
    <div className="w-full space-y-6 font-mono text-xs">
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>VANGUARD HIL BUS</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          SIH-26026 Telemetry &amp; Reflex Harness
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 1. Operational Regime */}
      <div className="space-y-3">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>1. OPERATIONAL REGIME</span>
        </div>

        <div className="space-y-1.5">
          {(['Trot Mode (Station Transit)', 'Crawl Mode (Hazard Ballast Stance)'] as OperationalRegime[]).map((mode) => (
            <label
              key={mode}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${
                state.regime === mode
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                  : 'bg-[#0d1422] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="regime"
                checked={state.regime === mode}
                onChange={() => setField('regime', mode)}
                className="accent-cyan-400"
              />
              <span className="text-[11px] font-medium leading-tight">{mode}</span>
            </label>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Ballast Roughness (μ):</span>
            <span className="text-cyan-400 font-bold">{state.ballastRoughness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.ballastRoughness}
            onChange={(e) => setField('ballastRoughness', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
            <span>Smooth Flat</span>
            <span>40-65mm Granite</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 2. Attitude & Reflex Injection (Virtual IMU) */}
      <div className="space-y-3">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>2. ATTITUDE &amp; REFLEX (IMU)</span>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Chassis Pitch θ (°):</span>
            <span className="text-cyan-400 font-bold">{state.pitchDeg > 0 ? `+${state.pitchDeg.toFixed(1)}` : state.pitchDeg.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="0.5"
            value={state.pitchDeg}
            onChange={(e) => setField('pitchDeg', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Chassis Roll ϕ (°):</span>
            <span className="text-cyan-400 font-bold">{state.rollDeg > 0 ? `+${state.rollDeg.toFixed(1)}` : state.rollDeg.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="0.5"
            value={state.rollDeg}
            onChange={(e) => setField('rollDeg', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Clearance Z-Offset (m):</span>
            <span className="text-cyan-400 font-bold">{state.zOffset > 0 ? `+${state.zOffset.toFixed(2)}` : state.zOffset.toFixed(2)}m</span>
          </div>
          <input
            type="range"
            min="-0.10"
            max="0.10"
            step="0.01"
            value={state.zOffset}
            onChange={(e) => setField('zOffset', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 3. Tri-Sensor Threat Influx */}
      <div className="space-y-3">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>3. TRI-SENSOR THREAT INFLUX</span>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Visual AI (Hailo-8 YOLO):</span>
            <span className="text-cyan-400 font-bold">{(state.visualConf * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.visualConf}
            onChange={(e) => setField('visualConf', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div
            className="mt-1.5 p-1 px-2 rounded text-[10px] border leading-tight"
            style={{ color: classColor, borderColor: `${classColor}40`, backgroundColor: `${classColor}10` }}
          >
            Class: {detectedClass}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Thermal Core Temp:</span>
            <span className="text-amber-400 font-bold">{state.thermalC.toFixed(1)}°C</span>
          </div>
          <input
            type="range"
            min="15"
            max="110"
            step="0.5"
            value={state.thermalC}
            onChange={(e) => setField('thermalC', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Chemical Trace Vapor:</span>
            <span className="text-purple-400 font-bold">{state.chemicalPpm.toFixed(0)} PPM</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="1"
            value={state.chemicalPpm}
            onChange={(e) => setField('chemicalPpm', parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 4. Mission Injection Presets */}
      <div className="space-y-2">
        <div className="text-slate-300 font-semibold text-xs">4. MISSION INJECTION PRESETS</div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            onClick={applyPresetNominal}
            className="flex items-center gap-1.5 p-2 rounded bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-[11px] transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Clear Track Sweeping</span>
          </button>
          <button
            onClick={applyPresetOrdnance}
            className="flex items-center gap-1.5 p-2 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 text-[11px] transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Simulate Bogie Ordnance</span>
          </button>
          <button
            onClick={applyPresetBrakeDisc}
            className="flex items-center gap-1.5 p-2 rounded bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-500/30 text-[11px] transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Brake Disc False Positive</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 5. System Vital Status */}
      <div className="space-y-2">
        <div className="text-slate-300 font-semibold text-xs">5. HARDWARE VITALS (SL-0 - SL-3)</div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between p-1.5 bg-[#0d1422] rounded border border-slate-800/80">
            <span>micro-ROS Latency:</span>
            <span className="text-cyan-400 font-bold">0.42 ms (1 kHz)</span>
          </div>
          <div className="flex justify-between p-1.5 bg-[#0d1422] rounded border border-slate-800/80">
            <span>Logic Rail (SL-0):</span>
            <span className="text-emerald-400 font-bold">5.04 V / 1.8 A</span>
          </div>
          <div className="flex justify-between p-1.5 bg-[#0d1422] rounded border border-slate-800/80">
            <span>Motor Bus (SL-0):</span>
            <span className="text-emerald-400 font-bold">8.38 V / 14.2 A</span>
          </div>
          <div className="flex justify-between p-1.5 bg-[#0d1422] rounded border border-slate-800/80">
            <span>Hailo-8 Core Temp:</span>
            <span className="text-cyan-400 font-bold">44.8°C (26 TOPS)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
