/**
 * =========================================================================================
 * Application Entry Point & React Root Bootstrap: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This module is the browser-side client entry point for the Detective Stories SPA. It mounts
 * the root React application into the `#root` DOM container, enforces React StrictMode for
 * development stability, and imports global Tailwind CSS noir styling and custom typography.
 * 
 * DIFFERENT USE CASES:
 * 1. SPA Initialization: Bootstraps the application inside the browser document DOM.
 * 2. StrictMode Verification: Catches unexpected side effects and lifecycle warnings early.
 * 3. Telemetry Bootstrapping: Emits initial bootstrap telemetry to the centralized logger.
 * =========================================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logFunctionCall } from './utils/logger';

/**
 * Initializes and mounts the Detective Stories application to the DOM.
 */
function bootstrapApp(): void {
  logFunctionCall('bootstrapApp');
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

bootstrapApp();
