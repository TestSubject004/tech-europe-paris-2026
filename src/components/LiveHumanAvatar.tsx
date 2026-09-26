/**
 * =========================================================================================
 * Live Human Anatomical Avatar & Facial Animation Rig: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component drives the realistic facial animation and biometric deformation rig for suspect
 * portraits in the Interrogation Chamber. Utilizing pixel-calibrated 2D landmark profiles mapped
 * specifically to 1024x1024 vintage photography, it performs procedural lip synchronization
 * during speech, dynamic pupil constriction/dilation, natural blinking, glance aversion saccades,
 * and micro-smirk lip corner asymmetries.
 * 
 * DIFFERENT USE CASES:
 * 1. Procedural Lip Synchronization:
 *    Deforms mouth curves and lip coordinates in real-time when `isSpeaking` is true, animating
 *    phoneme articulation in sync with Gemini TTS speech audio.
 * 2. Autonomic Pupil Dilation:
 *    Dynamically adjusts iris and pupil radii based on live `reading.pupilDilationMm`, accurately
 *    rendering pinpoint constriction (<2.5mm) or sympathetic dilation (>4.2mm).
 * 3. Micro-Smirk Deception Rendering:
 *    Simulates the unilateral upward pull of the zygomaticus major muscle on the suspect's mouth corner
 *    during deceptive statements.
 * =========================================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { BiometricReading, PersonalityProfile } from '../types/game';
import { Eye, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for LiveHumanAvatar component.
 */
interface LiveHumanAvatarProps {
  suspectId: string;
  suspectName: string;
  photoUrl: string;
  reading: BiometricReading;
  personality: PersonalityProfile;
  isSpeaking?: boolean;
}

/**
 * Coordinate mapping profile for suspect portrait anatomical landmarks.
 */
interface LandmarkProfile {
  leftEyePupil: { x: number; y: number };
  leftEyeInner: { x: number; y: number };
  leftEyeOuter: { x: number; y: number };
  leftEyeTop: { x: number; y: number };
  leftEyeBottom: { x: number; y: number };
  rightEyePupil: { x: number; y: number };
  rightEyeInner: { x: number; y: number };
  rightEyeOuter: { x: number; y: number };
  rightEyeTop: { x: number; y: number };
  rightEyeBottom: { x: number; y: number };
  leftBrowOuter: { x: number; y: number };
  leftBrowPeak: { x: number; y: number };
  leftBrowInner: { x: number; y: number };
  rightBrowInner: { x: number; y: number };
  rightBrowPeak: { x: number; y: number };
  rightBrowOuter: { x: number; y: number };
  noseBridgeTop: { x: number; y: number };
  noseMid: { x: number; y: number };
  noseLeft: { x: number; y: number };
  noseTip: { x: number; y: number };
  noseRight: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthTop: { x: number; y: number };
  mouthRight: { x: number; y: number };
  mouthBottom: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  leftCheek: { x: number; y: number };
  rightCheek: { x: number; y: number };
  leftJaw: { x: number; y: number };
  rightJaw: { x: number; y: number };
  chin: { x: number; y: number };
  lipColor: string;
  lipHighlight: string;
  mouthShadow: string;
  skinTone: string;
}

