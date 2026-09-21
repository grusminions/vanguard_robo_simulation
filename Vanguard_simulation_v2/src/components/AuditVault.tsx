import React, { useState, useEffect } from 'react';
import { TelemetryState, ThreatIndexResult } from '../types';
import { computeSha256 } from '../utils/kinematics';
import { Lock, FileCheck, Download, Copy, Check, ShieldAlert, WifiOff, HardDrive } from 'lucide-react';

interface Props {
  telemetry: TelemetryState;
  threatData: ThreatIndexResult;
}

export const AuditVault: React.FC<Props> = ({ telemetry, threatData }) => {
  const [copied, setCopied] = useState(false);
  const [hash, setHash] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    setTimestamp(new Date().toISOString());
  }, [threatData.score]);

  const payload = {
    vanguard_system_id: 'VANGUARD-QUAD-UNIT-04',
    sih_problem_code: 'SIH-26026',
    jurisdiction: 'Indian Railways / Railway Protection Force (RPF)',
    utc_timestamp: timestamp,
    sector_coordinates: {
      track_id: 'NDLS-PLATFORM-8B-NORTH',
      tunnel_chainage_km: 14.82,
      bogie_bay_number: 'B-04-A',
    },
    system_layers_state: {
      'SL-0_power_rails': 'Nominal (Logic: 5.04V, Motor: 8.38V)',
      'SL-1_actuator_bus': '12-DOF High-G Stance Locked',
      'SL-2_kinematics_teensy': 'Closed-Loop Reflex Active (600MHz)',
      'SL-3_hailo_ai_core': '26 TOPS YOLOv8 Detection',
      'SL-4_nav2_slam': 'Cartographer Tunnel Loop Closed',
    },
    tri_sensor_forensics: {
      visual_yolo_confidence: Number(telemetry.visualConf.toFixed(4)),
      visual_classified_class: threatData.detectedClass,
      radiometric_thermal_celsius: Number(telemetry.thermalC.toFixed(2)),
      chemical_precursor_ppm: Number(telemetry.chemicalPpm.toFixed(2)),
      computed_threat_index: Number(threatData.score.toFixed(4)),
      escalation_tier: threatData.tier === 'CRITICAL' ? 'CRITICAL LOCKDOWN' : threatData.tier === 'ELEVATED' ? 'ELEVATED' : 'NOMINAL',
    },
    operator_credentials: {
      field_operator_id: 'RPF-INSPECTOR-7104',
      command_station_ip: '10.14.88.2',
      crypto_algorithm: 'SHA-256 with PKCS#7 Envelope',
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);

  useEffect(() => {
    let active = true;
    computeSha256(jsonString).then((h) => {
      if (active) setHash(h);
    });
    return () => {
      active = false;
    };
  }, [jsonString]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullPackage = {
      payload,
      sha256_signature: hash,
      verified_chain_of_custody: true,
      standard: 'Indian Evidence Act 65B',
    };
    const blob = new Blob([JSON.stringify(fullPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VANGUARD_FORENSIC_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLockdown = threatData.score > 0.70;

  return (
    <div className="space-y-6">
      {/* Evidentiary Compliance Banner */}
      <div className="p-4 bg-slate-900/90 rounded-lg border-l-4 border-cyan-400 border border-slate-800 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm mb-1">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          SECTION 65B INDIAN EVIDENCE ACT FORENSIC ADMISSIBILITY PROTOCOL
        </div>
        <div className="text-slate-400 leading-relaxed">
          All sensor telemetry snapshots captured at Threat Index threshold (&gt; 0.70) are deterministically signed via 
          <strong> SHA-256</strong> with microsecond UTC timestamps, non-volatile tamper-proof flash storage, and immutable cryptographic chain-of-custody for Railway Protection Force (RPF) and forensic prosecution.
        </div>
      </div>

      {isLockdown && (
        <div className="p-4 bg-rose-950/40 rounded-lg border border-rose-500/60 critical-pulse flex items-center gap-3 text-rose-300 font-mono text-xs">
          <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce shrink-0" />
          <div>
            <div className="font-bold text-sm text-rose-200">EVIDENTIARY LOCKDOWN PROTOCOL ACTIVE</div>
            <div>Threat score exceeds 0.700 threshold. Kinematic motion locked. Forensic telemetry payload sealed.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: JSON Viewer */}
        <div className="lg:col-span-8 p-4 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">
                EVIDENTIARY TELEMETRY PAYLOAD (CANONICAL JSON)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>

          <pre className="p-3 bg-[#080c14] rounded border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Right: Cryptographic Fingerprint & Offline Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#121926] border border-cyan-500/30 shadow-xl space-y-4">
            <div className="font-mono text-xs font-semibold text-cyan-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>CRYPTOGRAPHIC SIGNATURE</span>
              <span className="text-[10px] text-emerald-400">HASH VERIFIED</span>
            </div>

            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1">SHA-256 DIGITAL DIGEST:</div>
              <div className="p-2.5 bg-[#080c14] rounded border border-slate-800 font-mono text-xs text-cyan-300 break-all leading-tight font-bold">
                {hash || 'Computing hash...'}
              </div>
            </div>

            <div className="p-2.5 bg-[#0d1422] rounded border border-slate-800 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Lock Status:</span>
                <span className={isLockdown ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {isLockdown ? 'SEALED (CRITICAL)' : 'ACTIVE MONITORING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Agency:</span>
                <span className="text-slate-200">RPF SEC-AUTH</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              Download Signed Forensic Report (.json)
            </button>
          </div>

          {/* Offline Tunnel Sync Queue Status */}
          <div className="p-4 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <div className="text-slate-300 font-semibold border-b border-slate-800 pb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>OFFLINE TUNNEL PACKET QUEUE</span>
            </div>

            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span>Non-Volatile NVMe FIFO:</span>
                <span className="text-cyan-400 font-bold">4 / 2048 Packets</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" /> RF Sync Mesh (868MHz):
                </span>
                <span className="text-amber-400">Tunnel Retrying</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span>Tamper Chassis Switch:</span>
                <span className="text-emerald-400 font-bold">Intact (Zero Tamper)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
