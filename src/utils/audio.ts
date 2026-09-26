/**
 * =========================================================================================
 * Noir Biometric Audio & Voice Synthesis Subsystem: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This module provides the complete procedural audio architecture and real-human voice synthesis
 * layer for the Detective Stories simulation. Operating entirely via the modern Web Audio API and
 * the browser SpeechSynthesis API, it synthesizes dynamic acoustic noir soundscapes without relying
 * on external MP3/WAV static asset downloads. It generates cardiovascular pulse beeps mapped to suspect
 * heart rates, typewriter mechanical keystrokes, radar acoustic pings, pink-noise rain loops,
 * and high-fidelity 24kHz PCM linear audio streamed from Gemini Studio TTS models.
 * 
 * DIFFERENT USE CASES:
 * 1. Biometric Cardiovascular Pulse Audio (playHeartbeat):
 *    Audibly renders the suspect's pulse rate (e.g. 58 bpm for sociopaths vs 98 bpm under acute panic).
 *    Frequencies and pitch modulations adjust exponentially based on active cardiovascular stress.
 * 2. Investigation Interaction Feedback:
 *    Generates instant tactile audio feedback: mechanical typewriter clicks on terminal navigation (playTypewriter),
 *    harmonious 4-note ascending chimes upon breaking lies (playSuccessChime), discordant buzzers on false
 *    confrontations (playBuzzer), and biometric radar chirps on facial analysis (playScanPing).
 * 3. Procedural Noir Rain Ambience (toggleAmbientRain):
 *    Synthesizes continuous pinkish low-pass filtered precipitation noise to maintain a 1940s detective
 *    interrogation room atmosphere without audio file streaming overhead.
 * 4. Dual-Mode Spoken Dialogue Performance (speakRealHumanVoice):
 *    Renders Gemini Studio 24kHz PCM high-fidelity spoken dialogue with character-specific acting prompts,
 *    gracefully falling back to accented SpeechSynthesisUtterance if network connectivity is absent.
 * 5. Mute & Global Audio Control (toggleMute, getMuted, stopSpeaking):
 *    Permits one-click master muting of all oscillators, ambient rain nodes, and active speech utterances.
 * =========================================================================================
 */

import { APP_CONFIG } from '../config';
import { logFunctionCall } from './logger';

