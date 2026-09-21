import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gamepad2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
  Eye,
  Flame,
  Radio,
  Wind,
  ShieldAlert,
  Battery,
  Wifi,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Crosshair,
  Volume2,
} from 'lucide-react';

export const VirtualSimulation: React.FC = () => {
  // Robot Position & Pose State
  const [posX, setPosX] = useState<number>(0.0);
  const [posY, setPosY] = useState<number>(-0.4);
  const [yaw, setYaw] = useState<number>(0); // degrees
  const [isCrouched, setIsCrouched] = useState<boolean>(false);

  // Sensor Toggles
  const [snifferActive, setSnifferActive] = useState<boolean>(true);
  const [lidarActive, setLidarActive] = useState<boolean>(true);
  const [thermalOverlay, setThermalOverlay] = useState<boolean>(false);

  // Mission State
  const [deepScanExecuted, setDeepScanExecuted] = useState<boolean>(false);
  const [battery, setBattery] = useState<number>(94.5);
  const [wpPlatform, setWpPlatform] = useState<boolean>(false);
  const [wpTrack1, setWpTrack1] = useState<boolean>(true);
  const [wpBogie, setWpBogie] = useState<boolean>(false);

  // Target coordinates (under freight carriage)
  const targetX = 3.8;
  const targetY = 1.4;

  // Distance to target
  const distToTarget = useMemo(() => {
    return Math.sqrt((posX - targetX) ** 2 + (posY - targetY) ** 2);
  }, [posX, posY]);

  const inTargetRange = distToTarget <= 2.2;
  const inTunnel = posX >= 5.5;

  // Comm signal dBm
  const commDbm = inTunnel ? -96 : -48;
  const commPercent = inTunnel ? 28 : 98;

  // Sector Clearance %
  const sectorClearance = useMemo(() => {
    let score = 0;
    if (wpPlatform) score += 33;
    if (wpTrack1) score += 33;
    if (wpBogie) score += 34;
    return score;
  }, [wpPlatform, wpTrack1, wpBogie]);

  // Update waypoints on movement
  useEffect(() => {
    if (posY <= -1.8) {
      setWpPlatform(true);
    }
    if (posX >= -3.0 && posX <= 3.0 && posY >= -0.8 && posY <= 0.2) {
      setWpTrack1(true);
    }
  }, [posX, posY]);

  // Movement Handlers
  const moveForward = () => {
    const rad = (yaw * Math.PI) / 180;
    setPosX((x) => Math.max(-7.5, Math.min(9.5, x + Math.cos(rad) * 0.7)));
    setPosY((y) => Math.max(-4.0, Math.min(3.5, y + Math.sin(rad) * 0.7)));
    setBattery((b) => Math.max(10, b - 0.15));
  };

  const moveBackward = () => {
    const rad = (yaw * Math.PI) / 180;
    setPosX((x) => Math.max(-7.5, Math.min(9.5, x - Math.cos(rad) * 0.7)));
    setPosY((y) => Math.max(-4.0, Math.min(3.5, y - Math.sin(rad) * 0.7)));
    setBattery((b) => Math.max(10, b - 0.15));
  };

  const strafeLeft = () => {
    const rad = ((yaw - 90) * Math.PI) / 180;
    setPosX((x) => Math.max(-7.5, Math.min(9.5, x + Math.cos(rad) * 0.6)));
    setPosY((y) => Math.max(-4.0, Math.min(3.5, y + Math.sin(rad) * 0.6)));
    setBattery((b) => Math.max(10, b - 0.15));
  };

  const strafeRight = () => {
    const rad = ((yaw + 90) * Math.PI) / 180;
    setPosX((x) => Math.max(-7.5, Math.min(9.5, x + Math.cos(rad) * 0.6)));
    setPosY((y) => Math.max(-4.0, Math.min(3.5, y + Math.sin(rad) * 0.6)));
    setBattery((b) => Math.max(10, b - 0.15));
  };

  const rotateLeft = () => setYaw((y) => (y - 25 + 360) % 360);
  const rotateRight = () => setYaw((y) => (y + 25) % 360);

  const toggleCrouch = () => setIsCrouched((c) => !c);

  const resetPosition = () => {
    setPosX(0.0);
    setPosY(-0.4);
    setYaw(0);
    setIsCrouched(false);
  };

  const executeDeepDiagnostic = () => {
    setIsCrouched(true);
    setDeepScanExecuted(true);
    setWpBogie(true);
    setBattery((b) => Math.max(10, b - 1.2));
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveForward();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveBackward();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        strafeLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        strafeRight();
      } else if (e.key === 'q' || e.key === 'Q') {
        rotateLeft();
      } else if (e.key === 'e' || e.key === 'E') {
        rotateRight();
      } else if (e.key === 'c' || e.key === 'C') {
        toggleCrouch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [yaw]);

  // Canvas 3D Perspective Projection Renderer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = thermalOverlay ? '#050814' : '#080c14';
      ctx.fillRect(0, 0, width, height);

      // Camera view setup
      // Centered slightly behind or following the robot or isometric station perspective
      // Isometric 3D Projection parameters:
      const originX = width * 0.46;
      const originY = height * 0.52;
      const scale = Math.min(width, height) / 19;

      // Project 3D World (X: longitudinal, Y: lateral, Z: elevation) to 2D screen
      // Isometric view: X goes down-right, Y goes down-left, Z goes straight up
      const isoAngle = Math.PI / 6; // 30 deg
      const cosA = Math.cos(isoAngle);
      const sinA = Math.sin(isoAngle);

      const project = (x: number, y: number, z: number) => {
        // Translate world relative to a station center (X=1.0, Y=-0.2)
        const wx = x - 1.0;
        const wy = y - -0.2;
        const screenX = originX + (wx * cosA - wy * cosA) * scale;
        const screenY = originY + (wx * sinA + wy * sinA) * scale - z * scale * 1.4;
        return { x: screenX, y: screenY };
      };

      // 1. Render Ground / Ballast Plane
      ctx.beginPath();
      const p1 = project(-8.5, -4.5, -0.05);
      const p2 = project(10.5, -4.5, -0.05);
      const p3 = project(10.5, 3.8, -0.05);
      const p4 = project(-8.5, 3.8, -0.05);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#0d1326' : '#111726';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // 2. Render Passenger Platform (Raised Slab at Z = 0.55m, Y from -4.2 to -1.8)
      const platZ = 0.55;
      const platP1 = project(-8.0, -4.0, platZ);
      const platP2 = project(5.5, -4.0, platZ);
      const platP3 = project(5.5, -1.8, platZ);
      const platP4 = project(-8.0, -1.8, platZ);

      // Platform top surface
      ctx.beginPath();
      ctx.moveTo(platP1.x, platP1.y);
      ctx.lineTo(platP2.x, platP2.y);
      ctx.lineTo(platP3.x, platP3.y);
      ctx.lineTo(platP4.x, platP4.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#172554' : '#1e293b'; // cool blue in thermal
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Platform vertical edge facing track
      const edgeBottom1 = project(-8.0, -1.8, 0.0);
      const edgeBottom2 = project(5.5, -1.8, 0.0);
      ctx.beginPath();
      ctx.moveTo(platP4.x, platP4.y);
      ctx.lineTo(platP3.x, platP3.y);
      ctx.lineTo(edgeBottom2.x, edgeBottom2.y);
      ctx.lineTo(edgeBottom1.x, edgeBottom1.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#1e1b4b' : '#0f172a';
      ctx.fill();
      ctx.stroke();

      // Tactile Safety Line (Yellow Strip) along Platform edge
      const yLine1 = project(-8.0, -1.9, platZ + 0.01);
      const yLine2 = project(5.5, -1.9, platZ + 0.01);
      ctx.beginPath();
      ctx.moveTo(yLine1.x, yLine1.y);
      ctx.lineTo(yLine2.x, yLine2.y);
      ctx.strokeStyle = '#eab308'; // Safety yellow
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Platform Pillars & Waiting Benches
      [-6, -2, 2].forEach((px) => {
        const base = project(px, -3.2, platZ);
        const top = project(px, -3.2, 2.7);
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(top.x, top.y);
        ctx.strokeStyle = thermalOverlay ? '#38bdf8' : '#64748b';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      // Overhead Canopy Roof Truss
      const roofP1 = project(-8.0, -3.8, 2.7);
      const roofP2 = project(5.5, -3.8, 2.7);
      const roofP3 = project(5.5, -1.8, 2.7);
      const roofP4 = project(-8.0, -1.8, 2.7);
      ctx.beginPath();
      ctx.moveTo(roofP1.x, roofP1.y);
      ctx.lineTo(roofP2.x, roofP2.y);
      ctx.lineTo(roofP3.x, roofP3.y);
      ctx.lineTo(roofP4.x, roofP4.y);
      ctx.closePath();
      ctx.strokeStyle = thermalOverlay ? '#1e293b' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Platform Bench
      const benchP = project(-4.0, -3.0, platZ);
      ctx.fillStyle = '#475569';
      ctx.fillRect(benchP.x - 8, benchP.y - 4, 16, 8);

      // Luggage Trolley Cart
      const cartP = project(1.2, -2.6, platZ);
      ctx.fillStyle = thermalOverlay ? '#0284c7' : '#94a3b8';
      ctx.fillRect(cartP.x - 6, cartP.y - 6, 12, 10);

      // 3. Railway Sleepers (Wood/Concrete Ties)
      for (let x = -8.0; x <= 10.0; x += 0.6) {
        // Track 1 Sleepers
        const s1a = project(x, -0.9, 0.02);
        const s1b = project(x, 0.1, 0.02);
        ctx.beginPath();
        ctx.moveTo(s1a.x, s1a.y);
        ctx.lineTo(s1b.x, s1b.y);
        ctx.strokeStyle = thermalOverlay ? '#1e293b' : '#292524';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Track 2 Sleepers
        const s2a = project(x, 0.9, 0.02);
        const s2b = project(x, 1.9, 0.02);
        ctx.beginPath();
        ctx.moveTo(s2a.x, s2a.y);
        ctx.lineTo(s2b.x, s2b.y);
        ctx.strokeStyle = thermalOverlay ? '#1e293b' : '#292524';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // 4. Steel Rails (UIC-60)
      // Track 1: Left rail (Y = -0.85), Right rail (Y = 0.05)
      const t1RailL1 = project(-8.5, -0.85, 0.08);
      const t1RailL2 = project(10.5, -0.85, 0.08);
      ctx.beginPath();
      ctx.moveTo(t1RailL1.x, t1RailL1.y);
      ctx.lineTo(t1RailL2.x, t1RailL2.y);
      ctx.strokeStyle = thermalOverlay ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const t1RailR1 = project(-8.5, 0.05, 0.08);
      const t1RailR2 = project(10.5, 0.05, 0.08);
      ctx.beginPath();
      ctx.moveTo(t1RailR1.x, t1RailR1.y);
      ctx.lineTo(t1RailR2.x, t1RailR2.y);
      ctx.strokeStyle = thermalOverlay ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Track 2: Left rail (Y = 0.95), Right rail (Y = 1.85)
      const t2RailL1 = project(-8.5, 0.95, 0.08);
      const t2RailL2 = project(10.5, 0.95, 0.08);
      ctx.beginPath();
      ctx.moveTo(t2RailL1.x, t2RailL1.y);
      ctx.lineTo(t2RailL2.x, t2RailL2.y);
      ctx.strokeStyle = thermalOverlay ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const t2RailR1 = project(-8.5, 1.85, 0.08);
      const t2RailR2 = project(10.5, 1.85, 0.08);
      ctx.beginPath();
      ctx.moveTo(t2RailR1.x, t2RailR1.y);
      ctx.lineTo(t2RailR2.x, t2RailR2.y);
      ctx.strokeStyle = thermalOverlay ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 5. Overhead Electric Catenary Wire
      const cat1 = project(-8.5, 1.4, 3.2);
      const cat2 = project(10.5, 1.4, 3.2);
      ctx.beginPath();
      ctx.moveTo(cat1.x, cat1.y);
      ctx.lineTo(cat2.x, cat2.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 6. Realistic Freight Train Carriage / Bogie (Parked on Track 2 from X = 1.0 to 7.0)
      const trainMinX = 1.0;
      const trainMaxX = 7.0;
      const trainMinY = 0.85;
      const trainMaxY = 1.95;
      const trainBottomZ = 0.85;
      const trainTopZ = 2.3;

      // Train Bogie Wheels & Axles
      [2.0, 6.0].forEach((axleX) => {
        const wLeft = project(axleX, 0.95, 0.35);
        const wRight = project(axleX, 1.85, 0.35);

        // Axle shaft
        ctx.beginPath();
        ctx.moveTo(wLeft.x, wLeft.y);
        ctx.lineTo(wRight.x, wRight.y);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(wLeft.x, wLeft.y, 7, 0, Math.PI * 2);
        ctx.arc(wRight.x, wRight.y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Hot Brake Disc on front axle (X = 2.0, Y = 0.95)
        if (axleX === 2.0) {
          ctx.beginPath();
          ctx.arc(wLeft.x, wLeft.y, 9, 0, Math.PI * 2);
          if (thermalOverlay) {
            ctx.fillStyle = '#ef4444'; // 92°C blazing red in thermal
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#d97706'; // hot friction bronze
            ctx.fill();
          }
        }
      });

      // Train Body Mesh / Cube
      const c1 = project(trainMinX, trainMinY, trainBottomZ);
      const c2 = project(trainMaxX, trainMinY, trainBottomZ);
      const c3 = project(trainMaxX, trainMaxY, trainBottomZ);
      const c4 = project(trainMinX, trainMaxY, trainBottomZ);

      const ct1 = project(trainMinX, trainMinY, trainTopZ);
      const ct2 = project(trainMaxX, trainMinY, trainTopZ);
      const ct3 = project(trainMaxX, trainMaxY, trainTopZ);
      const ct4 = project(trainMinX, trainMaxY, trainTopZ);

      // Carriage side facing Track 1 / Platform
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(ct2.x, ct2.y);
      ctx.lineTo(ct1.x, ct1.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#065f46' : '#1e3a8a'; // Indian Railways deep blue
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      // Carriage top
      ctx.beginPath();
      ctx.moveTo(ct1.x, ct1.y);
      ctx.lineTo(ct2.x, ct2.y);
      ctx.lineTo(ct3.x, ct3.y);
      ctx.lineTo(ct4.x, ct4.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#047857' : '#172554';
      ctx.fill();
      ctx.stroke();

      // Carriage markings
      const midText = project(4.0, trainMinY, 1.55);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('CR / BOGIE-BOXN-22', midText.x - 40, midText.y);

      // 7. Suspicious Ordnance / Hidden IED inside Undercarriage Crawl Cavity
      const targetPos = project(targetX, targetY, 0.22);
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, 8, 0, Math.PI * 2);
      if (thermalOverlay) {
        ctx.fillStyle = '#f97316'; // 58°C thermal anomaly
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#dc2626'; // Red ordnance
        ctx.fill();
      }
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Blinking strobe marker on target
      const pulse = Math.sin(Date.now() / 250) > 0;
      if (pulse) {
        ctx.beginPath();
        ctx.arc(targetPos.x, targetPos.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 8. Dark Tunnel Portal / Transition Zone (X >= 5.5m)
      const tunnelPortal1 = project(5.5, -4.5, 0.0);
      const tunnelPortal2 = project(5.5, -4.5, 3.6);
      const tunnelPortal3 = project(5.5, 3.8, 3.6);
      const tunnelPortal4 = project(5.5, 3.8, 0.0);

      ctx.beginPath();
      ctx.moveTo(tunnelPortal1.x, tunnelPortal1.y);
      ctx.lineTo(tunnelPortal2.x, tunnelPortal2.y);
      ctx.lineTo(tunnelPortal3.x, tunnelPortal3.y);
      ctx.lineTo(tunnelPortal4.x, tunnelPortal4.y);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tunnel dark ceiling & shadow
      const tunnelDark1 = project(5.5, -4.5, 0.0);
      const tunnelDark2 = project(10.5, -4.5, 0.0);
      const tunnelDark3 = project(10.5, 3.8, 0.0);
      const tunnelDark4 = project(5.5, 3.8, 0.0);
      ctx.beginPath();
      ctx.moveTo(tunnelDark1.x, tunnelDark1.y);
      ctx.lineTo(tunnelDark2.x, tunnelDark2.y);
      ctx.lineTo(tunnelDark3.x, tunnelDark3.y);
      ctx.lineTo(tunnelDark4.x, tunnelDark4.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)'; // deep darkness
      ctx.fill();

      // 9. VANGUARD Robot Quadruped Representation
      const rZ = isCrouched ? 0.15 : 0.32;
      const robotCenter = project(posX, posY, rZ);

      // Active Sniffer Cone under Robot
      if (snifferActive) {
        const coneTip = project(posX, posY, rZ - 0.05);
        const coneRadius = 18;
        ctx.beginPath();
        ctx.ellipse(coneTip.x, coneTip.y + 12, coneRadius, coneRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Active LiDAR Raycasting
      if (lidarActive) {
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const rayAngle = ((yaw + i * 30) * Math.PI) / 180;
          const rayDist = 2.2 + (i % 3) * 0.8;
          const rayEnd = project(
            posX + Math.cos(rayAngle) * rayDist,
            posY + Math.sin(rayAngle) * rayDist,
            rZ
          );
          ctx.beginPath();
          ctx.moveTo(robotCenter.x, robotCenter.y);
          ctx.lineTo(rayEnd.x, rayEnd.y);
          ctx.stroke();

          // Small laser return point
          ctx.fillStyle = '#00f2fe';
          ctx.fillRect(rayEnd.x - 1.5, rayEnd.y - 1.5, 3, 3);
        }
      }

      // Robot Chassis Box
      const yawRad = (yaw * Math.PI) / 180;
      const fx = Math.cos(yawRad) * 0.25;
      const fy = Math.sin(yawRad) * 0.25;
      const sx = -Math.sin(yawRad) * 0.14;
      const sy = Math.cos(yawRad) * 0.14;

      const rf1 = project(posX + fx + sx, posY + fy + sy, rZ);
      const rf2 = project(posX + fx - sx, posY + fy - sy, rZ);
      const rr1 = project(posX - fx - sx, posY - fy - sy, rZ);
      const rr2 = project(posX - fx + sx, posY - fy + sy, rZ);

      // Chassis polygon
      ctx.beginPath();
      ctx.moveTo(rf1.x, rf1.y);
      ctx.lineTo(rf2.x, rf2.y);
      ctx.lineTo(rr1.x, rr1.y);
      ctx.lineTo(rr2.x, rr2.y);
      ctx.closePath();
      ctx.fillStyle = thermalOverlay ? '#22d3ee' : '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Heading indicator arrow
      const nose = project(posX + fx * 1.6, posY + fy * 1.6, rZ);
      ctx.beginPath();
      ctx.moveTo(robotCenter.x, robotCenter.y);
      ctx.lineTo(nose.x, nose.y);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 4 Articulated Footpads on ground
      [
        [posX + fx + sx, posY + fy + sy],
        [posX + fx - sx, posY + fy - sy],
        [posX - fx + sx, posY - fy + sy],
        [posX - fx - sx, posY - fy - sy],
      ].forEach(([lx, ly]) => {
        const foot = project(lx, ly, 0.0);
        ctx.beginPath();
        ctx.arc(foot.x, foot.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2fe';
        ctx.fill();
      });

      // Target proximity line if close
      if (inTargetRange) {
        ctx.beginPath();
        ctx.moveTo(robotCenter.x, robotCenter.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [posX, posY, yaw, isCrouched, snifferActive, lidarActive, thermalOverlay, inTargetRange]);

  return (
    <div className="space-y-4 font-mono">
      {/* HUD Header Alert Bar */}
      {inTargetRange && (
        <div className="p-3.5 rounded-lg bg-rose-950/70 border border-rose-500/80 critical-pulse flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-200">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce shrink-0" />
            <div>
              <div className="font-bold text-sm text-rose-100">
                🚨 TARGET IN SCANNING RANGE — THREAT FUSION ENGAGED
              </div>
              <div className="text-rose-300">
                Concealed package detected inside Freight Bogie undercarriage cavity at ({targetX}m, {targetY}m). Distance: {distToTarget.toFixed(2)}m.
              </div>
            </div>
          </div>
          <button
            onClick={executeDeepDiagnostic}
            className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
          >
            <Crosshair className="w-4 h-4" />
            <span>Execute Deep Undercarriage Diagnostic</span>
          </button>
        </div>
      )}

      {/* Tunnel Alert Bar */}
      {inTunnel && !inTargetRange && (
        <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>GPS-DENIED TUNNEL TRANSITION:</strong> Comm signal degraded (-96 dBm). Cartographer &amp; LIO-SAM closed-loop odometry active.
            </span>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
            MESH LORAWAN
          </span>
        </div>
      )}

      {/* Deep Diagnostic Mission Readout Card (if executed) */}
      {deepScanExecuted && (
        <div className="p-4 rounded-lg bg-[#121926] border border-cyan-500/60 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>DIAGNOSTIC READOUT: BOGIE UNDERCARRIAGE CAVITY (CHAINAGE KM 14.82)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
              CRITICAL THREAT CONFIRMED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#080c14] rounded border border-slate-800">
              <div className="text-slate-400 text-[11px]">HAILO-8 NEURAL CLASSIFIER</div>
              <div className="font-bold text-rose-400 mt-1">Taped Military PE4 / C4</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Confidence: 94.2% (YOLOv8x)</div>
            </div>
            <div className="p-2.5 bg-[#080c14] rounded border border-slate-800">
              <div className="text-slate-400 text-[11px]">FLIR LEPTON 3.5 RADIOMETRIC</div>
              <div className="font-bold text-amber-400 mt-1">58.4°C Hotspot</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Exothermic circuit timer</div>
            </div>
            <div className="p-2.5 bg-[#080c14] rounded border border-slate-800">
              <div className="text-slate-400 text-[11px]">FORCED-AIR VAPOR DETECTOR</div>
              <div className="font-bold text-purple-400 mt-1">88 PPM Trace</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Nitrate / Peroxide Precursor</div>
            </div>
            <div className="p-2.5 bg-[#080c14] rounded border border-slate-800">
              <div className="text-slate-400 text-[11px]">COMBINED THREAT INDEX</div>
              <div className="font-bold text-rose-400 mt-1">0.892 / 1.000</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">SL-5 Hash Vault Sealed</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Simulation Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center 3D Simulation Canvas */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#080c14] shadow-2xl">
            {/* Top Canvas Overlay Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 text-[10px]">
              <div className="px-2.5 py-1 rounded bg-[#0d1422]/90 border border-slate-700 backdrop-blur-sm text-cyan-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>POSE: ({posX.toFixed(2)}m, {posY.toFixed(2)}m, {isCrouched ? '0.15' : '0.32'}m)</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#0d1422]/90 border border-slate-700 backdrop-blur-sm text-slate-300">
                HEADING: {yaw}°
              </div>
              <div className={`px-2.5 py-1 rounded border backdrop-blur-sm ${
                isCrouched ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-[#0d1422]/90 border-slate-700 text-slate-300'
              }`}>
                {isCrouched ? '🧎 CROUCHED (UNDERCARRIAGE CLEARANCE)' : 'STAND (TROT STANCE)'}
              </div>
            </div>

            {/* Top Right Sensor Toggles */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setSnifferActive(!snifferActive)}
                className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 backdrop-blur-sm ${
                  snifferActive
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-[#0d1422]/80 border-slate-700 text-slate-500'
                }`}
                title="Toggle Vapor Sniffer Intake Fan Cone"
              >
                <Wind className="w-3 h-3" />
                <span>Sniffer</span>
              </button>

              <button
                onClick={() => setLidarActive(!lidarActive)}
                className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 backdrop-blur-sm ${
                  lidarActive
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-[#0d1422]/80 border-slate-700 text-slate-500'
                }`}
                title="Toggle Active LiDAR Raycast Projections"
              >
                <Radio className="w-3 h-3" />
                <span>LiDAR</span>
              </button>

              <button
                onClick={() => setThermalOverlay(!thermalOverlay)}
                className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 backdrop-blur-sm ${
                  thermalOverlay
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-[#0d1422]/80 border-slate-700 text-slate-500'
                }`}
                title="Toggle Radiometric Thermal Overlay Mode"
              >
                <Flame className="w-3 h-3" />
                <span>Thermal HUD</span>
              </button>
            </div>

            {/* 3D Canvas */}
            <canvas
              ref={canvasRef}
              width={820}
              height={520}
              className="w-full h-auto block cursor-crosshair"
            />

            {/* Bottom Status Overlay */}
            <div className="absolute bottom-2 left-3 right-3 z-10 flex justify-between items-center text-[10px] text-slate-400 pointer-events-none">
              <div className="bg-[#080c14]/80 px-2 py-0.5 rounded border border-slate-800">
                STATION SWEEP ZONE: TRACK 1 &amp; FREIGHT BOGIE 2 (NDLS YARD)
              </div>
              <div className="bg-[#080c14]/80 px-2 py-0.5 rounded border border-slate-800 text-cyan-400">
                USE W/A/S/D OR ONSCREEN D-PAD FOR TELEOP
              </div>
            </div>
          </div>
        </div>

        {/* Right Arcade Teleoperation Console & Mission HUD */}
        <div className="lg:col-span-4 space-y-4">
          {/* Mission Progress Tracker */}
          <div className="p-4 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-semibold text-cyan-400 text-xs flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>MISSION PROGRESS HUD</span>
              </div>
              <span className="text-cyan-300 font-bold text-xs">{sectorClearance}% CLEARED</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${sectorClearance}%` }}
              />
            </div>

            {/* Waypoints List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span className="text-slate-300">1. Platform Perimeter Swept:</span>
                <span className={wpPlatform ? 'text-emerald-400 flex items-center gap-1 font-bold' : 'text-slate-500'}>
                  {wpPlatform ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Pending (Y < -1.8)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span className="text-slate-300">2. Track 1 Clearance Swept:</span>
                <span className={wpTrack1 ? 'text-emerald-400 flex items-center gap-1 font-bold' : 'text-slate-500'}>
                  {wpTrack1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0d1422] rounded border border-slate-800">
                <span className="text-slate-300">3. Freight Bogie Undercarriage:</span>
                <span className={wpBogie ? 'text-emerald-400 flex items-center gap-1 font-bold' : 'text-slate-500'}>
                  {wpBogie ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Pending Diagnostic'}
                </span>
              </div>
            </div>

            {/* Battery & Comm Status */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 bg-[#0d1422] rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery:</span>
                </div>
                <span className="text-emerald-400 font-bold">{battery.toFixed(1)}%</span>
              </div>

              <div className="p-2 bg-[#0d1422] rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Comm:</span>
                </div>
                <span className={inTunnel ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                  {commDbm} dBm
                </span>
              </div>
            </div>
          </div>

          {/* D-Pad Directional Teleoperation Controls */}
          <div className="p-4 rounded-lg bg-[#121926] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-semibold text-slate-300">TELEOP NAVIGATION D-PAD</span>
              <button
                onClick={resetPosition}
                className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                title="Reset robot to nominal track start"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Arcade Controller Grid */}
            <div className="flex flex-col items-center gap-2 py-1">
              {/* Forward */}
              <button
                onClick={moveForward}
                className="w-14 h-12 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all shadow-md"
                title="Move Forward (W / Up Arrow)"
              >
                <ChevronUp className="w-6 h-6" />
                <span className="text-[9px] font-bold">FWD</span>
              </button>

              {/* Middle Row: Strafe Left, Crouch, Strafe Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={strafeLeft}
                  className="w-14 h-12 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all shadow-md"
                  title="Strafe Left (A / Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                  <span className="text-[9px] font-bold">LEFT</span>
                </button>

                <button
                  onClick={toggleCrouch}
                  className={`w-16 h-12 rounded flex flex-col items-center justify-center border active:scale-95 transition-all shadow-md text-[10px] font-bold ${
                    isCrouched
                      ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-400'
                  }`}
                  title="Toggle Emergency Crouch for Low-Clearance Sweeps (C)"
                >
                  <span className="text-sm">🧎</span>
                  <span>{isCrouched ? 'CROUCH' : 'STAND'}</span>
                </button>

                <button
                  onClick={strafeRight}
                  className="w-14 h-12 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all shadow-md"
                  title="Strafe Right (D / Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                  <span className="text-[9px] font-bold">RIGHT</span>
                </button>
              </div>

              {/* Backward */}
              <button
                onClick={moveBackward}
                className="w-14 h-12 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex flex-col items-center justify-center border border-slate-700 active:scale-95 transition-all shadow-md"
                title="Move Backward (S / Down Arrow)"
              >
                <ChevronDown className="w-6 h-6" />
                <span className="text-[9px] font-bold">BACK</span>
              </button>

              {/* Yaw Rotation Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={rotateLeft}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 text-xs active:scale-95 transition-all"
                  title="Rotate Counter-Clockwise (Q)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Yaw -25°</span>
                </button>

                <button
                  onClick={rotateRight}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 text-xs active:scale-95 transition-all"
                  title="Rotate Clockwise (E)"
                >
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Yaw +25°</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
