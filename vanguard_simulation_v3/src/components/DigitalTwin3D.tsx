import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Camera,
  Eye,
  Maximize2,
  Navigation,
  RotateCcw,
  Zap,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import {
  playFootstepSound,
  playLaserScanSound,
  playDeployCountermeasure,
  playAlertSiren,
  playTacticalBlip,
} from '../utils/audio';

interface DigitalTwin3DProps {
  pitchAngle: number;
  rollAngle: number;
  clearanceCm: number;
  ballastDispersion: number;
  patrolMode: 'Trot' | 'Crawl / Hazard Ballast';
  stepCounter: number;
  eStopActive: boolean;
  activeThreat: string;
  scenario?: 'safe' | 'bomb' | 'drugs';
  scenarioTriggerTime?: number;
  onAdvanceChainage?: (deltaKm: number) => void;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  pitchAngle,
  rollAngle,
  clearanceCm,
  ballastDispersion,
  patrolMode,
  stepCounter,
  eStopActive,
  activeThreat,
  scenario,
  scenarioTriggerTime,
  onAdvanceChainage,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Viewport & Camera State
  const [cameraMode, setCameraMode] = useState<'CHASE' | 'FPS' | 'ORBIT' | 'TRACKSIDE'>('CHASE');
  const [laserScanActive, setLaserScanActive] = useState<boolean>(true);
  const [isDisarmed, setIsDisarmed] = useState<boolean>(false);

  // Reactive Detection Animation State (Chassis Shake & Flashing Red Border)
  const [detectionAnim, setDetectionAnim] = useState<{
    active: boolean;
    threatType: 'bomb' | 'drugs' | null;
    key: number;
  }>({
    active: false,
    threatType: null,
    key: 0,
  });

  const prevScenarioOrThreatRef = useRef<string>('');
  const shakeIntensityRef = useRef<number>(0);

  // Dynamic props & state refs to prevent Three.js scene destruction on updates
  const scenarioRef = useRef(scenario);
  const activeThreatRef = useRef(activeThreat);
  const cameraModeRef = useRef(cameraMode);
  const laserScanActiveRef = useRef(laserScanActive);
  const pitchAngleRef = useRef(pitchAngle);
  const rollAngleRef = useRef(rollAngle);
  const clearanceCmRef = useRef(clearanceCm);
  const patrolModeRef = useRef(patrolMode);
  const eStopActiveRef = useRef(eStopActive);
  const isDisarmedRef = useRef(isDisarmed);
  const onAdvanceChainageRef = useRef(onAdvanceChainage);

  useEffect(() => {
    scenarioRef.current = scenario;
    activeThreatRef.current = activeThreat;
    cameraModeRef.current = cameraMode;
    laserScanActiveRef.current = laserScanActive;
    pitchAngleRef.current = pitchAngle;
    rollAngleRef.current = rollAngle;
    clearanceCmRef.current = clearanceCm;
    patrolModeRef.current = patrolMode;
    eStopActiveRef.current = eStopActive;
    isDisarmedRef.current = isDisarmed;
    onAdvanceChainageRef.current = onAdvanceChainage;
  });

  // Trigger Detection Animation whenever scenario state changes to 'bomb' or 'drugs'
  useEffect(() => {
    const isBombNow = scenario === 'bomb' || activeThreat === 'Explosive Class 1.1';
    const isDrugsNow = scenario === 'drugs' || activeThreat === 'Narcotics';
    const currentKey = scenario
      ? `${scenario}-${scenarioTriggerTime || 0}`
      : `${activeThreat}-${scenarioTriggerTime || 0}`;

    if (isBombNow || isDrugsNow) {
      const type = isBombNow ? 'bomb' : 'drugs';
      setDetectionAnim({
        active: true,
        threatType: type,
        key: Date.now(),
      });
      // Trigger 3D Three.js chassis physical shake
      shakeIntensityRef.current = 1.0;

      const timer = setTimeout(() => {
        setDetectionAnim((prev) => ({ ...prev, active: false }));
      }, 3500);

      prevScenarioOrThreatRef.current = currentKey;
      return () => clearTimeout(timer);
    } else {
      setDetectionAnim({
        active: false,
        threatType: null,
        key: Date.now(),
      });
      shakeIntensityRef.current = 0;
    }

    prevScenarioOrThreatRef.current = currentKey;
  }, [scenario, activeThreat, scenarioTriggerTime]);

  // References for Three.js animation and interactions
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const headGimbalRef = useRef<THREE.Group | null>(null);
  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const laserMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const lidarRingMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const emergencyStrobesRef = useRef<THREE.PointLight[]>([]);
  const threatGroupRef = useRef<THREE.Group | null>(null);
  const bombMeshRef = useRef<THREE.Group | null>(null);
  const narcoticsMeshRef = useRef<THREE.Group | null>(null);
  const bombLightRef = useRef<THREE.PointLight | null>(null);
  const shockwaveMeshRef = useRef<THREE.Mesh | null>(null);
  const shockwaveAnimRef = useRef<{ active: boolean; scale: number; opacity: number }>({
    active: false,
    scale: 0.1,
    opacity: 1,
  });

  const legComponentsRef = useRef<{
    [key: string]: {
      femur: THREE.Mesh;
      knee: THREE.Mesh;
      tibia: THREE.Mesh;
      foot: THREE.Mesh;
      shockPiston: THREE.Mesh;
    };
  }>({});

