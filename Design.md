# Architectural & Feature Specification: Detective Stories

## 1. Executive Summary & Vision

**Detective Stories** is a full-stack, atmospheric 1940s film-noir detective simulation. Stepping into the rain-slicked corridors of Precinct 8’s Department of Forensic Analysis, players act as Lead Homicide Detectives solving cold murder cases. Rather than relying on simple multiple-choice branching, the simulation employs **calibrated forensic science**:
- **48-point facial landmark meshes** that detect sub-second micro-smirks and pupillary dilation.
- **Oscilloscope voice frequency analyzers** tracking acoustic pitch jitter ($Hz$) and laryngeal tremor.
- **Psychological baseline calibration** that guards against wrongful convictions caused by chronic anxiety or stoic demeanor.
- **Conversational Generative AI Interrogation** powered by Google Gemini, capable of roleplaying psychologically authentic noir suspects, adhering to case-partitioned secrets, and breaking into spoken admissions when confronted with hard contradictions.
- **Strict Narrative Decoupling** between cases, ensuring suspects appearing in multiple investigations have isolated alibis and motives.
- **Build-Scoped Invalidation**: With each new build, all cases automatically start uncleared, with manual reset options on demand.

---

## 2. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                              Vite + React 19 Client                               |
|                                                                                   |
|  [TopBar Navigation] <-----> [Case Directory & Vault] <-----> [Crime Dossier]     |
|          |                                                           |            |
|          v                                                           v            |
|  [Interrogation Chamber] <---> [Evidence Locker] <---> [Psych Profile Dossier]    |
|          |                                                           |            |
|          +---------------------> [Indictment Modal] <----------------+            |
|                                         |                                         |
|  [Pixel Noir Avatar]            [Voice Oscilloscope]        [Facial Mesh Canvas]  |
|  (Chiaroscuro & Smoke)          (Acoustic Jitter Hz)        (48 Landmark Points)  |
+-----------------------------------------+-----------------------------------------+
                                          |
                      JSON / REST API (/api/*) & Telemetry
                                          |
+-----------------------------------------v-----------------------------------------+
|                                Express Node.js Server                             |
|                                                                                   |
|   /api/chat-suspect   <--->   Case Personas & Canonical Admission Matcher         |
|   /api/speak          <--->   Gemini Studio TTS (Vintage Voice Modulation)        |
|   /api/transcribe     <--->   Gemini Multimodal Speech-to-Text Recognition        |
|   Vite Middleware     <--->   Hot Module Reload & Static Asset Bundling           |
|                                                                                   |
|                  Centralized Configuration: src/config.ts                         |
|                  Sanitized Logger: src/utils/logger.ts                            |
+-----------------------------------------------------------------------------------+
```

### Technology Matrix
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, HTML5 Canvas, Web Audio API, Web Speech API.
- **Backend**: Node.js, Express, `tsx`, `@google/genai` TypeScript SDK.
- **AI Models (Configurable in `src/config.ts`)**:
  - `gemini-3.8-flash`: Powers suspect conversational roleplay, biometric response synthesis, and audio transcription.
  - `gemini-3.8-flash-lite-tts`: Generates 24kHz linear PCM studio-grade vintage spoken audio tailored to each character.
- **Telemetry & Safety**: Structured info logging (`logFunctionCall`, `logGenAICall`) with recursive inline data stripping.

---

## 3. The Cold Case Murder Files

The game engine features two independent, self-contained murder investigations cataloged in the Precinct 8 Vault:

### Case 1: *The Velvet Ash Murder* (`case-01-velvet-ash`)
- **Case File**: `#COLD-1948-0914`
- **Victim**: Industrialist and art patron Arthur Sterling.
- **Crime Scene**: Locked 14th-floor penthouse library at 88 Blackwood Terrace. Smashed Patek Philippe watch stopped at 11:42 PM; crystal scotch tumbler on desk.
- **Coroner Findings**: Fatal cardiac arrhythmia caused by purified aconitine (wolfsbane extract) infused into 25-year Glenmorangie scotch.
- **Suspect Roster**:
  1. **Julian Vance**: High-society art gallery director. Claims Sterling phoned him at 11:30 PM. (Contradiction: switchboard cable physically severed at 11:15 PM).
  2. **Evelyn Cross**: Virtuoso concert pianist and Sterling's ward. High anxiety baseline (94 bpm). Completely innocent of murder.
  3. **Marcus Drake**: Discharged veteran and private chauffeur. Unflinching stoic baseline. Found duplicate service key on stairs.
  4. **Dr. Aris Thorne**: Botanical chemist and dispensary director. Synthesized the aconitine under Vance's extortion.
- **Prosecution Solution**: Indict Julian Vance + Purified aconitine alkaloid in scotch + Switchboard Cable Cut Log or Master Service Keycard.

### Case 2: *The Pier 14 Blackout* (`case-02-dockland-fog`)
- **Case File**: `#COLD-1948-1102`
- **Victim**: Tugboat master and dock foreman Silas O’Malley.
- **Crime Scene**: Winch engine cradle of Berth 4, Pier 14 Slipway. Power generator switch jammed with a 1-inch machinist spanner at 01:00 AM; dispatch telephone wire severed.
- **Coroner Findings**: Acute neuromuscular respiratory paralysis from purified $d$-tubocurarine alkaloid spiked into O'Malley's steel coffee thermos.
- **Suspect Roster**:
  1. **Julian Vance**: Art dealer smuggling forged Renaissance antiquities from Rotterdam. Claims he was in his Mayfair residence all night. (Contradiction: countersigned the impounded tugboat manifest at Berth 4 at 00:45 AM; Turkish Sobranie cigarette ash on thermos).
  2. **Marcus Drake**: Pier 14 slipway diesel mechanic. Cynical anti-police baseline. His spanner was stolen from his loft to jam the breaker; he was repairing fuel injectors.
  3. **Dr. Aris Thorne**: Forensic toxicologist. Supplied tubocurarine to Vance, claiming Vance promised it was only an incapacitating draft.
- **Prosecution Solution**: Indict Julian Vance + Purified $d$-tubocurarine alkaloid in coffee thermos + Impounded Tugboat Manifest or Spiked Coffee Thermos.

---

## 4. Biometric & Micro-Expression Detection Engine

The simulation tracks 10 physiological parameters, updating in real time with each suspect statement:

1. **Cardiovascular Pulse ($BPM$)**:
   - Monitored visually on the HUD and procedurally synthesized via Web Audio low-frequency oscillators.
   - Sociopaths (Vance) remain calm at 58 bpm while lying; panic-prone subjects (Cross) spike to 105 bpm.
2. **Spectral Voice Pitch Jitter ($Hz$)**:
   - Analyzes vocal cord tension. Baseline jitter is 2.0–4.0 Hz. Deception creates micro-spikes of 6.5–14.5 Hz.
   - Rendered on a CRT oscilloscope with animated phosphor traces.
3. **Voice Tremor Index ($0-100\%$)**:
   - Measures laryngeal micro-tremors and vocal fry.
4. **Facial Micro-Smirk Asymmetry ($0-100\%$)**:
   - Detects brief (120–140ms) unilateral elevation of the zygomaticus major muscle. Key tell for narcissists feeling superior during lies.
5. **Pupillary Diameter ($mm$)**:
   - Normal pupil size is 3.2–3.8 mm. Sympathetic autonomic dilation expands pupils to 4.4–4.8 mm under acute fear; intellectual overload constricts pupils to 2.2 mm.
6. **Glance Aversion ($0-100\%$)**:
   - Saccadic eye tracking measuring gaze evasion vs unblinking sociopathic stares.
7. **Lip Compression ($0-100\%$)**:
   - Measures orbicularis oris muscle tension indicating effortful suppression of truth.
8. **Speech Latency ($Seconds$)**:
   - Measures hesitancy before beginning an answer. Thorne shows abnormal 2.6s latency pauses when lying about toxicological origins.
9. **Visual Micro-Indicators**:
   - Descriptive micro-cues (e.g., *"Unilateral right-side micro-smirk (140ms)"*, *"Perspiration bead on temple"*).
10. **Acoustic Vocal Indicators**:
    - Frequency cues (e.g., *"Sub-vocal laryngeal catch"*, *"Cadence hesitation on timestamps"*).

---

## 5. Psychological Calibration & The Detective Shield

A critical game mechanic is the **False-Positive Guard**:

### The Four Archetypes
1. **Type-B Neurotic Avoidant (Evelyn Cross)**:
   - High anxiety baseline: 92–96 bpm pulse, 28% tremor, elevated pitch.
   - *Shield Warning*: **DO NOT accuse based on anxiety alone!** High stress is normal for her personality.
2. **Machiavellian Sociopath (Julian Vance)**:
   - Sub-normal resting pulse (58 bpm), 0% glance aversion, unwavering aristocratic composure.
   - *Shield Warning*: **Absence of anxiety does NOT indicate innocence!** Look for subtle micro-smirks and physical evidence contradictions.
3. **Introverted Cynical Stoic (Marcus Drake)**:
   - 70 bpm pulse, high glance aversion (48–50%) caused by intense disdain for authority.
   - *Shield Warning*: **Aversive gaze and terse speech are part of his disposition, not guilt!**
4. **Obsessive-Compulsive Intellectual (Dr. Aris Thorne)**:
   - Rapid articulate delivery (0.3s latency), clinical condescension.
   - *Shield Warning*: **Watch for speech latency pauses (>2.0s) and pinpoint pupillary constriction.**

### Hardboiled Mode
When the Detective Shield is toggled **OFF** in Options:
- Advisory warnings and cheat-sheets are redacted from the Psychological Dossier.
- Detectives must evaluate physiological anomalies against calibrated baselines purely through deductive skill.

---

## 6. Live Interrogation Chamber & Speech Suite

The Interrogation Chamber offers three interrogation pathways:
1. **Natural Language Free-Form Questioning**:
   - Investigators type arbitrary questions into the terminal.
   - The server routes queries through Gemini with case-partitioned persona prompts.
   - When key contradiction topics are hit, the model is strictly commanded to break character facade, admit the truth, and spike biometric metrics.
2. **Push-to-Talk Microphone Questioning**:
   - Detectives click the microphone to speak questions naturally.
   - Audio is captured in the browser, processed via `/api/transcribe` with Gemini speech recognition, transcribed into the interrogation log, and answered in real time.
3. **Targeted Forensic Quick Probes**:
   - Pre-calibrated interrogation questions specific to each suspect and case:
     - Case 1: Switchboard cable cut, master service key, apothecary tincture, Swiss escrow.
     - Case 2: Rotterdam manifest, spiked thermos, sandbar curare shard, machinist spanner.
4. **Dual Avatar Presentation**:
   - **Pixel Noir Avatar**: 1940s chiaroscuro portrait with rising cigarette smoke particles and chromatic aberration during deception.
   - **Live Human Avatar**: Anatomically calibrated landmark mesh with animated mouth phoneme sync, autonomic blinking, and pupillary dilation.
5. **Vintage Film-Noir Spoken Audio**:
   - Character voices synthesized via Gemini TTS (`gemini-3.8-flash-lite-tts`) mapped to distinct voice profiles:
     - Julian Vance: *Puck* (Smooth aristocratic film-noir delivery)
     - Evelyn Cross: *Kore* (Anxious trembling vintage cinema timbre)
     - Marcus Drake: *Fenrir* (Gravelly world-weary docklands cadence)
     - Dr. Aris Thorne: *Charon* (Pedantic, precise, articulate intellectual)

---

## 7. Judicial Indictment & Case Clearance Architecture

### Three-Point Legal Synthesis
Filing an indictment requires specifying:
1. **The Prime Culprit** (Must be Julian Vance in both Case 1 and Case 2).
2. **The Execution Method** (Purified aconitine in scotch for Case 1; purified tubocurarine in thermos for Case 2).
3. **The Decisive Exhibit** (Cable log or master key for Case 1; tugboat manifest or spiked thermos for Case 2).

### Verdict Engine & Department Ranks
- **Full Conviction (1000 pts)**: Awards the title of *Chief Superintendent of Cold Cases*.
- **Accessory Convicted (520 pts)**: Accusing Dr. Thorne convicts the accessory while the prime killer escapes.
- **Wrongful Indictment (280 pts)**: Convicting Marcus Drake or Evelyn Cross triggers a fatal false-positive reprimand.

### Build-Scoped Uncleared State
- **Rule**: Every new build or deployment of the application automatically purges all previously archived "case solved" records from local storage.
- **Implementation**: `App.tsx` matches the browser's stored build ID against `getBuildIdentifier()`. If the build ID differs, `STORAGE_SOLVED_KEY` is purged and `solvedCaseIds` initializes as `[]`.
- **Manual Reset**: Users can also reset solved statuses at any time via:
  - The "Reset Solved Statuses" button in the Case Directory.
  - The "Mark All Uncleared" control in the Options Modal.

---

## 8. Centralized Configuration & Telemetry Subsystem

### Centralized Configuration (`src/config.ts`)
Consolidates all magic numbers and configurable parameters:
- `APP_CONFIG.ai`: Primary model (`gemini-3.8-flash`), TTS model (`gemini-3.8-flash-lite-tts`), temperature, history buffers, voice maps.
- `APP_CONFIG.server`: Ports, payload size limits (`50mb`), API endpoints.
- `APP_CONFIG.storage`: Build identification keys, solved case storage keys.
- `APP_CONFIG.biometrics`: Pulse bounds, pitch jitter thresholds, pupil constriction/dilation thresholds, smirk anomaly bounds.
- `APP_CONFIG.audio`: Typewriter frequencies, chime harmonies, rain filter cutoffs.

### Sanitized Telemetry Logging (`src/utils/logger.ts`)
- **Function Call Auditing (`logFunctionCall`)**: Logs every function invocation across client and server with structured parameter tracking.
- **GenAI Telemetry (`logGenAICall`)**: Logs model name, input prompts/contents, configuration, and output.
- **Inline Data Stripping (`stripInlineData`)**: Recursively sanitizes payloads, replacing heavy base64 strings and audio binary blobs with concise metadata tags (`[STRIPPED_INLINE_DATA: audio/webm (x bytes)]`) to maintain clean logs and prevent memory leaks.

---

## 9. Verification & Quality Checklist

- [x] All functions across all modules contain comprehensive JSDoc docstrings.
- [x] Every file contains a detailed header comment explaining feature purpose and use cases.
- [x] All configurable items (models, ports, storage keys, biometrics) centralized in `src/config.ts`.
- [x] Function calls logged as info with input parameters.
- [x] GenAI calls logged with model, prompt, config, and output (inline data stripped).
- [x] `Design.md` created at root documenting all features.
- [x] Case 1 and Case 2 completely decoupled with zero narrative bleed.
- [x] Cases start uncleared on each rebuild, with on-demand manual reset controls intact.
- [x] Zero build or lint warnings.
