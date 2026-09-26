/**
 * =========================================================================================
 * Backend Interrogation Engine & Full-Stack Server: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This server module powers the gritty 1940s noir conversational interrogation backend. It serves
 * as both the Express host (integrating Vite middleware in development and serving static bundles
 * in production) and the forensic AI orchestration layer. Through Google Gemini multimodal models,
 * it simulates psychological suspect personas partitioned strictly by case, dynamically calibrates
 * biometric anomaly telemetry (heart rate, pitch jitter, tremor index, micro-smirks, pupillary dilation),
 * synthesizes vintage film-noir spoken audio via Gemini TTS, and transcribes spoken detective queries
 * captured from the investigator's microphone.
 * 
 * DIFFERENT USE CASES:
 * 1. Live Conversational Interrogation (/api/chat-suspect):
 *    Detectives question suspects using natural language or preset interrogation probes. The server
 *    loads the case-partitioned persona (e.g. Julian Vance in 'The Velvet Ash Murder' vs 'The Pier 14 Blackout'),
 *    scans for contradiction triggers against physical exhibits, forces canonical psychological cracking
 *    when caught in lies, and emits synchronized dialogue along with 10-point biometric anomaly metrics.
 * 2. Case Decoupling & Independent Narratives:
 *    Ensures suspect motivations, secrets, and crime scenes remain completely quarantined. For instance,
 *    Julian Vance in Case 2 never bleeds into or references Arthur Sterling or the Mayfair penthouse.
 * 3. Text-To-Speech Synthesis (/api/speak & generateGeminiSpeechAudio):
 *    Generates distinct vocal performances for each suspect using custom style-prompted Gemini TTS
 *    ('gemini-3.8-flash-lite-tts') mapped to distinct voices (Puck, Kore, Fenrir, Charon).
 * 4. Multimodal Audio Transcription (/api/transcribe):
 *    Receives microphone audio chunks from the browser, cleans MIME headers, and uses Gemini multimodal
 *    speech recognition to accurately transcribe spoken detective accusations in real time.
 * 5. Full-Stack Development & Static Production Delivery (startServer):
 *    Mounts Vite middleware for instant full-stack hot reload during development and serves optimized
 *    production bundles with client-side SPA routing fallback.
 * =========================================================================================
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { APP_CONFIG } from './src/config';
import { logFunctionCall, logGenAICall } from './src/utils/logger';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || APP_CONFIG.server.defaultPort;

app.use(express.json({ limit: APP_CONFIG.server.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: APP_CONFIG.server.bodyLimit }));

// CORS middleware allowing embedding in itch.io or external web hosts
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize GoogleGenAI on server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': APP_CONFIG.ai.userAgent,
      },
    },
  });
}

// Suspect Persona system prompts partitioned by case
const CASE_SUSPECT_PERSONAS: Record<string, Record<string, {
  name: string;
  background: string;
  personality: string;
  secret: string;
  baseline: string;
  canonicalAdmissions: Record<string, { triggers: string[]; confessionMeaning: string; biometricAnomaly: any }>;
}>> = {
  'case-01-velvet-ash': {
    'suspect-julian-vance': {
      name: 'Julian Vance',
      background: 'High-Society Art Gallery Director, 38 years old. Bespoke tailored charcoal suit, slicked hair, aristocratic demeanor. American Mid-Atlantic / East Coast accent.',
      personality: 'Machiavellian sociopath / charismatic narcissist. Ice-cold resting pulse (58 bpm), steady unblinking gaze, smooth measured cadence. Never fidgets or panics outwardly. His tells are subtle: a fleeting 140ms right-side smirk asymmetry when he feels superior, sub-vocal pitch drops when lying about finances, and rigid refusal to blink.',
      secret: 'He killed Arthur Sterling. He slipped into the penthouse via the service stairwell (using duplicate key, fibers on stair fire escape match his suit). He severed the basement phone line at 11:15 PM so Sterling could not call for help. He dosed Sterling’s 25-yr Glenmorangie with aconite tincture supplied by Dr. Thorne, and stole $3M municipal bonds and the unfiled will to fund his $75,000 Swiss escrow account.',
      baseline: 'Resting pulse 58 bpm, pitch jitter 2Hz, unwavering gaze. He claims Sterling rang him at 11:30 PM (physically impossible as line was cut at 11:15 PM).',
      canonicalAdmissions: {
        'whereabouts': {
          triggers: ['phone', 'call', '11:15', '11:30', 'cable', 'switchboard', 'severed', 'wire', 'dead line'],
          confessionMeaning: 'Admits the phone call never happened and that he was already at the penthouse earlier around 11:20 PM, though initially claiming he didn’t pour the poison.',
          biometricAnomaly: {
            heartRate: 72,
            pitchJitterHz: 6.8,
            tremorIndex: 20,
            glanceAversion: 26,
            pupilDilationMm: 4.4,
            lipCompression: 58,
            asymmetrySmirk: 68,
            speechLatencySec: 0.9,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Unilateral right-side micro-smirk (140ms)', 'Pupil dilated +0.8mm above baseline'],
            vocalIndicators: ['Sub-vocal laryngeal catch', 'Cadence hesitation on timestamps']
          }
        },
        'key': {
          triggers: ['key', 'stair', 'stairwell', 'wool', 'suit', 'fiber', 'charcoal', 'bespoke', 'fire escape'],
          confessionMeaning: 'Admits he possessed the master service key and used the service stairwell to enter the penthouse, claiming Sterling had given it to him for private appraisals.',
          biometricAnomaly: {
            heartRate: 74,
            pitchJitterHz: 6.2,
            tremorIndex: 18,
            glanceAversion: 22,
            pupilDilationMm: 4.2,
            lipCompression: 62,
            asymmetrySmirk: 55,
            speechLatencySec: 0.85,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Lip compression 62% (effortful suppression)', 'Neck swallowing reflex'],
            vocalIndicators: ['Pitch elevated to 142Hz (+20Hz above baseline)', 'Cadence stutter']
          }
        },
        'poison': {
          triggers: ['poison', 'thorne', 'scotch', 'glenmorangie', 'aconitine', 'aconite', 'tincture', 'wolfsbane', 'chemist'],
          confessionMeaning: 'Breaks and confesses that Dr. Thorne supplied the aconitine tincture, promising it would mimic natural cardiac failure from Sterling’s existing heart condition.',
          biometricAnomaly: {
            heartRate: 78,
            pitchJitterHz: 8.6,
            tremorIndex: 30,
            glanceAversion: 24,
            pupilDilationMm: 4.8,
            lipCompression: 68,
            asymmetrySmirk: 72,
            speechLatencySec: 1.2,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Micro-expression: Asymmetric sneer (right side)', 'Sudden pupil dilation to 4.8mm'],
            vocalIndicators: ['Pitch jitter jumps to 8.6Hz (400% above baseline)', 'Severe vocal fry and stutter']
          }
        }
      }
    },
    'suspect-evelyn-cross': {
      name: 'Evelyn Cross',
      background: 'Concert Pianist & Sterling’s Estranged Niece, 30 years old. Vintage emerald blouse. Speaks with anxious, rapid American English.',
      personality: 'Type-A Anxious Reactive / Neurotic. Resting pulse 94 bpm, 18% vocal tremor, frequent darting glances (44% aversion). Fidgets, stammers, and looks on the verge of panic constantly even when 100% innocent.',
      secret: 'She is completely innocent of the murder. She practiced Chopin at St. Jude Academy until 11:45 PM (corroborated by the proctor and sign-in sheet). She detested Arthur for disinheriting her family, but had nothing to do with poison.',
      baseline: 'High anxiety is her normal state. If accused of lying purely because she shakes or averts her eyes, that is a FALSE POSITIVE. She will defend herself with her conservatory alibi.',
      canonicalAdmissions: {
        'alibi': {
          triggers: ['chopin', 'piano', 'st. jude', 'henderson', 'conservatory', 'proctor', 'practice', 'alibi'],
          confessionMeaning: 'Truthfully explains her airtight conservatory alibi practicing Chopin under proctor Henderson until 11:45 PM, demonstrating her distress is pure trauma.',
          biometricAnomaly: {
            heartRate: 94,
            pitchJitterHz: 14.5,
            tremorIndex: 18,
            glanceAversion: 42,
            pupilDilationMm: 4.8,
            lipCompression: 24,
            asymmetrySmirk: 0,
            speechLatencySec: 0.25,
            anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
            visualIndicators: ['Symmetric tearful distress', 'Direct pleading gaze'],
            vocalIndicators: ['High pitch 220Hz', 'Vocal tremor 18% (calibrated neurotic baseline)']
          }
        }
      }
    },
    'suspect-marcus-drake': {
      name: 'Marcus Drake',
      background: 'Former Chauffeur & Docklands Diesel Mechanic, 45 years old. Worn leather jacket, stubble, cigarette smoke. Gritty working-class American docklands accent.',
      personality: 'Type-S Guarded Cynic / Introverted Stoic. Monotone delivery (98Hz), slow response latency (1.6s pause), 48% glance aversion because he despises police and authority. Steady pulse (70 bpm).',
      secret: 'Innocent of the murder. Was working graveyard shift at Pier 14 repairing tugboat Samson with Captain O’Malley until 2 AM. He hated Sterling for firing him without severance, but didn’t kill him. He saw Dr. Thorne visit Sterling with brown bottles and saw Thorne arguing with Julian Vance.',
      baseline: 'His lack of eye contact and gruff silence is hostility toward badges, NOT deception. Telemetry stays flat and honest.',
      canonicalAdmissions: {
        'alibi': {
          triggers: ['pier 14', 'o\'malley', 'tugboat', 'samson', 'diesel', 'mechanic', 'alibi', 'shift'],
          confessionMeaning: 'Stoutly verifies his pier repair shift with Captain O’Malley until 2 AM, and discloses that he saw Thorne and Vance whispering suspiciously with apothecary bottles.',
          biometricAnomaly: {
            heartRate: 71,
            pitchJitterHz: 3.9,
            tremorIndex: 6,
            glanceAversion: 48,
            pupilDilationMm: 3.4,
            lipCompression: 30,
            asymmetrySmirk: 4,
            speechLatencySec: 1.5,
            anomalyRating: 'BASELINE_NORMAL',
            visualIndicators: ['Stoic gaze toward window (baseline cynicism)', 'Firm jaw'],
            vocalIndicators: ['Flat 98Hz monotone', 'Zero stress jitter']
          }
        }
      }
    },
    'suspect-aris-thorne': {
      name: 'Dr. Aris Thorne',
      background: 'Forensic Toxicologist & Private Physician, 52 years old. Male. Silver spectacles, impeccably tailored formal waistcoat, clipped rapid pedantic baritone American academic delivery.',
      personality: 'Type-O Clinical Detached / Obsessive-Compulsive. Male scholar with a deep, clipped, rapid cadence (0.3s latency) and pedantic medical jargon. Masking paranoia with intellectual arrogance.',
      secret: 'He imported 500ml of crystalline aconitine alkaloid under the alias "A. T. Thorne, MD" (Sub-Rosa Manifest at Warehouse 4). Julian Vance blackmailed him regarding unauthorized clinical trials, forcing him to formulate a tasteless aconite tincture for 25-yr scotch. Thorne gave the vial to Vance at 6:00 PM, but Thorne himself was in his university lab at 11:42 PM.',
      baseline: 'When lying about aconitine or his meetings with Vance, his rapid speech stumbles (latency jumps >2.5s), pitch jitter spikes, and pupils constrict to 2.1mm.',
      canonicalAdmissions: {
        'poison': {
          triggers: ['warehouse', 'manifest', '500ml', 'sub-rosa', 'import', 'consignment', 'alkaloid', 'aconitine', 'aconite'],
          confessionMeaning: 'Admits the Warehouse 4 aconitine consignment was imported under his alias, but claims Vance blackmailed him with an audit threat to force him to hand it over.',
          biometricAnomaly: {
            heartRate: 100,
            pitchJitterHz: 13.5,
            tremorIndex: 38,
            glanceAversion: 35,
            pupilDilationMm: 2.2,
            lipCompression: 76,
            asymmetrySmirk: 32,
            speechLatencySec: 2.6,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Pupil constricts sharply to 2.2mm (acute cognitive stress)', 'Tight lip compression (76%)'],
            vocalIndicators: ['Latency jumped to 2.6s (deviation from 0.3s baseline)', 'Pitch jitter spikes to 13.5Hz']
          }
        },
        'vance': {
          triggers: ['vance', 'julian', 'fifty thousand', 'scotches', 'glenmorangie', 'conspiracy', 'tincture', 'dealings'],
          confessionMeaning: 'Completely breaks down and confesses that Julian Vance promised him fifty thousand dollars to formulate a tasteless aconite tincture for Sterling’s 25-year scotch, threatening to ruin Thorne if he refused.',
          biometricAnomaly: {
            heartRate: 106,
            pitchJitterHz: 15.8,
            tremorIndex: 44,
            glanceAversion: 46,
            pupilDilationMm: 2.1,
            lipCompression: 84,
            asymmetrySmirk: 40,
            speechLatencySec: 2.9,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Pupil pinpoint constriction (2.1mm)', 'Forehead perspiration sheen', 'Swallowing tremor'],
            vocalIndicators: ['Vocal frequency spikes to 184Hz', 'Pitch jitter 15.8Hz', 'Cadence breakdown']
          }
        }
      }
    }
  },
  'case-02-dockland-fog': {
    'suspect-julian-vance': {
      name: 'Julian Vance',
      background: 'High-Society Art Gallery Director, 38 years old. Bespoke tailored charcoal wool coat, imported Turkish Sobranie cigarettes, aristocratic arrogance.',
      personality: 'Machiavellian sociopath / charismatic narcissist. Ice-cold resting pulse (58 bpm), steady unblinking gaze. Tells are fleeting 140ms right-side smirk asymmetry when lying, sub-vocal pitch drops, and pupils dilating to 4.4mm.',
      secret: 'He killed Silas O’Malley. Vance was smuggling forged Renaissance antiquities through Pier 14 from Rotterdam. Dockmaster O’Malley discovered the unauthorized crates and demanded $10,000 in extortion. Vance obtained a vial of purified tubocurarine alkaloid from Dr. Thorne, met O’Malley at Pier 14 at 00:45 AM, signed the manifest under duress, spiked O’Malley’s steel coffee thermos with the curare (leaving Turkish cigarette ash on the lid), stole Marcus Drake’s 1-inch spanner to jam the slipway power breaker and plunge the docks into darkness, and fled while O’Malley succumbed to neuromuscular respiratory paralysis. He has NO connection to Arthur Sterling or Velvet Ash.',
      baseline: 'Resting pulse 58 bpm, pitch jitter 2.1Hz, unwavering gaze. He claims he was in his Mayfair gallery residence all night inspecting Renaissance drawings and never set foot on Pier 14.',
      canonicalAdmissions: {
        'manifest': {
          triggers: ['manifest', 'rotterdam', '00:45', 'notary', 'seal', 'crates', 'office', 'presence', 'wharf', 'docklands'],
          confessionMeaning: 'His composure breaks as he admits being at Pier 14 and signing the manifest at 00:45 AM, claiming O’Malley was shaking him down and threatening to destroy the Renaissance antiquities.',
          biometricAnomaly: {
            heartRate: 74,
            pitchJitterHz: 7.2,
            tremorIndex: 22,
            glanceAversion: 25,
            pupilDilationMm: 4.3,
            lipCompression: 60,
            asymmetrySmirk: 66,
            speechLatencySec: 0.95,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Right-side micro-smirk asymmetry (140ms)', 'Pupils dilated +1.1mm'],
            vocalIndicators: ['Vocal pitch drops to 104Hz', 'Cadence stutter on "milieu"']
          }
        },
        'thermos': {
          triggers: ['thermos', 'coffee', 'ash', 'cigarette', 'turkish', 'sobranie', 'curare', 'tubocurarine', 'lid', 'mug', 'poison'],
          confessionMeaning: 'Vance loses his temper in a furious micro-smirk outburst, admitting he poured Thorne’s tubocurarine vial into O’Malley’s coffee thermos because O’Malley gripped his lapel, before grabbing Marcus’s spanner to jam the breaker and kill the lights.',
          biometricAnomaly: {
            heartRate: 86,
            pitchJitterHz: 9.8,
            tremorIndex: 35,
            glanceAversion: 20,
            pupilDilationMm: 4.6,
            lipCompression: 72,
            asymmetrySmirk: 58,
            speechLatencySec: 1.1,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Jaw muscle clench', 'Micro-smirk twitch on left lip corner'],
            vocalIndicators: ['Cadence acceleration', 'Audible swallow click']
          }
        }
      }
    },
    'suspect-aris-thorne': {
      name: 'Dr. Aris Thorne',
      background: 'Forensic Toxicologist & Botanical Apothecary, 52 years old. Monogrammed linen coat, clinical spectacles, haughty condescending tone.',
      personality: 'Obsessive-Compulsive / Anti-Social Intellectual. Rapid clipped diction (0.3s latency), resting pulse 78 bpm, intense analytical gaze. His tells are anomalous speech latency pauses (>2.0s) and pinpoint pupillary constriction (<2.5mm).',
      secret: 'He supplied Julian Vance with the purified tubocurarine alkaloid solution in the brown pharmaceutical vial found on the sandbar. He claims Vance told him it was merely a temporary paralytic to incapacitate dockmaster O’Malley while retrieving impounded Rotterdam antiquities crates, but he knew the dose was lethal. He has NO connection to Arthur Sterling or Velvet Ash.',
      baseline: 'Rapid clinical jargon and disdain. Deception anomaly appears when confronted with the sandbar bottle.',
      canonicalAdmissions: {
        'poison': {
          triggers: ['sandbar', 'vial', 'curare', 'tubocurarine', 'bottle', 'latin', 'dispensary', 'chondrodendron', 'shard'],
          confessionMeaning: 'Breaks down under the weight of the sandbar vial and admits synthesizing the tubocurarine for Vance, but hysterically insists Vance promised it was only an incapacitating draft so they could clear the impounded crates.',
          biometricAnomaly: {
            heartRate: 98,
            pitchJitterHz: 14.5,
            tremorIndex: 38,
            glanceAversion: 40,
            pupilDilationMm: 2.2,
            lipCompression: 78,
            asymmetrySmirk: 35,
            speechLatencySec: 2.6,
            anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
            visualIndicators: ['Pinpoint pupillary constriction (2.2mm)', 'Perspiration bead on brow'],
            vocalIndicators: ['Pitch jitter jumps to 14.5Hz', 'Prolonged 2.6s latency before speaking']
          }
        }
      }
    },
    'suspect-marcus-drake': {
      name: 'Marcus Drake',
      background: 'Slipway Diesel Mechanic & Machinist at Pier 14, 45 years old. Combat veteran of the Pacific theater. Greasy work overalls, hardened hands, flat laconic delivery.',
      personality: 'Introverted / Emotionally Guarded Stoic. 70 bpm steady pulse, high eye aversion (48%) due to hatred of police authority, monotone voice. His tells are drops in vocal volume, sudden pupil flares to >5mm, and hurried one-word dismissals.',
      secret: 'He is completely innocent of the murder. He was in the upper machine loft rebuilding a diesel fuel pump for tugboat Samson during the blackout. Dockmaster O’Malley had docked his pay, but Marcus never touched the coffee or the breaker. Someone stole his 1-inch machinist spanner from his open workbench to jam the breaker.',
      baseline: 'Eye aversion and curt replies are his normal defense against badges. Not a sign of guilt unless pulse spikes.',
      canonicalAdmissions: {
        'alibi': {
          triggers: ['spanner', 'loft', 'wrench', 'breaker', 'diesel', 'samson', 'fuse', 'switch'],
          confessionMeaning: 'Firmly explains someone walked into his machine loft and stole his 1-inch spanner from his bench while he was working on the Samson diesel pump, and he heard hurried footsteps running toward the street when the lights cut out.',
          biometricAnomaly: {
            heartRate: 72,
            pitchJitterHz: 4.1,
            tremorIndex: 7,
            glanceAversion: 50,
            pupilDilationMm: 3.5,
            lipCompression: 32,
            asymmetrySmirk: 5,
            speechLatencySec: 1.6,
            anomalyRating: 'BASELINE_NORMAL',
            visualIndicators: ['Direct defiant posture', 'Normal respiration'],
            vocalIndicators: ['Gravelly, steady cadence', 'No pitch anomaly']
          }
        }
      }
    }
  }
};

/**
 * Express Route Handler: Live Conversational Interrogation
 * Receives detective questions, evaluates against case-partitioned persona,
 * checks for contradiction triggers, calls Gemini model (or deterministic fallback),
 * synthesizes vintage spoken audio, and responds with dialogue & biometric readings.
 * 
 * @param req - Express request containing { suspectId, message, chatHistory, caseId }
 * @param res - Express response returning { text, biometricReading, audioBase64 }
 */
