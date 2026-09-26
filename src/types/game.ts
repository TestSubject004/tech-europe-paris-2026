/**
 * =========================================================================================
 * Core Domain Schema & Game State Type Definitions: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This module defines the complete TypeScript domain model and structural schemas for the
 * Detective Stories application. It establishes the contracts for cold case archives, evidence exhibits,
 * suspect profiles, psychological personality dispositions, calibrated biometric readings,
 * voice acoustic parameters, statement contradictions, and grand jury indictment verdicts.
 * 
 * DIFFERENT USE CASES:
 * 1. Biometric & Micro-Expression Data Contracts (BiometricReading, PersonalityProfile):
 *    Provides rigid typing for cardiovascular pulse (bpm), spectral pitch jitter (Hz), pupillary dilation (mm),
 *    asymmetry smirk percentages, and facial mesh landmark anomalies. It enables the false-positive
 *    guard system to contrast instantaneous sensor readings against baseline dispositions.
 * 2. Narrative Case Dossier Modeling (ColdCase, Evidence, TimelineMilestone):
 *    Standardizes crime scene reports, autopsy findings, coroner manifests, timeline checkpoints,
 *    and physical exhibit lockers for independent murder investigations (e.g. 'The Velvet Ash Murder'
 *    and 'The Pier 14 Blackout').
 * 3. Interrogation Statement Flow (SuspectStatement, BaselineQuestion, InterrogationRecord):
 *    Models the suspect's testimony, determining whether a given statement constitutes perjury (isLie),
 *    what grounds contradict it (evidence, voice, or biometric), and the subsequent confession crack.
 * 4. Judicial Indictment Verification (ColdCase['solution']):
 *    Encapsulates the exact prosecutorial requirements (culprit ID, murder weapon/method, decisive exhibit)
 *    needed to achieve grand jury conviction and archive a case as solved.
 * =========================================================================================
 */

/**
 * Psychological archetype classification for suspects.
 */
export type PersonalityType = 
  | 'neurotic_anxious'
  | 'machiavellian_narcissist'
  | 'introverted_stoic'
  | 'obsessive_antisocial';

/**
 * Physical anatomical summary for suspect profile cards.
 */
export interface BiometricProfileSummary {
  sex: 'Male' | 'Female';
  gender: 'Male' | 'Female' | 'Non-binary';
  height: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

/**
 * Baseline psychological disposition and sensor calibration specifications.
 */
export interface PersonalityProfile {
  id: PersonalityType;
  title: string;
  indicator: string;
  summary: string;
  baselineDescription: string;
  physicalVitals?: BiometricProfileSummary;
  baselineMetrics: {
    heartRateBpm: number;
    voiceTremorPercent: number;
    glanceAversionPercent: number;
    pupilDilationMm: number;
    speechLatencySec: number;
    pitchJitterHz: number;
  };
  interrogationGuidelines: string;
  falsePositiveWarning: string;
  deceptionTells: string[];
}

/**
 * Severity ranking for biometric and acoustic anomalies.
 */
export type AnomalySeverity = 
  | 'BASELINE_NORMAL'
  | 'ELEVATED_ANXIETY_WITHIN_BASELINE'
  | 'CRITICAL_DECEPTION_ANOMALY';

/**
 * Instantaneous biometric sensor metrics captured during speech or interrogation.
 */
export interface BiometricReading {
  heartRate: number;
  pitchJitterHz: number;
  tremorIndex: number;
  glanceAversion: number;
  pupilDilationMm: number;
  lipCompression: number;
  asymmetrySmirk: number;
  speechLatencySec: number;
  anomalyRating: AnomalySeverity;
  visualIndicators: string[];
  vocalIndicators: string[];
}

/**
 * An individual interrogatable statement made by a suspect.
 */
export interface SuspectStatement {
  id: string;
  interrogationTopic: string;
  detectiveQuestion: string;
  suspectResponse: string;
  audioDurationSec: number;
  isLie: boolean;
  lieGrounds?: 'evidence' | 'voice' | 'biometric';
  contradictingEvidenceId?: string;
  deceptionExplanation?: string;
  confessionBreak?: string;
  biometricReading: BiometricReading;
  isCracked?: boolean;
}

/**
 * Baseline calibration interview question.
 */
export interface BaselineQuestion {
  question: string;
  expectedTone: string;
  response: string;
  reading: BiometricReading;
}

/**
 * Suspect entity dossier including alibi, motive, and psychological baseline.
 */
export interface Suspect {
  id: string;
  name: string;
  alias: string;
  age: number;
  sex: 'Male' | 'Female';
  gender: 'Male' | 'Female';
  height: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  occupation: string;
  photoUrl: string;
  alibi: string;
  initialMotive: string;
  background: string;
  personality: PersonalityProfile;
  baselineQuestions: BaselineQuestion[];
  statements: SuspectStatement[];
  isIndicted?: boolean;
  isCleared?: boolean;
}

/**
 * Forensic evidence item cataloged in the Evidence Locker.
 */
export interface Evidence {
  id: string;
  title: string;
  type: 'document' | 'forensics' | 'physical' | 'testimony';
  timestampOrDate: string;
  locationFound: string;
  description: string;
  forensicSignificance: string;
}

/**
 * Critical timeline milestone reconstructed by homicide detectives.
 */
export interface TimelineMilestone {
  time: string;
  description: string;
  isCritical?: boolean;
}

/**
 * Complete homicide cold case file.
 */
export interface ColdCase {
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  incidentDate: string;
  location: string;
  status: 'COLD' | 'REOPENED' | 'SOLVED';
  summary: string;
  crimeSceneDossier: string;
  coronerReport: string;
  autopsyReportNumber?: string;
  timelineMilestones?: TimelineMilestone[];
  evidence: Evidence[];
  suspects: Suspect[];
  solution: {
    culpritSuspectId: string;
    weaponOrMethod: string;
    decisiveEvidenceId: string;
    motiveBreakdown: string;
  };
}

/**
 * Record of an interrogation challenge or exhibit confrontation.
 */
export interface InterrogationRecord {
  suspectId: string;
  statementId: string;
  wasChallenged: boolean;
  challengeType?: 'evidence' | 'voice' | 'biometric';
  evidenceUsedId?: string;
  wasSuccessful?: boolean;
  penaltyApplied?: boolean;
}
