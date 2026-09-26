/**
 * =========================================================================================
 * Centralized Configuration: Detective Stories Engine
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This module serves as the single source of truth for all configurable settings, hyperparameters,
 * model identifiers, biometric thresholds, network configurations, storage keys, and gameplay defaults
 * across the Detective Stories application. Rather than scattering magic numbers and string literals
 * across various UI components and backend server scripts, this file consolidates them into strongly-typed,
 * immutable configurations.
 * 
 * DIFFERENT USE CASES:
 * 1. AI Interrogation Tuning: Adjusting the Google Gemini model alias (e.g. 'gemini-3.8-flash'),
 *    temperature, response schema formats, and conversation history buffer lengths in one location.
 * 2. Biometric Lie Detection Calibration: Defining the baseline thresholds for physiological stress
 *    (pulse rate bounds, pitch jitter frequencies, pupillary dilation ranges, and smirk asymmetry percentages).
 * 3. Persistence & Build Versioning: Managing local storage keys for build freshness validation and
 *    case clearance tracking across rebuilds.
 * 4. Audio Synthesizer Parameters: Centralizing base frequencies for mechanical typewriter keystrokes,
 *    sub-bass heartbeats, camera shutters, and atmospheric audio cues.
 * 5. Full-Stack Networking: Standardizing server ports, JSON payload limits, and API route endpoints
 *    for both browser client fetch calls and Express server mounts.
 * =========================================================================================
 */

export const APP_CONFIG = {
  /**
   * Generative AI Interrogation Settings
   */
  ai: {
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-2.5-flash',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    temperature: 0.8,
    chatHistoryLimit: 6,
    responseMimeType: 'application/json',
    userAgent: 'aistudio-build',
    ttsVoiceMap: {
      'suspect-julian-vance': 'Puck',
      'suspect-evelyn-cross': 'Kore',
      'suspect-marcus-drake': 'Fenrir',
      'suspect-aris-thorne': 'Charon',
    } as Record<string, string>,
  },

  /**
   * Express Full-Stack Server & API Networking
   */
  server: {
    defaultPort: 3000,
    bodyLimit: '50mb',
    chatEndpoint: '/api/chat-suspect',
    apiBaseUrl: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || '',
  },

  /**
   * LocalStorage Keys for Persistence and Build-Scoped Reset
   */
  storage: {
    buildIdKey: 'detective_stories_build_id',
    solvedCasesKey: 'detective_stories_solved_cases_v2',
    legacySolvedCasesKey: 'detective_stories_solved_cases_v1',
  },

  /**
   * Biometric Forensic Calibration Thresholds
   */
  biometrics: {
    pulse: {
      restingStandard: 70,
      elevatedAnxiety: 85,
      criticalDeception: 95,
      sociopathResting: 58,
    },
    pitchJitter: {
      baselineMaxHz: 4.5,
      deceptionMinHz: 6.0,
      criticalSpikeHz: 10.0,
    },
    pupils: {
      constrictionThresholdMm: 2.5,
      normalMm: 3.5,
      dilationThresholdMm: 4.2,
    },
    smirk: {
      asymmetryAnomalyMin: 40,
      severeDeceptionMin: 60,
    },
    latency: {
      normalSec: 0.6,
      hesitationSec: 1.5,
      severeHesitationSec: 2.2,
    },
  },

  /**
   * Web Audio API Synthesizer Configuration
   */
  audio: {
    typewriterFrequencyHz: 800,
    shutterNoiseFrequencyHz: 1200,
    successChimeFrequenciesHz: [523.25, 659.25, 783.99, 1046.50],
    buzzerFrequencyHz: 110,
    rainFilterCutoffHz: 600,
  },

  /**
   * Gameplay Defaults
   */
  gameplay: {
    defaultCaseId: 'case-01-velvet-ash',
    defaultShieldEnabled: true,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