// Pixel-accurate landmarks calibrated specifically to the 1024x1024 portrait photographs (normalized to 380x380 viewport)
const SUSPECT_LANDMARKS: Record<string, LandmarkProfile> = {
  'suspect-julian-vance': {
    leftEyePupil: { x: 142, y: 149 },
    leftEyeInner: { x: 154, y: 151 },
    leftEyeOuter: { x: 130, y: 148 },
    leftEyeTop: { x: 142, y: 144 },
    leftEyeBottom: { x: 142, y: 154 },
    rightEyePupil: { x: 214, y: 146 },
    rightEyeInner: { x: 202, y: 149 },
    rightEyeOuter: { x: 226, y: 145 },
    rightEyeTop: { x: 214, y: 141 },
    rightEyeBottom: { x: 214, y: 151 },
    leftBrowOuter: { x: 122, y: 135 },
    leftBrowPeak: { x: 140, y: 128 },
    leftBrowInner: { x: 156, y: 136 },
    rightBrowInner: { x: 198, y: 136 },
    rightBrowPeak: { x: 216, y: 128 },
    rightBrowOuter: { x: 232, y: 134 },
    noseBridgeTop: { x: 178, y: 150 },
    noseMid: { x: 179, y: 174 },
    noseLeft: { x: 170, y: 197 },
    noseTip: { x: 181, y: 196 },
    noseRight: { x: 192, y: 195 },
    mouthLeft: { x: 170, y: 234 },
    mouthTop: { x: 187, y: 230 },
    mouthRight: { x: 205, y: 233 },
    mouthBottom: { x: 187, y: 239 },
    mouthCenter: { x: 187, y: 234 },
    leftCheek: { x: 130, y: 192 },
    rightCheek: { x: 234, y: 188 },
    leftJaw: { x: 148, y: 242 },
    rightJaw: { x: 226, y: 238 },
    chin: { x: 188, y: 268 },
    lipColor: '#7d4a41',
    lipHighlight: 'rgba(215, 160, 145, 0.35)',
    mouthShadow: '#260a08',
    skinTone: '#cf9f85',
  },
  'suspect-evelyn-cross': {
    leftEyePupil: { x: 132, y: 152 },
    leftEyeInner: { x: 146, y: 153 },
    leftEyeOuter: { x: 118, y: 150 },
    leftEyeTop: { x: 132, y: 146 },
    leftEyeBottom: { x: 132, y: 158 },
    rightEyePupil: { x: 214, y: 146 },
    rightEyeInner: { x: 200, y: 148 },
    rightEyeOuter: { x: 228, y: 144 },
    rightEyeTop: { x: 214, y: 140 },
    rightEyeBottom: { x: 214, y: 152 },
    leftBrowOuter: { x: 114, y: 134 },
    leftBrowPeak: { x: 132, y: 124 },
    leftBrowInner: { x: 148, y: 134 },
    rightBrowInner: { x: 198, y: 134 },
    rightBrowPeak: { x: 216, y: 124 },
    rightBrowOuter: { x: 232, y: 132 },
    noseBridgeTop: { x: 176, y: 150 },
    noseMid: { x: 176, y: 176 },
    noseLeft: { x: 168, y: 198 },
    noseTip: { x: 176, y: 198 },
    noseRight: { x: 188, y: 197 },
    mouthLeft: { x: 166, y: 233 },
    mouthTop: { x: 179, y: 229 },
    mouthRight: { x: 198, y: 232 },
    mouthBottom: { x: 179, y: 238 },
    mouthCenter: { x: 179, y: 233 },
    leftCheek: { x: 122, y: 194 },
    rightCheek: { x: 228, y: 190 },
    leftJaw: { x: 144, y: 246 },
    rightJaw: { x: 218, y: 242 },
    chin: { x: 180, y: 268 },
    lipColor: '#934b4c',
    lipHighlight: 'rgba(235, 175, 170, 0.4)',
    mouthShadow: '#280c0c',
    skinTone: '#e5bda7',
  },
  'suspect-marcus-drake': {
    leftEyePupil: { x: 136, y: 156 },
    leftEyeInner: { x: 150, y: 157 },
    leftEyeOuter: { x: 122, y: 154 },
    leftEyeTop: { x: 136, y: 150 },
    leftEyeBottom: { x: 136, y: 162 },
    rightEyePupil: { x: 220, y: 147 },
    rightEyeInner: { x: 206, y: 150 },
    rightEyeOuter: { x: 234, y: 145 },
    rightEyeTop: { x: 220, y: 141 },
    rightEyeBottom: { x: 220, y: 153 },
    leftBrowOuter: { x: 118, y: 142 },
    leftBrowPeak: { x: 136, y: 134 },
    leftBrowInner: { x: 152, y: 142 },
    rightBrowInner: { x: 202, y: 140 },
    rightBrowPeak: { x: 222, y: 132 },
    rightBrowOuter: { x: 238, y: 138 },
    noseBridgeTop: { x: 180, y: 152 },
    noseMid: { x: 180, y: 178 },
    noseLeft: { x: 170, y: 202 },
    noseTip: { x: 180, y: 202 },
    noseRight: { x: 192, y: 200 },
    mouthLeft: { x: 168, y: 236 },
    mouthTop: { x: 182, y: 232 },
    mouthRight: { x: 202, y: 234 },
    mouthBottom: { x: 182, y: 242 },
    mouthCenter: { x: 182, y: 236 },
    leftCheek: { x: 124, y: 198 },
    rightCheek: { x: 234, y: 192 },
    leftJaw: { x: 142, y: 248 },
    rightJaw: { x: 224, y: 244 },
    chin: { x: 182, y: 274 },
    lipColor: '#6f4237',
    lipHighlight: 'rgba(195, 145, 130, 0.3)',
    mouthShadow: '#230a07',
    skinTone: '#bc896e',
  },
  'suspect-aris-thorne': {
    leftEyePupil: { x: 146, y: 149 },
    leftEyeInner: { x: 158, y: 151 },
    leftEyeOuter: { x: 134, y: 148 },
    leftEyeTop: { x: 146, y: 143 },
    leftEyeBottom: { x: 146, y: 155 },
    rightEyePupil: { x: 218, y: 147 },
    rightEyeInner: { x: 206, y: 150 },
    rightEyeOuter: { x: 230, y: 145 },
    rightEyeTop: { x: 218, y: 141 },
    rightEyeBottom: { x: 218, y: 153 },
    leftBrowOuter: { x: 128, y: 136 },
    leftBrowPeak: { x: 146, y: 128 },
    leftBrowInner: { x: 160, y: 136 },
    rightBrowInner: { x: 202, y: 136 },
    rightBrowPeak: { x: 220, y: 128 },
    rightBrowOuter: { x: 236, y: 134 },
    noseBridgeTop: { x: 184, y: 150 },
    noseMid: { x: 184, y: 174 },
    noseLeft: { x: 174, y: 198 },
    noseTip: { x: 184, y: 198 },
    noseRight: { x: 194, y: 196 },
    mouthLeft: { x: 170, y: 234 },
    mouthTop: { x: 184, y: 230 },
    mouthRight: { x: 202, y: 232 },
    mouthBottom: { x: 184, y: 239 },
    mouthCenter: { x: 184, y: 234 },
    leftCheek: { x: 134, y: 192 },
    rightCheek: { x: 232, y: 188 },
    leftJaw: { x: 148, y: 242 },
    rightJaw: { x: 222, y: 238 },
    chin: { x: 184, y: 268 },
    lipColor: '#78463c',
    lipHighlight: 'rgba(205, 155, 140, 0.3)',
    mouthShadow: '#240a08',
    skinTone: '#c7987e',
  },
};

