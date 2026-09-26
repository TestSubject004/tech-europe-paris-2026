/**
 * =========================================================================================
 * Precinct Cold Case Directory & Archive Vault: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component renders the central cold case directory of Precinct 8. It allows investigators
 * to review all cataloged murder cases in the department vault, inspect key forensic summaries
 * (incident dates, crime scene locations, victim names, suspect rosters), and transition directly
 * into the comprehensive Crime Dossier for an active investigation.
 * 
 * DIFFERENT USE CASES:
 * 1. Case Archive Browsing:
 *    Displays all cases (such as '#COLD-1948-0914: The Velvet Ash Murder' and '#COLD-1948-1102:
 *    The Pier 14 Blackout') with clear visual status indicators.
 * 2. Solved Case Distinction & Replay:
 *    Highlights solved cases with an emerald badge and border styling, allowing solved investigations
 *    to be reopened and reviewed without losing archived recognition.
 * 3. Unsaved Progress Protection:
 *    If an investigator attempts to switch cases while actively cracking statements in another,
 *    presents an un-filed progress warning dialog to prevent accidental loss of active leads.
 * 4. Manual Solved Status Purge (onResetSolvedCases):
 *    Provides an explicit "Reset Solved Statuses" trigger in the directory header, allowing users
 *    to immediately clear all solved statuses and mark all cases uncleared on demand.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { ColdCase } from '../types/game';
import { 
  FolderArchive, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  FileSearch, 
  Users,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for CaseSelectPage directory view.
 */
interface CaseSelectPageProps {
  coldCases: ColdCase[];
  currentCaseIdx: number;
  onSelectAndOpenDossier: (idx: number) => void;
  hasActiveProgress: boolean;
  activeCaseTitle: string;
  solvedCaseIds: string[];
  onResetSolvedCases?: () => void;
}

/**
 * Case directory page displaying available cold case files with clearance tracking.
 * 
 * @param props - Case lists, selection callbacks, active progress indicators
 * @returns Rendered React component for case directory
 */
