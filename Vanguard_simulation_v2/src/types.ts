export type OperationalRegime = 'Trot Mode (Station Transit)' | 'Crawl Mode (Hazard Ballast Stance)';

export interface TelemetryState {
  regime: OperationalRegime;
  ballastRoughness: number; // 0.00 to 1.00
  pitchDeg: number; // -30.0 to +30.0
  rollDeg: number; // -30.0 to +30.0
  zOffset: number; // -0.10 to +0.10 m
  visualConf: number; // 0.00 to 1.00
  thermalC: number; // 15.0 to 110.0 °C
  chemicalPpm: number; // 0.0 to 150.0 PPM
  estopEngaged: boolean;
}

export interface JointAngles {
  hipYaw: number;
  hipPitch: number;
  kneePitch: number;
}

export interface LegCalculation {
  id: 'FL' | 'FR' | 'RL' | 'RR';
  name: string;
  hip: [number, number, number];
  knee: [number, number, number];
  foot: [number, number, number];
  load: number;
  slipProb: number;
  jointAngles: JointAngles;
}

export interface KinematicsResult {
  com: [number, number, number];
  bodyCorners: [number, number, number][];
  legs: Record<'FL' | 'FR' | 'RL' | 'RR', LegCalculation>;
  balanceConvergence: number;
  meanSlipMargin: number;
}

export interface ThreatIndexResult {
  score: number;
  normThermal: number;
  normChemical: number;
  tier: 'SAFE' | 'ELEVATED' | 'CRITICAL';
  detectedClass: string;
  classColor: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  threatScore: number;
  tier: string;
  sha256: string;
  payload: any;
}