app.post('/api/chat-suspect', async (req, res) => {
  try {
    const { suspectId, message, chatHistory = [], caseId = 'case-01-velvet-ash' } = req.body;
    logFunctionCall('POST /api/chat-suspect', {
      suspectId,
      message,
      caseId,
      historyLength: Array.isArray(chatHistory) ? chatHistory.length : 0,
    });

    const casePersonas = CASE_SUSPECT_PERSONAS[caseId] || CASE_SUSPECT_PERSONAS['case-01-velvet-ash'];
    const persona = casePersonas[suspectId] || Object.values(casePersonas)[0];

    let aiResponseText = '';
    let biometricData: {
      heartRate: number;
      pitchJitterHz: number;
      tremorIndex: number;
      glanceAversion: number;
      pupilDilationMm: number;
      lipCompression: number;
      asymmetrySmirk: number;
      speechLatencySec: number;
      anomalyRating: 'BASELINE_NORMAL' | 'ELEVATED_ANXIETY_WITHIN_BASELINE' | 'CRITICAL_DECEPTION_ANOMALY';
      visualIndicators: string[];
      vocalIndicators: string[];
      isCracked?: boolean;
      crackedTopic?: string;
    } | null = null;

    if (ai) {
      // Check if message hits canonical case admission triggers
      const lowerMsg = message.toLowerCase();
      let matchedCanonicalTopic = '';
      let matchedCanonicalEntry: any = null;

      if (persona.canonicalAdmissions) {
        for (const [topicKey, entry] of Object.entries(persona.canonicalAdmissions)) {
          if (entry.triggers.some((trig: string) => lowerMsg.includes(trig))) {
            matchedCanonicalTopic = topicKey;
            matchedCanonicalEntry = entry;
            break;
          }
        }
      }

      let canonicalConstraint = '';
      if (matchedCanonicalTopic && matchedCanonicalEntry) {
        canonicalConstraint = `
CRITICAL INSTRUCTION - THE DETECTIVE HAS HIT A FATAL CASE CONTRADICTION:
The detective's prompt challenges you on "${matchedCanonicalTopic}".
You MUST CRACK and ADMIT to this truth in your own words.
REQUIRED MEANING OF YOUR SPOKEN RESPONSE:
"${matchedCanonicalEntry.confessionMeaning}"
You do not need to use the exact words, but the meaning of your response MUST BE THE SAME as this admission.
You MUST set "isCracked": true and "crackedTopic": "${matchedCanonicalTopic}".
You MUST set "anomalyRating": "${matchedCanonicalEntry.biometricAnomaly.anomalyRating}".
You MUST reflect severe biometric anomalies matching: heartRate: ${matchedCanonicalEntry.biometricAnomaly.heartRate}, pitchJitterHz: ${matchedCanonicalEntry.biometricAnomaly.pitchJitterHz}, pupilDilationMm: ${matchedCanonicalEntry.biometricAnomaly.pupilDilationMm}, asymmetrySmirk: ${matchedCanonicalEntry.biometricAnomaly.asymmetrySmirk}.
`;
      }

      const caseContext = caseId === 'case-02-dockland-fog'
        ? 'Case: The Pier 14 Blackout (Victim: Silas O’Malley, tugboat master poisoned by tubocurarine at Berth 4). This case has absolutely ZERO connection to Arthur Sterling, Velvet Ash, or penthouses.'
        : 'Case: The Velvet Ash Murder (Victim: Arthur Sterling, poisoned by aconitine in his penthouse study).';

      const systemInstruction = `You are roleplaying as ${persona.name} in a gritty 1940s noir detective interrogation room.
${caseContext}
Character Details:
- Background: ${persona.background}
- Personality & Biometrics: ${persona.personality}
- The Truth / Secret: ${persona.secret}
- Baseline Profile: ${persona.baseline}
${canonicalConstraint}
The user is the Detective interrogating you.
Rules:
1. Stay strictly in-character as ${persona.name}. Speak in natural, hardboiled 1940s American English dialogue (2-4 sentences max). Never mention characters or events from other cases!
2. If the user presents solid evidence or accurately calls out your biometric tells, you must feel cornered, your facade cracks, and you MUST admit the matching confession!
3. If the user makes a vague or false accusation, deflect with your characteristic attitude.
4. Output your answer strictly as a JSON object adhering to this schema:
{
  "speech": "What the suspect speaks out loud in American English",
  "heartRate": number,
  "pitchJitterHz": number,
  "tremorIndex": number (0-100),
  "glanceAversion": number (0-100),
  "pupilDilationMm": number,
  "lipCompression": number (0-100),
  "asymmetrySmirk": number (0-100),
  "speechLatencySec": number,
  "anomalyRating": "BASELINE_NORMAL" | "ELEVATED_ANXIETY_WITHIN_BASELINE" | "CRITICAL_DECEPTION_ANOMALY",
  "visualIndicators": ["1-2 detected micro facial cues"],
  "vocalIndicators": ["1-2 detected vocal frequency cues"],
  "isCracked": boolean (true if user's argument broke your alibi or forced a confession),
  "crackedTopic": "manifest" | "thermos" | "whereabouts" | "poison" | "key" | "alibi" | "none"
}`;

      const historyFormatted = chatHistory.slice(-APP_CONFIG.ai.chatHistoryLimit).map((msg: { sender: string; text: string }) => ({
        role: msg.sender === 'detective' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const contents = [
        ...historyFormatted,
        { role: 'user', parts: [{ text: message }] }
      ];

      const genConfig = {
        systemInstruction,
        responseMimeType: APP_CONFIG.ai.responseMimeType,
        temperature: APP_CONFIG.ai.temperature,
      };

      const response = await ai.models.generateContent({
        model: APP_CONFIG.ai.primaryModel,
        contents: contents,
        config: genConfig,
      });

      const responseText = response.text || '';
      logGenAICall({
        model: APP_CONFIG.ai.primaryModel,
        promptOrContents: contents,
        config: genConfig,
        output: responseText,
      });
      try {
        const parsed = JSON.parse(responseText.trim());
        aiResponseText = parsed.speech || '';
        biometricData = {
          heartRate: parsed.heartRate || 68,
          pitchJitterHz: parsed.pitchJitterHz || 4.0,
          tremorIndex: parsed.tremorIndex || 10,
          glanceAversion: parsed.glanceAversion || 20,
          pupilDilationMm: parsed.pupilDilationMm || 3.5,
          lipCompression: parsed.lipCompression || 25,
          asymmetrySmirk: parsed.asymmetrySmirk || 15,
          speechLatencySec: parsed.speechLatencySec || 0.6,
          anomalyRating: parsed.anomalyRating || 'BASELINE_NORMAL',
          visualIndicators: parsed.visualIndicators || ['Direct gaze maintained'],
          vocalIndicators: parsed.vocalIndicators || ['Steady vocal timbre'],
          isCracked: parsed.isCracked || false,
          crackedTopic: parsed.crackedTopic || 'none'
        };
      } catch {
        aiResponseText = responseText;
      }
    }

    // High quality deterministic fallback if no Gemini key or parse error
    if (!aiResponseText) {
      const lower = message.toLowerCase();

      if (caseId === 'case-02-dockland-fog') {
        // CASE 2: The Pier 14 Blackout (Silas O'Malley)
        if (suspectId === 'suspect-julian-vance') {
          if (lower.includes('manifest') || lower.includes('rotterdam') || lower.includes('crates') || lower.includes('00:45') || lower.includes('notary') || lower.includes('seal') || lower.includes('wharf')) {
            aiResponseText = "The dockmaster's manifest? Silas O’Malley was shaking me down! He threatened to throw my Renaissance crates into the harbor if I didn't pay him ten thousand dollars right there at midnight!";
            biometricData = {
              heartRate: 74,
              pitchJitterHz: 7.2,
              tremorIndex: 22,
              glanceAversion: 25,
              pupilDilationMm: 4.3,
              lipCompression: 60,
              asymmetrySmirk: 66,
              speechLatencySec: 0.95,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Right-side micro-smirk asymmetry (140ms)', 'Pupils dilated +1.1mm'],
              vocalIndicators: ['Vocal pitch drops to 104Hz', 'Cadence stutter on "milieu"'],
              isCracked: true,
              crackedTopic: 'manifest'
            };
          } else if (lower.includes('thermos') || lower.includes('coffee') || lower.includes('ash') || lower.includes('sobranie') || lower.includes('turkish') || lower.includes('curare') || lower.includes('tubocurarine') || lower.includes('poison')) {
            aiResponseText = "O’Malley lunged at me in the dark! He had his hands around my lapel choking me—I only tipped Thorne's vial into his thermos so he would release his grip and let me reach the exit!";
            biometricData = {
              heartRate: 86,
              pitchJitterHz: 9.8,
              tremorIndex: 35,
              glanceAversion: 20,
              pupilDilationMm: 4.6,
              lipCompression: 72,
              asymmetrySmirk: 58,
              speechLatencySec: 1.1,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Jaw muscle clench', 'Micro-smirk twitch on left lip corner'],
              vocalIndicators: ['Cadence acceleration', 'Audible swallow click'],
              isCracked: true,
              crackedTopic: 'thermos'
            };
          } else {
            aiResponseText = "I am an art connoisseur of international standing, Detective. Silas O’Malley’s sordid end near the slipway winch has nothing whatsoever to do with me or my gallery.";
            biometricData = {
              heartRate: 58,
              pitchJitterHz: 2.1,
              tremorIndex: 3,
              glanceAversion: 7,
              pupilDilationMm: 3.3,
              lipCompression: 14,
              asymmetrySmirk: 10,
              speechLatencySec: 0.4,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Smooth composed posture', 'Direct aristocratic eye lock'],
              vocalIndicators: ['Smooth resonant timbre'],
              isCracked: false
            };
          }
        } else if (suspectId === 'suspect-aris-thorne') {
          if (lower.includes('vial') || lower.includes('sandbar') || lower.includes('bottle') || lower.includes('curare') || lower.includes('tubocurarine') || lower.includes('dispensary') || lower.includes('chondrodendron')) {
            aiResponseText = "Julian Vance swore on his word it was merely an incapacitating draft to knock the dockmaster unconscious while clearing the impounded crates! I had no desire for O’Malley to suffer respiratory arrest!";
            biometricData = {
              heartRate: 98,
              pitchJitterHz: 14.5,
              tremorIndex: 38,
              glanceAversion: 40,
              pupilDilationMm: 2.2,
              lipCompression: 78,
              asymmetrySmirk: 35,
              speechLatencySec: 2.6,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Pinpoint pupillary constriction (2.2mm)', 'Perspiration bead on brow'],
              vocalIndicators: ['Pitch jitter jumps to 14.5Hz', 'Prolonged 2.6s latency before speaking'],
              isCracked: true,
              crackedTopic: 'poison'
            };
          } else {
            aiResponseText = "Silas O’Malley's death was acute neuromuscular paralysis from curare alkaloids. Inquire with Chief Medical Examiner Dr. Vane; I was cataloging reagents in my university laboratory.";
            biometricData = {
              heartRate: 78,
              pitchJitterHz: 4.8,
              tremorIndex: 7,
              glanceAversion: 12,
              pupilDilationMm: 3.6,
              lipCompression: 19,
              asymmetrySmirk: 12,
              speechLatencySec: 0.3,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Direct analytical gaze', 'Steady respiration'],
              vocalIndicators: ['Sharp diction', 'No latency hesitation'],
              isCracked: false
            };
          }
        } else {
          // suspect-marcus-drake in Case 2
          if (lower.includes('spanner') || lower.includes('breaker') || lower.includes('wrench') || lower.includes('switch') || lower.includes('blackout')) {
            aiResponseText = "My heavy machinist spanner was on the open workbench in the loft. Anyone could have snatched it while I was lapping diesel fuel valves on the Samson.";
            biometricData = {
              heartRate: 72,
              pitchJitterHz: 4.1,
              tremorIndex: 7,
              glanceAversion: 50,
              pupilDilationMm: 3.5,
              lipCompression: 32,
              asymmetrySmirk: 5,
              speechLatencySec: 1.6,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Direct defiant posture', 'Normal respiration'],
              vocalIndicators: ['Gravelly, steady cadence', 'No pitch anomaly'],
              isCracked: false
            };
          } else {
            aiResponseText = "O’Malley docked my pay, sure, but I don't poison men's coffee thermoses. You want answers, look into that fancy art dealer Vance who was pacing near Berth 4.";
            biometricData = {
              heartRate: 70,
              pitchJitterHz: 3.8,
              tremorIndex: 5,
              glanceAversion: 48,
              pupilDilationMm: 3.4,
              lipCompression: 30,
              asymmetrySmirk: 4,
              speechLatencySec: 1.5,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Stoic gaze toward window', 'Firm jaw'],
              vocalIndicators: ['Flat 98Hz monotone', 'Zero stress jitter'],
              isCracked: false
            };
          }
        }
      } else {
        // CASE 1: The Velvet Ash Murder (Arthur Sterling)
        if (suspectId === 'suspect-julian-vance') {
          if (lower.includes('phone') || lower.includes('call') || lower.includes('switchboard') || lower.includes('cable') || lower.includes('11:15') || lower.includes('11:30')) {
            aiResponseText = "The phone line? What nonsense are you insinuating, Detective? Arthur rang me, I'm certain of it... unless someone tampered with the line before I arrived.";
            biometricData = {
              heartRate: 72,
              pitchJitterHz: 6.8,
              tremorIndex: 18,
              glanceAversion: 24,
              pupilDilationMm: 4.2,
              lipCompression: 55,
              asymmetrySmirk: 65,
              speechLatencySec: 0.9,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Unilateral right-side micro-smirk (130ms)', 'Blink rate frozen'],
              vocalIndicators: ['Pitch drop into sub-vocal laryngeal register', 'Cadence stutter'],
              isCracked: true,
              crackedTopic: 'whereabouts'
            };
          } else if (lower.includes('poison') || lower.includes('thorne') || lower.includes('scotch') || lower.includes('aconitine') || lower.includes('wolfsbane')) {
            aiResponseText = "Dr. Thorne is an imaginative man when cornered by police badges. Anything he claims to have given me was purely a medicinal tonic for Arthur's angina.";
            biometricData = {
              heartRate: 75,
              pitchJitterHz: 8.2,
              tremorIndex: 26,
              glanceAversion: 28,
              pupilDilationMm: 4.6,
              lipCompression: 68,
              asymmetrySmirk: 75,
              speechLatencySec: 1.2,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Right zygomatic micro-contraction', 'Swallowing reflex'],
              vocalIndicators: ['Pitch jitter jumps 8.2Hz', 'Vocal fry detected'],
              isCracked: true,
              crackedTopic: 'poison'
            };
          } else if (lower.includes('key') || lower.includes('stair') || lower.includes('wool') || lower.includes('suit') || lower.includes('fiber')) {
            aiResponseText = "Charcoal wool? Half of the gentlemen at the Bellevue Club wear bespoke English charcoal wool. You're grasping at threads, Detective.";
            biometricData = {
              heartRate: 69,
              pitchJitterHz: 5.4,
              tremorIndex: 15,
              glanceAversion: 18,
              pupilDilationMm: 4.0,
              lipCompression: 48,
              asymmetrySmirk: 50,
              speechLatencySec: 0.8,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Lip compression 48%', 'Subtle neck tension'],
              vocalIndicators: ['Elevated pitch 140Hz', 'Mild laryngeal constriction'],
              isCracked: true,
              crackedTopic: 'key'
            };
          } else {
            aiResponseText = "I have cooperated fully with your department. Arthur Sterling was an esteemed patron of my gallery, and his passing is a cultural catastrophe.";
            biometricData = {
              heartRate: 59,
              pitchJitterHz: 2.2,
              tremorIndex: 4,
              glanceAversion: 6,
              pupilDilationMm: 3.2,
              lipCompression: 12,
              asymmetrySmirk: 8,
              speechLatencySec: 0.4,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Smooth composed baseline posture', 'Direct eye lock'],
              vocalIndicators: ['Smooth resonant aristocratic timbre'],
              isCracked: false
            };
          }
        } else if (suspectId === 'suspect-evelyn-cross') {
          if (lower.includes('kill') || lower.includes('poison') || lower.includes('guilty')) {
            aiResponseText = "How can you say that?! Look at my hands, I can barely hold my sheet music! Mr. Henderson at St. Jude saw me at the piano until eleven-forty-five!";
            biometricData = {
              heartRate: 97,
              pitchJitterHz: 15.2,
              tremorIndex: 21,
              glanceAversion: 46,
              pupilDilationMm: 4.9,
              lipCompression: 28,
              asymmetrySmirk: 0,
              speechLatencySec: 0.2,
              anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
              visualIndicators: ['Tearful distress (symmetric forehead)', 'Trembling fingers'],
              vocalIndicators: ['High pitch 225Hz', 'Vocal tremor 21% (within neurotic baseline)'],
              isCracked: false
            };
          } else {
            aiResponseText = "Uncle Arthur was so bitter toward everyone... Julian Vance kept asking questions about the safe, but Uncle Arthur wouldn't listen to anyone.";
            biometricData = {
              heartRate: 93,
              pitchJitterHz: 13.8,
              tremorIndex: 17,
              glanceAversion: 40,
              pupilDilationMm: 4.7,
              lipCompression: 22,
              asymmetrySmirk: 0,
              speechLatencySec: 0.25,
              anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
              visualIndicators: ['Rapid blinking (within panic baseline)', 'Direct pleading glance'],
              vocalIndicators: ['Emotional honest cadence'],
              isCracked: false
            };
          }
        } else if (suspectId === 'suspect-marcus-drake') {
          if (lower.includes('eye') || lower.includes('look at me') || lower.includes('nervous')) {
            aiResponseText = "I don't look at badges because badges don't look at working men. You want to know where I was? Call Captain O'Malley at Pier 14. We were up to our elbows in diesel.";
            biometricData = {
              heartRate: 70,
              pitchJitterHz: 3.8,
              tremorIndex: 5,
              glanceAversion: 52,
              pupilDilationMm: 3.4,
              lipCompression: 32,
              asymmetrySmirk: 4,
              speechLatencySec: 1.6,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Stoic gaze toward window (baseline cynicism)', 'Firm jaw'],
              vocalIndicators: ['Flat 98Hz monotone', 'Zero stress jitter'],
              isCracked: false
            };
          } else {
            aiResponseText = "Sterling was a tyrant who cheated his help. But I didn't poison him. If you want the truth, keep an eye on that sleek gallery fellow, Vance.";
            biometricData = {
              heartRate: 72,
              pitchJitterHz: 4.0,
              tremorIndex: 6,
              glanceAversion: 46,
              pupilDilationMm: 3.5,
              lipCompression: 29,
              asymmetrySmirk: 5,
              speechLatencySec: 1.5,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Composed blunt expression', 'Steady breathing'],
              vocalIndicators: ['Gravelly resonant timber'],
              isCracked: false
            };
          }
        } else {
          // Dr. Aris Thorne in Case 1
          if (lower.includes('warehouse') || lower.includes('manifest') || lower.includes('aconitine') || lower.includes('order')) {
            aiResponseText = "Good heavens... that manifest was confidential botanical research! Vance had evidence of my clinical trials—he forced me to prepare the aconitine tincture!";
            biometricData = {
              heartRate: 102,
              pitchJitterHz: 14.8,
              tremorIndex: 38,
              glanceAversion: 36,
              pupilDilationMm: 2.2,
              lipCompression: 78,
              asymmetrySmirk: 30,
              speechLatencySec: 2.7,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Pupil constricts to 2.2mm (acute stress)', 'Perspiration sheen'],
              vocalIndicators: ['Latency jumped to 2.7s', 'Pitch jitter spike 14.8Hz'],
              isCracked: true,
              crackedTopic: 'poison'
            };
          } else {
            aiResponseText = "As a fellow of the Royal College, I assure you my administration of digitalis was by the book. I have no patience for laymen questioning my toxicology.";
            biometricData = {
              heartRate: 79,
              pitchJitterHz: 4.8,
              tremorIndex: 8,
              glanceAversion: 12,
              pupilDilationMm: 3.6,
              lipCompression: 22,
              asymmetrySmirk: 14,
              speechLatencySec: 0.3,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Clipped clinical stare', 'Rigid academic posture'],
              vocalIndicators: ['Rapid articulate cadence'],
              isCracked: false
            };
          }
        }
      }
    }

    // Generate real human sounding speech audio using Gemini TTS
    let audioBase64: string | null = null;
    if (aiResponseText) {
      audioBase64 = await generateGeminiSpeechAudio(aiResponseText, suspectId);
    }

    res.json({
      text: aiResponseText,
      biometricReading: biometricData,
      audioBase64,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    res.status(500).json({ error: errorMsg });
  }
});

/**
 * Synthesizes vintage film-noir spoken audio for a suspect response using Gemini TTS.
 * 
 * @param text - Spoken dialogue text to synthesize
 * @param suspectId - Identifier of the suspect to select corresponding voice and style prompt
 * @returns Base64 encoded audio string or null if synthesis fails
 */
async function generateGeminiSpeechAudio(text: string, suspectId: string): Promise<string | null> {
  logFunctionCall('generateGeminiSpeechAudio', { suspectId, textLength: text?.length });
  if (!ai) return null;
  try {
    const voiceName = (APP_CONFIG.ai.ttsVoiceMap as Record<string, string>)[suspectId] || 'Charon';
    
    // Strip redundant markdown quotes or bracketed meta tags from incoming dialogue
    const cleanDialogue = text.replace(/^[«"']+|[»"']+$/g, '').trim().slice(0, 420);

    // Frame speech text with dramatic film-noir character performance direction to prevent monotonous delivery
    let performanceText = cleanDialogue;
    if (suspectId === 'suspect-evelyn-cross') {
      performanceText = `(Speaking with intense trembling anxiety, breathless vulnerability, emotional pitch shifts, and high vocal strain): "${cleanDialogue}"`;
    } else if (suspectId === 'suspect-julian-vance') {
      performanceText = `(Speaking with theatrical aristocratic arrogance, silky condescension, disdainful smirks, and dramatic film noir cadence): "${cleanDialogue}"`;
    } else if (suspectId === 'suspect-marcus-drake') {
      performanceText = `(Speaking with deep gravelly blue-collar gruffness, world-weary docklands cynicism, low raspy resonance, and blunt defiance): "${cleanDialogue}"`;
    } else if (suspectId === 'suspect-aris-thorne') {
      performanceText = `(Speaking with cold clinical intellectualism, sharp pedantic cadence, haughty medical superiority, and crisp articulate diction): "${cleanDialogue}"`;
    }

    const ttsContents = [
      {
        role: 'user',
        parts: [
          {
            text: performanceText,
          },
        ],
      },
    ];

    const ttsGenConfig = {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    };

    const response = await ai.models.generateContent({
      model: APP_CONFIG.ai.ttsModel,
      contents: ttsContents,
      config: ttsGenConfig,
    });

    logGenAICall({
      model: APP_CONFIG.ai.ttsModel,
      promptOrContents: ttsContents,
      config: ttsGenConfig,
      output: response.candidates?.[0]?.content?.parts?.[0],
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.error('Gemini TTS error:', err);
    return null;
  }
}

/**
 * Express Route Handler: Speech Audio Generation Endpoint
 * Generates spoken voice audio for any text or suspect statement on demand.
 * 
 * @param req - Express request containing { text, suspectId }
 * @param res - Express response returning { audioBase64 }
 */
app.post('/api/speak', async (req, res) => {
  try {
    const { text, suspectId } = req.body;
    logFunctionCall('POST /api/speak', { suspectId, textLength: text?.length });
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }
    const audioBase64 = await generateGeminiSpeechAudio(text, suspectId || 'suspect-julian-vance');
    res.json({ audioBase64 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Speech error';
    res.status(500).json({ error: errorMsg });
  }
});

/**
 * Express Route Handler: Microphone Audio Transcription Endpoint
 * Uses Gemini multimodal speech understanding to transcribe investigator's voice.
 * 
 * @param req - Express request containing { audioBase64, mimeType }
 * @param res - Express response returning { transcription, cleanMime }
 */
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    logFunctionCall('POST /api/transcribe', { mimeType, audioChars: audioBase64?.length });
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data required' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Gemini AI not initialized' });
    }

    // Clean MIME type, removing codec parameters if present (e.g., 'audio/ogg;codecs=opus' -> 'audio/ogg')
    const rawMime = mimeType || 'audio/webm';
    const cleanMime = rawMime.split(';')[0].trim().toLowerCase();

    console.log(`[Transcribe] Received audio chunk, mime: ${rawMime} -> clean: ${cleanMime}, size: ${audioBase64.length} chars`);

    const transcribeContents = [
      {
        inlineData: {
          mimeType: cleanMime,
          data: audioBase64,
        },
      },
      {
        text: 'Listen to this spoken detective question or accusation. Accurately transcribe what was spoken into clear English text. Return ONLY the transcribed text. Do not add quotes, markdown, brackets, or conversational preamble. If the audio contains only ambient silence, background clicks, or unintelligible noise, return exactly an empty string.',
      },
    ];

    const response = await ai.models.generateContent({
      model: APP_CONFIG.ai.primaryModel,
      contents: transcribeContents,
    });

    logGenAICall({
      model: APP_CONFIG.ai.primaryModel,
      promptOrContents: transcribeContents,
      config: undefined,
      output: response.text,
    });

    const transcription = response.text?.trim() || '';
    console.log(`[Transcribe] Success result: "${transcription}"`);
    res.json({ transcription, cleanMime });
  } catch (err: unknown) {
    console.error('[Transcribe] Audio transcription error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Transcription failed';
    res.status(500).json({ error: errorMsg });
  }
});

/**
 * Express Route Handler: Download Itch.io Game ZIP Package
 * Serves the compiled production HTML5 zip archive ready for direct upload to itch.io.
 */
app.get('/download-game-zip', (_req, res) => {
  logFunctionCall('GET /download-game-zip');
  const zipPath = path.join(__dirname, 'detective-stories-itch.zip');
  res.download(zipPath, 'detective-stories-itch.zip');
});

/**
 * Express Route Handler: Download Itch.io Game ZIP Package (static path alias)
 */
app.get('/detective-stories-itch.zip', (_req, res) => {
  logFunctionCall('GET /detective-stories-itch.zip');
  const zipPath = path.join(__dirname, 'detective-stories-itch.zip');
  res.download(zipPath, 'detective-stories-itch.zip');
});

/**
 * Initializes full-stack Express server, mounting Vite SPA middleware in development
 * and serving optimized static assets in production mode.
 */
async function startServer(): Promise<void> {
  logFunctionCall('startServer', { nodeEnv: process.env.NODE_ENV, port: PORT });
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
