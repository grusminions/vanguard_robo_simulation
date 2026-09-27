import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  Maximize2,
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { playDeployCountermeasure, playTacticalBlip } from '../utils/audio';

interface ThermalViewportProps {
  activeThreat: string;
  thermalDelta: number;
  visualMatch: number;
  chemPpm: number;
  compact?: boolean;
}

type PaletteType = 'IRONBOW' | 'RAINBOW' | 'NVG' | 'DAYLIGHT';

interface ComponentHotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  temp: number;
  desc: string;
}

export const ThermalViewport: React.FC<ThermalViewportProps> = ({
  activeThreat,
  thermalDelta,
  visualMatch,
  chemPpm,
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [palette, setPalette] = useState<PaletteType>('IRONBOW');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedHotspot, setSelectedHotspot] = useState<ComponentHotspot | null>(null);
  const [countermeasureActive, setCountermeasureActive] = useState<boolean>(false);
  const [disruptorParticles, setDisruptorParticles] = useState<{ x: number; y: number; alpha: number }[]>([]);

  // Hotspots definition for clickable inspection
  const hotspots: ComponentHotspot[] = [
    {
      id: 'axle1',
      name: 'Leading Wheelset Axle 01',
      x: 180,
      y: 220,
      w: 80,
      h: 80,
      temp: 54.2,
      desc: 'Spherical roller bearing box. Bearing race within nominal temperature limits.',
    },
    {
      id: 'brake1',
      name: 'Axle 01 Brake Disc Caliper',
      x: 140,
      y: 240,
      w: 60,
      h: 90,
      temp: 68.5,
      desc: 'Pneumatic disc brake pad. Frictional thermal dissipation detected.',
    },
    {
      id: 'axle2',
      name: 'Trailing Wheelset Axle 02',
      x: 520,
      y: 220,
      w: 80,
      h: 80,
      temp: 52.8,
      desc: 'Axle box temperature calibrated to ambient track conditions.',
    },
    {
      id: 'bolster',
      name: 'LHB Bogie Main Bolster',
      x: 310,
      y: 160,
      w: 160,
      h: 60,
      temp: 34.0,
      desc: 'Heavy cast-steel frame bolster supporting coach suspension.',
    },
    {
      id: 'threat_zone',
      name: activeThreat === 'Explosive Class 1.1' ? '⚠️ IED BLAST HAZARD' : activeThreat === 'Narcotics' ? '⚠️ NARCOTICS VAPOR PLUME' : 'Undercarriage Plenum',
      x: 340,
      y: 210,
      w: 100,
      h: 90,
      temp: 32.0 + thermalDelta + (activeThreat === 'Explosive Class 1.1' ? 22 : 4),
      desc: activeThreat === 'Explosive Class 1.1' ? 'High exothermic anomalous payload detected on center draft sill.' : activeThreat === 'Narcotics' ? 'Schedule I volatile alkaloid vapor leakage detected.' : 'Clear compartment structure.',
    },
  ];

  // Deploy Countermeasure Action
  const handleDeployCountermeasure = () => {
    playDeployCountermeasure();
    setCountermeasureActive(true);
    // Create flash particles
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: 390 + (Math.random() * 80 - 40),
        y: 250 + (Math.random() * 80 - 40),
        alpha: 1.0,
      });
    }
    setDisruptorParticles(particles);
    setTimeout(() => {
      setCountermeasureActive(false);
    }, 1800);
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Base background tone based on palette
      if (palette === 'IRONBOW') ctx.fillStyle = '#06030a';
      else if (palette === 'RAINBOW') ctx.fillStyle = '#020617';
      else if (palette === 'NVG') ctx.fillStyle = '#021206';
      else ctx.fillStyle = '#0b1626'; // DAYLIGHT
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      // Apply zoom transform centered
      if (zoomLevel > 1) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-w / 2, -h / 2);
      }

      // ==============================================
      // 1. RENDER INDIAN RAILWAYS LHB COACH UNDERCARRIAGE
      // ==============================================

      // Heavy Coach Chassis Floor Silhouettes (Dark Steel)
      ctx.fillStyle = palette === 'DAYLIGHT' ? '#1e293b' : palette === 'NVG' ? '#072412' : '#140c1d';
      ctx.fillRect(40, 70, w - 80, 50);

      // Bogie Center Bolster & Cross-beams
      ctx.fillStyle = palette === 'DAYLIGHT' ? '#334155' : palette === 'NVG' ? '#0d381c' : '#221230';
      ctx.fillRect(120, 120, w - 240, 45);

      // Central draft gear & coupler hook
      ctx.fillStyle = palette === 'DAYLIGHT' ? '#475569' : palette === 'NVG' ? '#144d28' : '#2f1842';
      ctx.fillRect(w / 2 - 25, 60, 50, 80);

      // Rails in undercarriage view (UIC-60 bottom head lines)
      ctx.strokeStyle = palette === 'DAYLIGHT' ? '#64748b' : palette === 'NVG' ? '#1f7a3f' : '#4a256a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 360); ctx.lineTo(w, 360);
      ctx.stroke();

      // Train Wheel 1 (Left 920mm Forged Steel Wheel) & Brake Rotor
      const wheel1X = 210;
      const wheel2X = 560;
      const wheelY = 270;

      [wheel1X, wheel2X].forEach((wx, idx) => {
        // Steel Wheel Rim
        ctx.strokeStyle = palette === 'DAYLIGHT' ? '#94a3b8' : palette === 'NVG' ? '#55ff88' : '#6b2d8f';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(wx, wheelY, 75, 0, Math.PI * 2);
        ctx.stroke();

        // Axle Core
        ctx.fillStyle = palette === 'DAYLIGHT' ? '#64748b' : palette === 'NVG' ? '#1b5e33' : '#3c1854';
        ctx.beginPath();
        ctx.arc(wx, wheelY, 26, 0, Math.PI * 2);
        ctx.fill();

        // BRAKE DISC THERMAL GLOW (Friction Heat Anomaly ~65°C)
        const brakeRotorGrad = ctx.createRadialGradient(wx, wheelY, 15, wx, wheelY, 95);
        if (palette === 'IRONBOW') {
          brakeRotorGrad.addColorStop(0, '#ffffff');
          brakeRotorGrad.addColorStop(0.2, '#ffcc00');
          brakeRotorGrad.addColorStop(0.55, '#ff2200');
          brakeRotorGrad.addColorStop(0.85, '#770055');
          brakeRotorGrad.addColorStop(1, 'transparent');
        } else if (palette === 'RAINBOW') {
          brakeRotorGrad.addColorStop(0, '#ffffff');
          brakeRotorGrad.addColorStop(0.25, '#ff0000');
          brakeRotorGrad.addColorStop(0.55, '#ffff00');
          brakeRotorGrad.addColorStop(0.85, '#00ff66');
          brakeRotorGrad.addColorStop(1, 'transparent');
        } else if (palette === 'NVG') {
          brakeRotorGrad.addColorStop(0, '#ffffff');
          brakeRotorGrad.addColorStop(0.3, '#55ff88');
          brakeRotorGrad.addColorStop(0.7, '#1b5e33');
          brakeRotorGrad.addColorStop(1, 'transparent');
        } else {
          // DAYLIGHT: metallic glowing rotor with red-hot ring
          brakeRotorGrad.addColorStop(0, '#ffaa00');
          brakeRotorGrad.addColorStop(0.35, '#ff3300');
          brakeRotorGrad.addColorStop(0.7, 'transparent');
        }

        ctx.fillStyle = brakeRotorGrad;
        ctx.beginPath();
        ctx.arc(wx, wheelY, 95, 0, Math.PI * 2);
        ctx.fill();

        // Suspension Helical Spring Coils
        ctx.strokeStyle = palette === 'DAYLIGHT' ? '#38bdf8' : palette === 'NVG' ? '#22c55e' : '#ffaa00';
        ctx.lineWidth = 3.5;
        for (let s = 0; s < 5; s++) {
          const sy = 145 + s * 14;
          ctx.beginPath();
          ctx.moveTo(wx - 48, sy);
          ctx.lineTo(wx - 28, sy + 7);
          ctx.lineTo(wx - 48, sy + 14);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(wx + 28, sy);
          ctx.lineTo(wx + 48, sy + 7);
          ctx.lineTo(wx + 28, sy + 14);
          ctx.stroke();
        }
      });

      // Air brake pneumatic pipes & reservoir tank
      ctx.strokeStyle = palette === 'DAYLIGHT' ? '#ef4444' : palette === 'NVG' ? '#4ade80' : '#00f3ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 115);
      ctx.bezierCurveTo(240, 130, 480, 125, w - 60, 115);
      ctx.stroke();

      // ==============================================
      // 2. DYNAMIC THREAT HEATMAP & PARTICLE SYNTHESIS
      // ==============================================
      const threatX = 390;
      const threatY = 250;

      if (activeThreat === 'Explosive Class 1.1') {
        // High thermal exothermic anomaly (RDX / TNT Booster Pack)
        const pulse = Math.sin(tick * 0.08) * 10;
        const radius = 80 + pulse;

        const explosiveGrad = ctx.createRadialGradient(threatX, threatY, 5, threatX, threatY, radius);
        if (palette === 'IRONBOW') {
          explosiveGrad.addColorStop(0, '#ffffff');
          explosiveGrad.addColorStop(0.2, '#ff0055');
          explosiveGrad.addColorStop(0.5, '#ff5500');
          explosiveGrad.addColorStop(0.85, '#990033');
          explosiveGrad.addColorStop(1, 'transparent');
        } else if (palette === 'RAINBOW') {
          explosiveGrad.addColorStop(0, '#ffffff');
          explosiveGrad.addColorStop(0.3, '#ff0000');
          explosiveGrad.addColorStop(0.65, '#ffaa00');
          explosiveGrad.addColorStop(1, 'transparent');
        } else if (palette === 'NVG') {
          explosiveGrad.addColorStop(0, '#ffffff');
          explosiveGrad.addColorStop(0.35, '#86efac');
          explosiveGrad.addColorStop(0.7, '#15803d');
          explosiveGrad.addColorStop(1, 'transparent');
        } else {
          explosiveGrad.addColorStop(0, '#ffffff');
          explosiveGrad.addColorStop(0.3, '#ff0055');
          explosiveGrad.addColorStop(0.7, '#ffaa00');
          explosiveGrad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = explosiveGrad;
        ctx.beginPath();
        ctx.arc(threatX, threatY, radius, 0, Math.PI * 2);
        ctx.fill();

        // High-Vis Tactical Threat Lock Box
        const bx = threatX - 55;
        const by = threatY - 45;
        const bw = 110;
        const bh = 90;

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner tick brackets
        const cLen = 16;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(bx, by + cLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cLen, by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + bh - cLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cLen, by + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cLen); ctx.stroke();

        // Tactical Banner Tag
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(bx - 10, by - 26, 310, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(`🚨 TARGET LOCK: CLASS 1.1 EXPLOSIVE [${visualMatch.toFixed(0)}%]`, bx - 4, by - 9);

        // Subtext Readout
        ctx.fillStyle = '#ffaacc';
        ctx.font = '11px monospace';
        ctx.fillText(`ΔT: +${thermalDelta.toFixed(1)}°C | NO₂: ${chemPpm.toFixed(0)} PPM | EXOTHERM SPIKE`, bx - 8, by + bh + 18);
      } else if (activeThreat === 'Narcotics') {
        // Schedule I Contraband Vapor Plume (Volatile plume wafting up)
        const plumeGrad = ctx.createRadialGradient(threatX, threatY, 8, threatX, threatY, 65);
        plumeGrad.addColorStop(0, '#ffff55');
        plumeGrad.addColorStop(0.35, '#ffaa00');
        plumeGrad.addColorStop(0.75, '#774400');
        plumeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = plumeGrad;
        ctx.beginPath();
        ctx.arc(threatX, threatY, 65, 0, Math.PI * 2);
        ctx.fill();

        // Amber Box
        const bx = threatX - 50;
        const by = threatY - 40;
        const bw = 100;
        const bh = 80;

        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(bx - 8, by - 24, 280, 22);
        ctx.fillStyle = '#050b14';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`⚠️ CONTRABAND: SCHEDULE I NARCOTICS`, bx - 2, by - 8);

        ctx.fillStyle = '#ffdd88';
        ctx.font = '10px monospace';
        ctx.fillText(`OP: ${chemPpm.toFixed(0)} PPM | ALKALOID VOLATILE DETECTED`, bx - 6, by + bh + 16);
      }

      // Countermeasure Beam Effect (Disruptor / Marking Gel)
      if (countermeasureActive) {
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w / 2, h);
        ctx.lineTo(threatX, threatY);
        ctx.stroke();

        // Expanding Shockwave Ring
        const shockRad = (tick % 30) * 4;
        ctx.strokeStyle = `rgba(0, 243, 255, ${1.0 - shockRad / 120})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(threatX, threatY, shockRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Aiming Reticle
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.strokeStyle = palette === 'NVG' ? 'rgba(85, 255, 136, 0.8)' : 'rgba(0, 243, 255, 0.8)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 60, cy); ctx.lineTo(cx - 15, cy);
      ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 60, cy);
      ctx.moveTo(cx, cy - 60); ctx.lineTo(cx, cy - 15);
      ctx.moveTo(cx, cy + 15); ctx.lineTo(cx, cy + 60);
      ctx.stroke();

      ctx.restore();

      // Scanline CRT Overlay (for authentic tactical HUD monitor look)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [palette, zoomLevel, activeThreat, thermalDelta, visualMatch, chemPpm, countermeasureActive]);

  // Handle canvas click to select hotspot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked inside any hotspot
    const found = hotspots.find(
      (h) =>
        clickX >= h.x - 20 &&
        clickX <= h.x + h.w + 20 &&
        clickY >= h.y - 20 &&
        clickY <= h.y + h.h + 20
    );

    if (found) {
      playTacticalBlip(900, 0.08, 'sine');
      setSelectedHotspot(found);
    } else {
      setSelectedHotspot(null);
    }
  };

  return (
    <div className="space-y-2 font-mono">
      {/* Top Header & Tactical Controls (Shown when not compact) */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#00f3ff] tracking-wide flex items-center gap-2 font-['Chakra_Petch']">
              <Flame className="w-5 h-5 text-[#ff0055]" />
              AR VIEWPORT &amp; RADIOMETRIC FLIR SCANNER
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Forward infrared optics focused on passenger coach bogies, wheelsets, and brake calipers.
            </p>
          </div>

          {/* Palette Switcher & Zoom */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#091220] p-1 border border-[#1e293b] rounded-lg">
              {(['IRONBOW', 'RAINBOW', 'NVG', 'DAYLIGHT'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                    palette === p
                      ? 'bg-[#00f3ff] text-[#050b14] shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                      : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#091220] p-1 border border-[#1e293b] rounded-lg">
              {[1, 2, 4].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                    zoomLevel === z
                      ? 'bg-[#ffaa00] text-[#050b14]'
                      : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Screen */}
      <div className={compact ? 'relative' : 'grid grid-cols-1 lg:grid-cols-4 gap-3'}>
        {/* Main Canvas Screen */}
        <div className={`${compact ? 'w-full' : 'lg:col-span-3'} relative rounded-lg border border-[#1e293b] bg-[#050b14] overflow-hidden shadow-2xl`}>
          <canvas
            ref={canvasRef}
            width={720}
            height={360}
            onClick={handleCanvasClick}
            className="w-full h-[360px] block cursor-crosshair"
          />

          {/* Top Left Controls & Mode */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
            <div className="bg-[#050b14]/85 border border-[#1e293b] rounded-md px-2.5 py-1.5 text-[11px] backdrop-blur-sm pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-pulse" />
                <span className="text-[#00f3ff] font-bold">FLIR LWIR HD</span>
                <span className="text-[#64748b]">·</span>
                <span className="text-[#ffffff]">60 FPS</span>
              </div>
            </div>

            {/* Quick Palette Toggles for Compact View */}
            <div className="flex items-center gap-1 bg-[#050b14]/85 border border-[#1e293b] rounded-md p-1 backdrop-blur-sm">
              {(['IRONBOW', 'NVG', 'DAYLIGHT'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    palette === p
                      ? 'bg-[#00f3ff] text-[#050b14]'
                      : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Thermal Calibration Color Bar (Right Margin) */}
          <div className="absolute right-2.5 top-8 bottom-8 w-6 flex flex-col items-center justify-between text-[9px] text-[#94a3b8] bg-[#050b14]/80 border border-[#1e293b] rounded py-1 px-0.5 pointer-events-none">
            <span className="text-[#ffffff] font-bold">75°</span>
            <div
              className="w-2 flex-1 my-1 rounded-sm shadow-inner"
              style={{
                background:
                  palette === 'IRONBOW'
                    ? 'linear-gradient(to bottom, #ffffff, #ffcc00, #ff0055, #880055, #21102b, #070a14)'
                    : palette === 'RAINBOW'
                    ? 'linear-gradient(to bottom, #ffffff, #ff0000, #ffff00, #00ff66, #00f3ff, #0000ff)'
                    : palette === 'NVG'
                    ? 'linear-gradient(to bottom, #ffffff, #86efac, #22c55e, #14532d, #021206)'
                    : 'linear-gradient(to bottom, #ffffff, #ffaa00, #ff3300, #334155, #0b1626)',
              }}
            />
            <span className="text-[#94a3b8]">28°</span>
          </div>

          {/* Bottom Bar: Quick Action Buttons & Interactive Target Hint */}
          <div className="absolute bottom-2.5 left-2.5 right-10 flex items-center justify-between pointer-events-none">
            <div className="bg-[#050b14]/90 border border-[#1e293b] rounded px-2.5 py-1 text-[11px] text-[#cbd5e1] backdrop-blur-sm pointer-events-auto flex items-center gap-2">
              <span className="hidden sm:inline">Click wheels/axles to inspect</span>
              <span className="hidden sm:inline text-[#64748b]">|</span>
              <span>PEAK TEMP: <b className="text-[#ff0055]">{(32.0 + thermalDelta + 22.0).toFixed(1)} °C</b></span>
            </div>

            {/* Countermeasure Disruptor Action Button */}
            {activeThreat !== 'Nominal' && (
              <button
                onClick={handleDeployCountermeasure}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#ff0055] hover:bg-[#ff3377] text-white rounded text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,0,85,0.7)] pointer-events-auto animate-pulse"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>DISARM / GEL COAT</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Inspection Panel (Shown only when not compact) */}
        {!compact && (
          <div className="space-y-3 text-xs">
            {/* Selected Hotspot Card */}
            <div className="bg-[#091220] border border-[#00f3ff]/40 rounded-lg p-3.5 shadow-lg">
              <div className="text-[10px] text-[#00f3ff] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                HOTSPOT FORENSIC INSPECTION
              </div>

              {selectedHotspot ? (
                <div className="space-y-2 mt-2">
                  <div className="text-sm font-bold text-[#ffffff]">{selectedHotspot.name}</div>
                  <div className="text-base font-bold text-[#ffaa00] font-mono">
                    {selectedHotspot.temp.toFixed(1)} °C
                  </div>
                  <div className="text-[11px] text-[#cbd5e1] leading-relaxed">
                    {selectedHotspot.desc}
                  </div>
                  <div className="pt-2 border-t border-[#1e293b] text-[10px] text-[#94a3b8] space-y-0.5">
                    <div>Emissivity ε: 0.95 (High Carbon Cast Steel)</div>
                    <div>Laser Rangefinder: 1.84 m ± 2mm</div>
                    <div>Status: <span className={selectedHotspot.temp > 60 ? 'text-[#ff0055] font-bold' : 'text-[#00ff66]'}>
                      {selectedHotspot.temp > 60 ? 'EXOTHERMIC WARNING' : 'WITHIN THERMAL ENVELOPE'}
                    </span></div>
                  </div>
                </div>
              ) : (
                <div className="text-[#94a3b8] py-4 text-center leading-relaxed">
                  Click on the wheels, brake rotors, bolster, or threat box in the viewport above to inspect component telemetry.
                </div>
              )}
            </div>

            {/* Quick Target Summary Card */}
            <div className="bg-[#091220] border border-[#1e293b] rounded-lg p-3.5 space-y-2">
              <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">
                CLASSIFICATION STATUS
              </div>
              <div
                className={`text-sm font-bold ${
                  activeThreat === 'Explosive Class 1.1'
                    ? 'text-[#ff0055]'
                    : activeThreat === 'Narcotics'
                    ? 'text-[#ffaa00]'
                    : 'text-[#00ff66]'
                }`}
              >
                {activeThreat === 'Nominal' ? 'SECTOR NOMINAL' : activeThreat.toUpperCase()}
              </div>
              <div className="text-[11px] text-[#cbd5e1] space-y-1">
                <div>Visual Confidence: <span className="text-[#00f3ff] font-bold">{visualMatch.toFixed(1)}%</span></div>
                <div>Thermal Delta ΔT: <span className="text-[#ffaa00] font-bold">+{thermalDelta.toFixed(1)} °C</span></div>
                <div>Chemical Sniffer: <span className="text-[#00ff66] font-bold">{chemPpm.toFixed(1)} PPM</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
