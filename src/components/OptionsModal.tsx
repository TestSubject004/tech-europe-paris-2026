/**
 * =========================================================================================
 * Investigation Protocol & Game Options Dialog: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The OptionsModal provides user configuration controls for difficulty mode, audio synthesis,
 * and case archive management. It houses the toggle for the Detective Shield (switching between
 * standard assisted mode and Hardboiled mode where false-positive hints are redacted), controls for
 * master SFX and procedural rain ambience, and the archive clearance button to mark all cases uncleared.
 * 
 * DIFFERENT USE CASES:
 * 1. Hardboiled Mode Toggle (onToggleDetectiveShield):
 *    Allows advanced detectives to disable psychological disposition hints in the Psych Profile Dossier,
 *    testing their raw deductive acumen without algorithmic hand-holding.
 * 2. Master Audio and Ambient Rain Controls:
 *    Toggles procedural Web Audio sound effects and persistent pink-noise rainfall.
 * 3. Case Solved Archives Clearance (onResetSolvedCases):
 *    Enables players to manually clear all saved "Case Solved" records and reset all investigations
 *    to an uncleared state without requiring a browser cache clear.
 * =========================================================================================
 */

import React from 'react';
import { Settings, ShieldAlert, ShieldCheck, Volume2, VolumeX, CloudRain, RotateCcw, X, Info, Download, Package, Server, Globe, Check } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';
import { APP_CONFIG } from '../config';

/**
 * Properties for OptionsModal component.
 */
interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectiveShieldEnabled: boolean;
  onToggleDetectiveShield: (enabled: boolean) => void;
  onResetSolvedCases?: () => void;
}

/**
 * Modal dialog for adjusting gameplay assistance, audio toggles, and solved archive resets.
 * 
 * @param props - Modal visibility, toggles, and reset callbacks
 * @returns Rendered React component for options modal
 */
export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  detectiveShieldEnabled,
  onToggleDetectiveShield,
  onResetSolvedCases,
}) => {
  logFunctionCall('OptionsModal', { isOpen, detectiveShieldEnabled });
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const [ambientRainActive, setAmbientRainActive] = React.useState(false);
  const [resetConfirmation, setResetConfirmation] = React.useState(false);
  const [serverUrl, setServerUrl] = React.useState<string>(() => APP_CONFIG.server.getApiBaseUrl());
  const [serverSaved, setServerSaved] = React.useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f17] border border-amber-500/50 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-noir">
                Game Options & Investigation Protocol
              </h3>
              <p className="text-xs text-slate-400 font-terminal">
                Customise investigation assistance and ambience
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTypewriter();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Detective Shield (False Positive Guard) */}
        <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {detectiveShieldEnabled ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="text-sm font-bold text-slate-100 font-terminal">
                  Detective Shield (False Positive Warnings)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-terminal">
                When enabled, the department shield alerts you if a subject’s anxiety or eye aversion is part of their baseline psychological disposition. In the Psych Profile Dossier, it provides false positive warnings and deception anomaly cheat-sheets; disabling it activates Hardboiled mode, redacting these advisory hints.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={detectiveShieldEnabled}
              onClick={() => {
                sound.playTypewriter();
                onToggleDetectiveShield(!detectiveShieldEnabled);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                detectiveShieldEnabled ? 'bg-amber-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  detectiveShieldEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Detailed status note */}
          <div className={`p-2.5 rounded text-xs font-terminal ${
            detectiveShieldEnabled
              ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
          }`}>
            {detectiveShieldEnabled ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  <strong>SHIELD ACTIVE (Hardboiled Mode Off):</strong> You will be cautioned when baseline anxiety is about to trigger a false accusation.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>
                  <strong>SHIELD DISABLED (Hardboiled Noir Mode):</strong> No false positive warnings will appear. You must evaluate psychological baselines on your own!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Setting 2: Audio & Noir Rain Ambience */}
        <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="text-xs uppercase font-terminal tracking-wider text-slate-400">
            Acoustic Atmosphere & Audio FX
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const muted = sound.toggleMute();
                setIsMuted(muted);
                sound.playTypewriter();
              }}
              className={`p-3 rounded border text-left font-terminal text-xs transition-colors flex items-center justify-between ${
                isMuted
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span>Master SFX</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{isMuted ? 'MUTED' : 'ON'}</span>
            </button>

            <button
              onClick={() => {
                const active = sound.toggleAmbientRain();
                setAmbientRainActive(active);
                sound.playTypewriter();
              }}
              className={`p-3 rounded border text-left font-terminal text-xs transition-colors flex items-center justify-between ${
                ambientRainActive
                  ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CloudRain className={`w-4 h-4 ${ambientRainActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>Noir Rain</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{ambientRainActive ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Setting 3: Case Solved Records / Archive Reset */}
        {onResetSolvedCases && (
          <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-100 font-terminal">
                    Case Clearance Archives
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-terminal">
                  Clear all "Case Solved" designations across all cold cases. All case files will be marked uncleared and reset for fresh investigation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playTypewriter();
                  onResetSolvedCases();
                  setResetConfirmation(true);
                  setTimeout(() => setResetConfirmation(false), 3000);
                }}
                className="px-3.5 py-1.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-terminal font-semibold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mark All Uncleared</span>
              </button>
            </div>

            {resetConfirmation && (
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-terminal flex items-center gap-2 animate-in fade-in duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>All case solved statuses have been cleared. All cases are now uncleared.</span>
              </div>
            )}
          </div>
        )}

        {/* Setting 4: Itch.io HTML5 Game Package */}
        <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-slate-100 font-terminal">
                  Itch.io HTML5 Game Package
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-terminal">
                Pre-built, standalone HTML5 bundle (<code className="text-amber-400">detective-stories-itch.zip</code>) ready for upload to Itch.io.
              </p>
            </div>

            <a
              href="/download-game-zip"
              download="detective-stories-itch.zip"
              onClick={() => sound.playSuccessChime()}
              className="px-3.5 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-terminal font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              title="Download compiled itch.io zip package"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ZIP</span>
            </a>
          </div>
        </div>

        {/* Setting 5: Remote AI Server Endpoint (Optional for itch.io players) */}
        <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-sm font-bold text-slate-100 font-terminal">
                  Remote AI Backend Server (Optional)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-terminal">
                For itch.io players: paste your Cloud Run / Node server URL to enable Gemini AI voice transcription & studio audio. Leave blank to run standalone in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="e.g. https://your-backend-app.run.app"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-terminal text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => {
                sound.playTypewriter();
                APP_CONFIG.server.setApiBaseUrl(serverUrl);
                setServerSaved(true);
                setTimeout(() => setServerSaved(false), 3000);
              }}
              className="px-3.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-terminal font-semibold transition-colors shrink-0 flex items-center gap-1"
            >
              {serverSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save URL</span>
              )}
            </button>
          </div>
          {serverSaved && (
            <div className="text-[11px] font-terminal text-emerald-300">
              API endpoint updated. Network calls will now route to this server.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              sound.playTypewriter();
              onClose();
            }}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-terminal rounded uppercase tracking-wider transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