  // Animation cycle & walking physics
  const walkPhaseRef = useRef<number>(0);
  const robotPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentClearanceRef = useRef<number>(clearanceCm / 100.0);
  const lastFootstepTimeRef = useRef<number>(0);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ theta: -0.65, phi: 0.48, radius: 4.5 });

  // Reset disarmed state when active threat changes
  useEffect(() => {
    setIsDisarmed(false);
  }, [activeThreat]);

  // Handle Disarm Action triggered by user
  const handleTriggerDisarm = () => {
    setIsDisarmed(true);
    playDeployCountermeasure();

    // Trigger visual shockwave in 3D
    if (shockwaveMeshRef.current) {
      shockwaveMeshRef.current.visible = true;
      shockwaveAnimRef.current = { active: true, scale: 0.2, opacity: 1.0 };
    }
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 360;

    // 1. Scene & Atmospheric Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040812);
    scene.fog = new THREE.FogExp2(0x040812, 0.055);
    sceneRef.current = scene;

    // 2. Camera setup - Position immediately in CHASE mode looking at the robot dog
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
    const initCamPos = new THREE.Vector3(
      robotPosRef.current.x - 2.8,
      (clearanceCmRef.current / 100.0) + 0.22 / 2 + 1.15,
      1.6
    );
    camera.position.copy(initCamPos);
    camera.lookAt(robotPosRef.current.x + 1.1, (clearanceCmRef.current / 100.0) + 0.22 / 2 + 0.1, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x0b1a30, 1.8);
    scene.add(ambientLight);

    // Directional moonlight / overhead yard lamp
    const moonLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    moonLight.position.set(4, 10, -5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    scene.add(moonLight);

    // Tactical cyan fill light
    const tacticalPoint = new THREE.PointLight(0x00f3ff, 2.0, 14);
    tacticalPoint.position.set(-2, 3, 2);
    scene.add(tacticalPoint);

    // 5. RAILWAY ENVIRONMENT (Indian Railways Broad Gauge: 1.676m)
    const railHalfGauge = 1.676 / 2; // 0.838m
    const trackSpan = 22.0;

    // Ground Ballast Bed (Crushed Dark Granite Gravel)
    const ballastGeo = new THREE.PlaneGeometry(trackSpan, 4.0);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballastMesh = new THREE.Mesh(ballastGeo, ballastMat);
    ballastMesh.rotation.x = -Math.PI / 2;
    ballastMesh.position.y = -0.06;
    ballastMesh.receiveShadow = true;
    scene.add(ballastMesh);

    // Ballast gravel texture grid lines
    const ballastGrid = new THREE.GridHelper(trackSpan, 44, 0x1e293b, 0x0a101d);
    ballastGrid.position.y = -0.055;
    scene.add(ballastGrid);

    // UIC-60 Steel Rails (Gleaming Chrome Tops + Rust Iron Webs)
    const railTopMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x002233,
      emissiveIntensity: 0.35,
    });
    const railWebMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.7,
    });

    const railLength = trackSpan;
    // Left & Right Rail Heads
    [-railHalfGauge, railHalfGauge].forEach((zPos) => {
      // Top Head
      const headGeo = new THREE.BoxGeometry(railLength, 0.035, 0.045);
      const headMesh = new THREE.Mesh(headGeo, railTopMat);
      headMesh.position.set(0, 0.035, zPos);
      headMesh.castShadow = true;
      scene.add(headMesh);

      // Web/Stem
      const webGeo = new THREE.BoxGeometry(railLength, 0.055, 0.02);
      const webMesh = new THREE.Mesh(webGeo, railWebMat);
      webMesh.position.set(0, -0.005, zPos);
      scene.add(webMesh);

      // Flange Base Foot
      const baseGeo = new THREE.BoxGeometry(railLength, 0.015, 0.075);
      const baseMesh = new THREE.Mesh(baseGeo, railWebMat);
      baseMesh.position.set(0, -0.04, zPos);
      scene.add(baseMesh);
    });

    // Concrete Sleepers (PSC Ties spaced every 0.6m) with Pandrol Clips
    const sleeperGeo = new THREE.BoxGeometry(0.24, 0.06, 2.5);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
    });
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.8,
      roughness: 0.3,
    });
    const clipGeo = new THREE.BoxGeometry(0.06, 0.03, 0.04);

    for (let x = -trackSpan / 2 + 0.5; x <= trackSpan / 2 - 0.5; x += 0.6) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(x, -0.03, 0);
      sleeper.receiveShadow = true;
      scene.add(sleeper);

      [-railHalfGauge, railHalfGauge].forEach((rz) => {
        const clipL = new THREE.Mesh(clipGeo, clipMat);
        clipL.position.set(x, 0.01, rz - 0.05);
        scene.add(clipL);

        const clipR = new THREE.Mesh(clipGeo, clipMat);
        clipR.position.set(x, 0.01, rz + 0.05);
        scene.add(clipR);
      });
    }

    // Overhead OHE Electric Traction Catenary Masts
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.07, 4.5, 8);
    const armGeo = new THREE.BoxGeometry(0.05, 0.05, 1.8);

    [-7.0, 7.0].forEach((mx) => {
      const pole = new THREE.Mesh(mastGeo, mastMat);
      pole.position.set(mx, 2.2, 1.85);
      scene.add(pole);

      const arm = new THREE.Mesh(armGeo, mastMat);
      arm.position.set(mx, 4.2, 0.95);
      scene.add(arm);

      const insGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
      const insMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x005577 });
      const insulator = new THREE.Mesh(insGeo, insMat);
      insulator.position.set(mx, 4.05, 0.2);
      scene.add(insulator);
    });

    // Milestone stone at track side: KM 118.4
    const stoneGeo = new THREE.BoxGeometry(0.2, 0.45, 0.25);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(2.4, 0.15, 1.35);
    scene.add(stone);

    // ==========================================
    // 6. 3D THREAT OBJECTS (IED BOMB & NARCOTICS STASH)
    // ==========================================
    const threatGroup = new THREE.Group();
    scene.add(threatGroup);
    threatGroupRef.current = threatGroup;

    // --- A. IED BOMB MODEL ---
    const bombGroup = new THREE.Group();
    threatGroup.add(bombGroup);
    bombMeshRef.current = bombGroup;

    // Metallic mounting bracket clamped to rail/sleeper
    const clampGeo = new THREE.BoxGeometry(0.28, 0.04, 0.18);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const clampMesh = new THREE.Mesh(clampGeo, clampMat);
    clampMesh.position.y = 0.02;
    bombGroup.add(clampMesh);

    // Military PE4 / C-4 Explosive Brick
    const c4Geo = new THREE.BoxGeometry(0.24, 0.1, 0.14);
    const c4Mat = new THREE.MeshStandardMaterial({
      color: 0x2b2b1a,
      roughness: 0.8,
    });
    const c4Mesh = new THREE.Mesh(c4Geo, c4Mat);
    c4Mesh.position.set(0, 0.09, 0);
    c4Mesh.castShadow = true;
    bombGroup.add(c4Mesh);

    // Red warning stripe on bomb
    const bombStripeGeo = new THREE.BoxGeometry(0.04, 0.102, 0.142);
    const bombStripeMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const bombStripe = new THREE.Mesh(bombStripeGeo, bombStripeMat);
    bombStripe.position.set(0, 0.09, 0);
    bombGroup.add(bombStripe);

    // Detonator Microcontroller Box
    const detGeo = new THREE.BoxGeometry(0.08, 0.04, 0.08);
    const detMat = new THREE.MeshStandardMaterial({ color: 0x050d1a, metalness: 0.9 });
    const detBox = new THREE.Mesh(detGeo, detMat);
    detBox.position.set(0, 0.155, 0);
    bombGroup.add(detBox);

    // Detonator Blinking LED Beacon
    const detLedGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const detLedMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const detLed = new THREE.Mesh(detLedGeo, detLedMat);
    detLed.position.set(0, 0.18, 0);
    bombGroup.add(detLed);

    // Detonator Wires (coiled red and blue curves)
    const wireMatRed = new THREE.LineBasicMaterial({ color: 0xff2222, linewidth: 2 });
    const wireGeoRed = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.16, 0.03),
      new THREE.Vector3(0.06, 0.14, 0.07),
      new THREE.Vector3(0.09, 0.08, 0.05),
    ]);
    const redWire = new THREE.Line(wireGeoRed, wireMatRed);
    bombGroup.add(redWire);

    // Pulsing Point Light from Detonator
    const bombPointLight = new THREE.PointLight(0xff0055, 2.5, 3.5);
    bombPointLight.position.set(0, 0.22, 0);
    bombGroup.add(bombPointLight);
    bombLightRef.current = bombPointLight;

    // AR Holographic 3D Warning Wireframe Bounding Box around Bomb
    const arBoxGeo = new THREE.BoxGeometry(0.42, 0.32, 0.32);
    const arBoxEdges = new THREE.EdgesGeometry(arBoxGeo);
    const arBoxMat = new THREE.LineBasicMaterial({ color: 0xff0055, linewidth: 2 });
    const arBoxWire = new THREE.LineSegments(arBoxEdges, arBoxMat);
    arBoxWire.position.set(0, 0.12, 0);
    bombGroup.add(arBoxWire);

    // AR Hazard Ring on ground
    const arRingGeo = new THREE.RingGeometry(0.28, 0.34, 24);
    const arRingMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const arRing = new THREE.Mesh(arRingGeo, arRingMat);
    arRing.rotation.x = -Math.PI / 2;
    arRing.position.set(0, 0.01, 0);
    bombGroup.add(arRing);

    // --- B. NARCOTICS / HAZARDOUS VAPOR CANISTER ---
    const drugsGroup = new THREE.Group();
    threatGroup.add(drugsGroup);
    narcoticsMeshRef.current = drugsGroup;

    // Contraband Canister cylinder
    const canGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const canMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const canister = new THREE.Mesh(canGeo, canMat);
    canister.position.set(0, 0.1, 0);
    canister.castShadow = true;
    drugsGroup.add(canister);

    // Amber vapor glowing rings
    const vaporRingGeo = new THREE.RingGeometry(0.06, 0.14, 16);
    const vaporRingMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const vaporRing = new THREE.Mesh(vaporRingGeo, vaporRingMat);
    vaporRing.rotation.x = -Math.PI / 2;
    vaporRing.position.set(0, 0.22, 0);
    drugsGroup.add(vaporRing);

    // Amber vapor point light
    const drugsLight = new THREE.PointLight(0xffaa00, 2.0, 3.0);
    drugsLight.position.set(0, 0.2, 0);
    drugsGroup.add(drugsLight);

    // --- C. DISRUPTOR ACOUSTIC PULSE / SHOCKWAVE EFFECT ---
    const shockGeo = new THREE.RingGeometry(0.1, 0.18, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockGeo, shockMat);
    shockwaveMesh.rotation.y = Math.PI / 2;
    shockwaveMesh.visible = false;
    scene.add(shockwaveMesh);
    shockwaveMeshRef.current = shockwaveMesh;

    // ==========================================
    // 7. HIGH-FIDELITY QUADRUPED ROBOT (Project VANGUARD)
    // ==========================================
    const robot = new THREE.Group();
    scene.add(robot);
    robotGroupRef.current = robot;

    const bodyL = 0.92;
    const bodyW = 0.44;
    const bodyH = 0.22;

    // Torso Main Frame (Matte Military Armor)
    const torsoGeo = new THREE.BoxGeometry(bodyL, bodyH, bodyW);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x091524,
      metalness: 0.85,
      roughness: 0.25,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.castShadow = true;
    robot.add(torsoMesh);

    // Carbon-fiber Top Cover Plate
    const topPlateGeo = new THREE.BoxGeometry(bodyL * 0.85, 0.03, bodyW * 0.85);
    const topPlateMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.9,
      roughness: 0.1,
    });
    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.position.y = bodyH / 2 + 0.015;
    robot.add(topPlate);

    // Indian Railways Livery & Hazard Stripes
    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0x442200,
      metalness: 0.6,
      roughness: 0.3,
    });
    const stripeGeo = new THREE.BoxGeometry(0.12, bodyH * 0.8, 0.01);
    [-0.32, 0.32].forEach((sx) => {
      const stripeL = new THREE.Mesh(stripeGeo, hazardMat);
      stripeL.position.set(sx, 0, bodyW / 2 + 0.006);
      robot.add(stripeL);

      const stripeR = new THREE.Mesh(stripeGeo, hazardMat);
      stripeR.position.set(sx, 0, -bodyW / 2 - 0.006);
      robot.add(stripeR);
    });

    // Glowing Neon Chassis Accent Edges
    const edgeGeo = new THREE.EdgesGeometry(torsoGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    robot.add(edgeLines);

    // Front Sensor Turret & Pan-Tilt Head Gimbal
    const headGimbal = new THREE.Group();
    headGimbal.position.set(bodyL / 2 + 0.06, 0.04, 0);
    robot.add(headGimbal);
    headGimbalRef.current = headGimbal;

    // Head Visor Housing
    const headGeo = new THREE.BoxGeometry(0.16, 0.14, 0.22);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x050d1a, metalness: 0.9, roughness: 0.2 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.castShadow = true;
    headGimbal.add(headMesh);

    // Optical Eye Lenses: Left (Thermal FLIR - Red Glowing), Right (RGB Laser - Cyan Glowing)
    const flirLensGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16);
    const flirLensMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xaa0033,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });
    const flirLens = new THREE.Mesh(flirLensGeo, flirLensMat);
    flirLens.rotation.z = Math.PI / 2;
    flirLens.position.set(0.08, 0.02, 0.05);
    headGimbal.add(flirLens);

    const rgbLensMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x0088aa,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });
    const rgbLens = new THREE.Mesh(flirLensGeo, rgbLensMat);
    rgbLens.rotation.z = Math.PI / 2;
    rgbLens.position.set(0.08, 0.02, -0.05);
    headGimbal.add(rgbLens);

    // Chemical Sniffer Nozzle mounted below head
    const snifferNozzleGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.08, 12);
    const snifferNozzleMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.9 });
    const snifferNozzle = new THREE.Mesh(snifferNozzleGeo, snifferNozzleMat);
    snifferNozzle.rotation.x = Math.PI / 2;
    snifferNozzle.position.set(0.06, -0.06, 0);
    headGimbal.add(snifferNozzle);

    // Top 360° LiDAR Dome
    const lidarBaseGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.06, 16);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const lidarBase = new THREE.Mesh(lidarBaseGeo, lidarMat);
    lidarBase.position.set(0, bodyH / 2 + 0.04, 0);
    robot.add(lidarBase);

    const lidarRingGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16);
    const lidarRingMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      emissive: 0x00bb44,
      emissiveIntensity: 1.0,
    });
    const lidarRing = new THREE.Mesh(lidarRingGeo, lidarRingMat);
    lidarRing.position.set(0, bodyH / 2 + 0.08, 0);
    robot.add(lidarRing);
    lidarRingMatRef.current = lidarRingMat;

    // Dual Emergency Warning Strobes on Shoulders
    const strobeL = new THREE.PointLight(0xff0044, 0, 4);
    strobeL.position.set(bodyL * 0.25, bodyH / 2 + 0.06, bodyW * 0.45);
    robot.add(strobeL);

    const strobeR = new THREE.PointLight(0xff0044, 0, 4);
    strobeR.position.set(bodyL * 0.25, bodyH / 2 + 0.06, -bodyW * 0.45);
    robot.add(strobeR);
    emergencyStrobesRef.current = [strobeL, strobeR];

    // Active Volumetric Laser Fan-Beam (Sweeping down across tracks)
    const laserConeGeo = new THREE.ConeGeometry(0.65, 2.2, 16, 1, true);
    const laserConeMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const laserMesh = new THREE.Mesh(laserConeGeo, laserConeMat);
    laserMesh.rotation.z = -Math.PI / 2 + 0.35;
    laserMesh.position.set(1.2, -0.15, 0);
    headGimbal.add(laserMesh);
    laserBeamRef.current = laserMesh;
    laserMatRef.current = laserConeMat;

    // Dual Front LED Spotlights
    const leftSpot = new THREE.SpotLight(0xffffff, 4.0, 10, Math.PI / 5, 0.4);
    leftSpot.position.set(bodyL / 2 + 0.1, 0.05, 0.12);
    leftSpot.target.position.set(bodyL / 2 + 3.0, -0.5, 0.12);
    robot.add(leftSpot);
    robot.add(leftSpot.target);

    const rightSpot = new THREE.SpotLight(0xffffff, 4.0, 10, Math.PI / 5, 0.4);
    rightSpot.position.set(bodyL / 2 + 0.1, 0.05, -0.12);
    rightSpot.target.position.set(bodyL / 2 + 3.0, -0.5, -0.12);
    robot.add(rightSpot);
    robot.add(rightSpot.target);

    // 4 Articulated Legs (FL, FR, RL, RR) with Hydraulic Shock Absorbers & Contact Pads
    const legIDs = [
      { id: 'FL', x: bodyL * 0.4, z: bodyW * 0.58, isLeft: true },
      { id: 'FR', x: bodyL * 0.4, z: -bodyW * 0.58, isLeft: false },
      { id: 'RL', x: -bodyL * 0.4, z: bodyW * 0.58, isLeft: true },
      { id: 'RR', x: -bodyL * 0.4, z: -bodyW * 0.58, isLeft: false },
    ];

    const servoMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x005577,
      metalness: 0.9,
    });
    const legCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const footMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0x553300,
      metalness: 0.5,
      roughness: 0.6,
    });

    legIDs.forEach((leg) => {
      const hipGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16);
      const hipMesh = new THREE.Mesh(hipGeo, servoMat);
      hipMesh.rotation.x = Math.PI / 2;
      hipMesh.position.set(leg.x, 0, leg.z);
      robot.add(hipMesh);

      const femurGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.28, 12);
      const femur = new THREE.Mesh(femurGeo, legCarbonMat);
      femur.castShadow = true;
      scene.add(femur);

      const shockGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8);
      const shock = new THREE.Mesh(shockGeo, servoMat);
      scene.add(shock);

      const kneeGeo = new THREE.SphereGeometry(0.048, 14, 14);
      const knee = new THREE.Mesh(kneeGeo, servoMat);
      scene.add(knee);

      const tibiaGeo = new THREE.CylinderGeometry(0.03, 0.022, 0.32, 12);
      const tibia = new THREE.Mesh(tibiaGeo, legCarbonMat);
      tibia.castShadow = true;
      scene.add(tibia);

      const footGeo = new THREE.SphereGeometry(0.055, 14, 14);
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.castShadow = true;
      scene.add(foot);

      legComponentsRef.current[leg.id] = {
        femur,
        knee,
        tibia,
        foot,
        shockPiston: shock,
      };
    });

    // Orbit Drag Handling
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;

      orbitAngleRef.current.theta += dx * 0.007;
      orbitAngleRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.08, orbitAngleRef.current.phi - dy * 0.007));

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAngleRef.current.radius = Math.max(2.2, Math.min(8.5, orbitAngleRef.current.radius + e.deltaY * 0.0035));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 8. CONTINUOUS 60FPS SIMULATION ANIMATION LOOP
    // ==========================================
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Proactive Threat State Evaluation (Reading from refs for seamless 60FPS updates)
      const currentScenario = scenarioRef.current;
      const currentThreat = activeThreatRef.current;
      const isBombThreat = currentScenario === 'bomb' || currentThreat === 'Explosive Class 1.1';
      const isNarcoticsThreat = currentScenario === 'drugs' || currentThreat === 'Narcotics';
      const hasActiveThreat = isBombThreat || isNarcoticsThreat;
      const currentEStop = eStopActiveRef.current;
      const currentPatrolMode = patrolModeRef.current;
      const currentDisarmed = isDisarmedRef.current;
      const currentClearanceCm = clearanceCmRef.current;
      const currentPitch = pitchAngleRef.current;
      const currentRoll = rollAngleRef.current;
      const currentLaserActive = laserScanActiveRef.current;
      const currentCameraMode = cameraModeRef.current;
      const advanceChainage = onAdvanceChainageRef.current;

      // Position Threat Objects right in front of the robot on the track
      if (threatGroupRef.current) {
        threatGroupRef.current.visible = hasActiveThreat;
        if (hasActiveThreat) {
          // Lock threat location 1.25m ahead of robot on track
          threatGroupRef.current.position.set(robotPosRef.current.x + 1.25, 0, 0.12);
        }
      }

      if (bombMeshRef.current) {
        bombMeshRef.current.visible = isBombThreat;
        if (isBombThreat && bombLightRef.current) {
          // Pulsing detonator light
          const pulse = Math.sin(time * 18);
          bombLightRef.current.intensity = currentDisarmed ? 0.3 : pulse > 0 ? 3.5 : 0.4;
          bombLightRef.current.color.setHex(currentDisarmed ? 0x00ff66 : 0xff0044);
        }
      }

      if (narcoticsMeshRef.current) {
        narcoticsMeshRef.current.visible = isNarcoticsThreat;
      }

      // Disruptor Shockwave Animation
      if (shockwaveMeshRef.current && shockwaveAnimRef.current.active) {
        const sw = shockwaveAnimRef.current;
        sw.scale += delta * 4.5;
        sw.opacity = Math.max(0, sw.opacity - delta * 2.2);
        shockwaveMeshRef.current.position.set(robotPosRef.current.x + 0.6 + sw.scale * 0.25, 0.15, 0);
        shockwaveMeshRef.current.scale.set(sw.scale, sw.scale, sw.scale);
        (shockwaveMeshRef.current.material as THREE.MeshBasicMaterial).opacity = sw.opacity;

        if (sw.opacity <= 0.05) {
          sw.active = false;
          shockwaveMeshRef.current.visible = false;
        }
      }

      // PROACTIVE ROBOT BEHAVIOR:
      // When a threat is simulated, the robot HALTS proactively! It does NOT keep walking blindly into the bomb!
      const shouldWalk = !hasActiveThreat && !currentEStop;

      if (shouldWalk) {
        walkPhaseRef.current += delta * 4.2 * 4.2;
        const forwardStep = delta * (currentPatrolMode === 'Trot' ? 0.9 : 0.45);
        robotPosRef.current.x += forwardStep;

        if (robotPosRef.current.x > trackSpan / 2 - 2.5) {
          robotPosRef.current.x = -trackSpan / 2 + 2.5;
        }

        if (advanceChainage && Math.random() < 0.04) {
          advanceChainage(0.001);
        }

        if (time - lastFootstepTimeRef.current > 0.45) {
          playFootstepSound();
          lastFootstepTimeRef.current = time;
        }
      }

      // PROACTIVE TACTICAL CROUCH / POSTURE:
      // When bomb is simulated, robot drops into tactical low-clearance crouch (14cm)!
      // When safe, robot stands tall at nominal clearance (28cm).
      let targetClearance = currentClearanceCm / 100.0; // 0.28m
      if (isBombThreat) {
        targetClearance = 0.14; // Tactical crouch
      } else if (isNarcoticsThreat) {
        targetClearance = 0.22; // Sniffer crawl
      }
      currentClearanceRef.current = THREE.MathUtils.lerp(
        currentClearanceRef.current,
        targetClearance,
        delta * 3.5
      );

      const bobY = shouldWalk ? Math.sin(walkPhaseRef.current * 2) * 0.016 : 0;
      const trotRoll = shouldWalk ? Math.cos(walkPhaseRef.current) * 0.022 : 0;
      const currentPitchRad = (currentPitch * Math.PI) / 180;
      const currentRollRad = (currentRoll * Math.PI) / 180 + trotRoll;

      robot.position.set(robotPosRef.current.x, currentClearanceRef.current + bodyH / 2 + bobY, 0);
      robot.rotation.set(currentRollRad, 0, -currentPitchRad);

      // REACTIVE DETECTION ANIMATION: Chassis Shake (Three.js High-Intensity Jitter Recoil + Suspension Damping)
      if (shakeIntensityRef.current > 0.001) {
        const shake = shakeIntensityRef.current;
        const jitterY = (Math.sin(time * 65) + (Math.random() - 0.5) * 0.9) * 0.032 * shake;
        const jitterZ = (Math.cos(time * 50) + (Math.random() - 0.5) * 0.9) * 0.026 * shake;
        const jitterPitch = (Math.sin(time * 44) + (Math.random() - 0.5) * 0.8) * 0.075 * shake;
        const jitterRoll = (Math.cos(time * 58) + (Math.random() - 0.5) * 0.8) * 0.075 * shake;

        robot.position.y += jitterY;
        robot.position.z += jitterZ;
        robot.rotation.x += jitterRoll;
        robot.rotation.z += jitterPitch;

        // Exponential decay of chassis shake over ~1.3 seconds
        shakeIntensityRef.current = THREE.MathUtils.lerp(
          shakeIntensityRef.current,
          0,
          delta * 2.6
        );
      }

      // Constant LiDAR spin
      lidarRing.rotation.y += 0.06;

      // PROACTIVE SENSOR GIMBAL HEAD LOCK & LASER BEAM
      if (headGimbalRef.current) {
        if (isBombThreat) {
          // PROACTIVE LOCK: Head gimbal points down & directly aims at the IED bomb on the track!
          headGimbalRef.current.rotation.x = THREE.MathUtils.lerp(
            headGimbalRef.current.rotation.x,
            -0.34,
            delta * 5.0
          );
          headGimbalRef.current.rotation.y = THREE.MathUtils.lerp(
            headGimbalRef.current.rotation.y,
            0.1,
            delta * 5.0
          );
        } else if (isNarcoticsThreat) {
          // PROACTIVE SNIFF: Head tilts up towards under-coach plenum
          headGimbalRef.current.rotation.x = THREE.MathUtils.lerp(
            headGimbalRef.current.rotation.x,
            0.22,
            delta * 5.0
          );
          headGimbalRef.current.rotation.y = Math.sin(time * 3.0) * 0.12;
        } else {
          // NOMINAL: Gentle scanning sweep across the rails
          headGimbalRef.current.rotation.y = Math.sin(time * 2.2) * 0.18;
          headGimbalRef.current.rotation.x = Math.sin(time * 1.5) * 0.08;
        }
      }

      // PROACTIVE LASER BEAM COLORS & FOCUS
      if (laserBeamRef.current && laserMatRef.current) {
        laserBeamRef.current.visible = currentLaserActive;
        if (isBombThreat) {
          // Intense Red Targeting / Neutralizing Beam focused on bomb
          laserMatRef.current.color.setHex(currentDisarmed ? 0x00ff66 : 0xff0044);
          laserMatRef.current.opacity = 0.42;
          laserBeamRef.current.scale.set(0.45, 1.2, 0.45);
        } else if (isNarcoticsThreat) {
          // Amber Vapor Analysis Beam
          laserMatRef.current.color.setHex(0xffaa00);
          laserMatRef.current.opacity = 0.35;
          laserBeamRef.current.scale.set(0.8, 1.0, 0.8);
        } else {
          // Nominal Cyan Sweeping Beam
          laserMatRef.current.color.setHex(0x00f3ff);
          laserMatRef.current.opacity = 0.22;
          laserBeamRef.current.scale.set(1.0, 1.0, 1.0);
          laserBeamRef.current.rotation.y = Math.sin(time * 3.5) * 0.25;
        }
      }

      // PROACTIVE EMERGENCY STROBE LIGHTS & LIDAR COLOR
      if (lidarRingMatRef.current) {
        if (isBombThreat) {
          lidarRingMatRef.current.color.setHex(0xff0044);
          lidarRingMatRef.current.emissive.setHex(0xaa0022);
        } else if (isNarcoticsThreat) {
          lidarRingMatRef.current.color.setHex(0xffaa00);
          lidarRingMatRef.current.emissive.setHex(0xaa5500);
        } else {
          lidarRingMatRef.current.color.setHex(0x00ff66);
          lidarRingMatRef.current.emissive.setHex(0x00bb44);
        }
      }

      emergencyStrobesRef.current.forEach((strobe) => {
        if (isBombThreat && !currentDisarmed) {
          // Rapid emergency 6Hz strobe flash
          strobe.color.setHex(0xff0044);
          strobe.intensity = Math.sin(time * 28) > 0 ? 4.5 : 0.0;
        } else if (isNarcoticsThreat) {
          strobe.color.setHex(0xffaa00);
          strobe.intensity = Math.sin(time * 12) > 0 ? 3.0 : 0.0;
        } else {
          strobe.intensity = 0.0;
        }
      });

      // Update Articulated Legs Inverse Kinematics
      const stepPhase = walkPhaseRef.current;
      legIDs.forEach((leg) => {
        const comp = legComponentsRef.current[leg.id];
        if (!comp) return;

        const localHip = new THREE.Vector3(leg.x, -bodyH * 0.35, leg.z);
        localHip.applyEuler(robot.rotation);
        const worldHip = localHip.add(robot.position);

        // Footpad target position on ballast
        const trackZ = leg.isLeft ? railHalfGauge * 0.72 : -railHalfGauge * 0.72;
        let footX = worldHip.x + (leg.x > 0 ? 0.1 : -0.1);
        let footY = 0.02;

        const isDiagonalGroupA = leg.id === 'FL' || leg.id === 'RR';
        const legPhase = isDiagonalGroupA ? stepPhase : stepPhase + Math.PI;

        if (shouldWalk) {
          const swingLift = Math.max(0, Math.sin(legPhase));
          footY += swingLift * (currentPatrolMode === 'Trot' ? 0.09 : 0.04);
          footX += Math.cos(legPhase) * 0.08;
        } else {
          // When crouched and stationary, feet are firmly planted and spread slightly
          footX = worldHip.x + (leg.x > 0 ? 0.16 : -0.16);
        }

        const worldFoot = new THREE.Vector3(footX, footY, trackZ);

        // Knee mid point with elbow outward flare
        const midKnee = worldHip.clone().add(worldFoot).multiplyScalar(0.5);
        midKnee.z += leg.isLeft ? 0.14 : -0.14;
        midKnee.y += currentClearanceRef.current * 0.38;

        // Position Femur (Hip to Knee)
        comp.femur.position.copy(worldHip.clone().add(midKnee).multiplyScalar(0.5));
        comp.femur.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          midKnee.clone().sub(worldHip).normalize()
        );
        comp.femur.scale.set(1, worldHip.distanceTo(midKnee) / 0.28, 1);

        // Position Knee Actuator
        comp.knee.position.copy(midKnee);

        // Position Tibia (Knee to Foot)
        comp.tibia.position.copy(midKnee.clone().add(worldFoot).multiplyScalar(0.5));
        comp.tibia.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          worldFoot.clone().sub(midKnee).normalize()
        );
        comp.tibia.scale.set(1, midKnee.distanceTo(worldFoot) / 0.32, 1);

        // Position Footpad
        comp.foot.position.copy(worldFoot);

        // Shock absorber piston
        comp.shockPiston.position.copy(worldHip.clone().add(midKnee).multiplyScalar(0.5));
        comp.shockPiston.position.z += leg.isLeft ? 0.03 : -0.03;
      });

      // CAMERA MODES - ROBO CHASE STABLE & NEVER DISAPPEARS
      if (cameraRef.current) {
        if (currentCameraMode === 'CHASE') {
          const targetCamPos = new THREE.Vector3(
            robot.position.x - 2.8,
            robot.position.y + 1.15,
            robot.position.z + 1.6
          );
          if (cameraRef.current.position.distanceTo(targetCamPos) > 6.0) {
            cameraRef.current.position.copy(targetCamPos);
          } else {
            cameraRef.current.position.lerp(targetCamPos, 0.12);
          }
          cameraRef.current.lookAt(robot.position.x + 1.1, robot.position.y + 0.1, 0);
        } else if (currentCameraMode === 'FPS') {
          cameraRef.current.position.set(
            robot.position.x + bodyL / 2 + 0.12,
            robot.position.y + 0.08,
            robot.position.z
          );
          cameraRef.current.lookAt(
            robot.position.x + 4.5,
            robot.position.y - 0.1,
            robot.position.z
          );
        } else if (currentCameraMode === 'TRACKSIDE') {
          cameraRef.current.position.set(robot.position.x + 2.5, 0.22, 1.45);
          cameraRef.current.lookAt(robot.position.x, 0.3, 0);
        } else {
          // Free Orbit Mode
          const { theta, phi, radius } = orbitAngleRef.current;
          cameraRef.current.position.x = robot.position.x + radius * Math.sin(phi) * Math.sin(theta);
          cameraRef.current.position.y = robot.position.y + radius * Math.cos(phi);
          cameraRef.current.position.z = robot.position.z + radius * Math.sin(phi) * Math.cos(theta);
          cameraRef.current.lookAt(robot.position.x, robot.position.y + 0.15, robot.position.z);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []); // Mounted once: Three.js canvas never tears down or resets during scenario updates!

  const isBomb = scenario === 'bomb' || activeThreat === 'Explosive Class 1.1';
  const isDrugs = scenario === 'drugs' || activeThreat === 'Narcotics';
  const isNominal = !isBomb && !isDrugs;

  return (
    <div
      className={`relative w-full rounded overflow-hidden select-none transition-all duration-300 ${
        detectionAnim.active ? 'animate-chassis-shake' : ''
      } ${
        isBomb
          ? 'border-2 border-[#ff0055] animate-flash-red-border'
          : isDrugs
          ? 'border-2 border-[#ffaa00] animate-flash-amber-border'
          : 'border border-[#1e293b] bg-[#040812]'
      }`}
    >
      {/* Three.js Canvas Container - Persistent */}
      <div ref={mountRef} className="w-full h-[360px] cursor-grab active:cursor-grabbing" />

      {/* REACTIVE DETECTION ANIMATION OVERLAY (TRIGGERED ON SCENARIO CHANGE TO BOMB OR DRUGS) */}
      {detectionAnim.active && (
        <div key={detectionAnim.key} className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3">
          {/* Flashing Full-Screen Perimeter Vignette */}
          <div
            className={`absolute inset-0 rounded pointer-events-none ${
              detectionAnim.threatType === 'bomb'
                ? 'border-[4px] border-[#ff0055] shadow-[inset_0_0_60px_rgba(255,0,85,0.7)]'
                : 'border-[4px] border-[#ffaa00] shadow-[inset_0_0_60px_rgba(255,170,0,0.7)]'
            } animate-pulse`}
          />

          {/* Tactical Corner Reticle Brackets */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#ff0055] animate-ping" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#ff0055] animate-ping" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#ff0055] animate-ping" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#ff0055] animate-ping" />

          {/* Center Tactical Detection Alert Banner */}
          <div className="mx-auto mt-14 bg-black/92 border-2 border-[#ff0055] text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(255,0,85,0.85)] flex items-center gap-3 animate-bounce">
            <ShieldAlert className="w-5 h-5 text-[#ff0055] animate-pulse shrink-0" />
            <div className="text-left font-mono">
              <div className="text-xs font-black tracking-widest text-[#ff0055] uppercase font-['Chakra_Petch'] flex items-center gap-2">
                <span>🚨 DETECTION ANIMATION: CHASSIS SHAKE &amp; HALT TRIGGERED</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#ff0055]/30 text-white font-mono">ACTIVE</span>
              </div>
              <div className="text-[11px] text-gray-300">
                {detectionAnim.threatType === 'bomb'
                  ? 'EXPLOSIVE DETECTED · CHASSIS RECOIL SHUDDER DAMPED · TACTICAL 14cm CROUCH'
                  : 'ILLICIT NARCOTICS DETECTED · CHASSIS RECOIL DAMPED · SNIFFER MAST ACTIVE'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Threat Border Vignette */}
      {(isBomb || isDrugs) && !detectionAnim.active && (
        <div
          className={`absolute inset-0 pointer-events-none z-10 rounded ${
            isBomb
              ? 'border-2 border-[#ff0055]/70 shadow-[inset_0_0_20px_rgba(255,0,85,0.25)]'
              : 'border-2 border-[#ffaa00]/70 shadow-[inset_0_0_20px_rgba(255,170,0,0.25)]'
          }`}
        />
      )}

      {/* TOP FLOATING HUD: Robot Proactive Status & Camera Switcher */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Left Status Lockup */}
        <div className="flex items-center gap-2 bg-[#050b14]/90 border border-[#1e293b] rounded-lg p-2 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBomb
                  ? 'bg-[#ff0055] animate-ping'
                  : isDrugs
                  ? 'bg-[#ffaa00] animate-pulse'
                  : 'bg-[#00ff66] animate-pulse'
              }`}
            />
            <span className="font-bold text-xs text-[#00f3ff] tracking-wider font-['Chakra_Petch']">
              VANGUARD 3D TWIN
            </span>
          </div>
          <span className="text-[#64748b]">|</span>
          <div className="text-[11px] font-mono text-[#cbd5e1] flex items-center gap-3">
            <span>
              SPEED:{' '}
              <b className={isNominal ? 'text-[#00ff66]' : 'text-[#ff0055]'}>
                {isNominal ? '4.8 km/h' : '0.0 km/h (HALTED)'}
              </b>
            </span>
            <span>
              POSTURE:{' '}
              <b className={isBomb ? 'text-[#ff0055]' : isDrugs ? 'text-[#ffaa00]' : 'text-[#38bdf8]'}>
                {isBomb ? 'DEFENSIVE CROUCH (14cm)' : isDrugs ? 'SNIFFER CRAWL (22cm)' : 'NOMINAL TROT (28cm)'}
              </b>
            </span>
            <span className="hidden sm:inline">
              THREAT:{' '}
              <b className={isBomb ? 'text-[#ff0055]' : isDrugs ? 'text-[#ffaa00]' : 'text-[#00ff66]'}>
                {activeThreat.toUpperCase()}
              </b>
            </span>
          </div>
        </div>

        {/* Right Camera & Laser Controls */}
        <div className="flex items-center gap-1.5 bg-[#050b14]/90 border border-[#1e293b] rounded-lg p-1.5 backdrop-blur-md pointer-events-auto">
          {(['CHASE', 'FPS', 'ORBIT', 'TRACKSIDE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setCameraMode(mode);
                cameraModeRef.current = mode;
              }}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded transition-colors cursor-pointer ${
                cameraMode === mode
                  ? 'bg-[#00f3ff] text-[#050b14] shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                  : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#0c182c]'
              }`}
            >
              {mode}
            </button>
          ))}

          <span className="text-[#64748b] mx-1">|</span>

          {/* Laser Scan Toggle */}
          <button
            onClick={() => {
              setLaserScanActive(!laserScanActive);
              playLaserScanSound();
            }}
            title="Toggle Volumetric LiDAR Fan-Beam"
            className={`px-2 py-1 text-[11px] font-mono font-bold rounded border transition-colors cursor-pointer ${
              laserScanActive
                ? isBomb
                  ? 'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/50'
                  : 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/50'
                : 'bg-[#0c1626] text-[#64748b] border-[#1e293b]'
            }`}
          >
            {isBomb ? 'TARGET LASER' : 'LASER SCAN'}
          </button>
        </div>
      </div>

      {/* FPS DRONE CROSSHAIR OVERLAY (Visible only in FPS Camera Mode) */}
      {cameraMode === 'FPS' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-48 h-48 border border-[#00f3ff]/30 rounded-full flex items-center justify-center">
            <div className="w-full h-[1px] bg-[#00f3ff]/40" />
            <div className="h-full w-[1px] bg-[#00f3ff]/40 absolute" />
            <div className="w-8 h-8 border border-[#00f3ff] rounded-sm absolute" />
            <div className="w-2 h-2 bg-[#00f3ff] rounded-full absolute animate-pulse" />
          </div>

          <div className="absolute top-16 left-6 font-mono text-xs text-[#00f3ff]">
            <div>PITCH: {pitchAngle > 0 ? `+${pitchAngle}` : pitchAngle}°</div>
            <div>ROLL: {rollAngle > 0 ? `+${rollAngle}` : rollAngle}°</div>
            <div>
              STANDOFF DISTANCE:{' '}
              <b className={isBomb ? 'text-[#ff0055]' : 'text-[#00ff66]'}>
                {isBomb ? '1.25 m (SAFE LOCK)' : '4.50 m'}
              </b>
            </div>
          </div>
          <div className="absolute top-16 right-6 font-mono text-xs text-right text-[#00ff66]">
            <div>OPTICS: 4K HIGH RES</div>
            <div>TRACK: BROAD GAUGE 1676mm</div>
            <div>
              ROBOT STATE: <b className="text-white">{isBomb ? 'HALTED & LOCKED' : 'PATROLLING'}</b>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM PROACTIVE ACTION BAR (NO CONFUSING CLUTTER / NO MANUAL KEYS) */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pointer-events-none">
        {/* Dynamic Proactive Reaction Banner & Countermeasure */}
        <div className="pointer-events-auto">
          {isBomb && (
            <div className="bg-[#2a0614]/95 border-2 border-[#ff0055] rounded-lg p-2.5 backdrop-blur-md flex flex-wrap items-center gap-3 shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff0055] animate-ping shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-[#ff99bb] flex items-center gap-1.5 font-['Chakra_Petch']">
                    <ShieldAlert className="w-4 h-4 text-[#ff0055]" />
                    PROACTIVE THREAT REACTION: HALTED & LOCKED ON IED BOMB
                  </div>
                  <div className="text-[11px] text-[#ffccd8]">
                    Clearance lowered to 14cm (Tactical Crouch) · Target standoff 1.25m · Detonation jammer active
                  </div>
                </div>
              </div>

              {/* Instant Disarm Countermeasure Button for Judges */}
              <button
                onClick={handleTriggerDisarm}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                  isDisarmed
                    ? 'bg-[#00ff66] text-[#050b14] shadow-[0_0_12px_rgba(0,255,102,0.6)]'
                    : 'bg-[#ff0055] hover:bg-[#ff2266] text-white shadow-[0_0_12px_rgba(255,0,85,0.6)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {isDisarmed ? '✅ BOMB DISARMED & SECURED' : '⚡ TRIGGER ACOUSTIC DISRUPTOR'}
              </button>
            </div>
          )}

          {isDrugs && (
            <div className="bg-[#261704]/95 border-2 border-[#ffaa00] rounded-lg p-2.5 backdrop-blur-md flex items-center gap-3 shadow-[0_0_15px_rgba(255,170,0,0.3)] animate-fadeIn">
              <span className="w-3 h-3 rounded-full bg-[#ffaa00] animate-pulse shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-[#ffd080] flex items-center gap-1.5 font-['Chakra_Petch']">
                  <AlertTriangle className="w-4 h-4 text-[#ffaa00]" />
                  PROACTIVE THREAT REACTION: AUTO-SNIFFER ACTIVE (76.2 PPM)
                </div>
                <div className="text-[11px] text-[#ffe6b3]">
                  Halted at undercarriage plenum · Mast elevated · Clandestine chemical vapor mapped
                </div>
              </div>
            </div>
          )}

          {isNominal && (
            <div className="bg-[#05160e]/90 border border-[#00ff66]/50 rounded-lg px-3 py-2 backdrop-blur-md flex items-center gap-2.5 shadow-[0_0_12px_rgba(0,255,102,0.2)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#99ffcc] font-['Chakra_Petch']">
                  AUTONOMOUS CORRIDOR PATROL ACTIVE
                </span>
                <span className="text-[#64748b]"> · </span>
                <span className="text-[#cbd5e1] text-[11px]">
                  UIC-60 Broad Gauge (1676mm) · 4.8 km/h sweep · 0 anomalies
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Track Milestone Mini-Badge */}
        <div className="bg-[#050b14]/85 border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs font-mono text-[#ffffff] backdrop-blur-md pointer-events-auto">
          <span className="text-[#64748b]">SECTION: </span>
          <span className="text-[#00f3ff] font-bold">COIMBATORE JUNCTION (CBE)</span>
          <span className="text-[#64748b]"> · </span>
          <span className="text-[#00ff66]">KM 498.420</span>
        </div>
      </div>
    </div>
  );
};
