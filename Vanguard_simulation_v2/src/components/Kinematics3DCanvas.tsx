import React, { useRef, useEffect, useState } from 'react';
import { KinematicsResult } from '../types';
import { RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface Props {
  kinematics: KinematicsResult;
  ballastRoughness: number;
}

export const Kinematics3DCanvas: React.FC<Props> = ({ kinematics, ballastRoughness }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [azimuth, setAzimuth] = useState<number>(45); // degrees
  const [elevation, setElevation] = useState<number>(28); // degrees
  const [zoom, setZoom] = useState<number>(380);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse drag orbit controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setAzimuth((prev) => (prev + dx * 0.5) % 360);
    setElevation((prev) => Math.max(5, Math.min(85, prev - dy * 0.5)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(200, Math.min(650, prev - e.deltaY * 0.3)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Render loop
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    // 3D to 2D projection function
    const azRad = (azimuth * Math.PI) / 180;
    const elRad = (elevation * Math.PI) / 180;
    const cosAz = Math.cos(azRad);
    const sinAz = Math.sin(azRad);
    const cosEl = Math.cos(elRad);
    const sinEl = Math.sin(elRad);

    const project = (x: number, y: number, z: number): { px: number; py: number; depth: number } => {
      // Rotate around Z axis (azimuth)
      const x1 = cosAz * x - sinAz * y;
      const y1 = sinAz * x + cosAz * y;
      const z1 = z;

      // Rotate around X axis (elevation)
      const x2 = x1;
      const y2 = cosEl * y1 - sinEl * z1;
      const z2 = sinEl * y1 + cosEl * z1;

      // Screen coords (center of canvas)
      const px = width / 2 + x2 * zoom;
      const py = height / 2 - z2 * zoom + 30; // +30 offset for ground perspective
      return { px, py, depth: y2 };
    };

    // 1. Draw 3D Railway Ballast Terrain Mesh
    const gridResX = 14;
    const gridResY = 12;
    const xMin = -0.55;
    const xMax = 0.55;
    const yMin = -0.45;
    const yMax = 0.45;

    ctx.lineWidth = 1;

    for (let i = 0; i < gridResX; i++) {
      for (let j = 0; j < gridResY; j++) {
        const xA = xMin + (i / gridResX) * (xMax - xMin);
        const xB = xMin + ((i + 1) / gridResX) * (xMax - xMin);
        const yA = yMin + (j / gridResY) * (yMax - yMin);
        const yB = yMin + ((j + 1) / gridResY) * (yMax - yMin);

        const zNoise = (x: number, y: number) => {
          return Math.sin(x * 9.0) * Math.cos(y * 7.0) * (ballastRoughness * 0.03);
        };

        const p1 = project(xA, yA, zNoise(xA, yA));
        const p2 = project(xB, yA, zNoise(xB, yA));
        const p3 = project(xB, yB, zNoise(xB, yB));
        const p4 = project(xA, yB, zNoise(xA, yB));

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.lineTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.closePath();

        const shade = 18 + Math.floor((Math.sin(xA * 10 + yA * 10) + 1) * 6);
        ctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 18})`;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();
      }
    }

    // 2. UIC-60 Steel Rails
    const railY = 0.35;
    [-railY, railY].forEach((ry) => {
      const pStart = project(-0.6, ry, 0.02);
      const pEnd = project(0.6, ry, 0.02);
      ctx.beginPath();
      ctx.moveTo(pStart.px, pStart.py);
      ctx.lineTo(pEnd.px, pEnd.py);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Rail highlights
      ctx.beginPath();
      ctx.moveTo(pStart.px, pStart.py - 1);
      ctx.lineTo(pEnd.px, pEnd.py - 1);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 3. Ground Contact Circles with Color-Shift Indicator
    const legKeys = ['FL', 'FR', 'RL', 'RR'] as const;
    legKeys.forEach((key) => {
      const leg = kinematics.legs[key];
      const pFoot = project(leg.foot[0], leg.foot[1], leg.foot[2]);

      let footColor = '#10b981'; // Green stance
      let labelText = 'STANCE';
      if (leg.slipProb > 0.65) {
        footColor = '#ff3366'; // Red slip
        labelText = 'SLIP HAZARD';
      } else if (leg.slipProb > 0.40) {
        footColor = '#f59e0b'; // Amber caution
        labelText = 'ELEVATED';
      }

      // Footpad shadow / contact ring
      ctx.beginPath();
      ctx.arc(pFoot.px, pFoot.py, 9, 0, Math.PI * 2);
      ctx.fillStyle = `${footColor}33`;
      ctx.fill();
      ctx.strokeStyle = footColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner pad
      ctx.beginPath();
      ctx.arc(pFoot.px, pFoot.py, 4, 0, Math.PI * 2);
      ctx.fillStyle = footColor;
      ctx.fill();

      // Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = footColor;
      ctx.fillText(`${key} [${labelText}]`, pFoot.px + 12, pFoot.py + 3);
    });

    // 4. Articulated Legs: Hip -> Knee -> Footpad
    legKeys.forEach((key) => {
      const leg = kinematics.legs[key];
      const pHip = project(leg.hip[0], leg.hip[1], leg.hip[2]);
      const pKnee = project(leg.knee[0], leg.knee[1], leg.knee[2]);
      const pFoot = project(leg.foot[0], leg.foot[1], leg.foot[2]);

      // Thigh segment (Hip -> Knee)
      ctx.beginPath();
      ctx.moveTo(pHip.px, pHip.py);
      ctx.lineTo(pKnee.px, pKnee.py);
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Shank segment (Knee -> Foot)
      ctx.beginPath();
      ctx.moveTo(pKnee.px, pKnee.py);
      ctx.lineTo(pFoot.px, pFoot.py);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Knee Joint actuator servo node
      ctx.beginPath();
      ctx.arc(pKnee.px, pKnee.py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hip Joint node
      ctx.beginPath();
      ctx.arc(pHip.px, pHip.py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#4facfe';
      ctx.fill();
    });

    // 5. Chassis Body Wireframe & Carbon Plate
    const corners = kinematics.bodyCorners.map(([x, y, z]) => project(x, y, z));
    if (corners.length === 8) {
      // Top face
      ctx.beginPath();
      ctx.moveTo(corners[0].px, corners[0].py);
      ctx.lineTo(corners[1].px, corners[1].py);
      ctx.lineTo(corners[2].px, corners[2].py);
      ctx.lineTo(corners[3].px, corners[3].py);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bottom face
      ctx.beginPath();
      ctx.moveTo(corners[4].px, corners[4].py);
      ctx.lineTo(corners[5].px, corners[5].py);
      ctx.lineTo(corners[6].px, corners[6].py);
      ctx.lineTo(corners[7].px, corners[7].py);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vertical pillars
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(corners[k].px, corners[k].py);
        ctx.lineTo(corners[k + 4].px, corners[k + 4].py);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 6. Center of Mass (COM) Diamond
    const pCOM = project(kinematics.com[0], kinematics.com[1], kinematics.com[2]);
    ctx.beginPath();
    ctx.moveTo(pCOM.px, pCOM.py - 8);
    ctx.lineTo(pCOM.px + 7, pCOM.py);
    ctx.lineTo(pCOM.px, pCOM.py + 8);
    ctx.lineTo(pCOM.px - 7, pCOM.py);
    ctx.closePath();
    ctx.fillStyle = '#ff3366';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ff3366';
    ctx.fillText('COM (Z-Reflex)', pCOM.px + 10, pCOM.py - 6);

    // Orientation compass HUD in corner
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Azimuth: ${azimuth.toFixed(1)}° | Elevation: ${elevation.toFixed(1)}° | Zoom: ${zoom}`, 16, height - 16);
  }, [kinematics, ballastRoughness, azimuth, elevation, zoom]);

  return (
    <div className="relative w-full rounded-lg border border-slate-800 bg-[#080c14] overflow-hidden shadow-2xl">
      {/* HUD Header Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700/60 font-mono text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>12-DOF HIGH-FIDELITY TWIN</span>
        <span className="text-cyan-400">| 1000 Hz CLOSED-LOOP</span>
      </div>

      {/* Orbit & Zoom Controls Floating Palette */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-md border border-slate-700/60 text-slate-300">
        <button
          onClick={() => setZoom((prev) => Math.min(650, prev + 40))}
          title="Zoom In"
          className="p-1 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(200, prev - 40))}
          title="Zoom Out"
          className="p-1 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setAzimuth(45);
            setElevation(28);
            setZoom(380);
          }}
          title="Reset Camera View"
          className="p-1 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-[520px] cursor-grab active:cursor-grabbing block"
      />

      {/* Footer Instructions */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none text-right font-mono text-[11px] text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
        Drag to Orbit (360°) • Scroll to Zoom • Reflex Ground Follower Active
      </div>
    </div>
  );
};
