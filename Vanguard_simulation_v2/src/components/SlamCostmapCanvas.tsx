import React, { useRef, useEffect, useState } from 'react';
import { Compass, Shield, Navigation } from 'lucide-react';

interface Props {
  threatScore: number;
}

export const SlamCostmapCanvas: React.FC<Props> = ({ threatScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [showInflation, setShowInflation] = useState<boolean>(true);
  const [showLidarBeams, setShowLidarBeams] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Coordinate conversion: World coords (x: -4 to 8, y: -2.5 to 2.5) to Canvas (0..width, 0..height)
    const xMin = -3.5;
    const xMax = 7.5;
    const yMin = -2.2;
    const yMax = 2.2;

    const toCanvas = (wx: number, wy: number) => {
      const cx = ((wx - xMin) / (xMax - xMin)) * width;
      const cy = height - ((wy - yMin) / (yMax - yMin)) * height;
      return { cx, cy };
    };

    // Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (1 meter resolution)
    ctx.strokeStyle = '#121926';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const p1 = toCanvas(x, yMin);
      const p2 = toCanvas(x, yMax);
      ctx.beginPath();
      ctx.moveTo(p1.cx, p1.cy);
      ctx.lineTo(p2.cx, p2.cy);
      ctx.stroke();

      // Axis labels
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(`${x}m`, p1.cx + 2, height - 6);
    }

    for (let y = -2; y <= 2; y++) {
      const p1 = toCanvas(xMin, y);
      const p2 = toCanvas(xMax, y);
      ctx.beginPath();
      ctx.moveTo(p1.cx, p1.cy);
      ctx.lineTo(p2.cx, p2.cy);
      ctx.stroke();

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(`${y > 0 ? '+' : ''}${y}m`, 6, p1.cy - 4);
    }

    // Tunnel walls (synthetic LiDAR point clusters)
    ctx.fillStyle = '#334155';
    for (let x = -3.5; x <= 7.5; x += 0.1) {
      const jitterL = Math.sin(x * 14) * 0.04;
      const jitterR = Math.cos(x * 12) * 0.04;
      const pL = toCanvas(x, 2.0 + jitterL);
      const pR = toCanvas(x, -2.0 + jitterR);

      ctx.beginPath();
      ctx.arc(pL.cx, pL.cy, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pR.cx, pR.cy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Steel Rails UIC-60
    [-0.75, 0.75].forEach((ry) => {
      const p1 = toCanvas(-3.5, ry);
      const p2 = toCanvas(7.5, ry);
      ctx.beginPath();
      ctx.moveTo(p1.cx, p1.cy);
      ctx.lineTo(p2.cx, p2.cy);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Railway Sleepers (Ties)
    for (let x = -3.0; x <= 7.0; x += 0.6) {
      const p1 = toCanvas(x, -0.9);
      const p2 = toCanvas(x, 0.9);
      ctx.beginPath();
      ctx.moveTo(p1.cx, p1.cy);
      ctx.lineTo(p2.cx, p2.cy);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Train Bogie Obstacles
    const bogieObstacles = [
      { x: 1.5, y: 0.85, name: 'Wheel FL' },
      { x: 1.5, y: -0.85, name: 'Wheel FR' },
      { x: 3.8, y: 0.85, name: 'Wheel RL' },
      { x: 3.8, y: -0.85, name: 'Wheel RR' },
      { x: 2.65, y: 0.0, name: 'Traction Motor Bogie Center' },
    ];

    // Costmap Inflation Disks (0.45m radius)
    if (showInflation) {
      bogieObstacles.forEach((obs) => {
        const p = toCanvas(obs.x, obs.y);
        const pEdge = toCanvas(obs.x + 0.48, obs.y);
        const radius = Math.abs(pEdge.cx - p.cx);

        // Outer inflation gradient
        const grad = ctx.createRadialGradient(p.cx, p.cy, 4, p.cx, p.cy, radius);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.12)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

        ctx.beginPath();
        ctx.arc(p.cx, p.cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Render Bogie Obstacle Markers
    bogieObstacles.forEach((obs) => {
      const p = toCanvas(obs.x, obs.y);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(p.cx - 7, p.cy - 7, 14, 14);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.cx - 7, p.cy - 7, 14, 14);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(obs.name, p.cx - 24, p.cy - 12);
    });

    // Suspect Anomaly Point (if elevated)
    if (threatScore > 0.40) {
      const pAnomaly = toCanvas(2.65, -0.3);
      ctx.beginPath();
      ctx.arc(pAnomaly.cx, pAnomaly.cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3366';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing alert ring
      ctx.beginPath();
      ctx.arc(pAnomaly.cx, pAnomaly.cy, 18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ff3366';
      ctx.fillText('SUSPECT ANOMALY (EOD TARGET)', pAnomaly.cx - 65, pAnomaly.cy + 24);
    }

    // Quadruped Robot Current Pose at (0.0, 0.0)
    const pRobot = toCanvas(0.0, 0.0);

    // Synthetic LiDAR Beams (Fan)
    if (showLidarBeams) {
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.lineWidth = 1;
      const numBeams = 36;
      for (let b = 0; b < numBeams; b++) {
        const angle = -Math.PI / 3 + (b / numBeams) * ((2 * Math.PI) / 3);
        const maxR = 3.5;
        const targetX = maxR * Math.cos(angle);
        const targetY = maxR * Math.sin(angle);
        const pBeam = toCanvas(targetX, targetY);

        ctx.beginPath();
        ctx.moveTo(pRobot.cx, pRobot.cy);
        ctx.lineTo(pBeam.cx, pBeam.cy);
        ctx.stroke();
      }
    }

    // Robot crosshair / avatar
    ctx.beginPath();
    ctx.arc(pRobot.cx, pRobot.cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Robot heading vector
    ctx.beginPath();
    ctx.moveTo(pRobot.cx, pRobot.cy);
    ctx.lineTo(pRobot.cx + 20, pRobot.cy);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('VANGUARD (0.0, 0.0)', pRobot.cx - 45, pRobot.cy - 16);

    // Nav2 Planned Trajectory with Dynamic Evasion Offset
    const evasionShift = threatScore > 0.40 ? -0.45 : 0.0;
    const waypoints = [
      { x: -2.5, y: 0.0 },
      { x: -1.0, y: 0.0 },
      { x: 0.0, y: 0.0 },
      { x: 1.2, y: 0.15 + evasionShift },
      { x: 2.65, y: 0.40 + evasionShift },
      { x: 4.2, y: 0.0 },
      { x: 6.0, y: 0.0 },
    ];

    ctx.beginPath();
    waypoints.forEach((wp, idx) => {
      const p = toCanvas(wp.x, wp.y);
      if (idx === 0) ctx.moveTo(p.cx, p.cy);
      else ctx.lineTo(p.cx, p.cy);
    });
    ctx.strokeStyle = threatScore > 0.70 ? '#ff3366' : '#00f2fe';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trajectory Waypoint dots
    waypoints.forEach((wp) => {
      const p = toCanvas(wp.x, wp.y);
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

  }, [threatScore, showInflation, showLidarBeams]);

  return (
    <div className="space-y-4">
      {/* Controls & Metrics Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121926] rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            ROS 2 NAV2 DYNAMIC COSTMAP (TUNNEL CARTOGRAPHER)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
            LIO-SAM 200 Hz
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showInflation}
              onChange={(e) => setShowInflation(e.target.checked)}
              className="accent-cyan-400"
            />
            Inflation Layers
          </label>
          <label className="flex items-center gap-1.5 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showLidarBeams}
              onChange={(e) => setShowLidarBeams(e.target.checked)}
              className="accent-cyan-400"
            />
            LiDAR Rays
          </label>
        </div>
      </div>

      {/* Main SLAM Canvas */}
      <div className="relative rounded-lg border border-slate-800 bg-[#080c14] overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-[440px] block"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#0d1422]/90 backdrop-blur-md p-2.5 rounded border border-slate-800 font-mono text-[10px] space-y-1 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Robot Pose (VANGUARD)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
            <span>Bogie Undercarriage Hardware (Cost Inflation: 0.45m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
            <span>Nav2 Planned Safe Evasion Trajectory</span>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-[#0d1422]/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 font-mono text-xs text-slate-300">
          <span className="text-slate-400">Bogie Clearance:</span>{' '}
          <span className="text-emerald-400 font-bold">0.18 m (Reflex Stance)</span>
        </div>
      </div>
    </div>
  );
};
