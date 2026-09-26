/**
 * =========================================================================================
 * Precinct 8 Homicide Archives: Canonical Cold Case Database
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This dataset defines the canonical murder cases investigated by the player in Detective Stories.
 * It contains exhaustive, unredacted dossiers, crime scene forensic analyses, coroner toxicology
 * reports, evidence exhibits, and psychological suspect profiles. Each case operates as a self-contained,
 * decoupled investigative sandbox with independent characters, clues, timelines, and judicial solutions.
 * 
 * DIFFERENT USE CASES:
 * 1. Case 1: 'The Velvet Ash Murder' (Penthouse Poisoning of Arthur Sterling):
 *    Investigating the death of industrialist Arthur Sterling, poisoned by purified aconitine in his
 *    Glenmorangie scotch. Features suspects Julian Vance (art gallery director), Evelyn Cross (concert pianist),
 *    Marcus Drake (chauffeur), and Dr. Aris Thorne (apothecary). Clues center on the severed 11:15 PM
 *    switchboard telephone line, duplicate master keycard, and Swiss escrow deposits.
 * 2. Case 2: 'The Pier 14 Blackout' (Smuggler's Slipway Murder of Silas O'Malley):
 *    Investigating the dockland death of tugboat master Silas O'Malley, murdered via tubocurarine
 *    spiked into his coffee thermos during a deliberate power outage. Features Julian Vance (antiquities smuggler),
 *    Marcus Drake (machinist in the upper loft), and Dr. Aris Thorne (forensic toxicologist). Clues center on
 *    the impounded Rotterdam manifest countersigned at 00:45 AM, the jammed breaker switch, and Turkish cigarette ash.
 * 3. Case Isolation & Dynamic Decoupling:
 *    Ensures that suspects with identical names appearing across different historical investigations
 *    (e.g., Julian Vance in 1948 Mayfair vs 1948 Pier 14) retain independent motives, secrets, and crime scenes
 *    without cross-contamination.
 * 4. Forensic Evidence & Interrogation Statement Binding:
 *    Links each exhibit in the Evidence Locker directly to suspect lies, enabling contradictions to be
 *    proven and statements to be cracked during live interrogation.
 * =========================================================================================
 */

import { ColdCase } from '../types/game';

/**
 * Master catalog of all available cold case files stored in the Precinct 8 archive.
 */
