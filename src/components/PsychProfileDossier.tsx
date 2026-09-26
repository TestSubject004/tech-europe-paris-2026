/**
 * =========================================================================================
 * Psychological Disposition & Sensor Calibration Dossier: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component visualizes the psychological calibration dossier for an individual suspect.
 * It articulates the suspect's psychological archetype (such as 'Type-B Neurotic Avoidant',
 * 'Machiavellian Sociopath', 'Introverted Cynical Stoic', or 'Obsessive-Compulsive Toxicologist')
 * and contrasts their resting physiological baseline against live sensor reads. Crucially, it hosts
 * the Detective False-Positive Guard, warning investigators against confusing natural anxiety
 * or stoicism with deception.
 * 
 * DIFFERENT USE CASES:
 * 1. Baseline Calibration Runs (handleRunCalibration):
 *    Simulates asking neutral control questions (e.g. verifying name, occupation, breakfast habits)
 *    to establish genuine baseline pulse, pitch jitter, glance aversion, and pupillary diameter.
 * 2. False-Positive Advisory (Detective Shield):
 *    Explains why suspects like Evelyn Cross exhibit 94 bpm tremors even when speaking the truth,
 *    or why Marcus Drake's 48% glance aversion is part of his anti-authoritarian baseline rather
 *    than guilt.
 * 3. Deception Tell Cheat-Sheets:
 *    Highlights true biometric anomalies (such as Julian Vance's 140ms unilateral micro-smirk
 *    or Dr. Thorne's pinpoint pupillary constriction under acute cognitive overload).
 * 4. Hardboiled Mode Redaction:
 *    When the Detective Shield is disabled in Options, redacts the explicit advisory hints,
 *    requiring the player to memorize and deduce psychological baselines independently.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { Suspect, BaselineQuestion } from '../types/game';
import { 
  Brain, 
  ShieldAlert, 
  ShieldOff, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle, 
  ArrowRight,
  EyeOff,
  Lock
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for PsychProfileDossier component.
 */
interface PsychProfileDossierProps {
  suspect: Suspect;
  onCalibrationComplete?: () => void;
  detectiveShieldEnabled?: boolean;
}

/**
 * Psychological profile dossier presenting baseline calibration metrics and false-positive guards.
 * 
 * @param props - Suspect profile, calibration triggers, shield state
 * @returns Rendered React component for psych profile
 */
