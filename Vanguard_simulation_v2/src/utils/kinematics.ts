import { TelemetryState, KinematicsResult, LegCalculation, ThreatIndexResult } from '../types';

export function calculateThreatIndex(visConf: number, thermalC: number, chemicalPpm: number): ThreatIndexResult {
  const normThermal = Math.min(Math.max((thermalC - 25.0) / (85.0 - 25.0), 0.0), 1.0);
  const normChemical = Math.min(Math.max((chemicalPpm - 10.0) / (100.0 - 10.0), 0.0), 1.0);

  const score = Math.min(Math.max((0.45 * visConf) + (0.35 * normThermal) + (0.20 * normChemical), 0.0), 1.0);

  let detectedClass = 'Track Clearance / Debris Clear';
  let classColor = '#10b981';

  if (visConf >= 0.85) {
    detectedClass = 'Taped Ordnance / Military PE4 / RDX';
    classColor = '#ff3366';
  } else if (visConf >= 0.65) {
    detectedClass = 'Concealed Bogie Compartment Void';
    classColor = '#ff8c00';
  } else if (visConf >= 0.30) {
    detectedClass = 'Unattended Baggage (Sub-Ballast)';
    classColor = '#f59e0b';
  }

  let tier: 'SAFE' | 'ELEVATED' | 'CRITICAL' = 'SAFE';
  if (score > 0.70) {
    tier = 'CRITICAL';
  } else if (score > 0.40) {
    tier = 'ELEVATED';
  }

  return {
    score,
    normThermal,
    normChemical,
    tier,
    detectedClass,
    classColor,
  };
}

export function computeKinematics(state: TelemetryState): KinematicsResult {
  const pitchRad = (state.pitchDeg * Math.PI) / 180.0;
  const rollRad = (state.rollDeg * Math.PI) / 180.0;

  // Euler rotation matrices: Rx * Ry
  const cosR = Math.cos(rollRad);
  const sinR = Math.sin(rollRad);
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);

  const rotate = (x: number, y: number, z: number): [number, number, number] => {
    // R_y then R_x
    const x1 = cosP * x + sinP * z;
    const y1 = y;
    const z1 = -sinP * x + cosP * z;

    const x2 = x1;
    const y2 = cosR * y1 - sinR * z1;
    const z2 = sinR * y1 + cosR * z1;

    return [x2, y2, z2];
  };

  const L = 0.28;
  const W = 0.16;
  const H = 0.08;
  const comZ = 0.35 + state.zOffset;
  const com: [number, number, number] = [0.0, 0.0, comZ];

  // 8 corners of body chassis
  const localCorners: [number, number, number][] = [
    [L, W, H / 2], [L, -W, H / 2], [-L, -W, H / 2], [-L, W, H / 2], // top loop
    [L, W, -H / 2], [L, -W, -H / 2], [-L, -W, -H / 2], [-L, W, -H / 2], // bottom loop
  ];

  const bodyCorners = localCorners.map(([x, y, z]) => {
    const [rx, ry, rz] = rotate(x, y, z);
    return [rx + com[0], ry + com[1], rz + com[2]] as [number, number, number];
  });

  const hipOffsets: Record<'FL' | 'FR' | 'RL' | 'RR', [number, number, number]> = {
    FL: [0.25, 0.14, 0.0],
    FR: [0.25, -0.14, 0.0],
    RL: [-0.25, 0.14, 0.0],
    RR: [-0.25, -0.14, 0.0],
  };

  const nominalFeetWorld: Record<'FL' | 'FR' | 'RL' | 'RR', [number, number, number]> = {
    FL: [0.28, 0.20, 0.0],
    FR: [0.28, -0.20, 0.0],
    RL: [-0.28, 0.20, 0.0],
    RR: [-0.28, -0.20, 0.0],
  };

  const legNames = {
    FL: 'Front-Left (FL)',
    FR: 'Front-Right (FR)',
    RL: 'Rear-Left (RL)',
    RR: 'Rear-Right (RR)',
  };

  const L1 = 0.20; // Thigh length (m)
  const L2 = 0.20; // Shank length (m)

  const legs: Record<'FL' | 'FR' | 'RL' | 'RR', LegCalculation> = {} as any;
  const slipProbs: number[] = [];
  const balanceConvergences: number[] = [];

  (['FL', 'FR', 'RL', 'RR'] as const).forEach((id) => {
    const [hxLocal, hyLocal, hzLocal] = hipOffsets[id];
    const [rx, ry, rz] = rotate(hxLocal, hyLocal, hzLocal);
    const hip: [number, number, number] = [rx + com[0], ry + com[1], rz + com[2]];

    const [fxNom, fyNom] = nominalFeetWorld[id];

    // Closed-loop reflex compensation: foot target responds inversely to body tilt
    const groundContactZ = (Math.sin(pitchRad) * fxNom - Math.sin(rollRad) * fyNom) * 0.15;
    const ballastNoise = Math.sin(fxNom * 12.0) * Math.cos(fyNom * 8.0) * (state.ballastRoughness * 0.04);
    const foot: [number, number, number] = [fxNom, fyNom, groundContactZ + ballastNoise];

    // Vector hip -> foot
    const dx = foot[0] - hip[0];
    const dy = foot[1] - hip[1];
    const dz = foot[2] - hip[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const clampedDist = Math.min(dist, (L1 + L2) * 0.98);

    // Law of cosines for Knee Pitch
    const cosKnee = (L1 * L1 + L2 * L2 - clampedDist * clampedDist) / (2 * L1 * L2);
    const kneePitchRad = Math.PI - Math.acos(Math.max(-1.0, Math.min(1.0, cosKnee)));

    // Hip Pitch
    const alpha = Math.acos(Math.max(-1.0, Math.min(1.0, (L1 * L1 + clampedDist * clampedDist - L2 * L2) / (2 * L1 * clampedDist))));
    const beta = Math.atan2(-dz, Math.sqrt(dx * dx + dy * dy));
    const hipPitchRad = beta + alpha;

    const hipYawRad = Math.atan2(dy, dx);

    // Approximate knee 3D position
    const knee: [number, number, number] = [
      hip[0] + dx * 0.5,
      hip[1] + dy * 0.5,
      hip[2] - L1 * Math.cos(hipPitchRad * 0.5),
    ];

    const load = Math.max(0.4, Math.min(1.8, 1.0 + (hip[2] - com[2]) * 2.0));
    const slipProb = Math.max(0.05, Math.min(0.95, state.ballastRoughness * 0.75 + (Math.abs(state.pitchDeg) / 45.0) * 0.3));
    slipProbs.push(slipProb);

    const balanceConvergence = Math.max(12.0, Math.min(99.8, 100.0 - (Math.abs(state.pitchDeg) * 1.5 + Math.abs(state.rollDeg) * 1.2 + state.ballastRoughness * 25.0)));
    balanceConvergences.push(balanceConvergence);

    legs[id] = {
      id,
      name: legNames[id],
      hip,
      knee,
      foot,
      load,
      slipProb,
      jointAngles: {
        hipYaw: (hipYawRad * 180.0) / Math.PI,
        hipPitch: (hipPitchRad * 180.0) / Math.PI,
        kneePitch: (kneePitchRad * 180.0) / Math.PI,
      },
    };
  });

  const avgBalance = balanceConvergences.reduce((a, b) => a + b, 0) / balanceConvergences.length;
  const avgSlip = slipProbs.reduce((a, b) => a + b, 0) / slipProbs.length;

  return {
    com,
    bodyCorners,
    legs,
    balanceConvergence: avgBalance,
    meanSlipMargin: 1.0 - avgSlip,
  };
}

export async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
