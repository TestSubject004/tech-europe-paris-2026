/**
 * =========================================================================================
 * Spectral Voice Pattern & Acoustic Oscilloscope: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component visualizes the suspect's vocal frequency spectrum and acoustic jitter
 * in real-time. Rendered on an atmospheric CRT oscilloscope canvas with green/amber phosphor
 * traces, it measures pitch jitter (Hz), voice tremor percentages, sub-vocal laryngeal fry,
 * and speech latency pauses, comparing instantaneous readings against the calibrated baseline.
 * 
 * DIFFERENT USE CASES:
 * 1. Spectral Frequency Oscilloscope Rendering:
 *    Draws modulated sine and harmonic waveforms with dynamic phase jitter representing vocal
 *    stability or deception stress.
 * 2. Acoustic Replay (handlePlayVoice):
 *    Audibly synthesizes the acoustic voice pattern using Web Audio oscillators or character
 *    voice models to let detectives hear frequency tremors and cadence hitches.
 * 3. Anomaly Rating Detection:
 *    Flags when pitch jitter exceeds 6.0 Hz above baseline, signaling vocal cord tension caused
 *    by conscious fabrication.
 * =========================================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { BiometricReading, PersonalityProfile } from '../types/game';
import { Mic, Play, Square, AudioWaveform, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for VoicePatternAnalyzer component.
 */
interface VoicePatternAnalyzerProps {
  reading: BiometricReading;
  personality: PersonalityProfile;
  durationSec: number;
  suspectId?: string;
  statementText?: string;
}

/**
 * Oscilloscope voice stress and acoustic frequency pattern analyzer.
 * 
 * @param props - Biometric reading, personality baseline, statement metadata
 * @returns Rendered React component for voice analyzer
 */
export const VoicePatternAnalyzer: React.FC<VoicePatternAnalyzerProps> = ({
  reading,
  personality,
  durationSec,
  suspectId,
  statementText,
}) => {
  logFunctionCall('VoicePatternAnalyzer', { suspectId, anomalyRating: reading.anomalyRating, pitchJitterHz: reading.pitchJitterHz });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const baseline = personality.baselineMetrics;
  const isAnomaly = reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY';
  const isElevatedNormal = reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE';

  // Draw real-time audio waveform / spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPhase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Center Baseline
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Draw Waveform
      const color = isAnomaly ? '#ef4444' : isElevatedNormal ? '#f59e0b' : '#06b6d4';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const points = 120;
      const step = w / points;
      const jitterFactor = isPlaying ? reading.pitchJitterHz * 0.8 : 1.2;

      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const norm = i / points;
        const envelope = Math.sin(norm * Math.PI); // fade at edges

        // Multi-frequency wave synthesis
        const f1 = Math.sin(localPhase + norm * 14);
        const f2 = Math.cos(localPhase * 1.5 + norm * 26) * 0.5;
        const jitter = isPlaying ? (Math.random() - 0.5) * (reading.pitchJitterHz / 8) : 0;

        const y = h / 2 + (f1 + f2 + jitter) * (isPlaying ? 28 : 8) * envelope;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (isPlaying) {
        localPhase += 0.25;
      } else {
        localPhase += 0.04;
      }
      phaseRef.current = localPhase;

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, reading, isAnomaly, isElevatedNormal]);

  /**
   * Triggers acoustic pattern playback through procedural audio synthesizer or real human speech.
   */
  const handlePlayVoice = (): void => {
    logFunctionCall('VoicePatternAnalyzer.handlePlayVoice', { suspectId, isPlaying });
    if (isPlaying) return;
    setIsPlaying(true);

    if (statementText && suspectId) {
      sound.speakRealHumanVoice(
        statementText,
        suspectId,
        null,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    } else {
      sound.playVoiceSample(durationSec, reading.pitchJitterHz, isAnomaly);
      setTimeout(() => {
        setIsPlaying(false);
      }, durationSec * 1000);
    }
  };

  return (
    <div className="flex flex-col bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
      {/* Voice Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-[#070a10]">
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-300 font-terminal">
            SPECTRAL VOICE PATTERN & ACOUSTIC JITTER
          </span>
        </div>
        <button
          onClick={handlePlayVoice}
          disabled={isPlaying}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-terminal transition-all ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3 h-3 fill-current animate-pulse text-amber-400" />
              <span>TRANSMITTING...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current text-slate-300" />
              <span>PLAY ACOUSTIC PATTERN</span>
            </>
          )}
        </button>
      </div>

      {/* Waveform Canvas */}
      <div className="relative p-2 bg-slate-950 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={440}
          height={100}
          className="w-full h-24 rounded border border-slate-900 bg-[#05070c]"
        />
        {/* Subtle grid watermark */}
        <div className="absolute top-3 left-4 text-[9px] font-terminal text-slate-600 uppercase tracking-wider">
          Hz Frequency Spectrum · Oscilloscope Output
        </div>
      </div>

      {/* Voice Acoustic Metrics */}
      <div className="p-3 border-t border-slate-800 bg-[#070a10] space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {/* Metric 1: Pitch Jitter */}
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-terminal">
            <div className="text-slate-400">Pitch Jitter</div>
            <div
              className={`text-sm font-bold mt-0.5 tabular-nums ${
                reading.pitchJitterHz > baseline.pitchJitterHz + 6 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {reading.pitchJitterHz.toFixed(1)} Hz
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Base: {baseline.pitchJitterHz.toFixed(1)} Hz
            </div>
          </div>

          {/* Metric 2: Vocal Tremor Index */}
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-terminal">
            <div className="text-slate-400">Tremor Index</div>
            <div
              className={`text-sm font-bold mt-0.5 tabular-nums ${
                reading.tremorIndex > baseline.voiceTremorPercent + 12 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {reading.tremorIndex}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Base: {baseline.voiceTremorPercent}%
            </div>
          </div>

          {/* Metric 3: Response Latency Pause */}
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-terminal">
            <div className="text-slate-400">Cadence Latency</div>
            <div
              className={`text-sm font-bold mt-0.5 tabular-nums ${
                reading.speechLatencySec > baseline.speechLatencySec + 1.2 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {reading.speechLatencySec.toFixed(2)}s
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Base: {baseline.speechLatencySec.toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Vocal tells list */}
        {reading.vocalIndicators.length > 0 && (
          <div className="pt-1 border-t border-slate-800/60">
            <div className="text-[10px] font-terminal uppercase tracking-wider text-slate-500 mb-1">
              Acoustic Stress Indicators
            </div>
            <ul className="space-y-0.5 text-xs text-slate-300 font-terminal">
              {reading.vocalIndicators.map((tell, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400">›</span>
                  <span>{tell}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
