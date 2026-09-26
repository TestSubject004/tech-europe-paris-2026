/**
 * =========================================================================================
 * Application Core Root & Investigation State Machine: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * App.tsx serves as the central state coordinator, view router, and lifecycle manager for
 * the entire Detective Stories application. It orchestrates the active cold case, tracks statement
 * cracking progress, manages global persistent archive states (clearing solved statuses upon new builds),
 * routes between the 6 distinct functional views (Main Page, Case Directory, Crime Dossier, Interrogation,
 * Evidence Locker, Psych Profiles), and handles indictment modals and options dialogues.
 * 
 * DIFFERENT USE CASES:
 * 1. Build-Scoped Case Clearance (loadInitialSolvedCases):
 *    Validates the running application's build fingerprint (`getBuildIdentifier()`). When a new build
 *    is detected, it automatically purges all previously saved "case solved" records from local storage,
 *    ensuring all cases start uncleared on every rebuild as required by department protocol.
 * 2. Multi-Case Investigative Sandboxes (handleSelectCaseAndOpenDossier):
 *    Permits seamless switching between Cold Cases (e.g. Case 1: 'The Velvet Ash Murder' and Case 2:
 *    'The Pier 14 Blackout'), warning the user if unfiled progress in the current case will be reset.
 * 3. Interrogation Perjury & Cracking Tracking (handleCrackStatement):
 *    Tracks cracked contradictions in real-time, updating the department progress metrics and unlocking
 *    sufficient legal grounds for Grand Jury indictment.
 * 4. Case Clearance & Archival (handleCaseSolved):
 *    Persists the solved case status to local storage for the duration of the current build, marking
 *    the case as SOLVED with distinction in the directory and top bar.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { COLD_CASES } from './data/cases';
import { TopBar } from './components/TopBar';
import { MainMenu } from './components/MainMenu';
import { CaseSelectPage } from './components/CaseSelectPage';
import { CaseDossierOverview } from './components/CaseDossierOverview';
import { OptionsModal } from './components/OptionsModal';
import { InterrogationChamber } from './components/InterrogationChamber';
import { EvidenceLocker } from './components/EvidenceLocker';
import { PsychProfileDossier } from './components/PsychProfileDossier';
import { IndictmentModal } from './components/IndictmentModal';
import { HelpCircle, ChevronRight, Compass, ShieldAlert, Sparkles, X, Award } from 'lucide-react';
import { sound } from './utils/audio';
import { getBuildIdentifier } from './buildInfo';
import { APP_CONFIG } from './config';
import { logFunctionCall } from './utils/logger';

const STORAGE_BUILD_ID_KEY = APP_CONFIG.storage.buildIdKey;
const STORAGE_SOLVED_KEY = APP_CONFIG.storage.solvedCasesKey;

/**
 * Initializes and validates solved case IDs from local storage against the active build identifier.
 * Automatically clears all solved statuses if running on a new build.
 * 
 * @returns Array of solved case IDs for the current build
 */
