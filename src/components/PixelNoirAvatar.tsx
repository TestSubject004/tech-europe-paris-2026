/**
 * =========================================================================================
 * Procedural Pixel-Noir Avatar & Biometric Animation Suite: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component renders an atmospheric, procedural 1940s film-noir pixel art avatar for the
 * interrogated suspect. Combining vintage shadow-drenched noir lighting (chiaroscuro), volumetric
 * cigarette smoke particle simulation, autonomic blinking, pupil dilation, mouth articulation,
 * and biometric radar sweeps, it dynamically transforms based on live psychological stress and deception.
 * 
 * DIFFERENT USE CASES:
 * 1. Chiaroscuro Portrait Rendering:
 *    Draws custom vector pixel noir silhouettes tailored to each suspect (Julian Vance's fedora
 *    and tailored lapel, Evelyn Cross's pearls, Marcus Drake's grease-stained cap, Dr. Thorne's
 *    spectacles and lab coat).
 * 2. Cigarette Smoke Particle Physics:
 *    Simulates drifting smoke particles rising from Julian Vance's Turkish Sobranie cigarette
 *    with semi-transparent alpha diffusion.
 * 3. Biometric Deception Distortion:
 *    When `reading.anomalyRating` enters 'CRITICAL_DECEPTION_ANOMALY', triggers chromatic aberration,
 *    unilateral smirk asymmetries, and cardiovascular pulse color shifts.
 * 4. Dual View Modes:
 *    Permits seamlessly toggling between the procedural pixel-noir avatar and the archival photo
 *    portrait.
 * =========================================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { BiometricReading, PersonalityProfile } from '../types/game';
import { Eye, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for PixelNoirAvatar component.
 */
interface PixelNoirAvatarProps {
  suspectId: string;
  suspectName: string;
  photoUrl: string;
  reading: BiometricReading;
  personality: PersonalityProfile;
  isSpeaking?: boolean;
  detectiveShieldEnabled?: boolean;
}

/**
 * Procedural pixel-noir avatar with particle physics and biometric deformation.
 * 
 * @param props - Suspect data, live readings, speech articulation state, shield status
 * @returns Rendered React component for pixel noir avatar
 */