/**
 * Procedural Web Audio and Speech Synthesis Engine
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientNoiseSource: AudioNode | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;

  /**
   * Lazily initializes and resumes the Web Audio context upon first user gesture.
   */
  private initContext(): void {
    logFunctionCall('SoundEngine.initContext');
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Toggles the global master mute state across all oscillators and ambient generators.
   * 
   * @returns The updated mute status (true if muted, false if audible)
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    logFunctionCall('SoundEngine.toggleMute', { isMuted: this.isMuted });
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isMuted;
  }

  /**
   * Returns current master mute state.
   * 
   * @returns Current mute state
   */
  public getMuted(): boolean {
    logFunctionCall('SoundEngine.getMuted', { isMuted: this.isMuted });
    return this.isMuted;
  }

  /**
   * Generates a biometric pulse beep modulated in frequency and rhythm according to heart rate.
   * 
   * @param bpm - Current heart rate in beats per minute
   */
  public playHeartbeat(bpm: number = 72): void {
    logFunctionCall('SoundEngine.playHeartbeat', { bpm, isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = Math.min(180, Math.max(90, 70 + bpm * 0.5));
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Synthesizes mechanical vintage typewriter key click for retro UI feel.
   */
  public playTypewriter(): void {
    logFunctionCall('SoundEngine.playTypewriter', { isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(APP_CONFIG.audio.typewriterFrequencyHz + Math.random() * 400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Procedural voice pattern speech audio simulation with vocal formant jitter.
   * 
   * @param durationSec - Length of the simulated speech snippet in seconds
   * @param pitchVariance - Range of frequency jitter applied across phonemes
   * @param isAnomaly - Whether deception vocal anomalies are actively simulated
   */
  public playVoiceSample(durationSec: number = 2.5, pitchVariance: number = 10, isAnomaly: boolean = false): void {
    logFunctionCall('SoundEngine.playVoiceSample', { durationSec, pitchVariance, isAnomaly, isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.value = 850;
      filter.Q.value = 3.0;

      const baseFreq = isAnomaly ? 240 : 150;
      osc.type = 'sawtooth';
      subOsc.type = 'sine';

      osc.frequency.setValueAtTime(baseFreq, now);
      subOsc.frequency.setValueAtTime(baseFreq / 2, now);

      // Modulate frequency to mimic speech syllables and jitter
      const steps = Math.floor(durationSec * 6);
      const stepDuration = durationSec / steps;
      for (let i = 0; i < steps; i++) {
        const time = now + i * stepDuration;
        const jitter = (Math.random() - 0.5) * pitchVariance * 4;
        const formFreq = baseFreq + jitter + (i % 2 === 0 ? 30 : -20);
        osc.frequency.linearRampToValueAtTime(Math.max(80, formFreq), time);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
      gain.gain.setValueAtTime(0.06, now + durationSec - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + durationSec);
      subOsc.stop(now + durationSec);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Plays harmonic 4-chord celebration chime when detective successfully cracks an alibi.
   */
  public playSuccessChime(): void {
    logFunctionCall('SoundEngine.playSuccessChime', { isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [329.63, 440.0, 554.37, 659.25]; // E4, A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.05, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Low-frequency buzzer for false accusations or contradictory claims.
   */
  public playBuzzer(): void {
    logFunctionCall('SoundEngine.playBuzzer', { isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(APP_CONFIG.audio.buzzerFrequencyHz, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.25);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Biometric scan radar ping for micro-expression alignment.
   */
  public playScanPing(): void {
    logFunctionCall('SoundEngine.playScanPing', { isMuted: this.isMuted });
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Toggles or sets procedural pink-noise atmospheric rain & tape hiss background loop.
   * 
   * @param forceState - Optional explicit boolean to enable or disable rain
   * @returns The resulting ambient playback state
   */
  public toggleAmbientRain(forceState?: boolean): boolean {
    logFunctionCall('SoundEngine.toggleAmbientRain', { forceState, currentPlaying: this.isAmbientPlaying });
    this.initContext();
    if (!this.ctx) return false;

    const nextState = forceState !== undefined ? forceState : !this.isAmbientPlaying;
    if (nextState && !this.isAmbientPlaying) {
      try {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        // Pinkish noise generator for rain
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = APP_CONFIG.audio.rainFilterCutoffHz;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.isMuted ? 0 : 0.035, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        this.ambientNoiseSource = noise;
        this.ambientGain = gain;
        this.isAmbientPlaying = true;
      } catch {
        this.isAmbientPlaying = false;
      }
    } else if (!nextState && this.isAmbientPlaying) {
      if (this.ambientNoiseSource) {
        try {
          (this.ambientNoiseSource as AudioScheduledSourceNode).stop();
        } catch {
          // ignore
        }
        this.ambientNoiseSource = null;
      }
      this.isAmbientPlaying = false;
    }
    return this.isAmbientPlaying;
  }

  /**
   * Client-side fallback: speaks response with American English accent tailored to the suspect's persona.
   * 
   * @param text - Dialogue text to voice
   * @param suspectId - Identifier of suspect to choose pitch and pacing
   * @param onStart - Callback invoked when utterance starts
   * @param onEnd - Callback invoked when utterance finishes
   */
  public speakAmericanEnglish(
    text: string,
    suspectId: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    logFunctionCall('SoundEngine.speakAmericanEnglish', { suspectId, textLength: text?.length });
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      // Pick an English voice with character-specific tonal traits
      const allVoices = window.speechSynthesis.getVoices();
      const enVoices = allVoices.filter(
        (v) => v.lang.startsWith('en')
      );
      const pool = enVoices.length > 0 ? enVoices : allVoices;

      // Character voice customizations with dramatic pitch and pacing differentiation
      if (suspectId === 'suspect-evelyn-cross') {
        const femaleVoice = pool.find((v) =>
          v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')
        ) || pool[0];
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.35;
        utterance.rate = 1.12;
      } else if (suspectId === 'suspect-julian-vance') {
        const aristocratVoice = pool.find((v) =>
          (v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Male')) && !v.name.includes('Female')
        ) || pool[0];
        if (aristocratVoice) utterance.voice = aristocratVoice;
        utterance.pitch = 1.04;
        utterance.rate = 0.95;
      } else if (suspectId === 'suspect-marcus-drake') {
        const gruffVoice = pool.find((v) =>
          (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Guy') || v.name.includes('Male')) && !v.name.includes('Female')
        ) || pool[0];
        if (gruffVoice) utterance.voice = gruffVoice;
        utterance.pitch = 0.60;
        utterance.rate = 0.84;
      } else if (suspectId === 'suspect-aris-thorne') {
        const clinicianVoice = pool.find((v) =>
          (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Alex')) &&
          !v.name.includes('Female')
        ) || pool[0];
        if (clinicianVoice) utterance.voice = clinicianVoice;
        utterance.pitch = 0.88;
        utterance.rate = 1.18;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  /**
   * Immediately halts any active PCM buffer audio playback and SpeechSynthesis utterances.
   */
  public stopSpeaking(): void {
    logFunctionCall('SoundEngine.stopSpeaking');
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch {
        // ignore
      }
      this.currentAudioSource = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Decodes and plays 24000Hz raw PCM linear or WAV audio generated by Gemini Studio TTS.
   * 
   * @param base64 - Base64 encoded audio byte stream
   * @param onStart - Callback invoked when playback starts
   * @param onEnd - Callback invoked when playback finishes
   */
  public playPcmAudio(base64: string, onStart?: () => void, onEnd?: () => void): void {
    logFunctionCall('SoundEngine.playPcmAudio', { base64Length: base64?.length, isMuted: this.isMuted });
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) {
        if (onEnd) onEnd();
        return;
      }

      this.stopSpeaking();

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      if (binary.startsWith('RIFF')) {
        this.ctx.decodeAudioData(
          bytes.buffer.slice(0),
          (audioBuf) => {
            const source = this.ctx!.createBufferSource();
            source.buffer = audioBuf;
            source.connect(this.ctx!.destination);
            this.currentAudioSource = source;
            source.onended = () => {
              this.currentAudioSource = null;
              if (onEnd) onEnd();
            };
            if (onStart) onStart();
            source.start();
          },
          () => {
            if (onEnd) onEnd();
          }
        );
      } else {
        // Linear PCM 16-bit 24kHz Mono
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
        }

        const audioBuf = this.ctx.createBuffer(1, float32.length, 24000);
        audioBuf.getChannelData(0).set(float32);

        const source = this.ctx.createBufferSource();
        source.buffer = audioBuf;
        source.connect(this.ctx.destination);
        this.currentAudioSource = source;
        source.onended = () => {
          this.currentAudioSource = null;
          if (onEnd) onEnd();
        };
        if (onStart) onStart();
        source.start();
      }
    } catch {
      if (onEnd) onEnd();
    }
  }

  /**
   * Speaks suspect dialogue using high-fidelity Gemini TTS audio with client fallback.
   * 
   * @param text - Dialogue text to voice
   * @param suspectId - Target suspect identifier
   * @param preloadedBase64 - Optional pre-synthesized audio from server response
   * @param onStart - Callback invoked when audio starts
   * @param onEnd - Callback invoked when audio concludes
   */
  public async speakRealHumanVoice(
    text: string,
    suspectId: string,
    preloadedBase64?: string | null,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    logFunctionCall('SoundEngine.speakRealHumanVoice', {
      suspectId,
      hasPreloaded: !!preloadedBase64,
      isMuted: this.isMuted,
      textLength: text?.length,
    });

    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // 1. If base64 audio already received from server, play immediately
    if (preloadedBase64) {
      this.playPcmAudio(preloadedBase64, onStart, onEnd);
      return;
    }

    // 2. Otherwise request high-fidelity Gemini TTS audio from /api/speak
    try {
      const baseUrl = APP_CONFIG.server.getApiBaseUrl();
      const resp = await fetch(`${baseUrl}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, suspectId }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.audioBase64) {
          this.playPcmAudio(data.audioBase64, onStart, onEnd);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    // 3. Fallback to American English SpeechSynthesis
    this.speakAmericanEnglish(text, suspectId, onStart, onEnd);
  }
}

export const sound = new SoundEngine();
