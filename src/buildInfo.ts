/**
 * =========================================================================================
 * Application Build Lifecycle & Clearance Specification: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This module manages build fingerprinting and release identification for the Detective Stories
 * game engine. Its primary mission is enforcing the "clean-slate on rebuild" rule: whenever a new
 * build is deployed, any previously cached "case solved" records or investigation archives stored
 * in the client's browser local storage must be automatically purged so that all cases start
 * in an uncleared state.
 * 
 * DIFFERENT USE CASES:
 * 1. Automatic Solved Status Invalidation: When the application initializes in `App.tsx`, it calls
 *    `getBuildIdentifier()` to check the build ID against the recorded client storage key. If the build
 *    differs, it purges all solved case records immediately.
 * 2. Continuous Delivery Identification: Combines the static semantic build revision string with
 *    Vite's dynamically injected build token (`import.meta.env.VITE_APP_BUILD_ID`) to guarantee that
 *    every incremental build, hot-reload cycle, or deployment creates a unique fingerprint.
 * 3. Audit Logging: Logs the retrieval of the active build identifier through the centralized
 *    telemetry system without exposing sensitive internals.
 * =========================================================================================
 */

import { logFunctionCall } from './utils/logger';

/**
 * Static semantic build revision string.
 * Updated whenever major case narratives, biometric logic, or architecture changes occur.
 */
export const BUILD_REVISION = '2026.09.26.1550.uncleared';

/**
 * Computes the unique composite build identifier for the current running application.
 * Merges the static build revision with any Vite-defined environment build token.
 * 
 * @returns The unique composite build signature string
 */
export function getBuildIdentifier(): string {
  const viteBuildId = (import.meta as any).env?.VITE_APP_BUILD_ID;
  const result = viteBuildId ? `${BUILD_REVISION}_${viteBuildId}` : BUILD_REVISION;
  logFunctionCall('getBuildIdentifier', { buildId: result });
  return result;
}