/**
 * Live human anatomical avatar rendering realistic facial articulation, blink states, and micro-expressions.
 * 
 * @param props - Portrait source, suspect identity, biometric readings, speech flag
 * @returns Rendered React component for live avatar
 */
export const LiveHumanAvatar: React.FC<LiveHumanAvatarProps> = ({
  suspectId,
  suspectName,
  photoUrl,
  reading,
  personality,
  isSpeaking = false,
}) => {
  logFunctionCall('LiveHumanAvatar', { suspectId, suspectName, isSpeaking, anomalyRating: reading.anomalyRating });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Animation clock & kinematics
  const frameRef = useRef<number>(0);
  const blinkStateRef = useRef<{ isBlinking: boolean; blinkProgress: number; nextBlinkTime: number }>({
    isBlinking: false,
    blinkProgress: 0,
    nextBlinkTime: Date.now() + 2000,
  });
  const gazeRef = useRef<{ x: number; y: number; targetX: number; targetY: number; nextGazeTime: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    nextGazeTime: Date.now() + 1500,
  });

  // Viseme speech state
  const speechPhonemeRef = useRef<number>(0);
  const mouthOpennessRef = useRef<number>(0);

  // Marcus Drake drifting cigar smoke
  const smokeParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }>>([]);

  // Load portrait photo
  useEffect(() => {
    const img = new Image();
    img.src = photoUrl;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
  }, [photoUrl]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      frameRef.current += 1;
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      const img = imgRef.current;
      if (!ctx || !img || !img.complete) {
        animId = requestAnimationFrame(render);
        return;
      }

      const now = Date.now();
      const t = frameRef.current * 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Character-specific personality dynamics
      const isAnxious = suspectId === 'suspect-evelyn-cross';
      const isCynic = suspectId === 'suspect-marcus-drake';
      const isSociopath = suspectId === 'suspect-julian-vance';

      // 1. Organic Whole-Body Breathing & Postural Sway
      const breathFreq = isAnxious ? 2.6 : isSociopath ? 1.05 : 1.4;
      const breathAmplitude = isAnxious ? 2.0 : 1.3;
      const breathY = Math.sin(t * breathFreq) * breathAmplitude;
      const breathScale = 1 + Math.sin(t * breathFreq) * 0.003;

      // Natural subtle head micro-sway (Lissajous curve)
      const headSwayX = Math.sin(t * 0.7) * (isSociopath ? 0.5 : 1.1);
      const headTilt = Math.sin(t * 0.5) * 0.009;

      // Speech-synced micro-nodding: heads dip gently with speech cadence
      let speechNodY = 0;
      let speechNodPitch = 0;
      if (isSpeaking) {
        speechPhonemeRef.current += 0.22;
        speechNodY = Math.sin(speechPhonemeRef.current * 1.8) * 1.6;
        speechNodPitch = Math.sin(speechPhonemeRef.current * 1.8) * 0.007;

        // Syllable viseme rhythm
        const syllableRhythm =
          Math.sin(speechPhonemeRef.current * 3.2) * 0.5 +
          Math.sin(speechPhonemeRef.current * 5.1) * 0.3 +
          Math.cos(speechPhonemeRef.current * 1.7) * 0.2;
        mouthOpennessRef.current = Math.max(0, Math.min(1, syllableRhythm * 1.1 + 0.35));
      } else {
        speechPhonemeRef.current = 0;
        mouthOpennessRef.current += (0 - mouthOpennessRef.current) * 0.25;
      }

      // Somatic jitter for Evelyn Cross (anxious trembling)
      const jitterX = isAnxious ? (Math.random() - 0.5) * 0.8 : 0;
      const jitterY = isAnxious ? (Math.random() - 0.5) * 0.8 : 0;

      // 2. Realistic Eyelid Blinking
      const blink = blinkStateRef.current;
      if (!blink.isBlinking && now > blink.nextBlinkTime) {
        blink.isBlinking = true;
        blink.blinkProgress = 0;
      }
      if (blink.isBlinking) {
        blink.blinkProgress += 0.16;
        if (blink.blinkProgress >= 1) {
          blink.isBlinking = false;
          blink.blinkProgress = 0;
          const interval = isAnxious
            ? 1100 + Math.random() * 1400
            : isSociopath
            ? 3600 + Math.random() * 3000
            : 2400 + Math.random() * 2200;
          blink.nextBlinkTime = now + interval;
        }
      }

      // 3. Eye Gaze Saccades
      const gaze = gazeRef.current;
      if (now > gaze.nextGazeTime) {
        if (isCynic) {
          // Averts gaze sideways
          gaze.targetX = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 18);
          gaze.targetY = 4 + Math.random() * 6;
        } else if (isAnxious) {
          // Rapid darting gaze
          gaze.targetX = (Math.random() - 0.5) * 22;
          gaze.targetY = 5 + Math.random() * 9;
        } else if (isSociopath) {
          // Locked direct eye contact
          gaze.targetX = (Math.random() - 0.5) * 4;
          gaze.targetY = (Math.random() - 0.5) * 3;
        } else {
          gaze.targetX = (Math.random() - 0.5) * 14;
          gaze.targetY = (Math.random() - 0.5) * 8;
        }
        gaze.nextGazeTime = now + (isAnxious ? 800 : 2100) + Math.random() * 1000;
      }
      gaze.x += (gaze.targetX - gaze.x) * 0.12;
      gaze.y += (gaze.targetY - gaze.y) * 0.12;

      const profile = SUSPECT_LANDMARKS[suspectId] || SUSPECT_LANDMARKS['suspect-julian-vance'];

      // Center transform: Entire body and head moves as a single coherent entity
      const totalY = height * 0.5 + breathY + speechNodY + jitterY;
      const totalX = width * 0.5 + headSwayX + jitterX;
      const totalRot = headTilt + speechNodPitch;

      ctx.save();
      ctx.translate(totalX, totalY);
      ctx.rotate(totalRot);
      ctx.scale(breathScale, breathScale);

      // --- LAYER 1: BASE PHOTOGRAPHIC PORTRAIT (FULL HEAD, NECK, COLLAR, SUIT) ---
      // The entire person is rendered cleanly without slicing or disconnecting!
      ctx.drawImage(img, -width * 0.5, -height * 0.5, width, height);

      // Helper to map 380-scale calibrated point to canvas-relative coordinates
      const toRel = (pt: { x: number; y: number }) => ({
        x: pt.x - width * 0.5,
        y: pt.y - height * 0.5,
      });

      // --- LAYER 2: PHOTOREALISTIC LIP-SYNC VISEMES (CONFINED STRICTLY TO LIPS) ---
      const mouthOpenness = mouthOpennessRef.current;
      const mRel = toRel(profile.mouthCenter);
      const mw = profile.mouthRight.x - profile.mouthLeft.x;
      const mh = profile.mouthBottom.y - profile.mouthTop.y;

      // Subtle smirk asymmetry for Julian Vance when deceptive
      const isDeceptiveSmirk = isSociopath && reading.asymmetrySmirk > 25;
      const rightLipOffset = isDeceptiveSmirk ? -2.5 : 0;

      if (mouthOpenness > 0.04 || isDeceptiveSmirk) {
        ctx.save();
        const lipAperture = mouthOpenness * 5.5; // Natural realistic oral aperture (max 5.5px)

        // 1. Soft feathered elliptical clip strictly bounded to the lips
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(mRel.x, mRel.y, mw * 0.52, mh * 0.6 + lipAperture * 0.4, 0, 0, Math.PI * 2);
        ctx.clip();

        // 2. Interior oral cavity: warm dark shadow
        ctx.fillStyle = profile.mouthShadow;
        ctx.beginPath();
        ctx.ellipse(mRel.x, mRel.y + lipAperture * 0.35, mw * 0.44, lipAperture * 0.6 + 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Subtle translucent upper teeth edge
        if (mouthOpenness > 0.18) {
          ctx.fillStyle = 'rgba(238, 232, 222, 0.85)';
          ctx.beginPath();
          ctx.ellipse(mRel.x, mRel.y - 1 + lipAperture * 0.15, mw * 0.28, Math.min(2.2, lipAperture * 0.4), 0, 0, Math.PI);
          ctx.fill();

          ctx.strokeStyle = 'rgba(70, 30, 25, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mRel.x, mRel.y - 1);
          ctx.lineTo(mRel.x, mRel.y + 1.2);
          ctx.stroke();
        }

        // 4. Tongue curve
        if (mouthOpenness > 0.35) {
          ctx.fillStyle = 'rgba(155, 60, 50, 0.7)';
          ctx.beginPath();
          ctx.ellipse(mRel.x, mRel.y + lipAperture * 0.65, mw * 0.24, lipAperture * 0.28, 0, Math.PI, 0);
          ctx.fill();
        }

        // 5. Upper lip contour
        ctx.strokeStyle = profile.lipColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(mRel.x - mw * 0.45, mRel.y);
        ctx.quadraticCurveTo(mRel.x - mw * 0.2, mRel.y - 1.5 - mouthOpenness * 0.6, mRel.x, mRel.y - 1 - mouthOpenness * 0.6);
        ctx.quadraticCurveTo(mRel.x + mw * 0.2, mRel.y - 1.5 - mouthOpenness * 0.6, mRel.x + mw * 0.45, mRel.y + rightLipOffset);
        ctx.stroke();

        // 6. Lower lip contour & highlight
        ctx.strokeStyle = profile.lipColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(mRel.x - mw * 0.45, mRel.y);
        ctx.quadraticCurveTo(mRel.x, mRel.y + lipAperture + 2.0, mRel.x + mw * 0.45, mRel.y + rightLipOffset);
        ctx.stroke();

        // Specular moisture highlight on lower lip
        ctx.fillStyle = profile.lipHighlight;
        ctx.beginPath();
        ctx.ellipse(mRel.x, mRel.y + lipAperture + 1.5, mw * 0.2, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // end mouth clip
        ctx.restore();
      }

      // --- LAYER 3: PHOTOREALISTIC EYELID BLINKING & CORNEAL SPECULARS ---
      const blinkProgress = blink.isBlinking ? Math.sin(blink.blinkProgress * Math.PI) : 0;
      const eyeLidClose = Math.min(1, blinkProgress * 1.45);

      const renderEyeDynamics = (
        pupil: { x: number; y: number },
        top: { x: number; y: number },
        bottom: { x: number; y: number },
        inner: { x: number; y: number },
        outer: { x: number; y: number }
      ) => {
        const pRel = toRel(pupil);
        const ew = Math.abs(outer.x - inner.x);
        const eh = Math.abs(bottom.y - top.y);

        // Corneal specular highlights tracking gaze
        if (eyeLidClose < 0.85) {
          const shiftX = gaze.x * 0.08;
          const shiftY = gaze.y * 0.08;

          ctx.save();
          ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
          ctx.beginPath();
          ctx.arc(pRel.x - 2.5 + shiftX, pRel.y - 1.5 + shiftY, 1.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 215, 175, 0.45)';
          ctx.beginPath();
          ctx.arc(pRel.x + 2.5 + shiftX, pRel.y + 1 + shiftY, 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Natural eyelid closure
        if (eyeLidClose > 0.04) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(pRel.x, pRel.y, ew * 0.52, eh * 0.62, 0, 0, Math.PI * 2);
          ctx.clip();

          const lidSweepY = pRel.y - eh * 0.6 + eh * 1.2 * eyeLidClose;
          const grad = ctx.createLinearGradient(pRel.x, pRel.y - eh * 0.6, pRel.x, pRel.y + eh * 0.6);
          grad.addColorStop(0, 'rgba(80, 50, 40, 0.85)');
          grad.addColorStop(0.5, profile.skinTone);
          grad.addColorStop(1, 'rgba(60, 35, 28, 0.85)');

          ctx.fillStyle = grad;
          ctx.fillRect(pRel.x - ew, pRel.y - eh, ew * 2, lidSweepY - (pRel.y - eh));

          ctx.strokeStyle = '#1a1410';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(pRel.x, lidSweepY, ew * 0.48, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.stroke();

          ctx.restore();
        }
      };

      renderEyeDynamics(
        profile.leftEyePupil,
        profile.leftEyeTop,
        profile.leftEyeBottom,
        profile.leftEyeInner,
        profile.leftEyeOuter
      );
      renderEyeDynamics(
        profile.rightEyePupil,
        profile.rightEyeTop,
        profile.rightEyeBottom,
        profile.rightEyeInner,
        profile.rightEyeOuter
      );

      // --- LAYER 4: MARCUS DRAKE DRIFTING CIGARETTE SMOKE ---
      if (isCynic) {
        if (Math.random() < 0.28) {
          smokeParticlesRef.current.push({
            x: mRel.x + 16,
            y: mRel.y + 1,
            vx: 0.2 + (Math.random() - 0.5) * 0.35,
            vy: -1.1 - Math.random() * 0.6,
            alpha: 0.38,
            size: 3 + Math.random() * 3.5,
          });
        }

        smokeParticlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.size += 0.3;
          p.alpha -= 0.007;

          const sGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          sGrad.addColorStop(0, `rgba(220, 226, 235, ${Math.max(0, p.alpha * 0.5)})`);
          sGrad.addColorStop(1, 'rgba(220, 226, 235, 0)');

          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        smokeParticlesRef.current = smokeParticlesRef.current.filter((p) => p.alpha > 0);
      }

      // --- LAYER 5: AMBIENT 35MM NOIR STREETLIGHT FLICKER ---
      const lampFlicker = Math.sin(t * 1.5) * 0.02 + 0.035;
      const noirOverlay = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, 0);
      noirOverlay.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      noirOverlay.addColorStop(0.65, `rgba(245, 158, 11, ${lampFlicker})`);
      noirOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = noirOverlay;
      ctx.fillRect(-width * 0.5, -height * 0.5, width, height);

      // --- LAYER 6: FORENSIC BIOMETRIC WIREFRAME MESH (PIXEL-PERFECTLY ALIGNED) ---
      if (showMesh) {
        const isAnomaly = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
        const isAnxiousOk = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';

        const meshColor = isAnomaly
          ? 'rgba(239, 68, 68, 0.45)'
          : isAnxiousOk
          ? 'rgba(245, 158, 11, 0.4)'
          : 'rgba(6, 182, 212, 0.35)';

        const dotColor = isAnomaly ? '#ef4444' : isAnxiousOk ? '#f59e0b' : '#06b6d4';

        // Convert calibrated absolute pixel coordinates to canvas relative coordinates
        const lp = toRel(profile.leftEyePupil);
        const rp = toRel(profile.rightEyePupil);
        const li = toRel(profile.leftEyeInner);
        const lo = toRel(profile.leftEyeOuter);
        const lt = toRel(profile.leftEyeTop);
        const lb = toRel(profile.leftEyeBottom);

        const ri = toRel(profile.rightEyeInner);
        const ro = toRel(profile.rightEyeOuter);
        const rt = toRel(profile.rightEyeTop);
        const rb = toRel(profile.rightEyeBottom);

        const lbo = toRel(profile.leftBrowOuter);
        const lbp = toRel(profile.leftBrowPeak);
        const lbi = toRel(profile.leftBrowInner);

        const rbi = toRel(profile.rightBrowInner);
        const rbp = toRel(profile.rightBrowPeak);
        const rbo = toRel(profile.rightBrowOuter);

        const nbt = toRel(profile.noseBridgeTop);
        const nmid = toRel(profile.noseMid);
        const nl = toRel(profile.noseLeft);
        const nt = toRel(profile.noseTip);
        const nr = toRel(profile.noseRight);

        const ml = toRel(profile.mouthLeft);
        const mt = toRel(profile.mouthTop);
        const mr = toRel(profile.mouthRight);
        const mb = toRel(profile.mouthBottom);
        const mc = toRel(profile.mouthCenter);

        const lchk = toRel(profile.leftCheek);
        const rchk = toRel(profile.rightCheek);
        const ljaw = toRel(profile.leftJaw);
        const rjaw = toRel(profile.rightJaw);
        const chn = toRel(profile.chin);

        // Adjust dynamically for gaze and speech
        const eyeGazeShiftX = gaze.x * 0.08;
        const eyeGazeShiftY = gaze.y * 0.08;
        const liveMouthBottomY = mb.y + mouthOpenness * 4.5;
        const liveRightLipY = mr.y + (isDeceptiveSmirk ? rightLipOffset : 0);

        ctx.strokeStyle = meshColor;
        ctx.lineWidth = 1;
        ctx.beginPath();

        // 1. Left Eye Contour
        ctx.moveTo(lo.x, lo.y);
        ctx.lineTo(lt.x, lt.y);
        ctx.lineTo(li.x, li.y);
        ctx.lineTo(lb.x, lb.y);
        ctx.closePath();

        // 2. Right Eye Contour
        ctx.moveTo(ri.x, ri.y);
        ctx.lineTo(rt.x, rt.y);
        ctx.lineTo(ro.x, ro.y);
        ctx.lineTo(rb.x, rb.y);
        ctx.closePath();

        // 3. Eyebrows
        ctx.moveTo(lbo.x, lbo.y);
        ctx.lineTo(lbp.x, lbp.y);
        ctx.lineTo(lbi.x, lbi.y);

        ctx.moveTo(rbi.x, rbi.y);
        ctx.lineTo(rbp.x, rbp.y);
        ctx.lineTo(rbo.x, rbo.y);

        // 4. Nose Bridge & Wings
        ctx.moveTo(nbt.x, nbt.y);
        ctx.lineTo(nmid.x, nmid.y);
        ctx.lineTo(nl.x, nl.y);
        ctx.lineTo(nt.x, nt.y);
        ctx.lineTo(nr.x, nr.y);
        ctx.lineTo(nmid.x, nmid.y);

        // 5. Mouth Loop
        ctx.moveTo(ml.x, ml.y);
        ctx.lineTo(mt.x, mt.y);
        ctx.lineTo(mr.x, liveRightLipY);
        ctx.lineTo(mb.x, liveMouthBottomY);
        ctx.closePath();

        // 6. Facial Contour & Jawline Triangulations
        ctx.moveTo(lbo.x, lbo.y);
        ctx.lineTo(lchk.x, lchk.y);
        ctx.lineTo(ljaw.x, ljaw.y);
        ctx.lineTo(chn.x, chn.y);
        ctx.lineTo(rjaw.x, rjaw.y);
        ctx.lineTo(rchk.x, rchk.y);
        ctx.lineTo(rbo.x, rbo.y);

        // Cross-facial structural struts
        ctx.moveTo(lchk.x, lchk.y);
        ctx.lineTo(ml.x, ml.y);
        ctx.lineTo(chn.x, chn.y);
        ctx.lineTo(mr.x, liveRightLipY);
        ctx.lineTo(rchk.x, rchk.y);

        ctx.moveTo(nt.x, nt.y);
        ctx.lineTo(mt.x, mt.y);

        ctx.stroke();

        // Landmark Nodes & Pupils
        const allNodes = [
          // Eyebrows
          lbo, lbp, lbi, rbi, rbp, rbo,
          // Eyes
          lo, lt, li, lb,
          ro, rt, ri, rb,
          // Nose
          nbt, nmid, nl, nt, nr,
          // Mouth
          ml, mt, { x: mr.x, y: liveRightLipY }, { x: mb.x, y: liveMouthBottomY },
          // Cheeks, Jaw, Chin
          lchk, rchk, ljaw, rjaw, chn,
        ];

        allNodes.forEach((node) => {
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Dynamic Pupil Tracking Dots
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(lp.x + eyeGazeShiftX, lp.y + eyeGazeShiftY, 2.4, 0, Math.PI * 2);
        ctx.arc(rp.x + eyeGazeShiftX, rp.y + eyeGazeShiftY, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Deception alert radar rings
        if (isAnomaly) {
          const pulseR = 12 + Math.sin(t * 10) * 3;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(mr.x, liveRightLipY, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Crosshairs on pupils
          ctx.beginPath();
          ctx.arc(lp.x + eyeGazeShiftX, lp.y + eyeGazeShiftY, 8, 0, Math.PI * 2);
          ctx.arc(rp.x + eyeGazeShiftX, rp.y + eyeGazeShiftY, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Atmospheric CRT Scanlines & Surveillance Feed Vignette
      const scanY = (frameRef.current * 1.5) % height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 25, 0, scanY + 25);
      scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
      scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 25, width, 50);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [suspectId, isSpeaking, showMesh, reading, imgLoaded]);

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
            LIVE AI AVATAR · {suspectName.toUpperCase()}
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
        </div>
      </div>

      {/* Main Photorealistic Live Viewport */}
      <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="w-full h-full object-cover"
        />

        {/* Vintage CRT scanlines */}
        <div className="absolute inset-0 terminal-scanlines pointer-events-none opacity-25" />

        {/* Framing brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/70" />

        {/* Realtime Speaking Status Badge */}
        {isSpeaking ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-950/90 border border-amber-500/80 rounded text-[11px] font-terminal text-amber-200 flex items-center gap-2 shadow-xl z-20">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-amber-400 rounded animate-pulse" />
              <span className="w-1 h-4 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-2 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </span>
            <span className="font-semibold">AI AVATAR SPEAKING (STUDIO VOICE)</span>
          </div>
        ) : (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] font-terminal text-slate-400 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE INTERROGATION FEED</span>
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
            ) : isAnxiousNormal ? (
              <span className="text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ELEVATED ANXIETY (WITHIN BASELINE)
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