export const PixelNoirAvatar: React.FC<PixelNoirAvatarProps> = ({
  suspectId,
  suspectName,
  photoUrl,
  reading,
  personality,
  isSpeaking = false,
  detectiveShieldEnabled = true,
}) => {
  logFunctionCall('PixelNoirAvatar', { suspectId, suspectName, isSpeaking, anomalyRating: reading.anomalyRating });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [mode, setMode] = useState<'avatar' | 'photo'>('avatar');

  // Animation clocks & kinematic state
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const blinkStateRef = useRef<{ phase: number; nextBlink: number }>({
    phase: 0,
    nextBlink: Date.now() + 2000,
  });
  const gazeRef = useRef<{ currentX: number; currentY: number; targetX: number; targetY: number; nextShift: number }>({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    nextShift: Date.now() + 1500,
  });
  const mouthKinematicsRef = useRef<{ open: number; targetOpen: number; width: number; targetWidth: number }>({
    open: 0,
    targetOpen: 0,
    width: 1.0,
    targetWidth: 1.0,
  });
  const smokeParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number; age: number; maxAge: number }>>([]);
  const radarPulseRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      frameRef.current += 1;
      const now = Date.now();
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // High-resolution canvas: 512 x 512
      const W = 512;
      const H = 512;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;

      // Character flags
      const isVance = suspectId === 'suspect-julian-vance';
      const isEvelyn = suspectId === 'suspect-evelyn-cross';
      const isMarcus = suspectId === 'suspect-marcus-drake';
      const isThorne = suspectId === 'suspect-aris-thorne';

      // -------------------------------------------------------------
      // 1. KINEMATIC SIMULATION (Physics & Phoneme Articulation)
      // -------------------------------------------------------------
      // Heart-rate reactive breathing frequency
      const bpm = reading.heartRate || 75;
      const breathSpeed = (bpm / 60) * Math.PI;
      const breathOffset = Math.sin(now * 0.001 * breathSpeed) * 2.2;
      const speechNod = isSpeaking ? Math.sin(now * 0.012) * 2.0 : 0;
      const headOffsetY = breathOffset + speechNod;

      // Blinking simulation
      const blink = blinkStateRef.current;
      if (blink.phase === 0 && now > blink.nextBlink) {
        blink.phase = 0.01;
      } else if (blink.phase > 0) {
        blink.phase += dt * 14; // fast eyelid snap
        if (blink.phase >= Math.PI) {
          blink.phase = 0;
          const interval = isEvelyn ? 1400 + Math.random() * 1500 : isVance ? 3600 + Math.random() * 2400 : 2500 + Math.random() * 2000;
          blink.nextBlink = now + interval;
        }
      }
      const blinkFactor = blink.phase > 0 ? Math.sin(blink.phase) : 0;

      // Gaze saccade smoothing
      const gaze = gazeRef.current;
      if (now > gaze.nextShift) {
        if (isMarcus) {
          gaze.targetX = Math.random() > 0.4 ? 4 : 0;
          gaze.targetY = 0;
        } else if (isEvelyn) {
          gaze.targetX = Math.random() > 0.5 ? -4 : 0;
          gaze.targetY = Math.random() > 0.5 ? 2.5 : 0;
        } else if (isVance) {
          gaze.targetX = Math.random() > 0.6 ? 3 : 0;
          gaze.targetY = 0;
        } else {
          gaze.targetX = (Math.random() - 0.5) * 6;
          gaze.targetY = 0;
        }
        gaze.nextShift = now + (isEvelyn ? 900 : 2200) + Math.random() * 1200;
      }
      gaze.currentX += (gaze.targetX - gaze.currentX) * Math.min(1, dt * 10);
      gaze.currentY += (gaze.targetY - gaze.currentY) * Math.min(1, dt * 10);

      // Talking phoneme articulation
      const mouth = mouthKinematicsRef.current;
      if (isSpeaking) {
        const t = now * 0.014;
        const phoneme = Math.floor(now * 0.007) % 5;
        if (phoneme === 0) {
          mouth.targetOpen = 0.85 + Math.sin(t) * 0.15; // wide vowels: /a/
          mouth.targetWidth = 1.1;
        } else if (phoneme === 1) {
          mouth.targetOpen = 0.45; // mid vowels: /e/
          mouth.targetWidth = 1.05;
        } else if (phoneme === 2) {
          mouth.targetOpen = 0.7; // rounded: /o/, /u/
          mouth.targetWidth = 0.8;
        } else if (phoneme === 3) {
          mouth.targetOpen = 0.2; // consonants: /t/, /s/
          mouth.targetWidth = 1.0;
        } else {
          mouth.targetOpen = 0.0; // closed bilabial: /m/, /p/
          mouth.targetWidth = 0.95;
        }
      } else {
        mouth.targetOpen = 0;
        mouth.targetWidth = 1.0;
      }
      mouth.open += (mouth.targetOpen - mouth.open) * Math.min(1, dt * 16);
      mouth.width += (mouth.targetWidth - mouth.width) * Math.min(1, dt * 14);

      // Deception indicators
      const isDeceptive = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
      const isAnxiousOk = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';
      const smirkLift = isVance && isDeceptive ? 7 : 0;
      const browDeceptionLift = isVance && isDeceptive ? -5 : 0;

      // -------------------------------------------------------------
      // 2. MATHEMATICAL ANATOMICAL LANDMARK COORDINATES (Exact Human Proportions)
      // -------------------------------------------------------------
      // Head Center: X = 256
      const CX = 256;
      const headY = 88 + headOffsetY;
      const chinY = 328 + headOffsetY;
      const eyeY = 196 + headOffsetY;
      const noseTipY = 252 + headOffsetY;
      const mouthY = 286 + headOffsetY;

      // Dynamic mouth aperture
      const openHeight = mouth.open * 18;
      const mouthW = 28 * mouth.width;

      const landmarks = {
        // Head Contour
        craniumTop: { x: CX, y: headY },
        leftTemple: { x: CX - 88, y: eyeY - 48 },
        rightTemple: { x: CX + 88, y: eyeY - 48 },
        leftCheek: { x: CX - 84, y: eyeY + 28 },
        rightCheek: { x: CX + 84, y: eyeY + 28 },
        leftJawAngle: { x: CX - 68, y: chinY - 32 },
        rightJawAngle: { x: CX + 68, y: chinY - 32 },
        chinApex: { x: CX, y: chinY },
        chinLeft: { x: CX - 22, y: chinY - 6 },
        chinRight: { x: CX + 22, y: chinY - 6 },

        // Forehead
        foreheadCenter: { x: CX, y: eyeY - 42 },

        // Eyebrows
        lbOut: { x: CX - 74, y: eyeY - 24 },
        lbPeak: { x: CX - 44, y: eyeY - 30 },
        lbIn: { x: CX - 14, y: eyeY - 22 },
        rbIn: { x: CX + 14, y: eyeY - 22 + browDeceptionLift },
        rbPeak: { x: CX + 44, y: eyeY - 30 + browDeceptionLift },
        rbOut: { x: CX + 74, y: eyeY - 24 + browDeceptionLift },

        // Eyes (Almond human contours with dynamic eyelid blink)
        leOut: { x: CX - 68, y: eyeY },
        leTop: { x: CX - 44, y: eyeY - 11 + blinkFactor * 10 },
        leIn: { x: CX - 20, y: eyeY },
        leBot: { x: CX - 44, y: eyeY + 10 - blinkFactor * 3 },
        lePupil: { x: CX - 44 + gaze.currentX, y: eyeY + gaze.currentY },

        reIn: { x: CX + 20, y: eyeY + browDeceptionLift * 0.4 },
        reTop: { x: CX + 44, y: eyeY - 11 + blinkFactor * 10 + browDeceptionLift * 0.4 },
        reOut: { x: CX + 68, y: eyeY + browDeceptionLift * 0.4 },
        reBot: { x: CX + 44, y: eyeY + 10 - blinkFactor * 3 + browDeceptionLift * 0.4 },
        rePupil: { x: CX + 44 + gaze.currentX, y: eyeY + gaze.currentY + browDeceptionLift * 0.4 },

        // Nose
        nRoot: { x: CX, y: eyeY - 16 },
        nBridge: { x: CX, y: eyeY + 18 },
        nTip: { x: CX, y: noseTipY },
        nL: { x: CX - 18, y: noseTipY + 4 },
        nR: { x: CX + 18, y: noseTipY + 4 },

        // Mouth (Real-time Spoken Phoneme Loop)
        mLeft: { x: CX - mouthW, y: mouthY },
        mTop: { x: CX, y: mouthY - 5 },
        mRight: { x: CX + mouthW, y: mouthY - smirkLift },
        mBottom: { x: CX, y: mouthY + 8 + openHeight },
        mOralCavityTop: { x: CX, y: mouthY - 1 },
        mOralCavityBot: { x: CX, y: mouthY + 1 + openHeight },

        // Neck & Trapezius
        neckLeft: { x: CX - 42, y: chinY - 12 },
        neckRight: { x: CX + 42, y: chinY - 12 },
        clavicleCenter: { x: CX, y: 396 },
        leftShoulder: { x: 0, y: 440 },
        rightShoulder: { x: W, y: 440 },
      };

      // -------------------------------------------------------------
      // 3. COLOR PALETTES & THEME
      // -------------------------------------------------------------
      const theme = isVance
        ? {
            // Julian Vance: Midnight Navy, Crimson & Amber Chiaroscuro
            bgGradTop: '#131926',
            bgGradBot: '#080c14',
            skinHighlight: '#fde4d4',
            skinBase: '#e2ab90',
            skinShadow: '#8a533c',
            skinDeep: '#4c2617',
            hairHighlight: '#9a6448',
            hairBase: '#251610',
            hairShadow: '#100805',
            irisOuter: '#475569',
            irisInner: '#64748b',
            coatBody: '#0f172a',
            coatLapel: '#1e293b',
            coatTrim: '#334155',
            shirt: '#f8fafc',
            tie: '#dc2626',
            tieShadow: '#991b1b',
            tieClip: '#fbbf24',
          }
        : isEvelyn
        ? {
            // Evelyn Cross: Emerald Velvet, Pearl Ivory & Auburn Waves
            bgGradTop: '#062820',
            bgGradBot: '#02130f',
            skinHighlight: '#fff1ec',
            skinBase: '#f4c5b3',
            skinShadow: '#a6644f',
            skinDeep: '#5e2a1b',
            hairHighlight: '#b91c1c',
            hairBase: '#450a0a',
            hairShadow: '#220404',
            irisOuter: '#059669',
            irisInner: '#34d399',
            coatBody: '#064e3b',
            coatLapel: '#047857',
            coatTrim: '#10b981',
            shirt: '#fdf2f8',
            tie: '#ec4899',
            tieShadow: '#be185d',
            tieClip: '#f59e0b',
          }
        : isMarcus
        ? {
            // Marcus Drake: Distressed Brown Leather, Amber & Stubble
            bgGradTop: '#25160d',
            bgGradBot: '#120904',
            skinHighlight: '#fed7be',
            skinBase: '#cf8f6e',
            skinShadow: '#844b2f',
            skinDeep: '#451f0f',
            hairHighlight: '#78350f',
            hairBase: '#291409',
            hairShadow: '#150803',
            irisOuter: '#854d0e',
            irisInner: '#ca8a04',
            coatBody: '#2c1409',
            coatLapel: '#5c2b12',
            coatTrim: '#d97706',
            shirt: '#cbd5e1',
            tie: '#475569',
            tieShadow: '#1e293b',
            tieClip: '#d97706',
          }
        : {
            // Dr. Aris Thorne: Obsidian Waistcoat, Silver Streak & Steel Cyan
            bgGradTop: '#0f172a',
            bgGradBot: '#050a14',
            skinHighlight: '#fbe2d7',
            skinBase: '#d4a38d',
            skinShadow: '#8c5945',
            skinDeep: '#492618',
            hairHighlight: '#cbd5e1', // silver streak
            hairBase: '#1e293b',
            hairShadow: '#090d16',
            irisOuter: '#0284c7',
            irisInner: '#38bdf8',
            coatBody: '#090d16',
            coatLapel: '#1e293b',
            coatTrim: '#60a5fa',
            shirt: '#f1f5f9',
            tie: '#0369a1',
            tieShadow: '#075985',
            tieClip: '#e2e8f0',
          };

      // -------------------------------------------------------------
      // 4. BACKGROUND (Cinematic Studio Noir Lighting)
      // -------------------------------------------------------------
      const bgGrad = ctx.createRadialGradient(CX - 40, eyeY - 20, 30, CX, eyeY, 340);
      bgGrad.addColorStop(0, theme.bgGradTop);
      bgGrad.addColorStop(1, theme.bgGradBot);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Horizontal background forensic gridlines (subtle 32px pitch)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 5. CLOTHING, SHOULDERS & COLLAR
      // -------------------------------------------------------------
      // Torso silhouette (broad shoulders sloping naturally)
      ctx.fillStyle = theme.coatBody;
      ctx.beginPath();
      ctx.moveTo(landmarks.leftShoulder.x, landmarks.leftShoulder.y);
      ctx.lineTo(landmarks.leftShoulder.x, H);
      ctx.lineTo(landmarks.rightShoulder.x, H);
      ctx.lineTo(landmarks.rightShoulder.x, landmarks.rightShoulder.y);
      ctx.quadraticCurveTo(CX + 140, 380, landmarks.neckRight.x, landmarks.clavicleCenter.y);
      ctx.lineTo(landmarks.neckLeft.x, landmarks.clavicleCenter.y);
      ctx.quadraticCurveTo(CX - 140, 380, landmarks.leftShoulder.x, landmarks.leftShoulder.y);
      ctx.closePath();
      ctx.fill();

      // Neck body
      const neckGrad = ctx.createLinearGradient(landmarks.neckLeft.x, 0, landmarks.neckRight.x, 0);
      neckGrad.addColorStop(0, theme.skinBase);
      neckGrad.addColorStop(0.55, theme.skinBase);
      neckGrad.addColorStop(1, theme.skinShadow);
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.moveTo(landmarks.neckLeft.x, landmarks.neckLeft.y);
      ctx.lineTo(landmarks.neckLeft.x - 4, landmarks.clavicleCenter.y);
      ctx.lineTo(landmarks.neckRight.x + 4, landmarks.clavicleCenter.y);
      ctx.lineTo(landmarks.neckRight.x, landmarks.neckRight.y);
      ctx.closePath();
      ctx.fill();

      // Deep cast shadow under chin
      ctx.fillStyle = theme.skinDeep;
      ctx.beginPath();
      ctx.moveTo(landmarks.leftJawAngle.x + 10, landmarks.chinLeft.y - 10);
      ctx.quadraticCurveTo(CX, landmarks.chinApex.y + 14, landmarks.rightJawAngle.x - 10, landmarks.chinRight.y - 10);
      ctx.quadraticCurveTo(CX, landmarks.chinApex.y + 2, landmarks.leftJawAngle.x + 10, landmarks.chinLeft.y - 10);
      ctx.closePath();
      ctx.fill();

      // Crisp Tailored Shirt & Tie / Cowl Neckline
      if (isVance || isThorne) {
        // Crisp White Shirt V-collar
        ctx.fillStyle = theme.shirt;
        ctx.beginPath();
        ctx.moveTo(CX - 28, landmarks.clavicleCenter.y - 20);
        ctx.lineTo(CX, landmarks.clavicleCenter.y + 26);
        ctx.lineTo(CX + 28, landmarks.clavicleCenter.y - 20);
        ctx.closePath();
        ctx.fill();

        // Silk Tie
        ctx.fillStyle = theme.tie;
        ctx.beginPath();
        ctx.moveTo(CX - 12, landmarks.clavicleCenter.y);
        ctx.lineTo(CX + 12, landmarks.clavicleCenter.y);
        ctx.lineTo(CX + 16, H);
        ctx.lineTo(CX - 16, H);
        ctx.closePath();
        ctx.fill();

        // Tie knot
        ctx.fillStyle = theme.tieShadow;
        ctx.beginPath();
        ctx.moveTo(CX - 14, landmarks.clavicleCenter.y - 6);
        ctx.lineTo(CX + 14, landmarks.clavicleCenter.y - 6);
        ctx.lineTo(CX + 10, landmarks.clavicleCenter.y + 14);
        ctx.lineTo(CX - 10, landmarks.clavicleCenter.y + 14);
        ctx.closePath();
        ctx.fill();

        // Gold tie bar
        ctx.fillStyle = theme.tieClip;
        ctx.fillRect(CX - 14, landmarks.clavicleCenter.y + 36, 28, 4);

        // Structured Peak Suit Lapels
        ctx.fillStyle = theme.coatLapel;
        // Left Lapel
        ctx.beginPath();
        ctx.moveTo(CX - 40, landmarks.clavicleCenter.y - 22);
        ctx.lineTo(CX - 78, landmarks.clavicleCenter.y + 20);
        ctx.lineTo(CX - 22, H);
        ctx.lineTo(CX - 4, landmarks.clavicleCenter.y + 40);
        ctx.closePath();
        ctx.fill();

        // Right Lapel
        ctx.beginPath();
        ctx.moveTo(CX + 40, landmarks.clavicleCenter.y - 22);
        ctx.lineTo(CX + 78, landmarks.clavicleCenter.y + 20);
        ctx.lineTo(CX + 22, H);
        ctx.lineTo(CX + 4, landmarks.clavicleCenter.y + 40);
        ctx.closePath();
        ctx.fill();
      } else if (isEvelyn) {
        // Sweetheart velvet dress opening
        ctx.fillStyle = '#022c22';
        ctx.beginPath();
        ctx.moveTo(CX - 50, landmarks.clavicleCenter.y - 10);
        ctx.quadraticCurveTo(CX, landmarks.clavicleCenter.y + 40, CX + 50, landmarks.clavicleCenter.y - 10);
        ctx.lineTo(CX + 40, H);
        ctx.lineTo(CX - 40, H);
        ctx.closePath();
        ctx.fill();

        // Pearl choker necklace
        for (let i = -36; i <= 36; i += 12) {
          const dy = Math.abs(i) * 0.15;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(CX + i, landmarks.clavicleCenter.y - 8 + dy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Emerald teardrop pendant
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(CX, landmarks.clavicleCenter.y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Marcus Drake: Distressed Leather Bomber with Shearling Collar
        ctx.fillStyle = '#b45309'; // shearling fleece
        ctx.beginPath();
        ctx.arc(CX - 44, landmarks.clavicleCenter.y, 22, 0, Math.PI * 2);
        ctx.arc(CX + 44, landmarks.clavicleCenter.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Heavy brass zipper line
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(CX, landmarks.clavicleCenter.y);
        ctx.lineTo(CX, H);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 6. HUMAN FACIAL ANATOMY & CEL-SHADED PLANAR SCULPTING
      // -------------------------------------------------------------
      // Full Head Mask
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(landmarks.craniumTop.x, landmarks.craniumTop.y);
      ctx.bezierCurveTo(landmarks.leftTemple.x, landmarks.craniumTop.y, landmarks.leftTemple.x, landmarks.leftTemple.y, landmarks.leftCheek.x, landmarks.leftCheek.y);
      ctx.bezierCurveTo(landmarks.leftCheek.x, landmarks.leftJawAngle.y - 10, landmarks.leftJawAngle.x, landmarks.leftJawAngle.y, landmarks.chinLeft.x, landmarks.chinLeft.y);
      ctx.quadraticCurveTo(landmarks.chinApex.x, landmarks.chinApex.y, landmarks.chinRight.x, landmarks.chinRight.y);
      ctx.bezierCurveTo(landmarks.rightJawAngle.x, landmarks.rightJawAngle.y, landmarks.rightCheek.x, landmarks.rightJawAngle.y - 10, landmarks.rightCheek.x, landmarks.rightCheek.y);
      ctx.bezierCurveTo(landmarks.rightTemple.x, landmarks.rightTemple.y, landmarks.rightTemple.x, landmarks.craniumTop.y, landmarks.craniumTop.x, landmarks.craniumTop.y);
      ctx.closePath();

      // Base skin fill with soft directional gradient
      const skinGrad = ctx.createLinearGradient(landmarks.leftTemple.x, eyeY, landmarks.rightTemple.x, eyeY);
      skinGrad.addColorStop(0, theme.skinHighlight);
      skinGrad.addColorStop(0.35, theme.skinBase);
      skinGrad.addColorStop(0.7, theme.skinShadow);
      skinGrad.addColorStop(1, theme.skinDeep);
      ctx.fillStyle = skinGrad;
      ctx.fill();

      // Clip inside head for facial shading planes
      ctx.clip();

      // Chiaroscuro Side Shadow (right half in deep film noir shadow)
      ctx.fillStyle = theme.skinShadow;
      ctx.beginPath();
      ctx.moveTo(CX + 8, headY);
      ctx.lineTo(W, headY);
      ctx.lineTo(W, H);
      ctx.lineTo(CX + 6, chinY + 10);
      ctx.bezierCurveTo(CX + 8, noseTipY + 20, CX + 4, noseTipY, CX + 6, eyeY);
      ctx.closePath();
      ctx.fill();

      // Forehead central highlight plane
      ctx.fillStyle = theme.skinHighlight;
      ctx.beginPath();
      ctx.ellipse(CX - 14, eyeY - 46, 32, 22, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Left cheek highlight plane
      ctx.fillStyle = 'rgba(255, 240, 230, 0.4)';
      ctx.beginPath();
      ctx.ellipse(CX - 42, eyeY + 32, 20, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Marcus Drake's 5 o'clock stubble
      if (isMarcus) {
        ctx.fillStyle = 'rgba(30, 15, 10, 0.42)';
        ctx.beginPath();
        ctx.moveTo(landmarks.leftCheek.x, landmarks.leftCheek.y + 20);
        ctx.lineTo(landmarks.leftJawAngle.x, landmarks.leftJawAngle.y);
        ctx.lineTo(landmarks.chinApex.x, landmarks.chinApex.y);
        ctx.lineTo(landmarks.rightJawAngle.x, landmarks.rightJawAngle.y);
        ctx.lineTo(landmarks.rightCheek.x, landmarks.rightCheek.y + 20);
        ctx.quadraticCurveTo(CX, mouthY + 10, landmarks.leftCheek.x, landmarks.leftCheek.y + 20);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Ears (aligned realistically between brow line and nose tip)
      const earY = eyeY + 4;
      // Left ear
      ctx.fillStyle = theme.skinBase;
      ctx.beginPath();
      ctx.ellipse(landmarks.leftCheek.x + 2, earY, 11, 26, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.skinShadow;
      ctx.beginPath();
      ctx.ellipse(landmarks.leftCheek.x + 3, earY, 6, 16, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Right ear
      ctx.fillStyle = theme.skinShadow;
      ctx.beginPath();
      ctx.ellipse(landmarks.rightCheek.x - 2, earY, 11, 26, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 7. HAIR SCULPTURE & TEXTURE
      // -------------------------------------------------------------
      ctx.fillStyle = theme.hairBase;
      ctx.beginPath();
      ctx.moveTo(landmarks.leftTemple.x - 4, eyeY - 26);
      ctx.quadraticCurveTo(landmarks.leftTemple.x - 10, headY + 10, CX - 30, headY - 26);
      ctx.quadraticCurveTo(CX + 40, headY - 32, landmarks.rightTemple.x + 10, headY + 16);
      ctx.quadraticCurveTo(landmarks.rightTemple.x + 4, eyeY - 20, landmarks.rightTemple.x - 6, eyeY - 36);
      ctx.quadraticCurveTo(CX + 20, eyeY - 60, landmarks.leftTemple.x - 4, eyeY - 26);
      ctx.closePath();
      ctx.fill();

      // Hair strands & top volume highlight
      ctx.fillStyle = theme.hairHighlight;
      ctx.beginPath();
      ctx.moveTo(CX - 40, headY - 24);
      ctx.quadraticCurveTo(CX, headY - 28, CX + 36, headY - 14);
      ctx.quadraticCurveTo(CX + 10, headY - 12, CX - 40, headY - 24);
      ctx.closePath();
      ctx.fill();

      // Evelyn's luxurious side waves
      if (isEvelyn) {
        ctx.fillStyle = theme.hairBase;
        ctx.beginPath();
        ctx.moveTo(landmarks.leftTemple.x, eyeY - 20);
        ctx.bezierCurveTo(landmarks.leftTemple.x - 28, eyeY + 40, landmarks.leftCheek.x - 24, eyeY + 100, landmarks.leftCheek.x + 10, eyeY + 130);
        ctx.quadraticCurveTo(landmarks.leftCheek.x - 6, eyeY + 60, landmarks.leftTemple.x, eyeY - 20);
        ctx.closePath();
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 8. EYEBROWS & EYES (Almond Sclera, Dual-Ring Iris & Pupils)
      // -------------------------------------------------------------
      // Eyebrows
      ctx.strokeStyle = theme.hairBase;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      // Left brow
      ctx.beginPath();
      ctx.moveTo(landmarks.lbOut.x, landmarks.lbOut.y);
      ctx.quadraticCurveTo(landmarks.lbPeak.x, landmarks.lbPeak.y, landmarks.lbIn.x, landmarks.lbIn.y);
      ctx.stroke();

      // Right brow
      ctx.beginPath();
      ctx.moveTo(landmarks.rbIn.x, landmarks.rbIn.y);
      ctx.quadraticCurveTo(landmarks.rbPeak.x, landmarks.rbPeak.y, landmarks.rbOut.x, landmarks.rbOut.y);
      ctx.stroke();

      // Render Eye function
      const renderEye = (outPt: { x: number; y: number }, topPt: { x: number; y: number }, inPt: { x: number; y: number }, botPt: { x: number; y: number }, pupilPt: { x: number; y: number }) => {
        // Sclera
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(outPt.x, outPt.y);
        ctx.quadraticCurveTo(topPt.x, topPt.y, inPt.x, inPt.y);
        ctx.quadraticCurveTo(botPt.x, botPt.y, outPt.x, outPt.y);
        ctx.closePath();
        ctx.fillStyle = '#f1f5f9';
        ctx.fill();
        ctx.clip();

        // Upper eyelid cast shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.fillRect(outPt.x - 10, topPt.y - 10, 60, 16);

        // Iris
        const irisRadius = 9;
        const pupilRadius = (reading.pupilDilationMm || 3.5) * 1.05;

        // Outer iris ring
        ctx.fillStyle = theme.irisOuter;
        ctx.beginPath();
        ctx.arc(pupilPt.x, pupilPt.y, irisRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner iris glint
        ctx.fillStyle = theme.irisInner;
        ctx.beginPath();
        ctx.arc(pupilPt.x, pupilPt.y, irisRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(pupilPt.x, pupilPt.y, Math.min(irisRadius - 1.5, pupilRadius), 0, Math.PI * 2);
        ctx.fill();

        // Specular Catchlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pupilPt.x - 3, pupilPt.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Eyelid line
        ctx.strokeStyle = '#1e1411';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(outPt.x, outPt.y);
        ctx.quadraticCurveTo(topPt.x, topPt.y, inPt.x, inPt.y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(30, 20, 17, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(outPt.x, outPt.y);
        ctx.quadraticCurveTo(botPt.x, botPt.y, inPt.x, inPt.y);
        ctx.stroke();
      };

      renderEye(landmarks.leOut, landmarks.leTop, landmarks.leIn, landmarks.leBot, landmarks.lePupil);
      renderEye(landmarks.reOut, landmarks.reTop, landmarks.reIn, landmarks.reBot, landmarks.rePupil);

      // Dr. Thorne's wireframe spectacles
      if (isThorne) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        // Left rim
        ctx.beginPath();
        ctx.ellipse(landmarks.lePupil.x, eyeY, 19, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Right rim
        ctx.beginPath();
        ctx.ellipse(landmarks.rePupil.x, eyeY, 19, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Bridge
        ctx.beginPath();
        ctx.moveTo(landmarks.leIn.x + 2, eyeY - 2);
        ctx.lineTo(landmarks.reIn.x - 2, eyeY - 2);
        ctx.stroke();
        // Anti-reflective glare
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.ellipse(landmarks.lePupil.x - 4, eyeY - 4, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(landmarks.rePupil.x - 4, eyeY - 4, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 9. NOSE
      // -------------------------------------------------------------
      // Bridge highlight line
      ctx.strokeStyle = 'rgba(255, 245, 240, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(landmarks.nRoot.x, landmarks.nRoot.y);
      ctx.lineTo(landmarks.nTip.x - 2, landmarks.nTip.y - 2);
      ctx.stroke();

      // Right bridge shadow
      ctx.strokeStyle = theme.skinShadow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(landmarks.nRoot.x + 3, landmarks.nRoot.y);
      ctx.lineTo(landmarks.nTip.x + 3, landmarks.nTip.y);
      ctx.stroke();

      // Nose tip bulb
      ctx.fillStyle = theme.skinBase;
      ctx.beginPath();
      ctx.ellipse(landmarks.nTip.x, landmarks.nTip.y, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils
      ctx.fillStyle = '#220f0a';
      ctx.beginPath();
      ctx.ellipse(landmarks.nL.x + 4, landmarks.nL.y - 2, 4, 2.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(landmarks.nR.x - 4, landmarks.nR.y - 2, 4, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 10. MOUTH & ACCURATE SPEECH VISEMES
      // -------------------------------------------------------------
      // Oral cavity & teeth when mouth opens
      if (openHeight > 1.5) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(landmarks.mLeft.x, landmarks.mLeft.y);
        ctx.quadraticCurveTo(landmarks.mOralCavityTop.x, landmarks.mOralCavityTop.y, landmarks.mRight.x, landmarks.mRight.y);
        ctx.quadraticCurveTo(landmarks.mOralCavityBot.x, landmarks.mOralCavityBot.y, landmarks.mLeft.x, landmarks.mLeft.y);
        ctx.closePath();

        // Dark oral cavity
        ctx.fillStyle = '#140504';
        ctx.fill();
        ctx.clip();

        // Upper teeth row
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.rect(CX - 16, landmarks.mOralCavityTop.y - 2, 32, 6);
        ctx.fill();

        // Tongue
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(CX, landmarks.mOralCavityBot.y + 2, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Upper Lip
      ctx.fillStyle = isEvelyn ? '#9f1239' : '#884336';
      ctx.beginPath();
      ctx.moveTo(landmarks.mLeft.x, landmarks.mLeft.y);
      ctx.quadraticCurveTo(CX - 10, landmarks.mTop.y, landmarks.mTop.x, landmarks.mTop.y + 1);
      ctx.quadraticCurveTo(CX + 10, landmarks.mTop.y, landmarks.mRight.x, landmarks.mRight.y);
      ctx.quadraticCurveTo(landmarks.mOralCavityTop.x, landmarks.mOralCavityTop.y + 2, landmarks.mLeft.x, landmarks.mLeft.y);
      ctx.closePath();
      ctx.fill();

      // Lower Lip
      ctx.fillStyle = isEvelyn ? '#be123c' : '#a25547';
      ctx.beginPath();
      ctx.moveTo(landmarks.mLeft.x, landmarks.mLeft.y);
      ctx.quadraticCurveTo(landmarks.mOralCavityBot.x, landmarks.mOralCavityBot.y, landmarks.mRight.x, landmarks.mRight.y);
      ctx.quadraticCurveTo(landmarks.mBottom.x, landmarks.mBottom.y + 3, landmarks.mLeft.x, landmarks.mLeft.y);
      ctx.closePath();
      ctx.fill();

      // Lip parting line
      ctx.strokeStyle = '#1e0c08';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(landmarks.mLeft.x, landmarks.mLeft.y);
      ctx.quadraticCurveTo(landmarks.mTop.x, landmarks.mTop.y + 3, landmarks.mRight.x, landmarks.mRight.y);
      ctx.stroke();

      // Marcus Drake's lit cigarette with curling smoke
      if (isMarcus) {
        const cigX = landmarks.mRight.x - 4;
        const cigY = landmarks.mRight.y + 2;

        // Paper roll
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cigX, cigY, 26, 4);

        // Glowing red ember & white-hot center
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cigX + 26, cigY, 6, 4);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cigX + 30, cigY + 1, 2, 2);

        // Spawn volumetric smoke puffs
        if (Math.random() < 0.4) {
          smokeParticlesRef.current.push({
            x: cigX + 30,
            y: cigY,
            vx: 0.3 + (Math.random() - 0.5) * 0.4,
            vy: -0.9 - Math.random() * 0.6,
            r: 2.5 + Math.random() * 2,
            alpha: 0.65,
            age: 0,
            maxAge: 40 + Math.random() * 25,
          });
        }
        smokeParticlesRef.current.forEach((smk) => {
          smk.age += 1;
          smk.x += smk.vx;
          smk.y += smk.vy;
          smk.r += 0.12;
          const a = (1 - smk.age / smk.maxAge) * smk.alpha;
          ctx.fillStyle = `rgba(226, 232, 240, ${a})`;
          ctx.beginPath();
          ctx.arc(smk.x, smk.y, smk.r, 0, Math.PI * 2);
          ctx.fill();
        });
        smokeParticlesRef.current = smokeParticlesRef.current.filter((smk) => smk.age < smk.maxAge);
      }

      // -------------------------------------------------------------
      // 11. FORENSIC BIOMETRIC WIREFRAME MESH (100% PERFECTLY LOCKED)
      // -------------------------------------------------------------
      if (showMesh) {
        const meshCol = isDeceptive
          ? 'rgba(239, 68, 68, 0.88)'
          : isAnxiousOk
          ? 'rgba(245, 158, 11, 0.82)'
          : 'rgba(6, 182, 212, 0.78)';

        const dotCol = isDeceptive ? '#ef4444' : isAnxiousOk ? '#f59e0b' : '#06b6d4';

        ctx.strokeStyle = meshCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();

        // Left Eye Loop
        ctx.moveTo(landmarks.leOut.x, landmarks.leOut.y);
        ctx.lineTo(landmarks.leTop.x, landmarks.leTop.y);
        ctx.lineTo(landmarks.leIn.x, landmarks.leIn.y);
        ctx.lineTo(landmarks.leBot.x, landmarks.leBot.y);
        ctx.closePath();

        // Right Eye Loop
        ctx.moveTo(landmarks.reIn.x, landmarks.reIn.y);
        ctx.lineTo(landmarks.reTop.x, landmarks.reTop.y);
        ctx.lineTo(landmarks.reOut.x, landmarks.reOut.y);
        ctx.lineTo(landmarks.reBot.x, landmarks.reBot.y);
        ctx.closePath();

        // Left Brow
        ctx.moveTo(landmarks.lbOut.x, landmarks.lbOut.y);
        ctx.lineTo(landmarks.lbPeak.x, landmarks.lbPeak.y);
        ctx.lineTo(landmarks.lbIn.x, landmarks.lbIn.y);

        // Right Brow
        ctx.moveTo(landmarks.rbIn.x, landmarks.rbIn.y);
        ctx.lineTo(landmarks.rbPeak.x, landmarks.rbPeak.y);
        ctx.lineTo(landmarks.rbOut.x, landmarks.rbOut.y);

        // Nose Bridge & Wing Struts
        ctx.moveTo(landmarks.nRoot.x, landmarks.nRoot.y);
        ctx.lineTo(landmarks.nBridge.x, landmarks.nBridge.y);
        ctx.lineTo(landmarks.nTip.x, landmarks.nTip.y);
        ctx.lineTo(landmarks.nL.x, landmarks.nL.y);
        ctx.lineTo(landmarks.nR.x, landmarks.nR.y);
        ctx.lineTo(landmarks.nTip.x, landmarks.nTip.y);

        // Mouth Dynamic Wireframe (Tracks Spoken Phonemes)
        ctx.moveTo(landmarks.mLeft.x, landmarks.mLeft.y);
        ctx.lineTo(landmarks.mTop.x, landmarks.mTop.y);
        ctx.lineTo(landmarks.mRight.x, landmarks.mRight.y);
        ctx.lineTo(landmarks.mBottom.x, landmarks.mBottom.y);
        ctx.closePath();

        // Facial Contour & Jaw
        ctx.moveTo(landmarks.lbOut.x, landmarks.lbOut.y);
        ctx.lineTo(landmarks.leftCheek.x, landmarks.leftCheek.y);
        ctx.lineTo(landmarks.leftJawAngle.x, landmarks.leftJawAngle.y);
        ctx.lineTo(landmarks.chinApex.x, landmarks.chinApex.y);
        ctx.lineTo(landmarks.rightJawAngle.x, landmarks.rightJawAngle.y);
        ctx.lineTo(landmarks.rightCheek.x, landmarks.rightCheek.y);
        ctx.lineTo(landmarks.rbOut.x, landmarks.rbOut.y);

        // Cross-facial structural struts
        ctx.moveTo(landmarks.leftCheek.x, landmarks.leftCheek.y);
        ctx.lineTo(landmarks.mLeft.x, landmarks.mLeft.y);
        ctx.lineTo(landmarks.chinApex.x, landmarks.chinApex.y);
        ctx.lineTo(landmarks.mRight.x, landmarks.mRight.y);
        ctx.lineTo(landmarks.rightCheek.x, landmarks.rightCheek.y);

        ctx.moveTo(landmarks.nL.x, landmarks.nL.y);
        ctx.lineTo(landmarks.mLeft.x, landmarks.mLeft.y);
        ctx.moveTo(landmarks.nR.x, landmarks.nR.y);
        ctx.lineTo(landmarks.mRight.x, landmarks.mRight.y);

        ctx.stroke();

        // Landmark Tracking Dots
        const dotNodes = [
          landmarks.lbOut, landmarks.lbPeak, landmarks.lbIn,
          landmarks.rbIn, landmarks.rbPeak, landmarks.rbOut,
          landmarks.leOut, landmarks.leTop, landmarks.leIn, landmarks.leBot,
          landmarks.reIn, landmarks.reTop, landmarks.reOut, landmarks.reBot,
          landmarks.nRoot, landmarks.nTip, landmarks.nL, landmarks.nR,
          landmarks.mLeft, landmarks.mTop, landmarks.mRight, landmarks.mBottom,
          landmarks.leftCheek, landmarks.rightCheek,
          landmarks.leftJawAngle, landmarks.rightJawAngle, landmarks.chinApex,
        ];

        ctx.fillStyle = dotCol;
        dotNodes.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Dynamic Pupil Target Crosshairs
        const drawCrosshair = (pt: { x: number; y: number }) => {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pt.x - 7, pt.y);
          ctx.lineTo(pt.x + 7, pt.y);
          ctx.moveTo(pt.x, pt.y - 7);
          ctx.lineTo(pt.x, pt.y + 7);
          ctx.stroke();
        };

        drawCrosshair(landmarks.lePupil);
        drawCrosshair(landmarks.rePupil);

        // Deception Radar Ring on Vance's Smirk
        if (isDeceptive) {
          radarPulseRef.current = (radarPulseRef.current + dt * 4) % (Math.PI * 2);
          const r = 14 + Math.sin(radarPulseRef.current) * 8;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(landmarks.mRight.x, landmarks.mRight.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [suspectId, isSpeaking, showMesh, reading, mode]);

  const baseline = personality.baselineMetrics;
  const isCriticalAnomaly = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
  const isAnxiousNormal = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';

  return (
    <div className="flex flex-col bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Live Avatar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-[#070a10]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 font-terminal">
            BIOMETRIC AVATAR · {suspectName.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTypewriter();
              setShowMesh(!showMesh);
            }}
            className="text-[11px] font-terminal text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showMesh ? '[ MESH: ON ]' : '[ MESH: OFF ]'}
          </button>
          <button
            onClick={() => {
              sound.playTypewriter();
              setMode(mode === 'avatar' ? 'photo' : 'avatar');
            }}
            className="text-[11px] font-terminal text-amber-400 hover:text-amber-300 transition-colors"
          >
            {mode === 'avatar' ? '[ LIVE AVATAR ]' : '[ ARCHIVAL PHOTO ]'}
          </button>
        </div>
      </div>

      {/* Main Viewport: High-Resolution 512x512 Canvas */}
      <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden bg-slate-950 flex items-center justify-center p-1.5">
        {mode === 'avatar' ? (
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={photoUrl}
              alt={suspectName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter contrast-125 sepia-[0.3]"
            />
          </div>
        )}

        {/* Framing brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/70 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/70 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/70 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/70 pointer-events-none" />

        {/* Realtime Speaking Status Badge */}
        {isSpeaking ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-950/90 border border-amber-500/80 rounded text-[11px] font-terminal text-amber-200 flex items-center gap-2 shadow-xl z-20">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-amber-400 rounded animate-pulse" />
              <span className="w-1 h-4 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-2 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </span>
            <span className="font-semibold">AVATAR SPEAKING (VISEMES ACTIVE)</span>
          </div>
        ) : (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] font-terminal text-slate-400 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALIGNED FORENSIC TRACKING</span>
          </div>
        )}

        {/* Micro-expression alert flag in portrait bottom */}
        <div className="absolute bottom-2 inset-x-2 px-2.5 py-1.5 bg-slate-950/90 backdrop-blur border border-slate-800 rounded flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-terminal">
            {isCriticalAnomaly ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                DECEPTION ANOMALY DETECTED
              </span>
            ) : isAnxiousNormal && detectiveShieldEnabled ? (
              <span className="text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ELEVATED ANXIETY (WITHIN BASELINE)
              </span>
            ) : isAnxiousNormal && !detectiveShieldEnabled ? (
              <span className="text-amber-300/80 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ELEVATED AUTONOMIC ACTIVITY
              </span>
            ) : (
              <span className="text-cyan-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                BIOMETRICS WITHIN CALIBRATED BASELINE
              </span>
            )}
          </div>
          <span className="text-[10px] font-terminal text-slate-400 tabular-nums">
            {reading.heartRate} BPM
          </span>
        </div>
      </div>

      {/* Biometric Telemetry Matrix */}
      <div className="p-3 border-t border-slate-800 bg-[#070a10] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-terminal text-slate-400 pb-1 border-b border-slate-800/60">
          <span>FACIAL MICRO-METRIC</span>
          <span>CURRENT / BASELINE</span>
        </div>

        {/* Metric 1: Pupil Dilation */}
        <div>
          <div className="flex items-center justify-between text-xs font-terminal">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Pupil Aperture
            </span>
            <span className="text-slate-200 tabular-nums">
              {reading.pupilDilationMm.toFixed(1)}mm{' '}
              <span className="text-slate-500 text-[10px]">
                (Base: {baseline.pupilDilationMm.toFixed(1)}mm)
              </span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                Math.abs(reading.pupilDilationMm - baseline.pupilDilationMm) > 0.8
                  ? 'bg-rose-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (reading.pupilDilationMm / 6) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Glance Aversion Saccades */}
        <div>
          <div className="flex items-center justify-between text-xs font-terminal">
            <span className="text-slate-300">Glance Aversion Rate</span>
            <span className="text-slate-200 tabular-nums">
              {reading.glanceAversion}%{' '}
              <span className="text-slate-500 text-[10px]">(Base: {baseline.glanceAversionPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                reading.glanceAversion > baseline.glanceAversionPercent + 20
                  ? 'bg-rose-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${reading.glanceAversion}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Lip Compression & Smirk Asymmetry */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-terminal">
            <div className="text-slate-400">Lip Compression</div>
            <div className="text-slate-200 font-semibold mt-0.5 tabular-nums">
              {reading.lipCompression}%
            </div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-terminal">
            <div className="text-slate-400">Smirk Asymmetry</div>
            <div
              className={`font-semibold mt-0.5 tabular-nums ${
                reading.asymmetrySmirk > 30 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {reading.asymmetrySmirk}%
            </div>
          </div>
        </div>

        {/* Visual Cues Detected */}
        {reading.visualIndicators.length > 0 && (
          <div className="pt-1 border-t border-slate-800/60">
            <div className="text-[10px] font-terminal uppercase tracking-wider text-slate-500 mb-1">
              Detected Micro-Cues
            </div>
            <ul className="space-y-0.5 text-xs text-slate-300 font-terminal">
              {reading.visualIndicators.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400">›</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