export const PsychProfileDossier: React.FC<PsychProfileDossierProps> = ({
  suspect,
  onCalibrationComplete,
  detectiveShieldEnabled = true,
}) => {
  logFunctionCall('PsychProfileDossier', { suspectId: suspect.id, detectiveShieldEnabled });

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [calibrated, setCalibrated] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const personality = suspect.personality;
  const currentControlQ = suspect.baselineQuestions[activeQuestionIdx];

  /**
   * Runs an interactive calibration sequence on a baseline control question.
   * 
   * @param idx - Index of baseline question being analyzed
   */
  const handleRunCalibration = (idx: number): void => {
    logFunctionCall('PsychProfileDossier.handleRunCalibration', { idx, suspectId: suspect.id });
    setActiveQuestionIdx(idx);
    setIsTesting(true);
    sound.playScanPing();
    sound.playHeartbeat(suspect.baselineQuestions[idx].reading.heartRate);

    setTimeout(() => {
      setIsTesting(false);
      setCalibrated(true);
      if (onCalibrationComplete) onCalibrationComplete();
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Personality Badge & Indicator Card */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-terminal text-amber-500 mb-1">
              <Brain className="w-4 h-4 text-amber-500" />
              <span>PSYCHOLOGICAL DISPOSITION · DOSSIER FILE</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-noir">
              {suspect.name} — {personality.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-terminal text-cyan-400 mt-0.5">
              <span>Indicator: {personality.indicator}</span>
              <span className="text-slate-600">|</span>
              <span>Alias: {suspect.alias}</span>
              <span className="text-slate-600">|</span>
              <span>Age: {suspect.age}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-terminal">
            {/* Detective Shield Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border ${
                detectiveShieldEnabled
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {detectiveShieldEnabled ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>SHIELD ACTIVE: ANNOTATED DISPOSITION</span>
                </>
              ) : (
                <>
                  <ShieldOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>SHIELD DISABLED: RAW UNGUIDED DOSSIER</span>
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              BASELINE CALIBRATED
            </span>
          </div>
        </div>

        {/* Physical Demographics & Forensic Vitals Bar */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 font-terminal">
          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] uppercase text-slate-500 block">Biological Sex</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block">{suspect.sex}</span>
          </div>
          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] uppercase text-slate-500 block">Gender Identity</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block">{suspect.gender}</span>
          </div>
          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] uppercase text-slate-500 block">Stature / Height</span>
            <span className="text-xs font-bold text-amber-300 mt-0.5 block">{suspect.height}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Blood Group Type</span>
            <span className="text-xs font-bold text-rose-400 mt-0.5 block">{suspect.bloodType}</span>
          </div>
        </div>

        {/* Psychological Summary */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs uppercase font-terminal tracking-wider text-slate-400 mb-1">
                Clinical Psychological Profile
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-serif">
                {personality.summary}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-terminal tracking-wider text-slate-400 mb-1">
                Autonomic Baseline Behavior
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-terminal">
                {personality.baselineDescription}
              </p>
            </div>
          </div>

          {/* Critical False Positive Warning Box (IMPACTED BY DETECTIVE SHIELD) */}
          {detectiveShieldEnabled ? (
            <div className="bg-amber-950/20 border border-amber-500/40 rounded-lg p-4 flex flex-col justify-between animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold font-terminal text-amber-400 mb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>INTERROGATOR'S FALSE POSITIVE SHIELD</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed font-terminal">
                  {personality.falsePositiveWarning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-slate-400 font-terminal">
                <span className="text-amber-300 font-semibold">Recommended Protocols: </span>
                {personality.interrogationGuidelines}
              </div>
            </div>
          ) : (
            /* REDACTED / HARDBOILED UNGUIDED BOX WHEN DETECTIVE SHIELD IS DISABLED */
            <div className="bg-slate-950/90 border border-dashed border-rose-500/40 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden animate-in fade-in duration-150">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-terminal text-rose-400">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>FALSE POSITIVE ADVISORY · [REDACTED BY DETECTIVE SHIELD]</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                    HARDBOILED
                  </span>
                </div>

                <div className="p-3 rounded bg-[#070a0f] border border-slate-800 text-xs font-terminal text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Shield Guidance Off-line:</span>
                  </div>
                  <p className="text-xs text-slate-400/90 leading-relaxed font-mono">
                    Warning annotations regarding idiosyncratic nervous system anomalies, innocent panic baselines, and false positive protections are withheld under Hardboiled mode.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-rose-300/80 font-terminal flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>You must discern genuine deception from anxious or stoic baselines without department guidance.</span>
              </div>
            </div>
          )}
        </div>

        {/* Calibrated Baseline Metrics Grid */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs uppercase font-terminal tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Calibrated Physiological Baselines</span>
            <span className="text-slate-500 text-[10px]">Pop. Norm: 72 bpm · 6% Jitter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-terminal">
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Resting Pulse</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.heartRateBpm}{' '}
                <span className="text-[11px] font-normal text-slate-500">BPM</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Voice Tremor</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.voiceTremorPercent}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Glance Aversion</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.glanceAversionPercent}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Pupil Aperture</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.pupilDilationMm.toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-slate-500">mm</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Pitch Jitter</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.pitchJitterHz.toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-slate-500">Hz</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Speech Latency</div>
              <div className="text-base font-bold text-slate-200 mt-1 tabular-nums">
                {personality.baselineMetrics.speechLatencySec.toFixed(2)}{' '}
                <span className="text-[11px] font-normal text-slate-500">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Question Calibration Workbench */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-200 font-noir">
              Control Question Calibration Workbench
            </h3>
          </div>
          <span className="text-xs font-terminal text-slate-400">
            Control Questions: {suspect.baselineQuestions.length} recorded
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-3 font-terminal">
          Run these non-threatening control queries to calibrate the polygraph and biometric sensors to this individual's idiosyncratic nervous system.
        </p>

        {/* Question Selector Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {suspect.baselineQuestions.map((bq, idx) => (
            <button
              key={idx}
              onClick={() => handleRunCalibration(idx)}
              className={`px-3 py-1.5 text-xs font-terminal rounded transition-colors border ${
                activeQuestionIdx === idx
                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Control #{idx + 1}: {bq.expectedTone}
            </button>
          ))}
        </div>

        {/* Selected Control Question Output */}
        {currentControlQ && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
            <div>
              <div className="text-[11px] font-terminal text-slate-500 uppercase tracking-wider">
                Detective's Baseline Query
              </div>
              <div className="text-sm text-slate-200 font-medium italic mt-0.5">
                "{currentControlQ.question}"
              </div>
            </div>

            <div>
              <div className="text-[11px] font-terminal text-slate-500 uppercase tracking-wider">
                Subject's Response & Cadence
              </div>
              <div className="text-sm text-amber-200/90 font-terminal mt-0.5">
                "{currentControlQ.response}"
              </div>
            </div>

            {/* Live Readout from this question */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-4 text-xs font-terminal text-slate-300">
              <span>Heart Rate: <strong className="text-cyan-400">{currentControlQ.reading.heartRate} bpm</strong></span>
              <span>Pitch Jitter: <strong className="text-cyan-400">{currentControlQ.reading.pitchJitterHz} Hz</strong></span>
              <span>Aversion: <strong className="text-cyan-400">{currentControlQ.reading.glanceAversion}%</strong></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Baseline Reference
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deception Tells Reference (IMPACTED BY DETECTIVE SHIELD) */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-xs font-terminal text-rose-400 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>TRUE DECEPTION ANOMALIES FOR THIS PERSONALITY</span>
          </div>
          {!detectiveShieldEnabled && (
            <span className="text-[10px] font-terminal uppercase px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
              Shield Disabled: Hints Masked
            </span>
          )}
        </div>

        {detectiveShieldEnabled ? (
          <>
            <p className="text-xs text-slate-400 mb-3 font-terminal">
              When this specific psychological disposition fabricates a statement, look for these distinctive anomalies:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {personality.deceptionTells.map((tell, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-950 border border-slate-800/80 text-xs font-terminal text-slate-300 flex items-start gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{tell}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-4 rounded-lg bg-slate-950/90 border border-dashed border-rose-500/30 space-y-2 font-terminal">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span>Diagnostic Deception Cheat-Sheet Redacted</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              In Hardboiled mode, specific deception micro-tells (such as pupillary dilation thresholds, vocal frequency collapse points, and unilateral smirk millisecond windows) must be observed empirically by comparing the subject’s live readings during interrogation against the Control Question baseline workbench above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
