/**
 * =========================================================================================
 * Main Landing Menu & Command Portal: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The MainMenu component acts as the atmospheric gateway to the simulation. It immerses players
 * in 1940s film-noir styling with CRT scanlines, vintage typography, and three primary action hubs:
 * "Play Game" (navigating to the Case Directory), "Instructions" (opening the Biometric Field Manual),
 * and "Options" (toggling the Detective False-Positive Shield and audio preferences).
 * 
 * DIFFERENT USE CASES:
 * 1. Case Launch & Directory Transition:
 *    Directs the investigator to the case vault while reflecting whether an active cold case
 *    is currently under un-filed investigation.
 * 2. Biometric Field Manual Access:
 *    Launches the tactical field guide explaining vocal jitter thresholds, facial landmark tracking,
 *    and psychological baseline rules to prevent false convictions.
 * 3. Settings & Options Portal:
 *    Provides one-click access to adjust Hardboiled vs Shielded investigation modes and audio parameters.
 * 4. Atmospheric Immersion:
 *    Renders CRT scanlines, vintage sepia vignettes, and highlighting the core technological pillars
 *    (Oscilloscope voice stress, micro-expression tracking, real-time Gemini interrogation).
 * =========================================================================================
 */

import React from 'react';
import { 
  Play, 
  HelpCircle, 
  Settings, 
  ChevronRight, 
  Eye, 
  Activity, 
  Mic 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for MainMenu component.
 */
interface MainMenuProps {
  onPlayGame: () => void;
  onOpenInstructions: () => void;
  onOpenOptions: () => void;
  detectiveShieldEnabled: boolean;
  hasActiveProgress: boolean;
  activeCaseTitle: string;
}

/**
 * Main entrance view for Detective Stories.
 * 
 * @param props - Action triggers and system state indicators
 * @returns Rendered React component for main menu
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onPlayGame,
  onOpenInstructions,
  onOpenOptions,
  detectiveShieldEnabled,
  hasActiveProgress,
  activeCaseTitle,
}) => {
  logFunctionCall('MainMenu', { detectiveShieldEnabled, hasActiveProgress, activeCaseTitle });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 md:py-10 px-4 md:px-8 overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#080b11] to-[#040609] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)`
        }}
      />

      {/* Header Section */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-4 pt-4 md:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-terminal uppercase tracking-widest shadow-lg shadow-amber-950/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Precinct 8 Forensic Archives · 1948 Division</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-noir tracking-wider text-slate-100 uppercase drop-shadow-md">
          Detective Stories
        </h1>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-300 font-serif italic leading-relaxed">
          Step into the rain-slicked shadows of Precinct 8. Cross-examine suspects using calibrated voice pitch jitter, 48-point facial micro-expression meshes, and hard physical timeline contradictions to crack cold murder cases.
        </p>
      </div>

      {/* Primary Action Hub: 3 Main Menu Buttons */}
      <div className="relative z-10 max-w-md mx-auto w-full space-y-3.5 my-8">
        {/* 1. PLAY GAME / RESUME */}
        <button
          onClick={() => {
            logFunctionCall('MainMenu.onPlayGame');
            sound.playTypewriter();
            onPlayGame();
          }}
          className="group w-full p-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-terminal flex items-center justify-between shadow-xl shadow-amber-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2.5 rounded-lg bg-slate-950/20 text-slate-950 group-hover:bg-slate-950/30 transition-colors">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base tracking-wide uppercase font-black">
                {hasActiveProgress ? 'Play Game / View Cases' : 'Play Game'}
              </div>
              <div className="text-xs text-slate-900/80 font-medium">
                Browse all case files & open individual crime dossiers
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. INSTRUCTIONS / FIELD MANUAL */}
        <button
          onClick={() => {
            logFunctionCall('MainMenu.onOpenInstructions');
            sound.playTypewriter();
            onOpenInstructions();
          }}
          className="group w-full p-4 rounded-xl bg-[#0b0f17]/90 hover:bg-[#121722] border border-slate-800 hover:border-slate-700 text-slate-200 font-terminal flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2.5 rounded-lg bg-slate-900 text-cyan-400 group-hover:text-cyan-300 border border-slate-800 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide uppercase text-slate-100">
                Instructions
              </div>
              <div className="text-xs text-slate-400">
                Acoustic jitter, micro-smirks & false positive rules
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 3. OPTIONS */}
        <button
          onClick={() => {
            logFunctionCall('MainMenu.onOpenOptions');
            sound.playTypewriter();
            onOpenOptions();
          }}
          className="group w-full p-4 rounded-xl bg-[#0b0f17]/90 hover:bg-[#121722] border border-slate-800 hover:border-slate-700 text-slate-200 font-terminal flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2.5 rounded-lg bg-slate-900 text-amber-400 group-hover:text-amber-300 border border-slate-800 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide uppercase text-slate-100 flex items-center gap-2">
                <span>Options</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  detectiveShieldEnabled ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}>
                  Shield: {detectiveShieldEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Detective Shield settings & audio configuration
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {hasActiveProgress && (
          <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/30 text-xs font-terminal text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Current Open Case: <strong className="text-slate-200">{activeCaseTitle}</strong></span>
            </div>
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Active</span>
          </div>
        )}
      </div>

      {/* Feature Pillar Highlights */}
      <div className="relative z-10 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-start gap-3">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs font-terminal">
            <div className="font-bold text-slate-200 uppercase">Oscilloscope Voice Stress</div>
            <div className="text-slate-400 mt-0.5">Detect vocal fry, 8Hz+ pitch jitter spikes, and cadence pauses.</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-start gap-3">
          <Eye className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs font-terminal">
            <div className="font-bold text-slate-200 uppercase">Micro-Expression Mesh</div>
            <div className="text-slate-400 mt-0.5">Track unilateral 120ms smirks, pupil flares, and sudden glance aversions.</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-start gap-3">
          <Mic className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-terminal">
            <div className="font-bold text-slate-200 uppercase">Real Human Voice Dialogue</div>
            <div className="text-slate-400 mt-0.5">Push-to-talk microphone interrogation with natural 1940s replies.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