export const CaseSelectPage: React.FC<CaseSelectPageProps> = ({
  coldCases,
  currentCaseIdx,
  onSelectAndOpenDossier,
  hasActiveProgress,
  activeCaseTitle,
  solvedCaseIds,
  onResetSolvedCases,
}) => {
  logFunctionCall('CaseSelectPage', { currentCaseIdx, solvedCaseCount: solvedCaseIds.length, hasActiveProgress });

  const [pendingSwitchIdx, setPendingSwitchIdx] = useState<number | null>(null);

  /**
   * Handles user click on a case file card, triggering switch warning if unfiled progress exists.
   * 
   * @param idx - Index of the clicked case in coldCases array
   */
  const handleCardClick = (idx: number): void => {
    logFunctionCall('CaseSelectPage.handleCardClick', { idx, currentCaseIdx, hasActiveProgress });
    sound.playTypewriter();
    if (idx === currentCaseIdx) {
      // Already selected case, go straight to its crime dossier
      onSelectAndOpenDossier(idx);
      return;
    }

    // If switching to another case and user currently has unfiled progress, warn them!
    if (hasActiveProgress) {
      setPendingSwitchIdx(idx);
    } else {
      onSelectAndOpenDossier(idx);
    }
  };

  /**
   * Confirms switching to another case, forfeiting active unfiled progress.
   */
  const confirmSwitch = (): void => {
    logFunctionCall('CaseSelectPage.confirmSwitch', { targetIdx: pendingSwitchIdx });
    if (pendingSwitchIdx !== null) {
      sound.playTypewriter();
      onSelectAndOpenDossier(pendingSwitchIdx);
      setPendingSwitchIdx(null);
    }
  };

  const solvedCount = coldCases.filter((c) => solvedCaseIds.includes(c.id)).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-terminal text-amber-400 uppercase tracking-widest font-semibold">
            <FolderArchive className="w-4 h-4 text-amber-500" />
            <span>Precinct 8 Homicide Archives · Case Directory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-noir text-slate-100 mt-1">
            Available Cold Case Files
          </h1>
          <p className="text-xs text-slate-400 font-terminal mt-1">
            Select an active case below to examine its official Crime Dossier, crime scene photographs, and coroner's autopsy records. Solved cases are archived with distinction and can be re-interrogated at any time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-terminal text-slate-400 bg-[#0b0f17] px-3.5 py-2 rounded-lg border border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span>Cases Solved:</span>{' '}
              <strong className="text-emerald-400 font-bold">{solvedCount}/{coldCases.length}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span>Vault:</span>{' '}
              <strong className="text-amber-400">{coldCases.length} Files</strong>
            </div>
            {solvedCount > 0 && onResetSolvedCases && (
              <>
                <span className="text-slate-700">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playTypewriter();
                    onResetSolvedCases();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-terminal text-rose-300 transition-colors"
                  title="Clear all solved statuses and mark all cases uncleared"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span>Reset Solved Statuses</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Warning Banner if User is currently investigating another case */}
      {hasActiveProgress && (
        <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs font-terminal text-amber-200/90 flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300 uppercase">Active Case in Progress:</span> You are currently working on <strong>"{activeCaseTitle}"</strong>.
            If you switch to a different case file, <strong>all current un-filed progress and cracked lies on "{activeCaseTitle}" will be completely lost</strong>.
          </div>
        </div>
      )}

      {/* Grid of Case Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coldCases.map((coldCase, idx) => {
          const isCurrentActive = idx === currentCaseIdx;
          const isSolved = solvedCaseIds.includes(coldCase.id);

          return (
            <div
              key={coldCase.id}
              onClick={() => handleCardClick(idx)}
              className={`group relative rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-2xl ${
                isSolved
                  ? isCurrentActive
                    ? 'bg-[#0a1612] border-2 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-[#09130f] border-2 border-emerald-500/80 hover:border-emerald-400 shadow-md shadow-emerald-950/30 hover:bg-[#0c1a14]'
                  : isCurrentActive
                  ? 'bg-[#0f1420] border-2 border-amber-500/90 shadow-amber-950/30'
                  : 'bg-[#0b0f17] border border-slate-800 hover:border-amber-500/50 hover:bg-[#111622]'
              }`}
            >
              <div className="space-y-3">
                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-terminal font-mono px-2.5 py-0.5 rounded border ${
                    isSolved 
                      ? 'text-emerald-300 bg-emerald-950/90 border-emerald-500/40' 
                      : 'text-amber-400 bg-amber-950/80 border-amber-500/30'
                  }`}>
                    {coldCase.caseNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* SOLVED BADGE */}
                    {isSolved && (
                      <span className="text-[10px] font-terminal font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 flex items-center gap-1 shadow-sm">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>CASE SOLVED</span>
                      </span>
                    )}

                    {isCurrentActive ? (
                      <span className="text-[10px] font-terminal font-bold uppercase px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>Current Case</span>
                      </span>
                    ) : (
                      !isSolved && (
                        <span className="text-[10px] font-terminal uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          Cold Case Archive
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Case Title & Subtitle */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-bold font-noir transition-colors ${
                      isSolved 
                        ? 'text-slate-100 group-hover:text-emerald-300' 
                        : 'text-slate-100 group-hover:text-amber-400'
                    }`}>
                      {coldCase.title}
                    </h3>
                  </div>
                  <p className={`text-xs font-serif italic mt-0.5 ${
                    isSolved ? 'text-emerald-300/80' : 'text-amber-300/80'
                  }`}>
                    {coldCase.subtitle}
                  </p>
                </div>

                {/* Case Summary */}
                <p className="text-xs text-slate-300 font-terminal line-clamp-3 leading-relaxed">
                  {coldCase.summary}
                </p>

                {/* Solved Banner Indicator */}
                {isSolved && (
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px] font-terminal text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Grand Jury Conviction on Record
                    </span>
                    <span className="text-[10px] text-emerald-400/80 uppercase">
                      Open to Re-interrogate
                    </span>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-terminal text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{coldCase.incidentDate.split('·')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{coldCase.location.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{coldCase.suspects.length} Suspects Profiled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{coldCase.evidence.length} Evidence Exhibits</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className={`pt-4 mt-4 border-t flex items-center justify-between ${
                isSolved ? 'border-emerald-500/30' : 'border-slate-800/80'
              }`}>
                <span className="text-[11px] font-terminal text-slate-400 flex items-center gap-1">
                  {isSolved ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      Solved · Re-examine Dossier
                    </span>
                  ) : (
                    'Click to open Crime Dossier'
                  )}
                </span>
                <button
                  type="button"
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-xs font-terminal flex items-center gap-1.5 transition-colors shadow-sm ${
                    isSolved
                      ? 'bg-emerald-600 group-hover:bg-emerald-500 text-slate-950'
                      : 'bg-amber-600 group-hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  <span>{isSolved ? 'Re-open Dossier' : 'Open Dossier'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION MODAL ON CASE SWITCH (WARNS PROGRESS IS LOST) */}
      {pendingSwitchIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b0f17] border border-rose-500/70 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 pb-2 border-b border-slate-800">
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold font-noir text-slate-100 uppercase">
                  Abandon Active Progress?
                </h3>
                <span className="text-[11px] font-terminal text-slate-400">
                  Switching to: {coldCases[pendingSwitchIdx]?.title}
                </span>
              </div>
            </div>

            <p className="text-xs font-terminal text-slate-300 leading-relaxed">
              You are currently investigating <strong>"{activeCaseTitle}"</strong>.
              If you proceed to open the crime dossier for <strong>"{coldCases[pendingSwitchIdx]?.title}"</strong>, <strong>all current interrogation progress, cracked alibis, and broken statements on "{activeCaseTitle}" will be completely lost!</strong>
            </p>

            <div className="p-3 rounded bg-rose-950/40 border border-rose-500/40 text-xs font-terminal text-rose-200">
              Are you sure you want to discard your current case progress and examine this new case dossier?
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingSwitchIdx(null)}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-terminal transition-colors"
              >
                Cancel & Keep Progress
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-terminal transition-colors shadow-lg shadow-rose-950/50 uppercase"
              >
                Discard & Open Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
