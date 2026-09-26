/**
 * =========================================================================================
 * 48-Point Facial Landmark & Micro-Expression Mesh Canvas: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component renders the forensic facial recognition HUD directly overlaid onto the suspect's
 * portrait. It projects an animated 48-point geometric landmark mesh across eyebrows, pupils,
 * nose bridge, jawline, and mouth corners. It detects real-time micro-expressions: pupil flares/constrictions,
 * lip compressions, glance aversion percentages, and unilateral asymmetric micro-smirks that expose
 * concealed deception.
 * 
 * DIFFERENT USE CASES:
 * 1. Facial Landmark Tracking:
 *    Overlays triangulated vector meshes tracking 48 anatomical coordinates across the suspect's face.
 * 2. Asymmetric Smirk Telemetry:
 *    Measures unilateral mouth elevation anomalies (such as Julian Vance's 140ms right-side smirk),
 *    triggering color-shifted crimson vectors when critical deception thresholds are breached.
 * 3. Pupillary Dilation Monitoring:
 *    Gauges pupil diameter against calibrated baseline (e.g. 2.2mm constriction for Dr. Thorne
 *    vs 4.8mm dilation under acute fear).
 * 4. Mesh Overlay Toggling:
 *    Allows detectives to toggle between raw vintage portrait photography and the active forensic
 *    biometric scanning grid.
 * =========================================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { BiometricReading, PersonalityProfile } from '../types/game';
import { Eye, Activity, Crosshair, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for FacialRecognitionCanvas component.
 */
interface FacialRecognitionCanvasProps {
  photoUrl: string;
  suspectName: string;
  reading: BiometricReading;
  personality: PersonalityProfile;
  isScanning?: boolean;
  isSpeaking?: boolean;
}

/**
 * 48-point facial landmark tracker and micro-expression canvas overlay.
 * 
 * @param props - Portrait source, biometric readings, speech state, scan mode
 * @returns Rendered React component for facial recognition canvas
 */
