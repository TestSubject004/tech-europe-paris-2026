/**
 * =========================================================================================
 * Grand Jury Indictment & Judicial Verdict Modal: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The IndictmentModal represents the climactic judicial phase of each murder investigation.
 * Once the detective has gathered sufficient evidence and broken suspect alibis, they must file
 * a formal legal charge with the District Attorney. To secure a conviction, the investigator must
 * correctly synthesize three critical elements: (1) The Prime Accused, (2) The Murder Weapon /
 * Execution Method, and (3) The Decisive Contradicting Exhibit.
 * 
 * DIFFERENT USE CASES:
 * 1. Case 1 Conviction ('The Velvet Ash Murder'):
 *    Requires indicting Julian Vance, identifying purified aconitine alkaloid in the scotch tumbler,
 *    and presenting the severed switchboard cable or master keycard to disprove his fabricated phone alibi.
 * 2. Case 2 Conviction ('The Pier 14 Blackout'):
 *    Requires indicting Julian Vance, identifying purified tubocurarine alkaloid in Silas O'Malley's
 *    coffee thermos, and presenting the impounded Rotterdam tugboat manifest or spiked thermos.
 * 3. Partial / Erroneous Accusation Feedback:
 *    If an investigator indicts an accessory (e.g. Dr. Thorne) or an innocent suspect (e.g. Marcus Drake
 *    or Evelyn Cross), the court returns detailed feedback explaining why the charge was rejected and
 *    provides biometric lessons on false-positive indicators.
 * 4. Case Clearance & Archival:
 *    Upon achieving a guilty verdict, awards a forensic score and rank (up to 1000 pts) and triggers
 *    `onCaseSolved(coldCase.id)` to archive the case in the precinct records.
 * =========================================================================================
 */

import React, { useState } from 'react';
import { Suspect, Evidence, ColdCase } from '../types/game';
import { ShieldAlert, Award, AlertTriangle, CheckCircle, RotateCcw, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';

/**
 * Properties for IndictmentModal component.
 */
interface IndictmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coldCase: ColdCase;
  suspects: Suspect[];
  evidenceList: Evidence[];
  crackedStatements: Record<string, boolean>;
  onResetCase: () => void;
  onCaseSolved?: (caseId: string) => void;
}

/**
 * Judicial indictment filing dialog evaluating case theories and rendering verdicts.
 * 
 * @param props - Active case, suspect rosters, evidence lists, solved callbacks
 * @returns Rendered React component for indictment modal
 */
