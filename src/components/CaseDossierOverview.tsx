/**
 * =========================================================================================
 * Crime Dossier & Forensic Overview View: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The CaseDossierOverview component presents the official physical crime folder for a selected
 * cold case. Styled after a 1948 police department case file, it details the incident timeline,
 * crime scene dossier, medical examiner autopsy findings, evidence roster, and prime suspect lineup.
 * It serves as the primary briefing room before launching into suspect interrogations.
 * 
 * DIFFERENT USE CASES:
 * 1. Comprehensive Crime Scene Briefing:
 *    Displays unredacted crime scene observations (e.g. the deadbolt locked from outside, severed
 *    switchboard wires, smashed Patek Philippe watch at 11:42 PM, or Berth 4 jammed breaker).
 * 2. Autopsy & Toxicology Inspection:
 *    Presents coroner certificates, toxicology breakdowns (purified aconitine vs curare-derived tubocurarine),
 *    and exact time-of-death windows necessary to refute suspect alibis.
 * 3. Chronological Timeline Reconstruction:
 *    Highlights critical timeline checkpoints with visual indicators to orient the detective.
 * 4. Interrogation Transition:
 *    Provides direct action button to immediately enter the Interrogation Suite with the suspect lineup.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { ColdCase } from '../types/game';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Skull, 
  FolderArchive, 
  AlertTriangle, 
  ArrowLeft,
  ChevronRight, 
  CheckCircle2, 
  Users,
  Search,
  ShieldAlert,
  ArrowRight,
  Award,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for CaseDossierOverview component.
 */
interface CaseDossierOverviewProps {
  coldCase: ColdCase;
  onBeginInterrogation: () => void;
  onBackToCases: () => void;
  hasActiveProgress: boolean;
  deskPhotoUrl: string;
  isSolved?: boolean;
}

/**
 * Forensic crime dossier overview detailing crime scene and coroner findings.
 * 
 * @param props - Selected case details, navigation callbacks, solved indicators
 * @returns Rendered React component for case dossier
 */
export const CaseDossierOverview: React.FC<CaseDossierOverviewProps> = ({
  coldCase,
  onBeginInterrogation,
  onBackToCases,
  hasActiveProgress,
  deskPhotoUrl,
  isSolved = false,
}) => {
  logFunctionCall('CaseDossierOverview', { caseId: coldCase.id, isSolved, hasActiveProgress });
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 animate-in fade-in duration-200">
      {/* Top Navigation Strip within Case Dossier */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <button
          onClick={() => {
            sound.playTypewriter();
            onBackToCases();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b0f17] hover:bg-slate-800 border border-slate-800 text-xs font-terminal text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to All Cases</span>
        </button>

        <div className="flex items-center gap-2">
          {isSolved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-terminal font-bold">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>CASE SOLVED & ARCHIVED</span>
            </span>
          )}

          <button
            onClick={() => {
              sound.playTypewriter();
              onBeginInterrogation();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs font-terminal uppercase tracking-wider transition-all shadow-md ${
              isSolved
                ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/40'
                : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/40'
            }`}
          >
            <span>{isSolved ? 'Re-enter Interrogation Chamber' : 'Proceed to Interrogation Chamber'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Banner with Detective Desk Image */}
      <div className={`relative rounded-xl overflow-hidden border aspect-[21/9] max-h-72 w-full flex items-end ${
        isSolved ? 'border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30' : 'border-slate-800'
      }`}>
        <img
          src={deskPhotoUrl}
          alt="Detective Office Midnight Desk"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/60 to-transparent" />

        <div className="relative z-10 p-6 space-y-1.5 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-terminal text-amber-400">
              <span className={`px-2 py-0.5 rounded border font-mono font-bold ${
                isSolved 
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' 
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
              }`}>
                {coldCase.caseNumber}
              </span>
              <span>·</span>
              <span className="text-slate-300">PRECINCT 8 FORENSIC DIVISION CRIME DOSSIER</span>
            </div>

            {isSolved && (
              <span className="px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-terminal text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>SOLVED CASE RECORD</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-100 font-noir">
            {coldCase.title}
          </h1>
          <p className="text-sm text-slate-300 font-serif italic max-w-2xl">
            {coldCase.subtitle}
          </p>
        </div>
      </div>

      {/* Incident & Crime Scene Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Crime Scene & Incident Summary (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-terminal text-amber-500 font-semibold">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>OFFICIAL INCIDENT REPORT & INITIAL INVESTIGATION</span>
              </div>
              <span className={`text-[10px] font-terminal uppercase px-2 py-0.5 rounded border ${
                isSolved 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'text-slate-400 border-slate-800'
              }`}>
                Status: {isSolved ? 'SOLVED' : coldCase.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-terminal text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  INCIDENT DATE & TIME
                </div>
                <div className="mt-1 font-semibold text-slate-200">
                  {coldCase.incidentDate}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  PRIMARY CRIME SCENE
                </div>
                <div className="mt-1 font-semibold text-slate-200 truncate">
                  {coldCase.location}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-terminal text-slate-400 font-semibold mb-1">
                Executive Case Summary
              </h4>
              <p className="text-xs text-slate-300 font-terminal leading-relaxed">
                {coldCase.summary}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="text-[11px] font-terminal text-amber-400 font-semibold uppercase flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Crime Scene Inspection Log</span>
              </div>
              <p className="text-xs text-slate-400 font-terminal leading-relaxed">
                {coldCase.crimeSceneDossier}
              </p>
            </div>
          </div>

          {/* Suspect Roster Summary Card */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-terminal text-amber-400 font-semibold pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-amber-400" />
              <span>ROSTER OF INTERESTED PERSONS & SUSPECTS ({coldCase.suspects.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coldCase.suspects.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                  <img
                    src={s.photoUrl}
                    alt={s.name}
                    className="w-12 h-12 rounded object-cover border border-slate-800 shrink-0 filter contrast-125"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{s.name}</div>
                    <div className="text-[10px] text-amber-400 font-terminal truncate">{s.occupation}</div>
                    <div className="text-[10px] text-slate-500 font-terminal truncate mt-0.5">{s.personality.indicator}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Autopsy & Medical Examiner Findings (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-terminal text-cyan-400 pb-2 border-b border-slate-800 font-semibold">
              <Skull className="w-4 h-4 text-cyan-400" />
              <span>FORENSIC PATHOLOGY & CORONER'S INQUEST</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-[11px] font-terminal text-cyan-300 font-semibold uppercase">
                Autopsy Examination Report #{coldCase.autopsyReportNumber || 'CTX-881'}
              </div>
              <p className="text-xs text-slate-300 font-terminal leading-relaxed">
                {coldCase.coronerReport}
              </p>
            </div>

            {/* Key Timeline Anchors */}
            {coldCase.timelineMilestones && coldCase.timelineMilestones.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <h5 className="text-[11px] font-terminal uppercase text-slate-500 tracking-wider mb-2 font-bold">
                  Established Chronological Milestones
                </h5>
                <div className="space-y-2 text-xs font-terminal text-slate-400">
                  {coldCase.timelineMilestones.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 ${m.isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                        {m.time}
                      </span>
                      <span>{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to action */}
            <div className="pt-3">
              <button
                onClick={() => {
                  sound.playTypewriter();
                  onBeginInterrogation();
                }}
                className={`w-full py-2.5 font-bold text-xs font-terminal rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md ${
                  isSolved
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/30'
                }`}
              >
                <span>{isSolved ? 'Re-enter Interrogation Chamber' : 'Enter Interrogation Chamber'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