export const FacialRecognitionCanvas: React.FC<FacialRecognitionCanvasProps> = ({
  photoUrl,
  suspectName,
  reading,
  personality,
  isScanning = false,
  isSpeaking = false,
}) => {
  logFunctionCall('FacialRecognitionCanvas', { suspectName, isSpeaking, anomalyRating: reading.anomalyRating });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [pulseFrame, setPulseFrame] = useState<number>(0);

  // Animate biometric pulse scan
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPulseFrame((prev) => (prev + 1) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw facial landmark nodes and biometric triangulations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showMesh) return;

    const width = canvas.width;
    const height = canvas.height;

    // Mouth corners and lips (with subtle live speaking articulation)
    const mouthDelta = isSpeaking ? Math.sin((pulseFrame * Math.PI) / 8) * 3 : 0;
    const nodes = [
      // Eyebrows Left
      { x: width * 0.35, y: height * 0.38 },
      { x: width * 0.40, y: height * 0.36 },
      { x: width * 0.45, y: height * 0.37 },
      // Eyebrows Right
      { x: width * 0.55, y: height * 0.37 },
      { x: width * 0.60, y: height * 0.36 },
      { x: width * 0.65, y: height * 0.38 },
      // Eyes Left
      { x: width * 0.37, y: height * 0.42 },
      { x: width * 0.43, y: height * 0.42 },
      { x: width * 0.40, y: height * 0.41 }, // left pupil
      // Eyes Right
      { x: width * 0.57, y: height * 0.42 },
      { x: width * 0.63, y: height * 0.42 },
      { x: width * 0.60, y: height * 0.41 }, // right pupil
      // Nose bridge and tip
      { x: width * 0.50, y: height * 0.42 },
      { x: width * 0.50, y: height * 0.49 },
      { x: width * 0.46, y: height * 0.55 },
      { x: width * 0.50, y: height * 0.56 },
      { x: width * 0.54, y: height * 0.55 },
      // Mouth corners and lips
      { x: width * 0.42, y: height * 0.67 }, // left corner
      { x: width * 0.50, y: height * 0.65 - mouthDelta * 0.5 }, // upper center
      { x: width * 0.58, y: height * 0.67 }, // right corner
      { x: width * 0.50, y: height * 0.70 + mouthDelta }, // lower center
      // Cheekbones and jawline
      { x: width * 0.30, y: height * 0.52 },
      { x: width * 0.70, y: height * 0.52 },
      { x: width * 0.34, y: height * 0.72 },
      { x: width * 0.66, y: height * 0.72 },
      { x: width * 0.50, y: height * 0.82 + mouthDelta * 0.5 }, // chin
    ];

    const isAnomaly = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
    const isAnxiousOk = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';

    const meshColor = isAnomaly
      ? 'rgba(239, 68, 68, 0.45)'
      : isAnxiousOk
      ? 'rgba(245, 158, 11, 0.4)'
      : 'rgba(6, 182, 212, 0.35)';

    const dotColor = isAnomaly
      ? '#ef4444'
      : isAnxiousOk
      ? '#f59e0b'
      : '#06b6d4';

    // Draw connecting triangulation lines
    ctx.strokeStyle = meshColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Eye contour
    ctx.moveTo(nodes[6].x, nodes[6].y);
    ctx.lineTo(nodes[7].x, nodes[7].y);
    ctx.moveTo(nodes[9].x, nodes[9].y);
    ctx.lineTo(nodes[10].x, nodes[10].y);

    // Eyebrow contour
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.moveTo(nodes[3].x, nodes[3].y);
    ctx.lineTo(nodes[4].x, nodes[4].y);
    ctx.lineTo(nodes[5].x, nodes[5].y);

    // Nose
    ctx.moveTo(nodes[12].x, nodes[12].y);
    ctx.lineTo(nodes[13].x, nodes[13].y);
    ctx.lineTo(nodes[15].x, nodes[15].y);
    ctx.lineTo(nodes[14].x, nodes[14].y);
    ctx.lineTo(nodes[16].x, nodes[16].y);

    // Mouth
    ctx.moveTo(nodes[17].x, nodes[17].y);
    ctx.lineTo(nodes[18].x, nodes[18].y);
    ctx.lineTo(nodes[19].x, nodes[19].y);
    ctx.lineTo(nodes[20].x, nodes[20].y);
    ctx.closePath();

    // Triangulations to cheeks & chin
    ctx.moveTo(nodes[21].x, nodes[21].y);
    ctx.lineTo(nodes[17].x, nodes[17].y);
    ctx.lineTo(nodes[23].x, nodes[23].y);
    ctx.lineTo(nodes[25].x, nodes[25].y);
    ctx.lineTo(nodes[24].x, nodes[24].y);
    ctx.lineTo(nodes[19].x, nodes[19].y);
    ctx.lineTo(nodes[22].x, nodes[22].y);
    ctx.stroke();

    // Draw landmark dots
    nodes.forEach((node, idx) => {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      const radius = idx === 8 || idx === 11 ? 2.5 : 1.8;
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // If micro-expression anomaly detected, draw pulsing tracker around eyes/mouth
    if (isAnomaly) {
      const pulseSize = 14 + Math.sin((pulseFrame * Math.PI) / 30) * 4;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 1.5;

      // Pulse at asymmetric mouth corner
      ctx.beginPath();
      ctx.arc(nodes[19].x, nodes[19].y, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Pupil stress crosshairs
      ctx.beginPath();
      ctx.arc(nodes[8].x, nodes[8].y, 10, 0, Math.PI * 2);
      ctx.arc(nodes[11].x, nodes[11].y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Scanline radar bar
    const scanY = (pulseFrame * 1.5) % height;
    const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 20, width, 40);
  }, [showMesh, pulseFrame, reading]);

  const baseline = personality.baselineMetrics;
  const isCriticalAnomaly = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
  const isAnxiousNormal = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';

  return (
    <div className="flex flex-col bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
      {/* Scanner Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-[#070a10]">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-semibold tracking-wide text-slate-300 font-terminal">
            BIOMETRIC MESH OVERLAY · {suspectName.toUpperCase()}
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
            {showMesh ? '[ HIDE MESH ]' : '[ SHOW MESH ]'}
          </button>
        </div>
      </div>

      {/* Portrait + Canvas Stage */}
      <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden bg-slate-950 flex items-center justify-center">
        <img
          src={photoUrl}
          alt={suspectName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale contrast-125 filter"
        />
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Vintage CRT scanlines */}
        <div className="absolute inset-0 terminal-scanlines pointer-events-none opacity-40" />

        {/* Framing brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/70" />

        {/* Scanning or Speaking Badge */}
        {isSpeaking ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-950/90 border border-amber-500/80 rounded text-[11px] font-terminal text-amber-200 flex items-center gap-2 shadow-xl z-20">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-amber-400 rounded animate-pulse" />
              <span className="w-1 h-4 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-2 bg-amber-400 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </span>
            <span className="font-semibold">AVATAR SPEAKING (EN-US)</span>
          </div>
        ) : isScanning ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-cyan-950/80 border border-cyan-500/60 rounded text-[11px] font-terminal text-cyan-300 flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE CAMERA FEED
          </div>
        ) : null}

        {/* Micro-expression alert flag in portrait bottom */}
        <div className="absolute bottom-2 inset-x-2 px-2.5 py-1.5 bg-slate-950/85 backdrop-blur border border-slate-800 rounded flex items-center justify-between">
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
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden relative">
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