export const IndictmentModal: React.FC<IndictmentModalProps> = ({
  isOpen,
  onClose,
  coldCase,
  suspects,
  evidenceList,
  crackedStatements,
  onResetCase,
  onCaseSolved,
}) => {
  logFunctionCall('IndictmentModal', { isOpen, caseId: coldCase.id, crackedCount: Object.keys(crackedStatements).length });

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [verdictResult, setVerdictResult] = useState<{
    solved: boolean;
    rank: string;
    score: number;
    title: string;
    narrative: string;
    biometricLesson: string;
  } | null>(null);

  if (!isOpen) return null;

  const isCaseTwo = coldCase.id === 'case-02-dockland-fog';

  /**
   * Submits indictment theory to the Grand Jury, evaluating accuracy of culprit, weapon, and exhibit.
   */
  const handleSubmitIndictment = (): void => {
    logFunctionCall('IndictmentModal.handleSubmitIndictment', {
      caseId: coldCase.id,
      selectedSuspectId,
      selectedEvidenceId,
      selectedMethod,
    });
    if (!selectedSuspectId || !selectedEvidenceId || !selectedMethod) {
      sound.playBuzzer();
      return;
    }

    // -------------------------------------------------------------
    // CASE 2: The Pier 14 Blackout (Dockmaster Silas O'Malley)
    // -------------------------------------------------------------
    if (isCaseTwo) {
      const isCorrectPierMethod = selectedMethod === 'tubocurarine_poison';

      if (selectedSuspectId === 'suspect-julian-vance') {
        if (!isCorrectPierMethod) {
          sound.playBuzzer();
          setVerdictResult({
            solved: false,
            rank: 'SENIOR INVESTIGATOR',
            score: 620,
            title: 'CULPRIT ACCURATE · WRONG EXECUTION METHOD',
            narrative:
              'You correctly identified Julian Vance as the killer of Silas O’Malley! However, the District Attorney threw out the indictment because of incorrect pathology findings. Coroner Dr. Vane confirmed acute respiratory paralysis from purified tubocurarine alkaloid in O’Malley’s coffee thermos, not mechanical trauma or aconitine.',
            biometricLesson:
              'Check Harbor Division Autopsy MR-1948-442: Silas O’Malley died of tubocurarine-induced neuromuscular blockade administered into his steel thermos.',
          });
          return;
        }

        // Check evidence for Pier 14
        if (selectedEvidenceId === 'ev-pier-manifest' || selectedEvidenceId === 'ev-thermos-sample') {
          sound.playSuccessChime();
          setVerdictResult({
            solved: true,
            rank: 'CHIEF SUPERINTENDENT OF COLD CASES',
            score: 1000,
            title: 'HARBOR NOIR: PIER 14 BLACKOUT FULLY SOLVED',
            narrative:
              'Julian Vance’s claims of spending the night in Mayfair collapsed under the weight of the Impounded Tugboat Manifest and the Turkish cigarette ash found on O’Malley’s spiked thermos. Faced with Dr. Thorne’s confession and his own biometric smirk anomalies, Vance broke down and admitted slipping the curare into the dockmaster’s coffee before jamming the circuit breaker with Marcus’s spanner to escape into the harbor fog.',
            biometricLesson:
              'By verifying Marcus Drake’s anti-authoritarian baseline and breaking Dr. Thorne’s speech latency tells, you isolated the true sociopath and secured a conviction.',
          });
        } else if (selectedEvidenceId === 'ev-apothecary-shard') {
          sound.playSuccessChime();
          setVerdictResult({
            solved: true,
            rank: 'LEAD HOMICIDE DETECTIVE',
            score: 930,
            title: 'COLD CASE SOLVED: CONSPIRACY LINKED TO VANCE',
            narrative:
              'The Latin-script apothecary vial of tubocurarine found on the sandbar tied Dr. Thorne to the poison source, forcing Thorne to turn state’s evidence against Julian Vance. Vance was convicted of murder in the first degree.',
            biometricLesson:
              'Superb synthesis of toxicological physical evidence and biometric interrogation.',
          });
        } else {
          sound.playBuzzer();
          setVerdictResult({
            solved: false,
            rank: 'INVESTIGATOR IN TRAINING',
            score: 640,
            title: 'CORRECT SUSPECT · INSUFFICIENT EVIDENCE AGAINST VANCE',
            narrative:
              'You identified the right killer, but the jury needs direct evidence placing Vance at the scene or linking him to the poisoned thermos. Select the Impounded Tugboat Manifest or the Spiked Coffee Thermos.',
            biometricLesson:
              'Julian Vance requires hard corroboration to overturn his fabricated alibi.',
          });
        }
        return;
      }

      // Pier 14: Accusing Dr. Thorne
      if (selectedSuspectId === 'suspect-aris-thorne') {
        sound.playBuzzer();
        setVerdictResult({
          solved: false,
          rank: 'PRECINCT DETECTIVE',
          score: 510,
          title: 'ACCESSORY CONVICTED · PRIME KILLER ESCAPED',
          narrative:
            'Dr. Thorne admitted to synthesizing the tubocurarine under pressure, but phone logs and campus night-watch logs confirm he was never at Pier 14 during the blackout. He handed the vial to Julian Vance hours earlier. Vance is the one who spiked the coffee and jammed the breaker!',
          biometricLesson:
            'Dr. Thorne’s extreme latency pause cracked his accessory role. Follow the chain to the principal perpetrator: Julian Vance.',
        });
        return;
      }

      // Pier 14: Accusing Marcus Drake
      if (selectedSuspectId === 'suspect-marcus-drake') {
        sound.playBuzzer();
        setVerdictResult({
          solved: false,
          rank: 'PROBATIONARY PATROLMAN',
          score: 280,
          title: 'WRONGFUL INDICTMENT: DOCK MECHANIC EXONERATED',
          narrative:
            'Marcus Drake’s tool may have been used to jam the breaker, but the diesel fuel stains and work logs verify he was rebuilding a marine injector in the upper loft until police sirens arrived. His sullen demeanor and eye contact aversion were part of his calibrated cynical baseline, not guilt.',
          biometricLesson:
            'FATAL MISTAKE: Marcus’s 48% glance aversion is normal for his introverted stoic disposition. Do not convict based on rough demeanor alone without forensic evidence.',
        });
        return;
      }
    }

    // -------------------------------------------------------------
    // CASE 1: The Velvet Ash Murder (Penthouse Study of Arthur Sterling)
    // -------------------------------------------------------------
    const isCorrectPenthouseMethod = selectedMethod === 'aconitine_poison';

    // Indicting Julian Vance (Prime Culprit)
    if (selectedSuspectId === 'suspect-julian-vance') {
      if (!isCorrectPenthouseMethod) {
        sound.playBuzzer();
        setVerdictResult({
          solved: false,
          rank: 'SENIOR INVESTIGATOR',
          score: 620,
          title: 'CULPRIT ACCURATE · WRONG EXECUTION METHOD',
          narrative:
            'You correctly identified Julian Vance as the prime culprit! However, the District Attorney cannot proceed because your indictment lists the wrong cause of death. The coroner confirmed lethal aconitine poisoning administered in Sterling’s scotch, not physical trauma or suffocation.',
          biometricLesson:
            'Review the coroner’s autopsy inquest CTX-881. Arthur Sterling died of purified aconitine alkaloid tincture administered in his scotch.',
        });
        return;
      }

      // Valid evidence against Vance
      if (selectedEvidenceId === 'ev-phone-log') {
        sound.playSuccessChime();
        setVerdictResult({
          solved: true,
          rank: 'CHIEF SUPERINTENDENT OF COLD CASES',
          score: 1000,
          title: 'VERITAS NOIR: COLD CASE SOLVED WITH FLAWLESS CONVICTION',
          narrative:
            'Julian Vance’s alibi collapsed completely under the weight of the Central Telephone Exchange switchboard log. Because the cable was severed at 11:15 PM, Vance could not possibly have received a call from Sterling at 11:30 PM. Faced with his own autonomic deception tells—his 140ms micro-smirk and pitch drops—Vance signed a full confession. The stolen municipal bonds and unfiled will were recovered from his gallery safe.',
          biometricLesson:
            'Masterful investigation. By calibrating against Evelyn Cross’s neurotic baseline, you prevented a disastrous false positive. You correctly identified that Marcus Drake’s stoic gaze aversion was cynical hostility rather than guilt, and systematically dismantled Julian Vance’s cold sociopathic facade.',
        });
      } else if (selectedEvidenceId === 'ev-master-keycard') {
        sound.playSuccessChime();
        setVerdictResult({
          solved: true,
          rank: 'LEAD HOMICIDE DETECTIVE',
          score: 950,
          title: 'COLD CASE SOLVED: SERVICE KEY FORENSIC MATCH',
          narrative:
            'Julian Vance was convicted of first-degree murder. The charcoal wool fibers on the discarded service stairwell key matched his bespoke tailored suit, placing him inside the building during the murder window despite his claims of entering via the front vestibule.',
          biometricLesson:
            'Superb physical corroboration. Vance’s unwavering pulse and steady eyes could not overcome the physical fiber evidence linking him to the locked penthouse.',
        });
      } else if (selectedEvidenceId === 'ev-warehouse-manifest') {
        sound.playSuccessChime();
        setVerdictResult({
          solved: true,
          rank: 'SENIOR COLD CASE DETECTIVE',
          score: 920,
          title: 'COLD CASE SOLVED: POISON TRAIL CONVICTION',
          narrative:
            'Using the Sub-Rosa Chemical Manifest, you exposed the conspiracy between Dr. Thorne and Julian Vance. Dr. Thorne testified that Vance extorted him for the aconite alkaloid. Vance was sentenced to life imprisonment.',
          biometricLesson:
            'Acoustic voice analysis of Dr. Thorne cracked the conspiracy, providing the decisive link to Vance’s murder scheme.',
        });
      } else if (selectedEvidenceId === 'ev-bank-deposit') {
        sound.playSuccessChime();
        setVerdictResult({
          solved: true,
          rank: 'FORENSIC DETECTIVE',
          score: 900,
          title: 'COLD CASE SOLVED: FINANCIAL MOTIVE ESTABLISHED',
          narrative:
            'The pending $75,000 Swiss escrow deposit in Vance’s gallery desk proved imminent financial ruin and immediate profit from Sterling’s death. Combined with his biometric tells, the jury returned a guilty verdict.',
          biometricLesson:
            'Financial evidence exposed the motive that Vance’s smooth narcissism tried to conceal.',
        });
      } else {
        sound.playBuzzer();
        setVerdictResult({
          solved: false,
          rank: 'INVESTIGATOR IN TRAINING',
          score: 650,
          title: 'CORRECT SUSPECT · INSUFFICIENT EVIDENCE AGAINST VANCE',
          narrative:
            'You correctly identified Julian Vance as the killer! However, the Grand Jury cannot convict him based solely on this specific exhibit. The defense attorney argued this clue does not directly disprove Vance’s alibi in court. Select the Switchboard Telephone Log, the Master Keycard, or the Chemical Manifest to seal the conviction.',
          biometricLesson:
            'Julian Vance’s cold sociopathic composure requires ironclad physical contradiction. Connect his false 11:30 PM phone call to the severed switchboard cable to win the case.',
        });
      }
      return;
    }

    // Case 1: Indicting Dr. Aris Thorne
    if (selectedSuspectId === 'suspect-aris-thorne') {
      sound.playBuzzer();
      setVerdictResult({
        solved: false,
        rank: 'PRECINCT DETECTIVE',
        score: 520,
        title: 'INCOMPLETE INDICTMENT: ACCESSORY CONVICTED, KILLER FREE',
        narrative:
          'While Dr. Thorne was indeed complicit in synthesizing the aconitine tincture under blackmail, his university laboratory records prove he was not inside the penthouse at 11:42 PM. Dr. Thorne confessed to supplying the vial to Julian Vance at 6:00 PM. Indict the primary mastermind who entered the penthouse and administered the poison.',
        biometricLesson:
          'Dr. Thorne’s severe speech latency pause and pupil constriction helped you uncover the poison source. Follow the trail to Julian Vance, who executed the crime.',
      });
      return;
    }

    // Case 1: Indicting Evelyn Cross (Fatal False Positive)
    if (selectedSuspectId === 'suspect-evelyn-cross') {
      sound.playBuzzer();
      setVerdictResult({
        solved: false,
        rank: 'ROOKIE PATROLMAN (DISCIPLINARY SUSPENSION)',
        score: 210,
        title: 'CATASTROPHIC FALSE POSITIVE: WRONGFUL INDICTMENT',
        narrative:
          'Evelyn Cross collapsed in tears on the courtroom floor. Her defense attorney instantly produced the St. Jude Conservatory sign-in sheet, proving she was playing Chopin until 11:45 PM. The Grand Jury dismissed the indictment with extreme prejudice and censured the department.',
        biometricLesson:
          'FATAL ERROR: You fell victim to the classic interrogator’s trap. Evelyn’s elevated heart rate (94 bpm) and vocal tremors were part of her baseline clinical anxiety profile. Nervousness is NOT deception without abnormal biometric deviation.',
      });
      return;
    }

    // Case 1: Indicting Marcus Drake
    if (selectedSuspectId === 'suspect-marcus-drake') {
      sound.playBuzzer();
      setVerdictResult({
        solved: false,
        rank: 'PRECINCT GUMSHOE (PROBATION)',
        score: 340,
        title: 'INDICTMENT DISMISSED: CORROBORATED ALIBI',
        narrative:
          'Marcus Drake’s docklands mechanic alibi was confirmed by tugboat logs. His sullen refusal to maintain eye contact was a natural product of his guarded, cynical disposition, not guilt.',
        biometricLesson:
          'Marcus’s 48% glance aversion was within his baseline stoic profile. You mistook anti-authoritarian body language for criminal deception.',
      });
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-[#0b0f17] border border-amber-500/60 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg md:text-xl font-bold text-slate-100 font-noir">
              OFFICIAL INDICTMENT FORM · DISTRICT ATTORNEY
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!verdictResult ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 font-terminal leading-relaxed">
              Synthesize your biometrics, acoustic patterns, and physical evidence to indict the true perpetrator of the {coldCase.title}.
            </p>

            {/* Select Suspect */}
            <div>
              <label className="text-xs uppercase font-terminal text-amber-400 font-bold tracking-wider block mb-1.5">
                1. Select Prime Accused
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suspects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      sound.playTypewriter();
                      setSelectedSuspectId(s.id);
                    }}
                    className={`p-3 rounded-lg border text-left transition-colors font-terminal flex items-center gap-3 ${
                      selectedSuspectId === s.id
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img
                      src={s.photoUrl}
                      alt={s.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded object-cover grayscale"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.personality.indicator}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Method / Weapon */}
            <div>
              <label className="text-xs uppercase font-terminal text-amber-400 font-bold tracking-wider block mb-1.5">
                2. Method of Execution / Murder Weapon
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-terminal text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Criminal Method --</option>
                {isCaseTwo ? (
                  <>
                    <option value="tubocurarine_poison">Purified d-tubocurarine neuromuscular alkaloid spiked into coffee thermos</option>
                    <option value="blunt_trauma">Blunt force trauma with heavy machinist spanner</option>
                    <option value="drowning_slipway">Forced submersion and drowning in the tidal slipway</option>
                    <option value="electrocution">Intentional high-voltage electrocution from tripped generator breaker</option>
                  </>
                ) : (
                  <>
                    <option value="blunt_trauma">Blunt force trauma with library brass claw</option>
                    <option value="aconitine_poison">Purified aconitine alkaloid tincture infused into scotch</option>
                    <option value="digitalis_overdose">Accidental medical overdose of digitalis glycoside</option>
                    <option value="forced_suffocation">Physical suffocation following a telephone dispute</option>
                  </>
                )}
              </select>
            </div>

            {/* Select Decisive Evidence */}
            <div>
              <label className="text-xs uppercase font-terminal text-amber-400 font-bold tracking-wider block mb-1.5">
                3. Decisive Physical Evidence Disproving Alibi
              </label>
              <select
                value={selectedEvidenceId}
                onChange={(e) => setSelectedEvidenceId(e.target.value)}
                className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-terminal text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Decisive Clue --</option>
                {evidenceList.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 font-terminal text-xs transition-colors"
              >
                Return to Chamber
              </button>
              <button
                onClick={handleSubmitIndictment}
                className="px-5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-terminal text-xs transition-colors shadow-lg shadow-amber-950/40 uppercase tracking-wider"
              >
                File Indictment With D.A.
              </button>
            </div>
          </div>
        ) : (
          /* Verdict Result View */
          <div className="space-y-4 font-terminal animate-in fade-in duration-200">
            <div
              className={`p-4 rounded-lg border ${
                verdictResult.solved
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {verdictResult.solved ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm tracking-wider uppercase">
                  {verdictResult.title}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-300">
                Department Performance Evaluation: <span className="text-amber-400 font-bold">{verdictResult.rank}</span> ({verdictResult.score}/1000 pts)
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs uppercase text-slate-400 font-bold">Judicial Verdict Summary:</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{verdictResult.narrative}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs uppercase text-amber-400 font-bold">
                Forensic & Biometric Post-Mortem Analysis:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{verdictResult.biometricLesson}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setVerdictResult(null)}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-terminal flex items-center gap-1.5"
              >
                <span>Re-examine Charges</span>
              </button>

              {verdictResult.solved && (
                <button
                  onClick={() => {
                    sound.playSuccessChime();
                    if (onCaseSolved) {
                      onCaseSolved(coldCase.id);
                    }
                    onResetCase();
                    onClose();
                  }}
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-terminal uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <Award className="w-4 h-4" />
                  <span>Case Solved · Archive Record</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
