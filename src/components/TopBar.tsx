/**
 * =========================================================================================
 * Top Navigation Header Bar & System Status: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The TopBar component provides the persistent atmospheric command header for the entire
 * Detective Stories application. Adhering to a clean 3-zone layout (Brand, Primary Navigation,
 * and Actions/Telemetry), it enables investigators to switch between the Precinct Main Page,
 * Case Directory, Crime Dossiers, Interrogation Chamber, Evidence Locker, and Psych Profiles,
 * while maintaining situational awareness of case numbers, solved statuses, and audio controls.
 * 
 * DIFFERENT USE CASES:
 * 1. Global View Navigation (Zone 2):
 *    Switches between high-level case selection ('home', 'cases') and deep-dive case investigation
 *    views ('dossier', 'interrogation', 'evidence', 'psychology') with synchronized typewriter audio.
 * 2. Case Context Display (Zone 1):
 *    Displays active Cold Case ID and title (e.g. '#COLD-1948-0914 · The Velvet Ash Murder') along
 *    with a distinctive emerald "SOLVED" badge if the case was cleared in the current build.
 * 3. Atmospheric Audio & Ambience Controls (Zone 3):
 *    Offers quick toggles for procedural 1940s noir rain noise and master audio SFX muting.
 * 4. Prosecutor Indictment Trigger:
 *    Displays the current lie-cracking tally (e.g. '3/6 Lies Broken') and launches the Indictment
 *    Modal when the detective believes they have assembled sufficient evidence.
 * =========================================================================================
 */

import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  FileText, 
  UserCheck, 
  BookOpen, 
  Home, 
  FolderArchive, 
  Layers, 
  Settings, 
  HelpCircle, 
  Award, 
  Maximize, 
  Minimize 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for TopBar navigation component.
 */
interface TopBarProps {
  currentTab: 'home' | 'cases' | 'dossier' | 'interrogation' | 'evidence' | 'psychology';
  onSelectTab: (tab: 'home' | 'cases' | 'dossier' | 'interrogation' | 'evidence' | 'psychology') => void;
  onOpenIndictment: () => void;
  onOpenOptions: () => void;
  onOpenHandbook: () => void;
  caseTitle: string;
  caseNumber: string;
  solvedCount: number;
  totalLiesCount: number;
  detectiveShieldEnabled: boolean;
  isCurrentCaseSolved?: boolean;
}

/**
 * Main application header bar providing tab switching, atmospheric audio controls, and indictment trigger.
 * 
 * @param props - Navigation state, callbacks, and active case metadata
 * @returns Rendered React top bar component
 */
export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenIndictment,
  onOpenOptions,
  onOpenHandbook,
  caseTitle,
  caseNumber,
  solvedCount,
  totalLiesCount,
  detectiveShieldEnabled,
  isCurrentCaseSolved = false,
}) => {
  logFunctionCall('TopBar', { currentTab, caseNumber, solvedCount, totalLiesCount });

  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const [ambientActive, setAmbientActive] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Toggles native browser fullscreen.
   */
  const toggleFullscreen = (): void => {
    logFunctionCall('TopBar.toggleFullscreen', { isFullscreen });
    sound.playTypewriter();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  /**
   * Toggles master audio mute state.
   */
  const toggleSound = (): void => {
    logFunctionCall('TopBar.toggleSound');
    const muted = sound.toggleMute();
    setIsMuted(muted);
    sound.playTypewriter();
  };

  /**
   * Toggles background procedural noir rain generator.
   */
  const toggleRain = (): void => {
    logFunctionCall('TopBar.toggleRain');
    const active = sound.toggleAmbientRain();
    setAmbientActive(active);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070a10]/95 backdrop-blur px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5">
      {/* Zone 1: Single text element wordmark / Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('home');
          }}
          title="Return to Main Menu"
          className="text-lg md:text-xl font-bold tracking-wider text-amber-500 font-noir hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 text-left"
        >
          <span>DETECTIVE STORIES</span>
        </button>

        {currentTab !== 'home' && currentTab !== 'cases' && (
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-terminal">
            <span className="font-mono text-amber-500/80">#{caseNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 truncate max-w-xs">{caseTitle}</span>
            {isCurrentCaseSolved && (
              <span className="ml-1.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>SOLVED</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs md:text-sm font-medium overflow-x-auto py-1">
        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('home');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'home'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Main Page</span>
        </button>

        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('cases');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'cases'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Case Files</span>
        </button>

        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('dossier');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'dossier'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Crime Dossier</span>
        </button>

        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('interrogation');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'interrogation'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Interrogation Suite</span>
        </button>

        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('evidence');
          }}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'evidence'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence Locker</span>
        </button>

        <button
          onClick={() => {
            sound.playTypewriter();
            onSelectTab('psychology');
          }}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
            currentTab === 'psychology'
              ? 'text-amber-400 font-semibold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Psych Profiles</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Options */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => {
            sound.playTypewriter();
            onOpenOptions();
          }}
          title="Game Options (Detective Shield, SFX)"
          className="p-2 rounded text-xs transition-colors border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-amber-300 hover:border-slate-700 flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline text-[11px] font-terminal font-semibold">
            Options
          </span>
          <span className={`text-[9px] px-1 py-0.2 rounded font-mono hidden sm:inline ${
            detectiveShieldEnabled ? 'text-amber-300 bg-amber-950/80' : 'text-rose-300 bg-rose-950/80'
          }`}>
            {detectiveShieldEnabled ? 'SHIELD' : 'NO-SHIELD'}
          </span>
        </button>

        <button
          onClick={toggleRain}
          title={ambientActive ? 'Silence Noir Rain Ambience' : 'Play Noir Rain Ambience'}
          className={`hidden sm:flex p-2 rounded text-xs transition-colors border ${
            ambientActive
              ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
              : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="font-terminal text-[11px] flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${ambientActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            Rain
          </span>
        </button>

        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
          className="p-2 rounded text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900/80 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter True Fullscreen'}
          className="p-2 rounded text-slate-400 hover:text-amber-300 border border-slate-800 bg-slate-900/80 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4 text-slate-300" />}
        </button>

        {currentTab !== 'home' && currentTab !== 'cases' && (
          <button
            onClick={() => {
              sound.playSuccessChime();
              onOpenIndictment();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded transition-colors shadow-sm whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Indict</span>
            <span className="font-terminal text-[10px] ml-0.5 bg-amber-700/60 text-amber-100 px-1.5 py-0.5 rounded">
              {solvedCount}/{totalLiesCount}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
