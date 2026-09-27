import React, { useState } from 'react';
import { Download, Search, ShieldCheck } from 'lucide-react';

export interface AuditRecord {
  id: string;
  timestamp: string;
  chainage: string;
  zone: string;
  threatLevel: string;
  threatIndex: number;
  visualMatch: number;
  thermalDelta: number;
  chemPpm: number;
  hash: string;
}

interface AuditVaultProps {
  logs: AuditRecord[];
}

export const AuditVault: React.FC<AuditVaultProps> = ({ logs }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.chainage.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.zone.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesThreat =
      threatFilter === 'ALL' ||
      log.threatLevel.toLowerCase().includes(threatFilter.toLowerCase());

    return matchesQuery && matchesThreat;
  });

  const downloadCSV = () => {
    const headers = [
      'Timestamp',
      'Chainage',
      'Zone',
      'Threat Level',
      'Threat Index',
      'Visual Match %',
      'Thermal Delta C',
      'Chemical Sniffer PPM',
      'SHA-256 Cryptographic Hash',
    ];

    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.chainage}"`,
      `"${l.zone}"`,
      `"${l.threatLevel}"`,
      l.threatIndex.toFixed(1),
      l.visualMatch.toFixed(1),
      l.thermalDelta.toFixed(1),
      l.chemPpm.toFixed(1),
      `"${l.hash}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VANGUARD_AUDIT_LOG_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#00f3ff] tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00f3ff]" />
            CRYPTOGRAPHIC AUDIT VAULT & FORENSIC MATRIX
          </h3>
          <p className="text-xs text-[#94a3b8]">
            Tamper-proof event chain with SHA-256 checksums per Indian Railways RPF Section 60 evidentiary standards.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-3 py-2 bg-[#0b1626] border border-[#00f3ff] hover:bg-[#00f3ff] hover:text-[#050b14] text-[#00f3ff] rounded text-xs font-bold transition-all"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD AUDIT LOG (CSV)
        </button>
      </div>

      {/* Forensic Comparison Matrix */}
      <div className="bg-[#091220] border border-[#1e293b] rounded p-4">
        <div className="text-xs font-bold text-[#00f3ff] uppercase tracking-wider mb-2 font-mono">
          FORENSIC THREAT CLASSIFICATION CRITERIA
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#94a3b8] text-[11px]">
                <th className="py-2 px-3">Parameter</th>
                <th className="py-2 px-3 text-[#ff0055]">Explosives (Class 1.1: RDX / PETN / TNT)</th>
                <th className="py-2 px-3 text-[#ffaa00]">Narcotics (Schedule I: Opioids / Synthetic)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[11px] text-[#cbd5e1]">
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Molecular Weight</td>
                <td className="py-2 px-3">222.12 g/mol (RDX) · 316.14 g/mol (PETN)</td>
                <td className="py-2 px-3">285.34 g/mol (Morphine) · 336.43 g/mol (Heroin)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Vapor Pressure (25°C)</td>
                <td className="py-2 px-3 text-[#ff0055]">4.0 × 10⁻⁹ mmHg (Ultra-Low Volatility)</td>
                <td className="py-2 px-3 text-[#ffaa00]">1.2 × 10⁻⁶ mmHg (Trace Volatile Plume)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Thermal Exotherm</td>
                <td className="py-2 px-3">High Exothermic Signature (ΔT &gt; 15°C)</td>
                <td className="py-2 px-3">Negligible Thermal Signature (ΔT &lt; 4°C)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Spectroscopic Marker</td>
                <td className="py-2 px-3">NO₂ / Nitramine stretching modes (1580 cm⁻¹)</td>
                <td className="py-2 px-3">Alkaloid tertiary amine / Acetyl ion fragment</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Safe Standoff Distance</td>
                <td className="py-2 px-3 font-bold text-[#ff0055]">150 meters minimum cordon</td>
                <td className="py-2 px-3 font-bold text-[#ffaa00]">Tactical physical containment (5 meters)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#94a3b8]">Indian Railways Protocol</td>
                <td className="py-2 px-3 text-[#ff0055]">Immediate E-Stop, BDDS Bomb Squad Mobilize</td>
                <td className="py-2 px-3 text-[#ffaa00]">RPF Platform Seizure &amp; NCB Chain of Custody</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search chainage, hash, zone..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#091220] border border-[#1e293b] rounded pl-8 pr-3 py-1.5 text-xs font-mono text-[#ffffff] focus:outline-none focus:border-[#00f3ff]"
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-[#64748b] mr-1">FILTER:</span>
          {['ALL', 'NOMINAL', 'NARCOTICS', 'EXPLOSIVE'].map((t) => (
            <button
              key={t}
              onClick={() => setThreatFilter(t)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                threatFilter === t
                  ? 'bg-[#00f3ff] text-[#050b14]'
                  : 'bg-[#091220] text-[#94a3b8] hover:text-[#ffffff]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#091220] border border-[#1e293b] rounded overflow-hidden">
        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead className="bg-[#070e1c] sticky top-0 border-b border-[#1e293b] text-[#94a3b8] text-[11px]">
              <tr>
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Track Chainage</th>
                <th className="py-2 px-3">Zone</th>
                <th className="py-2 px-3">Threat</th>
                <th className="py-2 px-3">MTI</th>
                <th className="py-2 px-3">Visual %</th>
                <th className="py-2 px-3">ΔT</th>
                <th className="py-2 px-3">PPM</th>
                <th className="py-2 px-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748b]">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0c182c] transition-colors">
                    <td className="py-2 px-3 text-[#94a3b8] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2 px-3 text-[#00f3ff] whitespace-nowrap font-semibold">
                      {log.chainage}
                    </td>
                    <td className="py-2 px-3 text-[#cbd5e1] whitespace-nowrap">{log.zone}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.threatLevel === 'Explosive Class 1.1'
                            ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'
                            : log.threatLevel === 'Narcotics'
                            ? 'bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/40'
                            : 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30'
                        }`}
                      >
                        {log.threatLevel}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold whitespace-nowrap">
                      <span
                        className={
                          log.threatIndex > 65
                            ? 'text-[#ff0055]'
                            : log.threatIndex > 30
                            ? 'text-[#ffaa00]'
                            : 'text-[#00ff66]'
                        }
                      >
                        {log.threatIndex.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#38bdf8]">{log.visualMatch.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-[#ffaa00]">+{log.thermalDelta.toFixed(1)}°</td>
                    <td className="py-2 px-3 text-[#00ff66]">{log.chemPpm.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#64748b] hover:text-[#00f3ff] cursor-pointer" title={log.hash}>
                      {log.hash.slice(0, 16)}...{log.hash.slice(-8)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
