import React from 'react';

interface NeurosymbolicFusionProps {
  visualMatch: number;
  thermalDelta: number;
  chemPpm: number;
  onUpdateSensors?: (v: number, t: number, c: number) => void;
}

export const NeurosymbolicFusion: React.FC<NeurosymbolicFusionProps> = ({
  visualMatch,
  thermalDelta,
  chemPpm,
  onUpdateSensors,
}) => {
  // Normalized components
  const vNorm = Math.min(1.0, Math.max(0.0, visualMatch / 100.0));
  const tNorm = Math.min(1.0, Math.max(0.0, thermalDelta / 30.0));
  const cNorm = Math.min(1.0, Math.max(0.0, chemPpm / 150.0));

  // Weighted base score
  const baseScore = (0.25 * vNorm + 0.35 * tNorm + 0.40 * cNorm) * 100.0;

  // Cross-modality synergistic multiplier (Thermal anomaly + Chemical nitro plume)
  const hasSynergy = thermalDelta > 8.0 && chemPpm > 25.0;
  const synergyBoost = hasSynergy ? 18.0 * (tNorm * cNorm) : 0;

  const masterThreatIndex = Math.min(100.0, Math.max(0.0, baseScore + synergyBoost));

  // Alert status classification
  let alertBorder = '#00ff66';
  let alertText = 'NOMINAL // NO SABOTAGE HAZARD DETECTED';
  let alertBg = 'rgba(0, 255, 102, 0.15)';
  let threatLevelBadge = 'NOMINAL';

  if (masterThreatIndex > 65) {
    alertBorder = '#ff0055';
    alertText = 'CRITICAL // EXPLOSIVE ORDNANCE (CLASS 1.1) DETECTED';
    alertBg = 'rgba(255, 0, 85, 0.2)';
    threatLevelBadge = 'EXPLOSIVE CLASS 1.1';
  } else if (masterThreatIndex > 30) {
    alertBorder = '#ffaa00';
    alertText = 'ELEVATED // ILLICIT CONTRABAND / NARCOTICS VAPOR SPIKE';
    alertBg = 'rgba(255, 170, 0, 0.2)';
    threatLevelBadge = 'NARCOTICS SCHEDULE I';
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#00f3ff] tracking-wide">
          NEUROSYMBOLIC SENSOR FUSION ENGINE
        </h3>
        <p className="text-xs text-[#94a3b8]">
          Real-time deterministic multi-modal sensor fusion linking Visual CNN embeddings, Radiometric FLIR ΔT, and Electrochemical Q-Sniffer PPM.
        </p>
      </div>

      {/* 3 Modality Progress & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Modality 1: Visual Match */}
        <div className="bg-[#091220] border border-[#1e293b] rounded p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] mb-1">
            <span>MODALITY 1 // OPTICAL</span>
            <span className="text-[#00f3ff] font-semibold">Weight: 25%</span>
          </div>
          <div className="text-xl font-bold text-[#ffffff] font-mono">
            {visualMatch.toFixed(1)} <span className="text-xs text-[#94a3b8]">%</span>
          </div>
          <div className="text-[11px] text-[#64748b] mb-3">YOLOv8 Edge Undercarriage Model</div>

          {/* Progress Bar */}
          <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00f3ff] transition-all duration-300"
              style={{ width: `${Math.min(100, visualMatch)}%` }}
            />
          </div>

          {onUpdateSensors && (
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={visualMatch}
                onChange={(e) => onUpdateSensors(parseFloat(e.target.value), thermalDelta, chemPpm)}
                className="w-full accent-[#00f3ff] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Modality 2: Thermal Delta */}
        <div className="bg-[#091220] border border-[#1e293b] rounded p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] mb-1">
            <span>MODALITY 2 // RADIOMETRIC</span>
            <span className="text-[#ffaa00] font-semibold">Weight: 35%</span>
          </div>
          <div className="text-xl font-bold text-[#ffffff] font-mono">
            +{thermalDelta.toFixed(1)} <span className="text-xs text-[#94a3b8]">°C ΔT</span>
          </div>
          <div className="text-[11px] text-[#64748b] mb-3">LWIR Bolometer (Above 32°C Ambient)</div>

          <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                thermalDelta > 15 ? 'bg-[#ff0055]' : 'bg-[#ffaa00]'
              }`}
              style={{ width: `${Math.min(100, (thermalDelta / 30) * 100)}%` }}
            />
          </div>

          {onUpdateSensors && (
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="30"
                step="0.1"
                value={thermalDelta}
                onChange={(e) => onUpdateSensors(visualMatch, parseFloat(e.target.value), chemPpm)}
                className="w-full accent-[#ffaa00] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Modality 3: Chemical Sniffer */}
        <div className="bg-[#091220] border border-[#1e293b] rounded p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] mb-1">
            <span>MODALITY 3 // Q-SNIFFER</span>
            <span className="text-[#00ff66] font-semibold">Weight: 40%</span>
          </div>
          <div className="text-xl font-bold text-[#ffffff] font-mono">
            {chemPpm.toFixed(1)} <span className="text-xs text-[#94a3b8]">PPM</span>
          </div>
          <div className="text-[11px] text-[#64748b] mb-3">Photoionization Nitro/Alkaloid Sensor</div>

          <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                chemPpm > 60 ? 'bg-[#ff0055]' : 'bg-[#00ff66]'
              }`}
              style={{ width: `${Math.min(100, (chemPpm / 150) * 100)}%` }}
            />
          </div>

          {onUpdateSensors && (
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="150"
                step="0.5"
                value={chemPpm}
                onChange={(e) => onUpdateSensors(visualMatch, thermalDelta, parseFloat(e.target.value))}
                className="w-full accent-[#00ff66] cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mathematical Master Threat Index & Fusion Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Score Box */}
        <div
          className="rounded p-5 text-center flex flex-col justify-center items-center bg-[#091220]"
          style={{ border: `2px solid ${alertBorder}` }}
        >
          <div className="text-xs uppercase tracking-widest text-[#94a3b8] font-mono mb-1">
            MASTER THREAT INDEX (MTI)
          </div>
          <div
            className="text-5xl font-black font-mono tracking-tight my-1"
            style={{ color: alertBorder }}
          >
            {masterThreatIndex.toFixed(1)}
            <span className="text-sm text-[#64748b] font-normal"> / 100</span>
          </div>
          <div
            className="px-3 py-1.5 rounded font-bold text-xs tracking-wider mt-2"
            style={{ background: alertBg, color: alertBorder }}
          >
            {alertText}
          </div>
        </div>

        {/* Mathematical Formulation Breakdown */}
        <div className="lg:col-span-2 bg-[#091220] border border-[#1e293b] rounded p-4 font-mono text-xs">
          <div className="text-[#00f3ff] font-bold mb-2 flex items-center justify-between">
            <span>NEUROSYMBOLIC ARBITRATION MATRIX</span>
            <span className="text-[#94a3b8] text-[11px]">SOP-RPF-TECH-88</span>
          </div>

          {/* Formula Display */}
          <div className="bg-[#050b14] border border-[#1c293d] rounded p-2.5 text-[#cbd5e1] text-[11px] mb-3 leading-relaxed">
            MTI = min(100, 100 · [ 0.25 · (V / 100) + 0.35 · (ΔT / 30) + 0.40 · (C / 150) ] +
            𝕀<sub>synergy</sub> · 18.0 · [ (ΔT / 30) · (C / 150) ])
          </div>

          {/* Active Mathematical Terms */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94a3b8]">
            <div className="bg-[#0b1626] p-2 rounded border border-[#1e293b]">
              <div className="text-[#64748b]">Visual Term (25%):</div>
              <div className="text-[#00f3ff] font-semibold text-sm">
                {(0.25 * vNorm * 100).toFixed(2)} pts
              </div>
            </div>
            <div className="bg-[#0b1626] p-2 rounded border border-[#1e293b]">
              <div className="text-[#64748b]">Thermal Term (35%):</div>
              <div className="text-[#ffaa00] font-semibold text-sm">
                {(0.35 * tNorm * 100).toFixed(2)} pts
              </div>
            </div>
            <div className="bg-[#0b1626] p-2 rounded border border-[#1e293b]">
              <div className="text-[#64748b]">Chemical Term (40%):</div>
              <div className="text-[#00ff66] font-semibold text-sm">
                {(0.40 * cNorm * 100).toFixed(2)} pts
              </div>
            </div>
            <div className="bg-[#0b1626] p-2 rounded border border-[#1e293b]">
              <div className="text-[#64748b]">Synergistic Penalty:</div>
              <div
                className={`font-semibold text-sm ${
                  hasSynergy ? 'text-[#ff0055]' : 'text-[#64748b]'
                }`}
              >
                {hasSynergy ? `+${synergyBoost.toFixed(2)} pts (ACTIVE)` : '0.00 pts (INACTIVE)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
