/**
 * =========================================================================================
 * Evidence Vault & Forensics Locker View: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This component provides an interactive forensic evidence locker for examining authenticated
 * documents, laboratory toxicology reports, and physical crime scene artifacts. Investigators can
 * filter exhibits by category ('document', 'forensics', 'physical'), examine item provenance and
 * forensic significance, and select exhibits during interrogation to confront suspect lies.
 * 
 * DIFFERENT USE CASES:
 * 1. Physical Artifact Examination:
 *    Inspects recovered items such as the smashed 11:42 PM pocket watch, the master keycard,
 *    the spiked coffee thermos with Turkish cigarette ash, or the 1-inch machinist spanner.
 * 2. Laboratory Assay Verification:
 *    Reviews toxicology assays and chemical manifests that disprove suspect claims (e.g. aconitine
 *    and tubocurarine certificates).
 * 3. Interrogation Exhibit Selection:
 *    When operating in selection mode during an interrogation probe or grand jury indictment,
 *    allows the detective to present a specific exhibit to break a suspect's perjury.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { Evidence } from '../types/game';
import { FileText, Microscope, Key, Eye, Clock, MapPin, Tag } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for EvidenceLocker component.
 */
interface EvidenceLockerProps {
  evidenceList: Evidence[];
  onSelectEvidence?: (evidence: Evidence) => void;
  selectedEvidenceId?: string;
  isSelectionMode?: boolean;
}

/**
 * Interactive forensic evidence locker component.
 * 
 * @param props - Evidence list, selection handlers, mode indicators
 * @returns Rendered React component for evidence locker
 */
export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  evidenceList,
  onSelectEvidence,
  selectedEvidenceId,
  isSelectionMode = false,
}) => {
  logFunctionCall('EvidenceLocker', { count: evidenceList.length, isSelectionMode, selectedEvidenceId });

  const [filter, setFilter] = useState<'all' | 'document' | 'forensics' | 'physical'>('all');
  const [activeEvidence, setActiveEvidence] = useState<Evidence>(evidenceList[0]);

  const filtered = evidenceList.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  /**
   * Helper returning visual icon matching exhibit type.
   * 
   * @param type - The evidence category
   * @returns JSX element icon
   */
  const getIcon = (type: Evidence['type']): React.ReactElement => {
    logFunctionCall('EvidenceLocker.getIcon', { type });
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'forensics':
        return <Microscope className="w-4 h-4 text-cyan-400" />;
      case 'physical':
        return <Key className="w-4 h-4 text-emerald-400" />;
      default:
        return <Eye className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter segmented buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-noir">Evidence Vault & Forensics Locker</h2>
          <div className="text-xs text-slate-400 font-terminal mt-0.5">
            Physical exhibits, laboratory analyses, and authenticated records
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => {
              sound.playTypewriter();
              setFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-terminal rounded transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({evidenceList.length})
          </button>
          <button
            onClick={() => {
              sound.playTypewriter();
              setFilter('document');
            }}
            className={`px-3 py-1.5 text-xs font-terminal rounded transition-colors whitespace-nowrap ${
              filter === 'document'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => {
              sound.playTypewriter();
              setFilter('forensics');
            }}
            className={`px-3 py-1.5 text-xs font-terminal rounded transition-colors whitespace-nowrap ${
              filter === 'forensics'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forensics
          </button>
          <button
            onClick={() => {
              sound.playTypewriter();
              setFilter('physical');
            }}
            className={`px-3 py-1.5 text-xs font-terminal rounded transition-colors whitespace-nowrap ${
              filter === 'physical'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical Items
          </button>
        </div>
      </div>

      {/* Main Evidence Grid & Detail split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-6 space-y-3">
          {filtered.map((item) => {
            const isSelected = (selectedEvidenceId || activeEvidence?.id) === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playTypewriter();
                  setActiveEvidence(item);
                  if (onSelectEvidence) onSelectEvidence(item);
                }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/70 shadow-lg shadow-amber-950/20'
                    : 'bg-[#0b0f17] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 font-noir">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-terminal mt-0.5">
                        <span className="uppercase text-amber-400/90">{item.type}</span>
                        <span>·</span>
                        <span>{item.timestampOrDate}</span>
                      </div>
                    </div>
                  </div>
                  {isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectEvidence) onSelectEvidence(item);
                      }}
                      className="px-2.5 py-1 text-xs font-terminal rounded bg-amber-600 text-slate-950 font-bold hover:bg-amber-500 transition-colors"
                    >
                      Present
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Evidence Detail / Dossier Card */}
        {activeEvidence && (
          <div className="lg:col-span-6 bg-[#0b0f17] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    {getIcon(activeEvidence.type)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-noir">
                      {activeEvidence.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-terminal mt-0.5">
                      <span className="text-amber-400 uppercase font-semibold">
                        EXHIBIT ID: {activeEvidence.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-2 gap-3 text-xs font-terminal text-slate-300">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    RECORDED DATE / TIME
                  </div>
                  <div className="mt-1 font-semibold text-slate-200">
                    {activeEvidence.timestampOrDate}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    FOUND LOCATION
                  </div>
                  <div className="mt-1 font-semibold text-slate-200 truncate">
                    {activeEvidence.locationFound}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h5 className="text-[11px] font-terminal uppercase text-slate-500 tracking-wider mb-1">
                  Evidence Description & Chain of Custody
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed p-3 rounded bg-slate-950 border border-slate-800/80">
                  {activeEvidence.description}
                </p>
              </div>

              {/* Forensic & Investigative Significance */}
              <div className="p-3.5 rounded bg-amber-950/20 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-terminal font-bold text-amber-400">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>INVESTIGATIVE RELEVANCE / LIE BREAKER</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed font-terminal">
                  {activeEvidence.forensicSignificance}
                </p>
              </div>
            </div>

            {isSelectionMode && (
              <button
                onClick={() => {
                  sound.playSuccessChime();
                  if (onSelectEvidence) onSelectEvidence(activeEvidence);
                }}
                className="mt-5 w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-terminal uppercase tracking-wider transition-colors shadow-md"
              >
                Confront Suspect With This Exhibit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
