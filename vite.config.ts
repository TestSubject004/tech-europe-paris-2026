/**
 * =========================================================================================
 * Vite Build Tooling & Asset Bundling Configuration: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This configuration controls the Vite development server and production static build compilation.
 * It integrates the official React compiler plugin, Tailwind CSS v4 Vite plugin, path aliases,
 * and dynamically injects unique build tokens (`VITE_APP_BUILD_ID`) into the client bundle on every build
 * to guarantee that previously solved case archives are automatically purged upon rebuilding.
 * 
 * DIFFERENT USE CASES:
 * 1. Build Invalidation Token Injection: Injects a unique timestamp and random salt into
 *    `import.meta.env.VITE_APP_BUILD_ID`, allowing client state machines to detect fresh builds.
 * 2. Full-Stack Dev Middleware: Configures Vite server options when embedded into Express middleware.
 * 3. Path Alias Resolution: Maps `@/` directly to root workspace directories for clean imports.
 * =========================================================================================
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Creates and exports the active Vite bundler configuration.
 * 
 * @returns Vite UserConfig object
 */
export default defineConfig(() => {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    base: './',
    define: {
      'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(buildId),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
