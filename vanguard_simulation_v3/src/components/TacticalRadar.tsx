import React, { useEffect, useRef } from 'react';

interface TacticalRadarProps {
  chainage: number;
  activeThreat: string;
  threatIndex: number;
}

export const TacticalRadar: React.FC<TacticalRadarProps> = ({
  chainage,
  activeThreat,
  threatIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.045;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = w / 2 - 8;

      // Dark background
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, w, h);

      // Radar Concentric Circles
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair Axes
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Railway Track Line Running Top-to-Bottom
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Station Signal Milestone Blips along Track
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // If Threat Active, Render Pulsing Hazard Blip on Radar
      if (activeThreat !== 'Nominal') {
        const blipDist = radius * 0.45;
        const blipAngle = Math.PI * 1.25;
        const bx = cx + Math.cos(blipAngle) * blipDist;
        const by = cy + Math.sin(blipAngle) * blipDist;

        const pulseSize = 4 + (Math.sin(angle * 3) + 1) * 2.5;
        ctx.fillStyle = activeThreat === 'Explosive Class 1.1' ? '#ff0055' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(bx, by, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Expanding alert ring
        ctx.strokeStyle = activeThreat === 'Explosive Class 1.1' ? 'rgba(255, 0, 85, 0.5)' : 'rgba(255, 170, 0, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, pulseSize * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sweeping Radar Line & Phosphor Glow Cone
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Sweeping Gradient Fan
      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      sweepGrad.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
      sweepGrad.addColorStop(1, 'rgba(0, 243, 255, 0.0)');

      ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, -Math.PI / 4, true);
      ctx.closePath();
      ctx.fill();

      // Leading Sweep Beam
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();

      ctx.restore();

      // Robot Center Position Blip (Diamond)
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeThreat]);

  return (
    <div className="bg-[#091220] border border-[#1e293b] rounded-lg p-3 flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#94a3b8] mb-1.5">
        <span className="text-[#00f3ff] font-bold">TACTICAL RADAR 360°</span>
        <span className="text-[#00ff66]">RANGE: 250m</span>
      </div>
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="w-[160px] h-[160px] rounded-full border border-[#00f3ff]/30 shadow-[0_0_15px_rgba(0,243,255,0.15)]"
      />
      <div className="text-[10px] font-mono text-[#94a3b8] mt-2 text-center">
        CHAINAGE: <span className="text-[#ffffff] font-bold">KM {chainage.toFixed(3)}</span>
      </div>
    </div>
  );
};