export const COLD_CASES: ColdCase[] = [
  {
    id: 'case-01-velvet-ash',
    caseNumber: 'COLD-1948-0914',
    title: 'The Velvet Ash Murder',
    subtitle: 'The Penthouse Study Poisoning of Arthur Sterling',
    incidentDate: 'November 14, 1948 · 23:42 EST',
    location: 'Sterling Heights Penthouse, 88 Blackwood Terrace',
    status: 'REOPENED',
    summary:
      'Industrialist and art patron Arthur Sterling was discovered slumped over his mahogany desk in a locked 14th-floor library. The autopsy revealed lethal aconitine poisoning administered inside his rare vintage scotch. The master key was found discarded on the service stairs. Three million in municipal bonds and Sterling’s unfiled will were missing from the wall safe.',
    crimeSceneDossier:
      'The penthouse library door was locked from the outside with the mechanical deadbolt. A crystal tumbler on the desk held remnants of 25-year Glenmorangie infused with purified aconitine alkaloid (wolfsbane extract). Arthur Sterling’s vintage gold pocket watch was shattered on the floor, its hands frozen at 11:42 PM. The study window looking onto the fire escape was bolted from within. A telephone receiver hung off the cradle on the foyer sideboard.',
    coronerReport:
      'Coroner Dr. Langford confirms death occurred between 11:35 PM and 11:55 PM due to sudden cardiac arrhythmia induced by purified aconitine. Gastric absorption indicates ingestion occurred 10 to 20 minutes prior to collapse. No physical marks of struggle or blunt force trauma were found.',
    autopsyReportNumber: 'CTX-881 · Penthouse Division',
    timelineMilestones: [
      { time: '23:15', description: 'Penthouse telephone cable severed at basement switchboard.' },
      { time: '23:25', description: 'Estimated aconitine ingestion window (10-20 min before collapse).' },
      { time: '23:42', description: 'Sterling’s gold pocket watch violently crushed on library rug.', isCritical: true },
      { time: '00:00', description: 'Julian Vance claims he arrived at the penthouse door.' }
    ],
    evidence: [
      {
        id: 'ev-phone-log',
        title: 'Switchboard Cable Cut Log',
        type: 'document',
        timestampOrDate: 'Nov 14, 1948 · 23:15 EST',
        locationFound: 'Basement Telephone Junction Box',
        description: 'Central telephone exchange log showing the line to Penthouse 14 was physically severed from the junction box at exactly 11:15 PM.',
        forensicSignificance: 'Any suspect claiming to have had a telephone conversation with Arthur Sterling in the penthouse after 11:15 PM is fabricating their testimony.'
      },
      {
        id: 'ev-crushed-watch',
        title: 'Shattered Gold Pocket Watch',
        type: 'physical',
        timestampOrDate: 'Nov 14, 1948 · 23:42 EST',
        locationFound: 'Penthouse Library Rug',
        description: 'Sterling’s 18k Patek Philippe pocket watch, shattered by impact with the brass desk claw. The mechanical balance wheel froze at 11:42 PM.',
        forensicSignificance: 'Fixes the physical struggle or collapse of the victim precisely at 11:42 PM.'
      },
      {
        id: 'ev-conservatory-log',
        title: 'Conservatory Rehearsal Sign-in Sheet',
        type: 'document',
        timestampOrDate: 'Nov 14, 1948 · 20:30 - 23:45 EST',
        locationFound: 'St. Jude Academy of Music',
        description: 'Official stage-door sign-in roster signed by the night proctor, noting Evelyn Cross practiced in Hall B until 23:45 EST.',
        forensicSignificance: 'Provides an unbroken external alibi for Evelyn Cross during the estimated time of death.'
      },
      {
        id: 'ev-warehouse-manifest',
        title: 'Sub-Rosa Chemical Manifest',
        type: 'forensics',
        timestampOrDate: 'Nov 02, 1948',
        locationFound: 'Industrial Docklands Warehouse 4',
        description: 'Customs impound manifest for 500ml of crystalline aconitine alkaloid consigned under the alias "A. T. Thorne, MD".',
        forensicSignificance: 'Direct physical proof linking Dr. Aris Thorne to the procurement of the lethal poison used in the crime.'
      },
      {
        id: 'ev-master-keycard',
        title: 'Oiled Service Stairwell Master Key',
        type: 'physical',
        timestampOrDate: 'Nov 15, 1948 · 02:00 EST',
        locationFound: '3rd Floor Fire Escape Landing',
        description: 'The brass master service key to the penthouse suite, bearing faint traces of charcoal wool fiber matching high-end tailored suiting.',
        forensicSignificance: 'Disproves the theory that an intruder forced entry; the perpetrator possessed the service key and wore fine tailored fabric.'
      },
      {
        id: 'ev-bank-deposit',
        title: 'Offshore Escrow Transfer Slip',
        type: 'document',
        timestampOrDate: 'Nov 12, 1948',
        locationFound: 'Julian Vance Art Gallery Desk Safe',
        description: 'A wire slip showing a $75,000 pending escrow deposit from Julian Vance Art Holdings to an account in Zurich, conditioned on "estate asset liquidation".',
        forensicSignificance: 'Proves Julian Vance was facing imminent financial ruin and stood to gain directly from Sterling’s immediate demise.'
      }
    ],
    suspects: [
      {
        id: 'suspect-julian-vance',
        name: 'Julian Vance',
        alias: 'The Curator',
        age: 38,
        sex: 'Male',
        gender: 'Male',
        height: '6\'1" (185 cm)',
        bloodType: 'A+',
        occupation: 'High-Society Art Gallery Director',
        photoUrl: '/src/assets/images/suspect_julian_vance_1790418148120.jpg',
        alibi: 'Claims he was dining at the Bellevue Club until 11:15 PM, received a phone call from Sterling at 11:30 PM to discuss an emergency painting acquisition, and arrived at midnight to find Sterling dead.',
        initialMotive: 'Arthur Sterling was threatening to audit the Vance Gallery books regarding forged Renaissance provenance records.',
        background: 'Educated at Oxford and Florence. Moves among old-money circles with aristocratic poise. Extremely charming, calculating, and accustomed to dominating conversations.',
        personality: {
          id: 'machiavellian_narcissist',
          title: 'Machiavellian / Charismatic Narcissist',
          indicator: 'Type-M Dominant Sociopath',
          summary: 'Ice-cold autonomic control with smooth conversational cadence. Unnaturally steady pulse and unwavering direct eye contact under stress.',
          baselineDescription: 'Julian naturally exhibits an unusually low resting heart rate (56-62 bpm), virtually zero vocal pitch jitter (1-3Hz), and rigid direct eye contact (95% lock). In normal conversation, he uses measured, aristocratic cadence without hesitation.',
          physicalVitals: {
            sex: 'Male',
            gender: 'Male',
            height: '6\'1" (185 cm)',
            bloodType: 'A+'
          },
          baselineMetrics: {
            heartRateBpm: 58,
            voiceTremorPercent: 2,
            glanceAversionPercent: 6,
            pupilDilationMm: 3.2,
            speechLatencySec: 0.4,
            pitchJitterHz: 2.1
          },
          interrogationGuidelines: 'Do not rely on obvious fidgeting or nervousness. Julian will never show panic. Look for micro-asymmetries: a fleeting unilateral lip smirk when deceiving, or sudden unnatural pitch flattening. His biggest vulnerability is hard physical evidence that contradicts his smooth story.',
          falsePositiveWarning: 'Because he displays zero nervous tells during innocent statements, a rookie detective might consider his calm demeanor proof of honesty. Contrast his unwavering metrics against physical timelines.',
          deceptionTells: [
            'Micro-smirk asymmetry (elevated unilateral zygomatic contraction ~120ms)',
            'Vocal pitch drops into sub-vocal laryngeal compression (<110Hz)',
            'Zero blink reflex during fabricated details (hyper-fixation eye lock)'
          ]
        },
        baselineQuestions: [
          {
            question: 'State your full legal name, occupation, and business address for the record.',
            expectedTone: 'Casual aristocratic composure',
            response: 'Julian Alistair Vance. Director and senior curator of the Vance Gallery of Fine Antiquities, 400 Grand Boulevard.',
            reading: {
              heartRate: 58,
              pitchJitterHz: 2.0,
              tremorIndex: 3,
              glanceAversion: 5,
              pupilDilationMm: 3.2,
              lipCompression: 10,
              asymmetrySmirk: 8,
              speechLatencySec: 0.35,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Direct eye contact maintained', 'Blink rate calm (14/min)', 'Bilateral symmetric facial posture'],
              vocalIndicators: ['Resonant timbre', 'Pitch variance within normal 2Hz window', 'Smooth cadence']
            }
          },
          {
            question: 'How long had you been business associates with the late Arthur Sterling?',
            expectedTone: 'Neutral professional recollection',
            response: 'Approximately seven years. Arthur was an astute patron, though demanding. We shared a passion for early Quattrocento canvases.',
            reading: {
              heartRate: 60,
              pitchJitterHz: 2.2,
              tremorIndex: 4,
              glanceAversion: 7,
              pupilDilationMm: 3.3,
              lipCompression: 12,
              asymmetrySmirk: 10,
              speechLatencySec: 0.4,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Steady ocular lock', 'Relaxed jaw muscles', 'Fluid hand gesture'],
              vocalIndicators: ['Stable pitch 122Hz', 'No laryngeal constriction']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-jv-01',
            interrogationTopic: 'Whereabouts & The Alleged Phone Call',
            detectiveQuestion: 'Walk me through your precise timeline between 11:00 PM and midnight on the night of the murder.',
            suspectResponse: 'I left the Bellevue Club at eleven-fifteen. At eleven-thirty prompt, Arthur rang me directly from his penthouse library—he sounded animated, insisted I bring over the appraisal for the Bellini canvas immediately. I took a cab and arrived at midnight.',
            audioDurationSec: 3.2,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-phone-log',
            deceptionExplanation: 'Julian claims Arthur phoned him at 11:30 PM from the penthouse library. However, the switchboard log proves the penthouse telephone cable was severed at 11:15 PM! It was physically impossible for Sterling to ring him.',
            confessionBreak: 'Julian’s aristocratic facade cracks. "Fine... the phone didn’t ring. I was already at the penthouse door by eleven-twenty. But I didn’t pour that scotch!"',
            biometricReading: {
              heartRate: 64,
              pitchJitterHz: 3.1,
              tremorIndex: 8,
              glanceAversion: 12,
              pupilDilationMm: 3.8,
              lipCompression: 35,
              asymmetrySmirk: 68,
              speechLatencySec: 0.6,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Unilateral right-side micro-smirk (duration: 140ms)', 'Pupil dilated +0.6mm during timestamp claim'],
              vocalIndicators: ['Subtle glottal catch at "eleven-thirty prompt"', 'Cadence compression']
            }
          },
          {
            id: 'stmt-jv-02',
            interrogationTopic: 'Access to the Service Stairs & Master Key',
            detectiveQuestion: 'How did you enter the penthouse if the main elevator was grounded by building security at eleven?',
            suspectResponse: 'Arthur buzzed me up through the front vestibule and unlocked the elevator. I never touched any service stairwell or back doors.',
            audioDurationSec: 2.8,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-master-keycard',
            deceptionExplanation: 'The master key found on the fire escape bore charcoal wool fibers identical to Julian Vance’s bespoke tailored suit, proving he entered via the service stairwell.',
            confessionBreak: 'Julian stares at the evidence photo of the master key. His throat tightens. "Arthur gave me that duplicate key weeks ago to drop off private appraisals!"',
            biometricReading: {
              heartRate: 68,
              pitchJitterHz: 4.8,
              tremorIndex: 14,
              glanceAversion: 22,
              pupilDilationMm: 4.2,
              lipCompression: 58,
              asymmetrySmirk: 45,
              speechLatencySec: 0.85,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Lip compression index 58% (effortful suppression)', 'Subtle neck swallowing reflex'],
              vocalIndicators: ['Pitch elevated to 142Hz (+20Hz above his baseline)', 'Tremor index exceeds normal 2%']
            }
          },
          {
            id: 'stmt-jv-03',
            interrogationTopic: 'Knowledge of Aconitine Poison',
            detectiveQuestion: 'Did you know Arthur was drinking Glenmorangie scotch dosed with deadly aconitine tincture?',
            suspectResponse: 'Aconitine? I’m an art historian, detective, not a chemist or apothecary. I’ve never seen or handled wolfsbane alkaloid in my entire life.',
            audioDurationSec: 2.9,
            isLie: true,
            lieGrounds: 'voice',
            deceptionExplanation: 'Julian’s voice patterns exhibit severe vocal cord tension: his pitch frequency abruptly dropped to an unnatural sub-vocal monotone (102Hz) with vocal fry and micro-jitter spikes, completely contradicting his smooth baseline cadence.',
            confessionBreak: 'Julian swallows hard, his gaze darting. "All right! Dr. Thorne... Thorne procured the tincture. He said it would look like a natural cardiac failure from Arthur’s existing heart condition!"',
            biometricReading: {
              heartRate: 72,
              pitchJitterHz: 8.4,
              tremorIndex: 28,
              glanceAversion: 18,
              pupilDilationMm: 4.5,
              lipCompression: 62,
              asymmetrySmirk: 72,
              speechLatencySec: 1.1,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Micro-expression: Asymmetric sneer (right side)', 'Sudden pupil dilation to 4.5mm'],
              vocalIndicators: ['Pitch jitter jumps to 8.4Hz (400% above baseline)', 'Uncharacteristic vocal fry and cadence hesitation']
            }
          },
          {
            id: 'stmt-jv-04',
            interrogationTopic: 'Relationship with Arthur Sterling',
            detectiveQuestion: 'Were you aware that Arthur Sterling intended to disinherit his relatives and leave his entire collection to a public museum?',
            suspectResponse: 'Arthur discussed his philanthropic intentions frequently. It would have been a crowning moment for our city’s cultural heritage.',
            audioDurationSec: 2.6,
            isLie: false,
            deceptionExplanation: 'Truthful statement regarding Arthur’s public intentions; his biometric markers stay within acceptable bounds.',
            biometricReading: {
              heartRate: 61,
              pitchJitterHz: 2.4,
              tremorIndex: 5,
              glanceAversion: 8,
              pupilDilationMm: 3.3,
              lipCompression: 14,
              asymmetrySmirk: 12,
              speechLatencySec: 0.45,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Composed facial musculature', 'Direct gaze'],
              vocalIndicators: ['Melodic cadence', 'Within baseline 2Hz jitter']
            }
          }
        ]
      },
      {
        id: 'suspect-evelyn-cross',
        name: 'Evelyn Cross',
        alias: 'The Niece',
        age: 30,
        sex: 'Female',
        gender: 'Female',
        height: '5\'5" (165 cm)',
        bloodType: 'O+',
        occupation: 'Concert Pianist & Sterling’s Estranged Niece',
        photoUrl: '/src/assets/images/suspect_evelyn_cross_1790418159789.jpg',
        alibi: 'Practicing Chopin études in the rehearsal hall at St. Jude Academy of Music until 11:45 PM.',
        initialMotive: 'Arthur Sterling had cut her mother off from the family fortune and threatened to cancel Evelyn’s conservatory trust fund.',
        background: 'Highly sensitive, emotionally fragile artist. Suffers from chronic clinical anxiety and somatic tremor. Often appears panicked and flustered under any official questioning.',
        personality: {
          id: 'neurotic_anxious',
          title: 'Neurotic / Chronic Panic Disposition',
          indicator: 'Type-A Anxious Reactive',
          summary: 'Chronically elevated sympathetic nervous system. High baseline heart rate, frequent tremor, and evasive eye movements even when completely innocent.',
          baselineDescription: 'Evelyn’s calibrated baseline shows a resting heart rate of 90-98 bpm, a persistent vocal pitch tremor of 16-22%, and frequent ocular darting (40-48% glance aversion). She will appear to be on the verge of tears or panic even when answering mundane questions.',
          physicalVitals: {
            sex: 'Female',
            gender: 'Female',
            height: '5\'5" (165 cm)',
            bloodType: 'O+'
          },
          baselineMetrics: {
            heartRateBpm: 94,
            voiceTremorPercent: 18,
            glanceAversionPercent: 44,
            pupilDilationMm: 4.8,
            speechLatencySec: 0.2,
            pitchJitterHz: 14.5
          },
          interrogationGuidelines: 'CRITICAL: Do NOT mistake her sweating, trembling, or stammering for guilt. This is her biological baseline. Only evaluate whether her readings deviate significantly ABOVE her already anxious baseline. If her metrics stay within her 90-98 bpm and 18% tremor range, she is telling the truth.',
          falsePositiveWarning: 'High risk of False Positive! Novice interrogators frequently lock onto Evelyn because she acts "like a guilty suspect". Adjust for her baseline to avoid wrongful indictment.',
          deceptionTells: [
            'Sudden freezing of tremors (counter-intuitive stiffening when attempting a prepared falsehood)',
            'Speech latency jumping from rapid panic to calculated pause (>1.5s)',
            'Pitch spiking past 22Hz tremor index'
          ]
        },
        baselineQuestions: [
          {
            question: 'Evelyn, take a breath. Tell me where you teach piano and what piece you practiced yesterday.',
            expectedTone: 'Nervous, hurried, breathless',
            response: 'I... I teach at the conservatory on 5th Street. Yesterday was Chopin’s Nocturne in C-sharp minor. I was having trouble with the tempo transitions.',
            reading: {
              heartRate: 94,
              pitchJitterHz: 14.2,
              tremorIndex: 19,
              glanceAversion: 42,
              pupilDilationMm: 4.8,
              lipCompression: 24,
              asymmetrySmirk: 2,
              speechLatencySec: 0.22,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Frequent rapid blinks (38/min)', 'Fingers trembling slightly', 'Glance averts to the floor'],
              vocalIndicators: ['High pitch (220Hz)', 'Vocal tremor 19%', 'Breath intake audible']
            }
          },
          {
            question: 'When did you last see Arthur in person?',
            expectedTone: 'Emotional anxiety, somatic tremor',
            response: 'Three weeks ago... at Thanksgiving dinner. He told my mother that our branch of the family would receive nothing. It made me sick to my stomach.',
            reading: {
              heartRate: 96,
              pitchJitterHz: 15.0,
              tremorIndex: 20,
              glanceAversion: 46,
              pupilDilationMm: 4.9,
              lipCompression: 28,
              asymmetrySmirk: 0,
              speechLatencySec: 0.25,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Visible pulse in carotid artery', 'Darting eye saccades (46%)', 'Lip trembling'],
              vocalIndicators: ['Voice tremor 20%', 'High pitch 228Hz', 'Natural emotional grief']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-ec-01',
            interrogationTopic: 'Whereabouts During the Poisoning',
            detectiveQuestion: 'Were you anywhere near the Sterling Heights Penthouse between 11:00 PM and midnight?',
            suspectResponse: 'No! I swear on my mother’s soul! I was at St. Jude’s rehearsal hall until a quarter to midnight! The night proctor Mr. Henderson let me out, and I signed the registry!',
            audioDurationSec: 2.7,
            isLie: false,
            deceptionExplanation: 'Evelyn is telling the absolute truth. Despite her high heart rate (95 bpm) and shaky voice, her readings match her calibrated anxiety baseline perfectly. Furthermore, the conservatory rehearsal sign-in sheet confirms her alibi.',
            biometricReading: {
              heartRate: 95,
              pitchJitterHz: 14.8,
              tremorIndex: 18,
              glanceAversion: 43,
              pupilDilationMm: 4.8,
              lipCompression: 26,
              asymmetrySmirk: 0,
              speechLatencySec: 0.2,
              anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
              visualIndicators: ['High blinking rate but within baseline profile', 'No micro-smirk asymmetry', 'Genuine fear response'],
              vocalIndicators: ['Pitch tremor 18% (matches baseline 18%)', 'Natural cadence of high anxiety']
            }
          },
          {
            id: 'stmt-ec-02',
            interrogationTopic: 'Inheritance & Will Disinheritance',
            detectiveQuestion: 'Did you hire someone or obtain poison to stop your uncle from executing his revised will?',
            suspectResponse: 'I wanted him to understand us, not die! I wouldn’t even know how to find poison! Uncle Arthur was cruel, but I’m a musician, not a murderer!',
            audioDurationSec: 2.9,
            isLie: false,
            deceptionExplanation: 'Her biometric response is completely genuine. Tremor and pitch remain consistent with her neurotic baseline. She had no involvement in procuring aconite or killing Arthur.',
            biometricReading: {
              heartRate: 93,
              pitchJitterHz: 13.9,
              tremorIndex: 17,
              glanceAversion: 40,
              pupilDilationMm: 4.7,
              lipCompression: 22,
              asymmetrySmirk: 0,
              speechLatencySec: 0.22,
              anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
              visualIndicators: ['Bilateral tearful expression', 'Symmetric distress in forehead corrugator'],
              vocalIndicators: ['Vocal tremor 17% (within baseline)', 'No calculated cadence latency']
            }
          },
          {
            id: 'stmt-ec-03',
            interrogationTopic: 'Suspicions Regarding Others',
            detectiveQuestion: 'Did you see or speak with anyone else connected to your uncle recently?',
            suspectResponse: 'Julian Vance... he came to my recital two weeks ago. He asked whether Arthur ever kept cash or bonds in the study safe. He said Arthur was "vulnerable" and needed protection. Julian gave me chills.',
            audioDurationSec: 3.1,
            isLie: false,
            deceptionExplanation: 'Crucial truthful testimony pointing directly towards Julian Vance’s premeditation and interest in the penthouse safe.',
            biometricReading: {
              heartRate: 92,
              pitchJitterHz: 13.5,
              tremorIndex: 16,
              glanceAversion: 38,
              pupilDilationMm: 4.6,
              lipCompression: 20,
              asymmetrySmirk: 0,
              speechLatencySec: 0.3,
              anomalyRating: 'ELEVATED_ANXIETY_WITHIN_BASELINE',
              visualIndicators: ['Steady emotional conviction', 'Gaze fixates on interviewer'],
              vocalIndicators: ['Pitch stabilizes slightly', 'Honest recounting']
            }
          }
        ]
      },
      {
        id: 'suspect-marcus-drake',
        name: 'Marcus Drake',
        alias: 'The Chauffeur',
        age: 45,
        sex: 'Male',
        gender: 'Male',
        height: '6\'2" (188 cm)',
        bloodType: 'B+',
        occupation: 'Former Chauffeur & Docklands Mechanic',
        photoUrl: '/src/assets/images/suspect_marcus_drake_1790418172070.jpg',
        alibi: 'Working the graveyard shift repairing marine diesel engines at Pier 14 repair slip from 8:00 PM until 4:00 AM.',
        initialMotive: 'Fired by Arthur Sterling without severance two months prior after being falsely blamed for a scratched Bentley fender.',
        background: 'Decorated combat veteran of the Pacific theater. Deeply cynical, laconic, and resentful of elite authority. Keeps answers brief and distrusts police badges.',
        personality: {
          id: 'introverted_stoic',
          title: 'Introverted / Emotionally Guarded Stoic',
          indicator: 'Type-S Guarded Cynic',
          summary: 'Guarded defensive posture. Monotone delivery, low verbal cadence, and frequent gaze avoidance due to deep hostility toward interrogators, NOT guilt.',
          baselineDescription: 'Marcus’s baseline is characterized by a flat vocal pitch (95-105Hz with only 4Hz jitter), slow response latency (1.4-1.9s pause before speaking), and consistent eye aversion (45-55% looking sideways or down). His heart rate is a steady 68-74 bpm.',
          physicalVitals: {
            sex: 'Male',
            gender: 'Male',
            height: '6\'2" (188 cm)',
            bloodType: 'B+'
          },
          baselineMetrics: {
            heartRateBpm: 70,
            voiceTremorPercent: 5,
            glanceAversionPercent: 48,
            pupilDilationMm: 3.4,
            speechLatencySec: 1.6,
            pitchJitterHz: 3.8
          },
          interrogationGuidelines: 'Do not interpret his lack of eye contact or long pauses as deception. Marcus takes time to measure his words because he hates cops. When Marcus lies, his vocal volume drops significantly and pupil dilation flares.',
          falsePositiveWarning: 'His grimace, gruff silences, and refusal to make eye contact make him look suspicious on the surface. Calibrate against his stoic baseline.',
          deceptionTells: [
            'Noticeable drop in vocal volume accompanied by sudden laryngeal swallow',
            'Pupil flares to >5.0mm',
            'Cadence shifts from deliberate slow pauses to hurried one-word dismissals'
          ]
        },
        baselineQuestions: [
          {
            question: 'Marcus, state your current residence and place of employment.',
            expectedTone: 'Gruff, flat, unhurried',
            response: 'Pier 14 slipway repair shack. I fix diesels and winches for the tugboat fleet. Live in the loft above the shop.',
            reading: {
              heartRate: 70,
              pitchJitterHz: 3.6,
              tremorIndex: 5,
              glanceAversion: 50,
              pupilDilationMm: 3.4,
              lipCompression: 30,
              asymmetrySmirk: 4,
              speechLatencySec: 1.5,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Averts gaze toward window (50%)', 'Arms crossed, jaw set', 'No nervous twitching'],
              vocalIndicators: ['Low monotone (98Hz)', 'Stable 3.6Hz jitter', 'Long 1.5s initial pause']
            }
          },
          {
            question: 'Did you harbor hard feelings toward Arthur Sterling for terminating your employment?',
            expectedTone: 'Blunt honest resentment',
            response: 'I hated the man. He was a tyrant who treated everyone like grease under his shoes. Doesn’t mean I killed him.',
            reading: {
              heartRate: 72,
              pitchJitterHz: 4.1,
              tremorIndex: 6,
              glanceAversion: 48,
              pupilDilationMm: 3.5,
              lipCompression: 32,
              asymmetrySmirk: 6,
              speechLatencySec: 1.6,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Unvarnished blunt facial expression', 'Consistent stoic eye aversion'],
              vocalIndicators: ['Resolute monotone', 'No laryngeal constriction']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-md-01',
            interrogationTopic: 'Night of the Murder & Diesel Shift',
            detectiveQuestion: 'Can anyone at Pier 14 corroborate that you were inside the machine shop at eleven-forty PM?',
            suspectResponse: 'Captain O’Malley brought the tug Samson in for a broken fuel injector at eleven-twenty. We were covered in diesel fuel until two in the morning. Check his logbook.',
            audioDurationSec: 2.8,
            isLie: false,
            deceptionExplanation: 'Marcus is completely truthful. His steady 71 bpm heart rate and 1.6s latency perfectly match his calibrated stoic baseline. Captain O’Malley’s dock log confirms the repair.',
            biometricReading: {
              heartRate: 71,
              pitchJitterHz: 3.7,
              tremorIndex: 5,
              glanceAversion: 47,
              pupilDilationMm: 3.4,
              lipCompression: 28,
              asymmetrySmirk: 3,
              speechLatencySec: 1.6,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Steady posture', 'Normal stoic glance aversion (47%)', 'No pupil dilation change'],
              vocalIndicators: ['Rock steady 98Hz pitch', 'Natural conversational cadence']
            }
          },
          {
            id: 'stmt-md-02',
            interrogationTopic: 'The Master Keycard & Service Entrance',
            detectiveQuestion: 'Did you retain a duplicate key or access card to the Sterling Heights service stairwell?',
            suspectResponse: 'Sterling made me hand over every brass key the hour he fired me. Even made the building super change the tumbler on the garage gate.',
            audioDurationSec: 2.6,
            isLie: false,
            deceptionExplanation: 'Truthful. Marcus had no keys to the building, which aligns with building security reports from his termination date.',
            biometricReading: {
              heartRate: 70,
              pitchJitterHz: 3.9,
              tremorIndex: 5,
              glanceAversion: 49,
              pupilDilationMm: 3.5,
              lipCompression: 31,
              asymmetrySmirk: 5,
              speechLatencySec: 1.5,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Consistent eye-contact pattern', 'Neutral brow'],
              vocalIndicators: ['Flat timbre', 'No pitch variance']
            }
          },
          {
            id: 'stmt-md-03',
            interrogationTopic: 'Observations of Other Visitors',
            detectiveQuestion: 'Did you ever notice anyone else visiting Sterling’s penthouse after hours?',
            suspectResponse: 'That doctor fellow... Dr. Thorne. He’d arrive late carrying small brown glass bottles in his medical satchel. Saw him arguing with Julian Vance in the lobby parking garage a month ago.',
            audioDurationSec: 3.0,
            isLie: false,
            deceptionExplanation: 'Truthful observation confirming the clandestine connection between Dr. Thorne and Julian Vance.',
            biometricReading: {
              heartRate: 73,
              pitchJitterHz: 4.0,
              tremorIndex: 6,
              glanceAversion: 46,
              pupilDilationMm: 3.5,
              lipCompression: 29,
              asymmetrySmirk: 4,
              speechLatencySec: 1.7,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Relaxed jaw', 'Consistent stoic metrics'],
              vocalIndicators: ['Steady volume', 'No vocal fry']
            }
          }
        ]
      },
      {
        id: 'suspect-aris-thorne',
        name: 'Dr. Aris Thorne',
        alias: 'The Apothecary',
        age: 52,
        sex: 'Male',
        gender: 'Male',
        height: '5\'10" (178 cm)',
        bloodType: 'AB-',
        occupation: 'Forensic Toxicologist & Private Physician',
        photoUrl: '/src/assets/images/suspect_aris_thorne_1790418183377.jpg',
        alibi: 'Claims he was in his university laboratory cataloging pharmaceutical samples until midnight and had no interaction with Sterling that evening.',
        initialMotive: 'Sterling funded Thorne’s research lab and had recently threatened to withdraw endowment funding and report unauthorized clinical trials.',
        background: 'Brilliant but cold, detached, and obsessive. Treats human emotions with scientific disdain. Speaks in rapid, pedantic bursts of medical jargon to assert dominance.',
        personality: {
          id: 'obsessive_antisocial',
          title: 'Obsessive-Compulsive / Anti-Social Intellectual',
          indicator: 'Type-O Clinical Detached',
          summary: 'Hyper-intellectualized defense mechanism. Speaks in clipped, rapid technical jargon with intense hyper-fixated gaze. Masking deep paranoia through pedantry.',
          baselineDescription: 'Dr. Thorne speaks at a rapid clip (response latency only 0.2-0.4s) with sharp, precise articulation (pitch jitter 4-6Hz). He maintains an intense, unblinking glare (glance aversion only 10-15%). Resting pulse is 76-82 bpm.',
          physicalVitals: {
            sex: 'Male',
            gender: 'Male',
            height: '5\'10" (178 cm)',
            bloodType: 'AB-'
          },
          baselineMetrics: {
            heartRateBpm: 78,
            voiceTremorPercent: 7,
            glanceAversionPercent: 12,
            pupilDilationMm: 3.6,
            speechLatencySec: 0.3,
            pitchJitterHz: 4.8
          },
          interrogationGuidelines: 'Thorne uses pedantic corrections to deflect. When he is hiding the truth, his rapid speech stumbles—his response latency spikes drastically (>2.0s) as his brain calculates how to conceal facts, and his pupils constrict sharply (pupillary reflex under acute cognitive overload).',
          falsePositiveWarning: 'His arrogant, condescending manner often irritates investigators into making premature accusations. Focus on his speech latency and biochemical paper trail.',
          deceptionTells: [
            'Sudden anomalous speech latency pause (>2.0s vs his usual 0.3s rapid fire)',
            'Pupil constriction down to <2.5mm (pinpoint constriction during focused evasion)',
            'Vocal pitch stutter and sudden throat clearing'
          ]
        },
        baselineQuestions: [
          {
            question: 'Dr. Thorne, specify your credentials and relationship to Arthur Sterling.',
            expectedTone: 'Clipped, haughty, clinical precision',
            response: 'Senior Fellow of the Royal College of Pathologists, Chair of Forensic Toxicology. I served as Mr. Sterling’s personal consultant on cardiovascular therapeutics.',
            reading: {
              heartRate: 78,
              pitchJitterHz: 4.6,
              tremorIndex: 7,
              glanceAversion: 11,
              pupilDilationMm: 3.6,
              lipCompression: 18,
              asymmetrySmirk: 14,
              speechLatencySec: 0.28,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Intense focused stare', 'Minimal blink rate (9/min)', 'Clipped head nod'],
              vocalIndicators: ['Sharp, crisp consonants', 'High frequency resonance', 'Rapid cadence']
            }
          },
          {
            question: 'What medications were you administering for Mr. Sterling’s cardiovascular condition?',
            expectedTone: 'Authoritative pharmacological breakdown',
            response: 'Standard digitalis glycoside titrated at 0.25 milligrams daily. Completely routine, non-toxic, and monitored weekly.',
            reading: {
              heartRate: 80,
              pitchJitterHz: 5.0,
              tremorIndex: 8,
              glanceAversion: 13,
              pupilDilationMm: 3.5,
              lipCompression: 20,
              asymmetrySmirk: 15,
              speechLatencySec: 0.32,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Clinical detachment', 'Direct eye contact', 'Symmetric facial tone'],
              vocalIndicators: ['Even pitch modulation', 'No vocal hesitation']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-at-01',
            interrogationTopic: 'Possession of Purified Aconitine Alkaloid',
            detectiveQuestion: 'Did your laboratory import or process crystalline aconitine alkaloid during the past month?',
            suspectResponse: 'Preposterous! Aconitine is an obsolete, dangerously unstable botanical neurotoxin. Our university facility has had no order or synthesis of aconitine in over a decade!',
            audioDurationSec: 3.4,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-warehouse-manifest',
            deceptionExplanation: 'Dr. Thorne claims his lab has not ordered aconitine in a decade. However, the Sub-Rosa Chemical Manifest from Warehouse 4 explicitly documents 500ml of purified aconitine alkaloid imported on November 2nd under the alias "A. T. Thorne, MD".',
            confessionBreak: 'Dr. Thorne’s glasses slide down his nose. His knuckles turn white. "That consignment was strictly for botanical alkaloid assays! Vance found out about the shipment and cornered me with an audit threat!"',
            biometricReading: {
              heartRate: 98,
              pitchJitterHz: 12.6,
              tremorIndex: 35,
              glanceAversion: 32,
              pupilDilationMm: 2.2,
              lipCompression: 74,
              asymmetrySmirk: 35,
              speechLatencySec: 2.6,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Pupil constricts sharply to 2.2mm (acute cognitive stress)', 'Tight lip compression (74%)', 'Blink frequency surges to 45/min'],
              vocalIndicators: ['Latency jumped to 2.6s (massive deviation from 0.3s baseline)', 'Pitch jitter spikes to 12.6Hz']
            }
          },
          {
            id: 'stmt-at-02',
            interrogationTopic: 'Communication with Julian Vance',
            detectiveQuestion: 'Did you meet Julian Vance privately or discuss Arthur Sterling’s death beforehand?',
            suspectResponse: 'I have never had any private or conspiratorial dealings with Mr. Vance whatsoever. Our interactions were purely social at museum galas.',
            audioDurationSec: 3.1,
            isLie: true,
            lieGrounds: 'voice',
            deceptionExplanation: 'A glaring Voice Pattern Anomaly: Thorne’s vocal pitch suddenly jumped 38Hz above his calibrated frequency with severe micro-tremor stutter, and his characteristic clipped cadence disintegrated into a 2.8s hesitation pause.',
            confessionBreak: 'Thorne covers his face. "Vance promised me fifty thousand dollars to formulate a tasteless, odorless aconite tincture that would dissolve in aged scotch. He said Sterling had ruined him, and he would ruin me if I refused!"',
            biometricReading: {
              heartRate: 104,
              pitchJitterHz: 15.2,
              tremorIndex: 42,
              glanceAversion: 45,
              pupilDilationMm: 2.1,
              lipCompression: 82,
              asymmetrySmirk: 40,
              speechLatencySec: 2.8,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Pupil pinpoint constriction (2.1mm)', 'Forehead perspiration sheen', 'Swallowing tremor'],
              vocalIndicators: ['Vocal frequency spikes to 182Hz', 'Pitch jitter 15.2Hz', 'Pronounced stutter on "whatsoever"']
            }
          },
          {
            id: 'stmt-at-03',
            interrogationTopic: 'Physical Presence at Penthouse',
            detectiveQuestion: 'Were you inside Arthur Sterling’s penthouse apartment at eleven-forty-two PM when the watch was crushed?',
            suspectResponse: 'No. I was in my university laboratory until after midnight. Julian took the vial at six in the evening. I was never inside the penthouse on the night of the crime.',
            audioDurationSec: 2.8,
            isLie: false,
            deceptionExplanation: 'Truthful statement. Thorne supplied the poison to Julian Vance, but Vance alone executed the poisoning inside the penthouse.',
            biometricReading: {
              heartRate: 85,
              pitchJitterHz: 5.4,
              tremorIndex: 10,
              glanceAversion: 15,
              pupilDilationMm: 3.4,
              lipCompression: 25,
              asymmetrySmirk: 10,
              speechLatencySec: 0.4,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Return to clinical focus', 'Pupil re-dilated to 3.4mm', 'Symmetric vocal posture'],
              vocalIndicators: ['Cadence stabilizes to rapid 0.4s latency', 'Timbre clears']
            }
          }
        ]
      }
    ],
    solution: {
      culpritSuspectId: 'suspect-julian-vance',
      weaponOrMethod: 'Aconitine alkaloid poison dissolved in 25-year Glenmorangie scotch, supplied by Dr. Thorne and delivered by Julian Vance',
      decisiveEvidenceId: 'ev-phone-log',
      motiveBreakdown:
        'Julian Vance confronted Arthur Sterling over the impending audit of forged antiquities. Having obtained aconitine tincture from Dr. Thorne and the duplicate service key, Vance severed the telephone line at 11:15 PM, slipped into the penthouse via the service stairwell, dosed Sterling’s scotch, and stole the unfiled will and $3M in municipal bonds to fund his Swiss escrow account.'
    }
  },
  {
    id: 'case-02-dockland-fog',
    caseNumber: 'COLD-1948-1102',
    title: 'The Pier 14 Blackout',
    subtitle: 'The Smuggler’s Slipway Murder of Dockmaster O’Malley',
    incidentDate: 'October 28, 1948 · 01:15 EST',
    location: 'Pier 14 Slipway & Tugboat Samson Berth',
    status: 'REOPENED',
    summary:
      'Tugboat master and dock foreman Silas O’Malley was found dead near the winch gears of Berth 4 during the Pier 14 blackout. The coroner discovered acute systemic respiratory paralysis caused by a lethal dose of concentrated curare-derived tubocurarine administered into his metal coffee thermos. The main knife switch was jammed with a spanner from mechanic Marcus Drake’s shop, and an amber apothecary vial from Dr. Thorne’s dispensary was recovered on the slipway.',
    crimeSceneDossier:
      'Silas O’Malley was discovered collapsed beside the tugboat engine cradle. Heavy diesel grease covered his work jacket, and his dented steel coffee thermos was overturned nearby with traces of an odorless, amber alkaloid. The slipway power generator switch was forcefully jammed at 01:00 AM with an industrial spanner from Marcus Drake’s upper tool chest, plunging Pier 14 into pitch darkness. The dispatch telephone wire was hacked off at the wall jack.',
    coronerReport:
      'Chief Medical Examiner Dr. Vane confirms death occurred between 01:05 AM and 01:20 AM due to complete neuromuscular blockade and acute diaphragm asphyxiation induced by purified d-tubocurarine alkaloid. Chemical assay detected lethal concentrations in the gastric wash and inside the victim’s coffee thermos. Superficial defensive bruising on the forearms indicates a brief struggle prior to neuromuscular arrest.',
    autopsyReportNumber: 'MR-1948-442 · Harbor Division',
    timelineMilestones: [
      { time: '00:45', description: 'Tugboat manifest countersigned at dockmaster office with Vance’s notary stamp.' },
      { time: '01:00', description: 'Pier 14 main knife switch jammed with Marcus Drake’s spanner, plunging slipway into blackout.', isCritical: true },
      { time: '01:15', description: 'Dockmaster O’Malley collapses from neuromuscular respiratory paralysis.' },
      { time: '02:30', description: 'Dr. Thorne’s monogrammed tubocurarine vial recovered on low tide sandbar.' }
    ],
    evidence: [
      {
        id: 'ev-pier-manifest',
        title: 'Impounded Tugboat Manifest',
        type: 'document',
        timestampOrDate: 'Oct 28, 1948 · 00:45 EST',
        locationFound: 'Pier 14 Dispatch Office',
        description: 'Log recording arrival of unauthorized crates from Rotterdam destined for the Vance Gallery warehouse, bearing Julian Vance’s embossed wax seal.',
        forensicSignificance: 'Proves the dockmaster caught Julian Vance mid-smuggle and was extorting him before the blackout.'
      },
      {
        id: 'ev-severed-cable',
        title: 'Jammed Pier Slipway Breaker',
        type: 'physical',
        timestampOrDate: 'Oct 28, 1948 · 01:00 EST',
        locationFound: 'Main Slipway Fuse Box',
        description: 'The industrial knife switch was intentionally jammed with a heavy 1-inch machinist spanner stolen from Marcus Drake’s open workbench to plunge the dock into darkness.',
        forensicSignificance: 'Points to an insider with mechanical knowledge and access to the upper machine shop tools.'
      },
      {
        id: 'ev-apothecary-shard',
        title: 'Cracked Amber Tincture Bottle',
        type: 'forensics',
        timestampOrDate: 'Oct 28, 1948 · 02:30 EST',
        locationFound: 'Low Tide Sandbar',
        description: 'Brown pharmaceutical vial bearing the Latin formulation script "Extr. Chondrodendron - Tubocurarine" matching Dr. Aris Thorne’s university dispensary inventory.',
        forensicSignificance: 'Direct physical link to Dr. Aris Thorne’s botanical alkaloid supply.'
      },
      {
        id: 'ev-thermos-sample',
        title: 'Spiked Steel Coffee Thermos',
        type: 'forensics',
        timestampOrDate: 'Oct 28, 1948 · 01:30 EST',
        locationFound: 'Berth 4 Slipway Winch',
        description: 'Silas O’Malley’s heavy metal coffee thermos, tainted with 80mg of purified tubocurarine solution. Traces of expensive Turkish cigarette ash matching Vance’s brand were found on the thermos lid.',
        forensicSignificance: 'Confirms the lethal alkaloid was introduced directly into the victim’s drink, and links Vance’s bespoke tobacco blend to the scene.'
      }
    ],
    suspects: [
      {
        id: 'suspect-marcus-drake',
        name: 'Marcus Drake',
        alias: 'The Machinist',
        age: 45,
        sex: 'Male',
        gender: 'Male',
        height: '6\'2" (188 cm)',
        bloodType: 'B+',
        occupation: 'Slipway Diesel Mechanic & Machinist',
        photoUrl: '/src/assets/images/suspect_marcus_drake_1790418172070.jpg',
        alibi: 'Claims he was in the upper loft rebuilding a diesel fuel pump and never heard any struggle below.',
        initialMotive: 'Dockmaster O’Malley had docked his pay and threatened to report him to the maritime union.',
        background: 'Decorated combat veteran of the Pacific theater now working the graveyard shift at Pier 14. Deeply cynical, laconic, and resentful of corrupt authority.',
        personality: {
          id: 'introverted_stoic',
          title: 'Introverted / Emotionally Guarded Stoic',
          indicator: 'Type-S Guarded Cynic',
          summary: 'Guarded defensive posture. Monotone delivery and steady pulse.',
          baselineDescription: 'Marcus speaks in a flat vocal pitch with deliberate pauses. Steady 70 bpm pulse.',
          baselineMetrics: {
            heartRateBpm: 70,
            voiceTremorPercent: 5,
            glanceAversionPercent: 48,
            pupilDilationMm: 3.4,
            speechLatencySec: 1.6,
            pitchJitterHz: 3.8
          },
          interrogationGuidelines: 'Do not mistake his curt answers for guilt. Look for pupil flares and sudden volume drops.',
          falsePositiveWarning: 'His hatred of badges causes frequent eye aversion. Look for genuine baseline shifts.',
          deceptionTells: [
            'Noticeable drop in vocal volume',
            'Pupil flares to >5.0mm',
            'Cadence shifts from deliberate slow pauses to hurried one-word dismissals'
          ]
        },
        baselineQuestions: [
          {
            question: 'Marcus, where were you when the power was cut to Pier 14?',
            expectedTone: 'Gruff, flat, unhurried',
            response: 'Up in the loft with a grease gun and a fuel injector. You can check the generator fuel line.',
            reading: {
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
              vocalIndicators: ['Flat 98Hz monotone', 'Zero stress jitter']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-md-02-01',
            interrogationTopic: 'Knowledge of the Power Blackout',
            detectiveQuestion: 'Did you jam the slipway circuit breaker with the machinist spanner?',
            suspectResponse: 'I didn’t touch the breaker. If the juice went out, it was someone trying to sneak contraband off the barge without the night proctor noticing.',
            audioDurationSec: 3.0,
            isLie: false,
            deceptionExplanation: 'Truthful statement. Marcus was repairing engines and saw unfamiliar figures on the dock.',
            biometricReading: {
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
        ]
      },
      {
        id: 'suspect-aris-thorne',
        name: 'Dr. Aris Thorne',
        alias: 'The Apothecary',
        age: 52,
        sex: 'Male',
        gender: 'Male',
        height: '5\'10" (178 cm)',
        bloodType: 'AB-',
        occupation: 'Forensic Toxicologist & Private Physician',
        photoUrl: '/src/assets/images/suspect_aris_thorne_1790418183377.jpg',
        alibi: 'Claims he was in his university lab cataloging pharmacology reagents and had no connection to Pier 14.',
        initialMotive: 'The harbor police were inspecting maritime chemical manifests that traced directly to his unregistered botanical imports.',
        background: 'Brilliant, detached, and obsessive. Treats human interactions with scientific disdain. Masks anxiety behind rapid clinical terminology.',
        personality: {
          id: 'obsessive_antisocial',
          title: 'Obsessive-Compulsive / Anti-Social Intellectual',
          indicator: 'Type-O Clinical Detached',
          summary: 'Hyper-intellectualized defense mechanism. Rapid technical jargon with intense hyper-fixated gaze.',
          baselineDescription: 'Dr. Thorne speaks at a rapid clip (response latency 0.2-0.4s) with sharp, precise articulation (pitch jitter 4-6Hz). Resting pulse 76-82 bpm.',
          physicalVitals: {
            sex: 'Male',
            gender: 'Male',
            height: '5\'10" (178 cm)',
            bloodType: 'AB-'
          },
          baselineMetrics: {
            heartRateBpm: 78,
            voiceTremorPercent: 7,
            glanceAversionPercent: 12,
            pupilDilationMm: 3.6,
            speechLatencySec: 0.3,
            pitchJitterHz: 4.8
          },
          interrogationGuidelines: 'Watch for sudden speech pauses (>2.0s) and pinpoint pupillary constriction when confronted with physical chemical exhibits.',
          falsePositiveWarning: 'His haughty condescension can be mistaken for deceit. Look for actual physiological breaks.',
          deceptionTells: [
            'Sudden anomalous speech latency pause (>2.0s)',
            'Pupil constriction down to <2.5mm',
            'Vocal pitch stutter on chemical details'
          ]
        },
        baselineQuestions: [
          {
            question: 'Dr. Thorne, why was an amber bottle bearing your dispensary label found on the sandbar?',
            expectedTone: 'Clipped clinical indignation',
            response: 'I supply standard antiseptics to commercial harbor vessels routinely. A discarded bottle is hardly proof of foul play.',
            reading: {
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
              vocalIndicators: ['Sharp diction', 'No latency hesitation']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-at-02-01',
            interrogationTopic: 'Procurement of Refined Tubocurarine for Vance',
            detectiveQuestion: 'Did you synthesize the tubocurarine alkaloid solution found in O’Malley’s thermos?',
            suspectResponse: 'Absurd. I had no contact with Julian Vance or dock personnel on the evening of October twenty-eighth.',
            audioDurationSec: 3.3,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-apothecary-shard',
            deceptionExplanation: 'The pharmaceutical vial found on the sandbar bears Dr. Thorne’s Latin formulation script and batch stamp, refuting his denial of delivering the solution.',
            confessionBreak: 'Dr. Thorne blinks rapidly, his clinical composure shattering. "Vance swore it was only an incapacitating draft to knock the dockmaster unconscious while we cleared the impounded crates!"',
            biometricReading: {
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
        ]
      },
      {
        id: 'suspect-julian-vance',
        name: 'Julian Vance',
        alias: 'The Curator',
        age: 38,
        sex: 'Male',
        gender: 'Male',
        height: '6\'1" (185 cm)',
        bloodType: 'A+',
        occupation: 'High-Society Art Gallery Director',
        photoUrl: '/src/assets/images/suspect_julian_vance_1790418148120.jpg',
        alibi: 'Claims he was in his Mayfair gallery residence inspecting Renaissance sketches and was never near Pier 14.',
        initialMotive: 'O’Malley demanded ten thousand dollars hush money after discovering forged antiquity crates.',
        background: 'Moves in elite high-society old-money circles. Smooth, arrogant, and calculating.',
        personality: {
          id: 'machiavellian_narcissist',
          title: 'Machiavellian / Charismatic Narcissist',
          indicator: 'Type-M Dominant Sociopath',
          summary: 'Ice-cold autonomic control with smooth conversational cadence.',
          baselineDescription: 'Julian naturally exhibits a low resting heart rate (58 bpm) and steady unblinking eye contact.',
          baselineMetrics: {
            heartRateBpm: 58,
            voiceTremorPercent: 2,
            glanceAversionPercent: 6,
            pupilDilationMm: 3.2,
            speechLatencySec: 0.4,
            pitchJitterHz: 2.1
          },
          interrogationGuidelines: 'Watch for fleeting 140ms right-side smirk asymmetry when he lies.',
          falsePositiveWarning: 'His natural calm can mislead rookies into thinking he is innocent.',
          deceptionTells: [
            'Micro-smirk asymmetry',
            'Vocal pitch drops into sub-vocal laryngeal compression',
            'Zero blink reflex during fabricated details'
          ]
        },
        baselineQuestions: [
          {
            question: 'Mr. Vance, what were your gallery crates doing on Pier 14?',
            expectedTone: 'Polished diplomatic disdain',
            response: 'Routine European antiquities transit, cleared by federal customs inspectors.',
            reading: {
              heartRate: 60,
              pitchJitterHz: 2.2,
              tremorIndex: 3,
              glanceAversion: 7,
              pupilDilationMm: 3.3,
              lipCompression: 14,
              asymmetrySmirk: 10,
              speechLatencySec: 0.4,
              anomalyRating: 'BASELINE_NORMAL',
              visualIndicators: ['Direct eye contact', 'Bilateral facial symmetry'],
              vocalIndicators: ['Smooth resonant timbre']
            }
          }
        ],
        statements: [
          {
            id: 'stmt-jv-02-01',
            interrogationTopic: 'Presence at Pier 14 at Midnight',
            detectiveQuestion: 'Were you down at the slipway meeting O’Malley before the power failed?',
            suspectResponse: 'I haven’t set foot on Pier 14 since the summer regatta, Detective. The docklands are hardly my milieu.',
            audioDurationSec: 3.2,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-pier-manifest',
            deceptionExplanation: 'The impounded tugboat manifest was countersigned with Julian Vance’s private notary seal at 00:45 AM, proving he was physically present at the dockmaster office.',
            confessionBreak: 'Julian adjusts his cufflinks nervously. "O’Malley was extorting me! He threatened to dump the crates into the harbor if I didn’t pay his cut!"',
            biometricReading: {
              heartRate: 74,
              pitchJitterHz: 7.2,
              tremorIndex: 22,
              glanceAversion: 25,
              pupilDilationMm: 4.3,
              lipCompression: 60,
              asymmetrySmirk: 66,
              speechLatencySec: 0.95,
              anomalyRating: 'CRITICAL_DECEPTION_ANOMALY',
              visualIndicators: ['Right-side micro-smirk asymmetry', 'Pupils dilated +1.1mm'],
              vocalIndicators: ['Vocal pitch drops to 104Hz', 'Cadence stutter on "milieu"']
            }
          },
          {
            id: 'stmt-jv-02-02',
            interrogationTopic: 'The Spiked Coffee Thermos',
            detectiveQuestion: 'Did you tamper with dockmaster O’Malley’s steel coffee thermos at Berth 4?',
            suspectResponse: 'Preposterous. I do not drink dockworkers’ swill, nor did I ever come near his coffee thermos or winch machinery.',
            audioDurationSec: 3.0,
            isLie: true,
            lieGrounds: 'evidence',
            contradictingEvidenceId: 'ev-thermos-sample',
            deceptionExplanation: 'Forensic analysis of the thermos lid recovered Turkish cigarette ash identical to Julian Vance’s exclusive imported Sobranie blend.',
            confessionBreak: 'Julian grinds his teeth in rage. "He had his hand around my lapel, choking me! I only tipped Thorne’s vial into his mug so he would let me reach the exit!"',
            biometricReading: {
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
        ]
      }
    ],
    solution: {
      culpritSuspectId: 'suspect-julian-vance',
      weaponOrMethod: 'Tubocurarine alkaloid solution dosed into O’Malley’s steel thermos following an extortion dispute over impounded antiquity crates',
      decisiveEvidenceId: 'ev-pier-manifest',
      motiveBreakdown:
        'Silas O’Malley discovered forged Renaissance antiquities hidden in Julian Vance’s import shipments and demanded ten thousand dollars in extortion. Vance met O’Malley at Pier 14 with a tubocurarine vial supplied by Dr. Thorne, spiked O’Malley’s coffee thermos, jammed the power breaker with Marcus Drake’s spanner to plunge the dock into darkness, and fled as the dockmaster succumbed to respiratory paralysis.'
    }
  }
];