function loadInitialSolvedCases(): string[] {
  logFunctionCall('loadInitialSolvedCases');
  try {
    const currentBuild = getBuildIdentifier();
    const recordedBuild = localStorage.getItem(STORAGE_BUILD_ID_KEY);

    // Whenever a new build is loaded, clear all previously saved case solved statuses!
    // With each new build, all cases are assumed uncleared.
    if (recordedBuild !== currentBuild) {
      localStorage.removeItem(STORAGE_SOLVED_KEY);
      localStorage.removeItem(APP_CONFIG.storage.legacySolvedCasesKey);
      localStorage.setItem(STORAGE_BUILD_ID_KEY, currentBuild);
      return [];
    }

    const stored = localStorage.getItem(STORAGE_SOLVED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Root component for Detective Stories.
 * 
 * @returns Rendered React application tree
 */
export default function App() {
  logFunctionCall('App.render');
  const [currentCaseIdx, setCurrentCaseIdx] = useState<number>(0);
  const currentCase = COLD_CASES[currentCaseIdx] || COLD_CASES[0];

  // Solved cases persistence: track solved case IDs, reset on each build
  const [solvedCaseIds, setSolvedCaseIds] = useState<string[]>(loadInitialSolvedCases);

  /**
   * Archives a case as solved after a successful Grand Jury indictment verdict.
   * 
   * @param caseId - Identifier of the solved case
   */
  const handleCaseSolved = (caseId: string): void => {
    logFunctionCall('App.handleCaseSolved', { caseId });
    setSolvedCaseIds((prev) => {
      if (!prev.includes(caseId)) {
        const next = [...prev, caseId];
        try {
          localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  };

  /**
   * Manually clears all solved case records from storage and state.
   */
  const handleClearSolvedCases = (): void => {
    logFunctionCall('App.handleClearSolvedCases');
    try {
      localStorage.removeItem(STORAGE_SOLVED_KEY);
      localStorage.removeItem(APP_CONFIG.storage.legacySolvedCasesKey);
    } catch {}
    setSolvedCaseIds([]);
  };

  // Active view tab:
  // 'home' -> Main Landing Page (Play Game, Instructions, Options)
  // 'cases' -> Case Files Directory listing all cases
  // 'dossier' -> Crime Dossier for the chosen case
  // 'interrogation' -> Questioning Suspects
  // 'evidence' -> Evidence Locker
  // 'psychology' -> Suspect Psych Profiles
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'dossier' | 'interrogation' | 'evidence' | 'psychology'>('home');
  const [activeSuspectId, setActiveSuspectId] = useState<string>(currentCase.suspects[0].id);
  const [activeStatementIdx, setActiveStatementIdx] = useState<number>(0);
  const [crackedStatements, setCrackedStatements] = useState<Record<string, boolean>>({});
  
  // Modals & Settings
  const [isIndictmentOpen, setIsIndictmentOpen] = useState<boolean>(false);
  const [showHandbook, setShowHandbook] = useState<boolean>(false);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  
  // Detective Shield setting: when false, users are not notified of false positive shields
  const [detectiveShieldEnabled, setDetectiveShieldEnabled] = useState<boolean>(APP_CONFIG.gameplay.defaultShieldEnabled);

  // Compute total lies in the case vs cracked
  const totalLiesCount = currentCase.suspects.reduce(
    (acc, s) => acc + s.statements.filter((stmt) => stmt.isLie).length,
    0
  );
  const crackedCount = Object.keys(crackedStatements).length;
  const hasActiveProgress = crackedCount > 0;

  /**
   * Marks a suspect statement as cracked upon exposing a fatal perjury contradiction.
   * 
   * @param statementId - Identifier of statement
   * @param suspectId - Identifier of suspect
   */
  const handleCrackStatement = (statementId: string, suspectId: string): void => {
    logFunctionCall('App.handleCrackStatement', { statementId, suspectId });
    setCrackedStatements((prev) => ({
      ...prev,
      [statementId]: true,
    }));
  };

  /**
   * Selects an active suspect in the interrogation room or psych profile tab.
   * 
   * @param id - Identifier of target suspect
   */
  const handleSelectSuspect = (id: string): void => {
    logFunctionCall('App.handleSelectSuspect', { suspectId: id });
    setActiveSuspectId(id);
    setActiveStatementIdx(0);
  };

  /**
   * Resets active investigation progress on current case.
   */
  const handleResetCase = (): void => {
    logFunctionCall('App.handleResetCase', { caseId: currentCase.id });
    setCrackedStatements({});
    setIsIndictmentOpen(false);
    setActiveStatementIdx(0);
    setActiveTab('interrogation');
  };

  /**
   * Switches to a new case file and navigates to its crime dossier.
   * 
   * @param idx - Index of target case in COLD_CASES
   */
  const handleSelectCaseAndOpenDossier = (idx: number): void => {
    logFunctionCall('App.handleSelectCaseAndOpenDossier', { idx, currentCaseIdx });
    const targetCase = COLD_CASES[idx] || COLD_CASES[0];
    if (idx !== currentCaseIdx) {
      // Progress is lost when switching to a different case
      setCrackedStatements({});
      setIsIndictmentOpen(false);
      setCurrentCaseIdx(idx);
      setActiveSuspectId(targetCase.suspects[0].id);
      setActiveStatementIdx(0);
    }
    setActiveTab('dossier');
  };

  const activeSuspect = currentCase.suspects.find((s) => s.id === activeSuspectId) || currentCase.suspects[0];

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        currentTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenIndictment={() => setIsIndictmentOpen(true)}
        onOpenOptions={() => setShowOptionsModal(true)}
        onOpenHandbook={() => setShowHandbook(true)}
        caseTitle={currentCase.title}
        caseNumber={currentCase.caseNumber}
        solvedCount={crackedCount}
        totalLiesCount={totalLiesCount}
        detectiveShieldEnabled={detectiveShieldEnabled}
        isCurrentCaseSolved={solvedCaseIds.includes(currentCase.id)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* VIEW 1: MAIN PAGE (PLAY GAME, INSTRUCTIONS, OPTIONS) */}
        {activeTab === 'home' && (
          <MainMenu
            onPlayGame={() => {
              setActiveTab('cases');
            }}
            onOpenInstructions={() => setShowHandbook(true)}
            onOpenOptions={() => setShowOptionsModal(true)}
            detectiveShieldEnabled={detectiveShieldEnabled}
            hasActiveProgress={hasActiveProgress}
            activeCaseTitle={currentCase.title}
          />
        )}

        {/* VIEW 2: CASE DIRECTORY (Lists all cases in precinct vault) */}
        {activeTab === 'cases' && (
          <CaseSelectPage
            coldCases={COLD_CASES}
            currentCaseIdx={currentCaseIdx}
            onSelectAndOpenDossier={handleSelectCaseAndOpenDossier}
            hasActiveProgress={hasActiveProgress}
            activeCaseTitle={currentCase.title}
            solvedCaseIds={solvedCaseIds}
            onResetSolvedCases={handleClearSolvedCases}
          />
        )}

        {/* VIEW 3: CASE HEADER STRIP (Rendered for specific case investigation views) */}
        {activeTab !== 'home' && activeTab !== 'cases' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${
                solvedCaseIds.includes(currentCase.id) ? 'bg-emerald-400' : 'bg-amber-500 animate-pulse'
              }`} />
              <div>
                <div className="text-xs font-terminal text-amber-500/90 font-semibold tracking-wider flex items-center gap-2">
                  <span>COLD CASE ARCHIVE · #{currentCase.caseNumber}</span>
                  {solvedCaseIds.includes(currentCase.id) && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>SOLVED</span>
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-bold font-noir text-slate-100">
                  {currentCase.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playTypewriter();
                  setShowHandbook(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-terminal text-slate-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Biometric Field Manual</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: CRIME DOSSIER OF THE SELECTED CASE */}
        {activeTab === 'dossier' && (
          <CaseDossierOverview
            coldCase={currentCase}
            onBeginInterrogation={() => setActiveTab('interrogation')}
            onBackToCases={() => setActiveTab('cases')}
            hasActiveProgress={hasActiveProgress}
            deskPhotoUrl="/src/assets/images/noir_detective_desk_1790418135201.jpg"
            isSolved={solvedCaseIds.includes(currentCase.id)}
          />
        )}

        {/* VIEW 5: INTERROGATION SUITE */}
        {activeTab === 'interrogation' && (
          <InterrogationChamber
            coldCase={currentCase}
            suspects={currentCase.suspects}
            activeSuspectId={activeSuspectId}
            onSelectSuspect={handleSelectSuspect}
            activeStatementIdx={activeStatementIdx}
            onSelectStatementIdx={setActiveStatementIdx}
            evidenceList={currentCase.evidence}
            crackedStatements={crackedStatements}
            onCrackStatement={handleCrackStatement}
            onOpenPsychProfile={() => setActiveTab('psychology')}
            detectiveShieldEnabled={detectiveShieldEnabled}
          />
        )}

        {/* VIEW 6: EVIDENCE LOCKER */}
        {activeTab === 'evidence' && (
          <EvidenceLocker evidenceList={currentCase.evidence} />
        )}

        {/* VIEW 7: PSYCHOLOGY PROFILES */}
        {activeTab === 'psychology' && (
          <div className="space-y-4">
            {/* Suspect Selector Ribbon inside Psych Tab */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#0b0f17] border border-slate-800 rounded-lg">
              <span className="text-xs font-terminal text-slate-500 uppercase px-2">
                Inspect Subject:
              </span>
              {currentCase.suspects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playTypewriter();
                    setActiveSuspectId(s.id);
                  }}
                  className={`px-3 py-1 text-xs font-terminal rounded transition-colors ${
                    activeSuspectId === s.id
                      ? 'bg-amber-600 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.name} ({s.personality.indicator})
                </button>
              ))}
            </div>

            <PsychProfileDossier
              suspect={activeSuspect}
              detectiveShieldEnabled={detectiveShieldEnabled}
            />
          </div>
        )}
      </main>

      {/* Field Manual / Instructions Modal */}
      {showHandbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b0f17] border border-amber-500/60 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-100 font-noir">
                  Detective’s Biometric Interrogation Manual
                </h3>
              </div>
              <button
                onClick={() => setShowHandbook(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-terminal text-slate-300 leading-relaxed">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold uppercase">
                  Parameter 1: Text-Based Physical Evidence
                </span>
                <p className="text-slate-400">
                  Inspect phone logs, receipts, keycards, and chemical manifests in the Evidence Locker. When a suspect claims an alibi contradicted by physical records, confront them with the specific exhibit!
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold uppercase">
                  Parameter 2: Spectral Voice Patterns & Jitter
                </span>
                <p className="text-slate-400">
                  When physical evidence is absent, listen to their acoustic pattern. Look for pitch jitter (Hz) spiking beyond baseline, sub-vocal compression, vocal fry, or excessive cadence hesitation.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-rose-400 font-bold uppercase">
                  Parameter 3: Facial Landmark Micro-Expressions
                </span>
                <p className="text-slate-400">
                  The biometric mesh scans 48 facial points. Watch for pupil dilation spikes or pinpoint constrictions, unilateral micro-smirks (120ms), and glance aversion exceeding baseline.
                </p>
              </div>

              <div className="p-3.5 rounded bg-amber-950/30 border border-amber-500/50 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>The False Positive Guard: Psychological Disposition</span>
                </div>
                <p className="text-amber-200/90">
                  CRITICAL RULE: People who are chronically anxious (like Evelyn Cross) have elevated tremors and 94 bpm pulses at baseline. DO NOT accuse them of lying based on anxiety alone! Conversely, sociopaths (like Julian Vance) maintain an ice-cold 58 bpm pulse while spinning lies. Always check the subject’s calibrated baseline before confronting.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHandbook(false)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-terminal rounded uppercase tracking-wider"
              >
                Understood, Chief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options Modal (Detective Shield toggle & Solved Archives Reset) */}
      <OptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        detectiveShieldEnabled={detectiveShieldEnabled}
        onToggleDetectiveShield={(enabled) => setDetectiveShieldEnabled(enabled)}
        onResetSolvedCases={handleClearSolvedCases}
      />

      {/* Official Indictment Modal */}
      <IndictmentModal
        isOpen={isIndictmentOpen}
        onClose={() => setIsIndictmentOpen(false)}
        coldCase={currentCase}
        suspects={currentCase.suspects}
        evidenceList={currentCase.evidence}
        crackedStatements={crackedStatements}
        onResetCase={handleResetCase}
        onCaseSolved={handleCaseSolved}
      />

      {/* Noir Ambient Status Bar / Quiet Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#06080d] px-4 md:px-8 py-3 text-xs text-slate-500 font-terminal flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Detective Stories</span>
          <span>·</span>
          <span>Precinct 8 Department of Forensic Analysis</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {activeTab !== 'home' && activeTab !== 'cases' && (
            <span>Lies Broken: {crackedCount}/{totalLiesCount} · </span>
          )}
          <span className={detectiveShieldEnabled ? 'text-amber-500/80' : 'text-rose-500/80 font-bold'}>
            Detective Shield: {detectiveShieldEnabled ? 'Active' : 'Disabled (Hardboiled)'}
          </span>
        </div>
      </footer>
    </div>
  );
}
