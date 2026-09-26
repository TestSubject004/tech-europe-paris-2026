/**
 * =========================================================================================
 * Live Interrogation Chamber & Conversational Questioning Suite: Detective Stories
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * The InterrogationChamber component is the primary interactive stage of Detective Stories.
 * It simulates a gritty 1940s precinct interrogation room where investigators directly cross-examine
 * suspects via keyboard text queries or real microphone push-to-talk speech recognition. It integrates
 * dynamic Gemini AI conversational responses, 48-point micro-expression meshes, real-time voice
 * frequency oscilloscope graphing, case-partitioned persona prompts, and automated lie-cracking
 * contradiction detection.
 * 
 * DIFFERENT USE CASES:
 * 1. Free-Form & Microphone Interrogation (handleSendMessage, handleStartVoiceRecording):
 *    Detectives question suspects using free-form text or speech. The input is evaluated against
 *    the suspect's case persona, synthesizing spoken responses in 1940s noir vernacular.
 * 2. Curated Interrogation Probes:
 *    Offers case-specific, targeted quick confrontation buttons for each suspect (e.g. challenging
 *    Julian Vance on the 11:15 PM switchboard cut in Case 1, or confronting him on the Rotterdam
 *    tugboat manifest in Case 2).
 * 3. Real-Time Biometric Sensor HUD:
 *    Simultaneously plots cardiovascular pulse (bpm), voice jitter (Hz), lip compression,
 *    glance aversion, and smirk asymmetry for every statement.
 * 4. Perjury Cracking & Confession Break:
 *    When a question successfully touches upon a fatal contradiction (e.g. 'cable', 'manifest', 'curare'),
 *    the suspect breaks composure, admitting their perjury and marking the statement as cracked.
 * =========================================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Suspect, SuspectStatement, Evidence, BiometricReading, ColdCase } from '../types/game';
import { PixelNoirAvatar } from './PixelNoirAvatar';
import { VoicePatternAnalyzer } from './VoicePatternAnalyzer';
import {
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  FileSearch,
  Sparkles,
  User,
  AlertOctagon,
  RefreshCw,
  X,
  Send,
  Volume2,
  VolumeX,
  Radio,
  CornerDownLeft,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Loader2,
  Activity,
  CheckCircle2,
  History,
  Copy
} from 'lucide-react';
import { sound } from '../utils/audio';
import { logFunctionCall } from '../utils/logger';
import { APP_CONFIG } from '../config';

/**
 * Chat dialogue message representation in interrogation room.
 */
interface ChatMessage {
  id: string;
  sender: 'detective' | 'suspect';
  text: string;
  timestamp: string;
  reading?: BiometricReading;
  isCracked?: boolean;
  audioBase64?: string | null;
  isVoice?: boolean;
}

/**
 * Microphone audio transcript log entry.
 */
export interface VoiceLogEntry {
  id: string;
  timestamp: string;
  suspectName: string;
  transcript: string;
  durationSec: number;
  status: 'transcribed' | 'silent' | 'failed';
}

/**
 * Properties for InterrogationChamber component.
 */
interface InterrogationChamberProps {
  coldCase: ColdCase;
  suspects: Suspect[];
  activeSuspectId: string;
  onSelectSuspect: (id: string) => void;
  activeStatementIdx: number;
  onSelectStatementIdx: (idx: number) => void;
  evidenceList: Evidence[];
  crackedStatements: Record<string, boolean>;
  onCrackStatement: (statementId: string, suspectId: string) => void;
  onOpenPsychProfile: () => void;
  detectiveShieldEnabled?: boolean;
}

/**
 * Generates initial greeting messages partitioned cleanly by case and suspect.
 * 
 * @param caseId - Active case identifier
 * @param suspects - Suspects roster for active case
 * @returns Map of suspect IDs to initial greeting messages
 */
function getInitialChatHistories(caseId: string, suspects: Suspect[]): Record<string, ChatMessage[]> {
  logFunctionCall('getInitialChatHistories', { caseId, suspectCount: suspects.length });
  if (caseId === 'case-02-dockland-fog') {
    // Case 2: The Pier 14 Blackout (Silas O'Malley) - ZERO connection to Arthur Sterling or Velvet Ash
    return {
      'suspect-julian-vance': [
        {
          id: 'msg-jv-0',
          sender: 'suspect',
          text: 'Detective. Let’s make this brief. I have an art gallery to administer, and Silas O’Malley’s untimely mishap at the docks is hardly a matter for high-society collectors.',
          timestamp: '01:40 AM',
          reading: suspects.find((s) => s.id === 'suspect-julian-vance')?.statements[0]?.biometricReading,
        }
      ],
      'suspect-marcus-drake': [
        {
          id: 'msg-md-0',
          sender: 'suspect',
          text: 'Two uniforms pulled me away from repairing diesel winches at Pier 14. Say what you have to say, Detective, but don’t waste my time.',
          timestamp: '01:45 AM',
          reading: suspects.find((s) => s.id === 'suspect-marcus-drake')?.statements[0]?.biometricReading,
        }
      ],
      'suspect-aris-thorne': [
        {
          id: 'msg-at-0',
          sender: 'suspect',
          text: 'I have already submitted my dispensary records to the harbor police. If you have questions regarding maritime toxicological assays, ask them with clinical precision.',
          timestamp: '01:50 AM',
          reading: suspects.find((s) => s.id === 'suspect-aris-thorne')?.statements[0]?.biometricReading,
        }
      ]
    };
  }

  // Case 1: The Velvet Ash Murder (Arthur Sterling)
  return {
    'suspect-julian-vance': [
      {
        id: 'msg-jv-0',
        sender: 'suspect',
        text: 'Detective. Let’s make this brief. I have an art gallery to administer, and Arthur Sterling’s death is already causing distress among our international patrons.',
        timestamp: '11:02 PM',
        reading: suspects.find((s) => s.id === 'suspect-julian-vance')?.statements[0]?.biometricReading,
      }
    ],
    'suspect-evelyn-cross': [
      {
        id: 'msg-ec-0',
        sender: 'suspect',
        text: 'Please, Detective... I came down here voluntarily. I don’t know what you think I did, but I’ve been shaking ever since your officers arrived at the academy.',
        timestamp: '11:04 PM',
        reading: suspects.find((s) => s.id === 'suspect-evelyn-cross')?.statements[0]?.biometricReading,
      }
    ],
    'suspect-marcus-drake': [
      {
        id: 'msg-md-0',
        sender: 'suspect',
        text: 'I told your patrolmen everything. Mr. Sterling fired me two months ago, and I was miles away at the shipyard.',
        timestamp: '11:06 PM',
        reading: suspects.find((s) => s.id === 'suspect-marcus-drake')?.statements[0]?.biometricReading,
      }
    ],
    'suspect-aris-thorne': [
      {
        id: 'msg-at-0',
        sender: 'suspect',
        text: 'I have already submitted my toxicology logs to the coroner. If you have questions regarding digitalis titration, ask them with clinical precision.',
        timestamp: '11:08 PM',
        reading: suspects.find((s) => s.id === 'suspect-aris-thorne')?.statements[0]?.biometricReading,
      }
    ]
  };
}

export const InterrogationChamber: React.FC<InterrogationChamberProps> = ({
  coldCase,
  suspects,
  activeSuspectId,
  onSelectSuspect,
  activeStatementIdx,
  onSelectStatementIdx,
  evidenceList,
  crackedStatements,
  onCrackStatement,
  onOpenPsychProfile,
  detectiveShieldEnabled = true,
}) => {
  const activeSuspect = suspects.find((s) => s.id === activeSuspectId) || suspects[0];
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [feedbackResult, setFeedbackResult] = useState<{
    success: boolean;
    title: string;
    message: string;
    breakdown?: string;
  } | null>(null);

  // Live Avatar Conversation State
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [speechTranscriptPreview, setSpeechTranscriptPreview] = useState<string>('');
  const [showCaseTopics, setShowCaseTopics] = useState<boolean>(true);

  // Detective Voice Capture Log & Audio Monitor State
  const [voiceLogs, setVoiceLogs] = useState<VoiceLogEntry[]>([]);
  const [lastVoiceResult, setLastVoiceResult] = useState<{
    transcript: string;
    timestamp: string;
    durationSec: number;
    status: 'success' | 'no_speech' | 'error';
  } | null>(null);
  const [showVoiceHistory, setShowVoiceHistory] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const recordingTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() =>
    getInitialChatHistories(coldCase.id, suspects)
  );

  // Synchronize initial chat histories when switching cases
  useEffect(() => {
    setChatHistories(getInitialChatHistories(coldCase.id, suspects));
  }, [coldCase.id]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const safeIdx = Math.min(activeStatementIdx, activeSuspect.statements.length - 1);
  const currentStatement: SuspectStatement = activeSuspect.statements[safeIdx] || activeSuspect.statements[0];
  const isAlreadyCracked = crackedStatements[currentStatement.id];

  // Explicit dynamic biometric reading state (updated by topic clicks or latest conversation turns)
  const [customLiveReading, setCustomLiveReading] = useState<BiometricReading | null>(null);

  // When suspect changes, reset custom reading to statement 0's reading
  useEffect(() => {
    setCustomLiveReading(null);
  }, [activeSuspect.id]);

  const currentChatList = chatHistories[activeSuspect.id] || [];

  // Current dynamic biometric reading (prioritizes explicitly selected topic or latest interaction)
  const liveReading: BiometricReading = customLiveReading || currentStatement.biometricReading;

  // Auto-scroll chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistories, isGenerating]);

  // Handle switching topic statement - immediately updates live facial cues and voice pattern data!
  const handleSelectTopic = (idx: number) => {
    sound.playTypewriter();
    onSelectStatementIdx(idx);
    setFeedbackResult(null);
    const targetStatement = activeSuspect.statements[idx];
    if (targetStatement) {
      setCustomLiveReading(targetStatement.biometricReading);
      sound.playHeartbeat(targetStatement.biometricReading.heartRate);
    }
  };

  // Clean up any ongoing recording when suspect changes or component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, [activeSuspect.id]);

  // Start microphone voice recording
  const handleStartVoiceRecording = async () => {
    setRecordingError(null);
    setSpeechTranscriptPreview('');
    liveTranscriptRef.current = '';
    sound.stopSpeaking();
    sound.playTypewriter();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordingError('Microphone audio capture is not supported in this browser environment.');
      return;
    }

    try {
      // Direct user gesture audio stream request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      // Start elapsed recording duration counter
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setRecordingDuration(elapsed);
      }, 100);

      // Connect Web Audio API Analyser for real-time visual microphone level
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          audioContextRef.current = audioCtx;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch (audioErr) {
        console.warn('AudioContext meter failed to initialize:', audioErr);
      }

      // Determine best audio mime type supported by Firefox / Chromium
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg',
          'audio/mp4',
        ];
        for (const t of types) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
            mimeType = t;
            break;
          }
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const actualMime = recorder.mimeType || mimeType || 'audio/webm';

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setMicVolume(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) {
          try {
            audioContextRef.current.close();
          } catch {}
          audioContextRef.current = null;
        }

        const durationSec = Math.max(0.5, (Date.now() - startTimeRef.current) / 1000);
        const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // If SpeechRecognition gave us text via liveTranscriptRef (immune to React stale closures), use it directly
        const capturedText = (liveTranscriptRef.current || inputQuery).trim();
        if (capturedText && capturedText.length > 0) {
          setSpeechTranscriptPreview('');
          setLastVoiceResult({
            transcript: capturedText,
            timestamp: timeFormatted,
            durationSec,
            status: 'success',
          });
          setVoiceLogs((prev) => [
            {
              id: `vlog-${Date.now()}`,
              timestamp: timeFormatted,
              suspectName: activeSuspect.name,
              transcript: capturedText,
              durationSec,
              status: 'transcribed',
            },
            ...prev,
          ]);
          handleSendMessage(capturedText, true);
          return;
        }

        // Process audio via Gemini multimodal backend or standalone fallback
        const baseUrl = APP_CONFIG.server.getApiBaseUrl();

        if (audioChunksRef.current.length > 0) {
          setIsTranscribing(true);
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              try {
                const resultStr = reader.result as string;
                const base64Audio = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
                const endpoint = `${baseUrl}/api/transcribe`;
                const res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audioBase64: base64Audio, mimeType: actualMime }),
                });

                if (res.ok) {
                  const data = await res.json();
                  const transcript = data.transcription?.trim();
                  if (transcript) {
                    setSpeechTranscriptPreview('');
                    setLastVoiceResult({
                      transcript,
                      timestamp: timeFormatted,
                      durationSec,
                      status: 'success',
                    });
                    setVoiceLogs((prev) => [
                      {
                        id: `vlog-${Date.now()}`,
                        timestamp: timeFormatted,
                        suspectName: activeSuspect.name,
                        transcript,
                        durationSec,
                        status: 'transcribed',
                      },
                      ...prev,
                    ]);
                    handleSendMessage(transcript, true);
                  } else {
                    setLastVoiceResult({
                      transcript: '(No speech detected in audio)',
                      timestamp: timeFormatted,
                      durationSec,
                      status: 'no_speech',
                    });
                    setRecordingError(
                      `Audio of ${durationSec.toFixed(1)}s was received, but no words were heard. Speak clearly into your mic or click a Quick Accusation below!`
                    );
                  }
                } else {
                  setLastVoiceResult({
                    transcript: '(No speech detected)',
                    timestamp: timeFormatted,
                    durationSec,
                    status: 'no_speech',
                  });
                  setRecordingError(
                    `Voice inquest ready. Click any "Quick Accusation" button below to interrogate ${activeSuspect.name}, or type your question in the box!`
                  );
                }
              } catch (err: any) {
                setLastVoiceResult({
                  transcript: '(Voice offline)',
                  timestamp: timeFormatted,
                  durationSec,
                  status: 'no_speech',
                });
                setRecordingError(
                  `Voice audio recorded. Click any "Quick Accusation" below to immediately interrogate ${activeSuspect.name} with your findings, or type your question!`
                );
              } finally {
                setIsTranscribing(false);
              }
            };
          } catch {
            setIsTranscribing(false);
          }
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start browser speech recognition if supported (Chrome/Edge/Safari/Opera)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i] && event.results[i][0]) {
                fullText += event.results[i][0].transcript;
              }
            }
            const trimmed = fullText.trim();
            if (trimmed) {
              liveTranscriptRef.current = trimmed;
              setSpeechTranscriptPreview(trimmed);
              setInputQuery(trimmed);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('[SpeechRec] Recognition event notice:', e.error);
          };

          recognition.onend = () => {
            // Keep active while recording is ongoing
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }
    } catch (err: any) {
      console.warn('Microphone error in Firefox/browser:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setRecordingError(
        isDenied
          ? 'Microphone permission blocked. Click the microphone/lock icon in the URL bar to allow microphone access.'
          : `Microphone issue: ${err.message || 'Device unavailable'}`
      );
      setIsRecording(false);
      setMicVolume(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Stop microphone voice recording
  const handleStopVoiceRecording = () => {
    sound.playTypewriter();
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  // Replay suspect audio via real human studio voice
  const handleSpeakText = (text: string, preloadedBase64?: string | null) => {
    sound.stopSpeaking();
    setIsSpeaking(true);
    sound.speakRealHumanVoice(
      text,
      activeSuspect.id,
      preloadedBase64,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Handle sending a free-form question or confrontation via text or voice
  const handleSendMessage = async (customText?: string, wasVoice?: boolean) => {
    const textToSend = customText !== undefined ? customText.trim() : inputQuery.trim();
    if (!textToSend || isGenerating) return;

    sound.playTypewriter();
    setInputQuery('');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'detective',
      text: textToSend,
      timestamp,
      isVoice: !!wasVoice,
    };

    const updatedHistory = [...(chatHistories[activeSuspect.id] || []), userMessage];
    setChatHistories((prev) => ({
      ...prev,
      [activeSuspect.id]: updatedHistory,
    }));

    setIsGenerating(true);

    try {
      const baseUrl = APP_CONFIG.server.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/chat-suspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: coldCase.id,
          suspectId: activeSuspect.id,
          message: textToSend,
          chatHistory: updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server error communicating with suspect avatar');
      }

      const data = await response.json();
      const suspectReplyText = data.text || 'I have nothing further to state without my counsel present.';
      const newBiometrics: BiometricReading = data.biometricReading || activeSuspect.personality.baselineMetrics;

      const suspectMessage: ChatMessage = {
        id: `sus-${Date.now()}`,
        sender: 'suspect',
        text: suspectReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reading: newBiometrics,
        isCracked: data.biometricReading?.isCracked || false,
        audioBase64: data.audioBase64 || null,
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeSuspect.id]: [...(prev[activeSuspect.id] || []), suspectMessage],
      }));

      // Immediately synchronize live avatar facial micro-cues and spectral voice waveform
      setCustomLiveReading(newBiometrics);

      // Speak using real human voice (Gemini TTS Studio Audio)
      handleSpeakText(suspectReplyText, data.audioBase64);

      // Play heart pulse
      if (newBiometrics.heartRate) {
        sound.playHeartbeat(newBiometrics.heartRate);
      }

      // Check if this conversational turn cracked a case topic!
      if (data.biometricReading?.isCracked) {
        sound.playSuccessChime();
        const crackedTopic = data.biometricReading.crackedTopic;

        // Auto-mark corresponding statement as cracked
        let matchedStatementId = '';
        if (coldCase.id === 'case-02-dockland-fog') {
          if (activeSuspect.id === 'suspect-julian-vance') {
            if (
              crackedTopic === 'manifest' ||
              textToSend.toLowerCase().includes('manifest') ||
              textToSend.toLowerCase().includes('rotterdam') ||
              textToSend.toLowerCase().includes('00:45') ||
              textToSend.toLowerCase().includes('notary') ||
              textToSend.toLowerCase().includes('seal') ||
              textToSend.toLowerCase().includes('office')
            ) {
              matchedStatementId = 'stmt-jv-02-01';
            } else {
              matchedStatementId = 'stmt-jv-02-02';
            }
          } else if (activeSuspect.id === 'suspect-aris-thorne') {
            matchedStatementId = 'stmt-at-02-01';
          }
        } else {
          if (activeSuspect.id === 'suspect-julian-vance') {
            if (crackedTopic === 'whereabouts' || textToSend.toLowerCase().includes('phone') || textToSend.toLowerCase().includes('11:15')) {
              matchedStatementId = 'stmt-jv-01';
            } else if (crackedTopic === 'key' || textToSend.toLowerCase().includes('key') || textToSend.toLowerCase().includes('wool')) {
              matchedStatementId = 'stmt-jv-02';
            } else if (crackedTopic === 'poison' || textToSend.toLowerCase().includes('poison') || textToSend.toLowerCase().includes('thorne')) {
              matchedStatementId = 'stmt-jv-03';
            } else {
              matchedStatementId = 'stmt-jv-01';
            }
          } else if (activeSuspect.id === 'suspect-aris-thorne') {
            if (crackedTopic === 'poison' || textToSend.toLowerCase().includes('manifest') || textToSend.toLowerCase().includes('warehouse')) {
              matchedStatementId = 'stmt-at-01';
            } else {
              matchedStatementId = 'stmt-at-02';
            }
          }
        }

        if (matchedStatementId) {
          onCrackStatement(matchedStatementId, activeSuspect.id);
        }

        setFeedbackResult({
          success: true,
          title: 'DECEPTION CRACKED THROUGH CONVERSATION',
          message: `${activeSuspect.name}’s alibi gave way under your direct inquest. Their admission has been permanently entered into the case file.`,
          breakdown: suspectReplyText,
        });
      }
    } catch {
      // Fallback response for offline / standalone hosts (e.g. itch.io)
      const q = textToSend.toLowerCase();
      let fallbackReply = `${activeSuspect.name} maintains a guarded posture. "You'll have to present harder facts than that, Detective."`;
      let didCrackOffline = false;
      let matchedStatementId = '';

      if (coldCase.id === 'case-01-velvet-ash') {
        if (activeSuspect.id === 'suspect-julian-vance') {
          if (q.includes('phone') || q.includes('11:15') || q.includes('11:30') || q.includes('cable') || q.includes('switchboard') || q.includes('cut')) {
            fallbackReply = 'Alright, damn you! Arthur never phoned me. The switchboard was severed at 11:15 PM and I knew it. But that doesn’t prove I poisoned his scotch!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-jv-01';
          } else if (q.includes('key') || q.includes('duplicate') || q.includes('carpet') || q.includes('wool') || q.includes('service')) {
            fallbackReply = 'Fine! I took the duplicate service key from Arthur’s desk weeks ago. I went up there to retrieve my promissory notes, but he was already dead!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-jv-02';
          } else if (q.includes('poison') || q.includes('aconitine') || q.includes('scotch') || q.includes('wolfsbane') || q.includes('thorne')) {
            fallbackReply = 'Dr. Thorne swore the aconitine tincture was undetectable! Arthur was ruining my gallery... he gave me no choice!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-jv-03';
          }
        } else if (activeSuspect.id === 'suspect-aris-thorne') {
          if (q.includes('manifest') || q.includes('warehouse') || q.includes('500ml') || q.includes('aconitine') || q.includes('dispensary')) {
            fallbackReply = 'Julian blackmailed me with my counterfeit morphine prescriptions! I prepared the tincture, but I never set foot inside Arthur’s penthouse!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-at-01';
          }
        }
      } else if (coldCase.id === 'case-02-dockland-fog') {
        if (activeSuspect.id === 'suspect-julian-vance') {
          if (q.includes('manifest') || q.includes('rotterdam') || q.includes('00:45') || q.includes('seal') || q.includes('countersign') || q.includes('berth')) {
            fallbackReply = 'Silas O’Malley discovered the Dutch antiquities in crate 14! He demanded twenty thousand dollars or he was calling the commissioner!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-jv-02-01';
          } else if (q.includes('ash') || q.includes('sobranie') || q.includes('cigarette') || q.includes('thermos') || q.includes('curare') || q.includes('poison')) {
            fallbackReply = 'I spiked the thermos while Silas was checking the generator! It was self-preservation, Detective!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-jv-02-02';
          }
        } else if (activeSuspect.id === 'suspect-aris-thorne') {
          if (q.includes('sandbar') || q.includes('vial') || q.includes('tubocurarine') || q.includes('bottle') || q.includes('curare')) {
            fallbackReply = 'Julian swore to me it was only a veterinary sedative to put Silas to sleep for three hours! I threw the empty vial into the low-tide mud!';
            didCrackOffline = true;
            matchedStatementId = 'stmt-at-02-01';
          }
        }
      }

      if (didCrackOffline && matchedStatementId) {
        onCrackStatement(matchedStatementId, activeSuspect.id);
        sound.playSuccessChime();
        setFeedbackResult({
          success: true,
          title: 'DECEPTION CRACKED THROUGH CONVERSATION',
          message: `${activeSuspect.name}’s alibi gave way under your direct inquest. Their admission has been permanently entered into the case file.`,
          breakdown: fallbackReply,
        });
      }

      const suspectMessage: ChatMessage = {
        id: `sus-${Date.now()}`,
        sender: 'suspect',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reading: currentStatement.biometricReading,
        isCracked: didCrackOffline,
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeSuspect.id]: [...(prev[activeSuspect.id] || []), suspectMessage],
      }));
      handleSpeakText(fallbackReply);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Challenge with Physical Evidence (Original button)
  const handleConfrontWithEvidence = (selectedEvidence: Evidence) => {
    setIsEvidenceModalOpen(false);

    if (currentStatement.isLie && currentStatement.lieGrounds === 'evidence') {
      if (currentStatement.contradictingEvidenceId === selectedEvidence.id) {
        sound.playSuccessChime();
        onCrackStatement(currentStatement.id, activeSuspect.id);
        setFeedbackResult({
          success: true,
          title: 'DECEPTION UNMASKED BY PHYSICAL EVIDENCE',
          message: currentStatement.deceptionExplanation || 'The suspect’s alibi is irrevocably broken by physical exhibits.',
          breakdown: currentStatement.confessionBreak,
        });
        if (currentStatement.confessionBreak) {
          handleSpeakText(currentStatement.confessionBreak);
        }
      } else {
        sound.playBuzzer();
        setFeedbackResult({
          success: false,
          title: 'INCORRECT EVIDENCE PRESENTED',
          message: `The suspect brushes aside "${selectedEvidence.title}". This exhibit does not directly contradict this specific statement.`,
        });
      }
    } else if (currentStatement.isLie) {
      sound.playBuzzer();
      setFeedbackResult({
        success: false,
        title: 'WRONG INVESTIGATIVE ANGLE',
        message: 'There is deception here, but no physical document refutes it. Analyze their Voice Pattern or Facial Micro-Expressions calibrated against their psychological baseline!',
      });
    } else {
      sound.playBuzzer();
      setFeedbackResult({
        success: false,
        title: 'FALSE ACCUSATION: SUBJECT IS TELLING THE TRUTH',
        message: `Careful, Detective! ${activeSuspect.name}’s statement is verified by existing records. Review their psychological disposition to avoid false accusations.`,
      });
    }
  };

  // 2. Challenge with Voice Stress Anomaly (Original button)
  const handleConfrontVoiceStress = () => {
    if (currentStatement.isLie && currentStatement.lieGrounds === 'voice') {
      sound.playSuccessChime();
      onCrackStatement(currentStatement.id, activeSuspect.id);
      setFeedbackResult({
        success: true,
        title: 'ACOUSTIC JITTER ANOMALY CONFIRMED',
        message: currentStatement.deceptionExplanation || 'Vocal frequency jump, cadence stutter, and laryngeal micro-tremor exceeded calibrated baseline.',
        breakdown: currentStatement.confessionBreak,
      });
      if (currentStatement.confessionBreak) {
        handleSpeakText(currentStatement.confessionBreak);
      }
    } else if (!currentStatement.isLie) {
      sound.playBuzzer();
      if (detectiveShieldEnabled && activeSuspect.personality.id === 'neurotic_anxious') {
        setFeedbackResult({
          success: false,
          title: 'FALSE POSITIVE: ANXIETY BASELINE MISINTERPRETED',
          message: `${activeSuspect.name} exhibits natural 18% vocal tremor due to their chronic panic profile. Their voice jitter here did NOT exceed their calibrated baseline!`,
        });
      } else {
        setFeedbackResult({
          success: false,
          title: 'CHALLENGE FAILED: NO CONTRADICTION',
          message: 'The subject’s vocal pitch, frequency, and cadence remain steady or fail to establish deception.',
        });
      }
    } else {
      sound.playBuzzer();
      setFeedbackResult({
        success: false,
        title: 'INSUFFICIENT VOICE CORROBORATION',
        message: 'Their voice pitch alone does not break this statement. Check the physical evidence locker!',
      });
    }
  };

  // 3. Challenge with Facial / Micro-Expression Biometrics (Original button)
  const handleConfrontBiometrics = () => {
    const reading = currentStatement.biometricReading;
    if (reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY') {
      sound.playSuccessChime();
      onCrackStatement(currentStatement.id, activeSuspect.id);
      setFeedbackResult({
        success: true,
        title: 'MICRO-EXPRESSION & FACIAL ANOMALY PINNED',
        message: currentStatement.deceptionExplanation || 'Facial recognition caught acute micro-smirk asymmetry and pupillary constriction breaking baseline calibration.',
        breakdown: currentStatement.confessionBreak,
      });
      if (currentStatement.confessionBreak) {
        handleSpeakText(currentStatement.confessionBreak);
      }
    } else if (reading.anomalyRating === 'ELEVATED_ANXIETY_WITHIN_BASELINE') {
      sound.playBuzzer();
      if (detectiveShieldEnabled) {
        setFeedbackResult({
          success: false,
          title: 'FALSE POSITIVE GUARD TRIGGERED',
          message: `Detective alert: ${activeSuspect.name}’s darting eyes and elevated heart rate are part of their calibrated nervous disposition, NOT deception! Accusing them on this basis is a procedural blunder.`,
        });
      } else {
        setFeedbackResult({
          success: false,
          title: 'CHALLENGE REBUFFED',
          message: `${activeSuspect.name} remains composed under pressure. Your accusation failed to establish deception.`,
        });
      }
    } else {
      sound.playBuzzer();
      setFeedbackResult({
        success: false,
        title: 'NO FACIAL ANOMALY DETECTED',
        message: 'Facial landmarks, pupil aperture, and blink rate remain bilaterally symmetric and normal.',
      });
    }
  };

  // 4. Accept Statement as Truth (Original button)
  const handleAcceptStatement = () => {
    sound.playTypewriter();
    if (!currentStatement.isLie) {
      sound.playSuccessChime();
      setFeedbackResult({
        success: true,
        title: 'STATEMENT CONFIRMED TRUTHFUL',
        message: 'Biometric telemetry confirms the testimony is consistent with the subject’s calibrated baseline. No contradiction detected.',
      });
    } else {
      sound.playBuzzer();
      setFeedbackResult({
        success: false,
        title: 'DECEPTION OVERLOOKED',
        message: 'You accepted a statement that contains critical fabrication! Re-examine the biometrics and physical timeline before proceeding.',
      });
    }
  };

  // Preset quick probe prompts tailored to suspect and active case
  const isCaseTwo = coldCase.id === 'case-02-dockland-fog';
  const quickProbes: { label: string; query: string }[] = isCaseTwo
    ? activeSuspect.id === 'suspect-julian-vance'
      ? [
          { label: 'Confront Pier Manifest', query: 'Your private notary seal countersigned the Rotterdam manifest at 00:45 AM inside O’Malley’s office!' },
          { label: 'Confront Turkish Ash on Thermos', query: 'Turkish cigarette ash matching your bespoke Sobranie blend was found on O’Malley’s poisoned coffee thermos!' },
          { label: 'Challenge Mayfair Alibi', query: 'You claim you were in Mayfair inspecting sketches, but the impounded tugboat log places you on Pier 14.' },
          { label: 'Ask About Rotterdam Crates', query: 'What forged European antiquities were hidden in the Rotterdam crates Silas O’Malley impounded?' }
        ]
      : activeSuspect.id === 'suspect-aris-thorne'
      ? [
          { label: 'Confront Sandbar Tincture Vial', query: 'The cracked amber bottle found on the low tide sandbar bears your university dispensary label for purified tubocurarine.' },
          { label: 'Challenge Speech Latency', query: 'Your speech latency paused for over 2.5 seconds and your pupils pinpointed when asked about Vance.' },
          { label: 'Ask About Curare Formulation', query: 'Did you synthesize the tubocurarine alkaloid solution used to paralyze dockmaster O’Malley?' }
        ]
      : [
          { label: 'Inquire About Stolen Spanner', query: 'Your 1-inch machinist spanner was found jamming the main circuit breaker. Who took it from your workbench?' },
          { label: 'Verify Loft Alibi', query: 'The tugboat engine cradle shows fresh diesel grease confirming you were repairing the manifold during the blackout.' },
          { label: 'Confirm Stoic Demeanor', query: 'Your 48% glance aversion reflects hostility toward badges, but your physiological baseline is steady.' }
        ]
    : activeSuspect.id === 'suspect-julian-vance'
    ? [
        { label: 'Confront Phone Line', query: 'Arthur could not have called you at 11:30 PM because the telephone cable was severed at 11:15 PM!' },
        { label: 'Confront Service Key', query: 'Charcoal wool fibers matching your bespoke suit were found on the service stairwell master key.' },
        { label: 'Challenge Micro-Smirk', query: 'Your facial biometrics betrayed a 140ms asymmetric smirk when you claimed you were never in the study.' },
        { label: 'Ask About Safe Bonds', query: 'Where were you when three million in municipal bonds were taken from Arthur’s wall safe?' }
      ]
    : activeSuspect.id === 'suspect-aris-thorne'
    ? [
        { label: 'Confront Warehouse Manifest', query: 'Customs impound records show 500ml of aconitine alkaloid imported under your alias at Warehouse 4.' },
        { label: 'Challenge Speech Latency', query: 'Your response latency jumped to 2.8 seconds and your pupils pinpointed when asked about Vance.' },
        { label: 'Ask About Poison Delivery', query: 'Did you supply Julian Vance with the purified aconitine tincture found in Arthur’s scotch?' }
      ]
    : activeSuspect.id === 'suspect-evelyn-cross'
    ? [
        { label: 'Verify Conservatory Alibi', query: 'Can you confirm Mr. Henderson logged you practicing Chopin until 11:45 PM at St. Jude?' },
        { label: 'Observe Anxiety Baseline', query: 'Take a breath, Evelyn. Your heart rate and tremors match your normal baseline profile.' },
        { label: 'Inquire About Julian Vance', query: 'Did Julian Vance ever ask you about your uncle’s will or the penthouse safe?' }
      ]
    : [
        { label: 'Verify Shipyard Alibi', query: 'Captain O’Malley’s tugboat repair log places you at the machine shop until 2:00 AM.' },
        { label: 'Ask About Doctor Thorne', query: 'Did you witness Dr. Thorne carrying brown apothecary bottles to Arthur’s penthouse?' },
        { label: 'Confirm Stoic Gaze', query: 'Your eye aversion reflects hostility toward police, but your physiological baseline is steady.' }
      ];

  return (
    <div className="space-y-6">
      {/* Suspect Selector Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0b0f17] border border-slate-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-terminal text-slate-500 uppercase tracking-wider pl-1">
            Interrogate Suspect:
          </span>
          {suspects.map((suspect) => {
            const isSelected = suspect.id === activeSuspectId;
            return (
              <button
                key={suspect.id}
                onClick={() => {
                  sound.stopSpeaking();
                  sound.playTypewriter();
                  onSelectSuspect(suspect.id);
                  onSelectStatementIdx(0);
                  setFeedbackResult(null);
                  sound.playHeartbeat(suspect.personality.baselineMetrics.heartRateBpm);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all border text-xs font-terminal ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-500/80 text-amber-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="font-semibold">{suspect.name}</span>
                <span className="text-[10px] text-slate-500">({suspect.alias})</span>
              </button>
            );
          })}
        </div>

        {/* Live Audio / Voice Status Pill */}
        <div className="flex items-center gap-2 text-xs font-terminal">
          {isSpeaking ? (
            <button
              onClick={() => {
                sound.stopSpeaking();
                setIsSpeaking(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/60 text-amber-300 animate-pulse hover:bg-amber-500/30"
              title="Silence Suspect Voice"
            >
              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              <span>Speaking (Real Human Voice) · Stop</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Real Human Studio Voice (24kHz)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Split Console: Left Biometrics vs Right Live Conversation & Case Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suspect Bio & Facial Landmark Scanner (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <PixelNoirAvatar
            suspectId={activeSuspect.id}
            suspectName={activeSuspect.name}
            photoUrl={activeSuspect.photoUrl}
            reading={liveReading}
            personality={activeSuspect.personality}
            isSpeaking={isSpeaking}
            detectiveShieldEnabled={detectiveShieldEnabled}
          />

          {/* Quick Psych Summary Pill */}
          <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-terminal text-slate-500 uppercase">
                  Psychological Disposition
                </div>
                <div className="text-xs font-bold text-amber-400 font-terminal mt-0.5">
                  {activeSuspect.personality.indicator}
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playTypewriter();
                  onOpenPsychProfile();
                }}
                className="text-xs font-terminal text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              >
                View Full Baseline Profile ›
              </button>
            </div>

            {/* Quick Demographics Strip */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center font-terminal text-[11px]">
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase">Sex</span>
                <span className="text-slate-200 font-semibold">{activeSuspect.sex}</span>
              </div>
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase">Gender</span>
                <span className="text-slate-200 font-semibold">{activeSuspect.gender}</span>
              </div>
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase">Height</span>
                <span className="text-amber-300 font-semibold">{activeSuspect.height.split(' ')[0]}</span>
              </div>
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase">Blood</span>
                <span className="text-rose-400 font-semibold">{activeSuspect.bloodType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Spectrogram, Live Conversational Chat & Older Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Spectral Audio Pattern */}
            <VoicePatternAnalyzer
              reading={liveReading}
              personality={activeSuspect.personality}
              durationSec={currentStatement.audioDurationSec}
              suspectId={activeSuspect.id}
              statementText={currentStatement.suspectResponse}
            />

            {/* LIVE CONVERSATION CONSOLE (NEW FEATURE) */}
            <div className="bg-[#0b0f17] border border-cyan-500/40 rounded-lg overflow-hidden flex flex-col shadow-lg shadow-cyan-950/10">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#070a10] border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold font-terminal text-cyan-300 tracking-wider">
                    LIVE CONVERSATIONAL INQUEST · {activeSuspect.name.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-terminal text-amber-300">
                    <Mic className="w-3 h-3 text-amber-400" />
                    <span>MIC ACTIVE</span>
                  </span>
                </div>
                <div className="text-[10px] font-terminal text-slate-400">
                  Voice Inquest & Real-time Dialogue
                </div>
              </div>

              {/* Scrollable Conversation Log */}
              <div
                ref={chatContainerRef}
                className="p-3.5 max-h-56 overflow-y-auto space-y-3 bg-[#06090e]"
              >
                {currentChatList.map((msg) => {
                  const isDet = msg.sender === 'detective';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDet ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-terminal text-slate-500 mb-0.5">
                        <span>{isDet ? 'Detective Inquest' : activeSuspect.name}</span>
                        {isDet && msg.isVoice && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-terminal font-semibold">
                            <Mic className="w-2.5 h-2.5 text-amber-400" />
                            VOICE CAPTURED
                          </span>
                        )}
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                        {!isDet && (
                          <button
                            onClick={() => handleSpeakText(msg.text, msg.audioBase64)}
                            title="Replay Studio Human Voice"
                            className="text-amber-400 hover:text-amber-300 ml-1 inline-flex items-center gap-0.5"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Voice</span>
                          </button>
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-lg p-2.5 text-xs font-serif leading-relaxed ${
                          isDet
                            ? 'bg-slate-900 border border-slate-700 text-slate-100 italic'
                            : msg.isCracked
                            ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-100 shadow-md'
                            : 'bg-[#0d121c] border border-slate-800 text-amber-100'
                        }`}
                      >
                        "{msg.text}"
                        {msg.reading && msg.reading.anomalyRating === 'CRITICAL_DECEPTION_ANOMALY' && (
                          <div className="mt-1 pt-1 border-t border-rose-500/30 text-[10px] font-terminal text-rose-400 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            Micro-Deception Anomaly Detected ({msg.reading.heartRate} BPM · Jitter: {msg.reading.pitchJitterHz}Hz)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs font-terminal text-cyan-400 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Analyzing facial micro-mesh and compiling suspect response...</span>
                  </div>
                )}
              </div>

              {/* Quick Inquest Accusation Chips */}
              <div className="px-3 py-2 bg-[#090d14] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-terminal text-slate-500 uppercase shrink-0">
                  Quick Accusations:
                </span>
                {quickProbes.map((probe, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(probe.query)}
                    disabled={isGenerating}
                    className="px-2.5 py-1 text-[11px] font-terminal rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    {probe.label}
                  </button>
                ))}
              </div>

              {/* Live Voice Recording Status & Audio Visualizer (when user is speaking) */}
              {isRecording && (
                <div className="px-3.5 py-2.5 bg-gradient-to-r from-rose-950/90 via-slate-950 to-rose-950/90 border-t border-rose-500/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-terminal text-rose-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-bold tracking-wider uppercase text-rose-300">
                        MICROPHONE LIVE · QUESTIONING {activeSuspect.name.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-rose-300 text-xs">
                      <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>
                        00:{recordingDuration < 10 ? `0${recordingDuration.toFixed(1)}` : recordingDuration.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Real-time Visual Audio Wave / Level Meter */}
                  <div className="flex items-center gap-2 text-[10px] font-terminal text-slate-400">
                    <span className="shrink-0 text-slate-400">MIC SIGNAL:</span>
                    <div className="flex-1 bg-slate-900 border border-slate-700 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 h-full transition-all duration-75"
                        style={{ width: `${Math.max(6, micVolume)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-amber-300 font-bold">{micVolume}%</span>
                  </div>

                  {speechTranscriptPreview && (
                    <div className="text-xs font-serif text-amber-200 italic bg-black/60 px-2 py-1 rounded border border-rose-500/40">
                      Hearing: "{speechTranscriptPreview}"
                    </div>
                  )}
                  <div className="text-[10px] font-terminal text-rose-300/80 text-right">
                    Click "FINISH TALK" or press Enter when done speaking
                  </div>
                </div>
              )}

              {/* Transcribing Indicator */}
              {isTranscribing && (
                <div className="px-3.5 py-2.5 bg-cyan-950/70 border-t border-cyan-500/50 flex items-center justify-between text-xs font-terminal text-cyan-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>Gemini Multimodal Neural Transcription · Decoding voice statement...</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-mono">
                    {recordingDuration > 0 ? `${recordingDuration.toFixed(1)}s audio` : 'processing audio'}
                  </span>
                </div>
              )}

              {/* Recording / Voice Inquest Error Alert */}
              {recordingError && (
                <div className="px-3 py-2 bg-amber-950/60 border-t border-amber-500/40 flex items-center justify-between text-[11px] font-terminal text-amber-300">
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{recordingError}</span>
                  </div>
                  <button onClick={() => setRecordingError(null)} className="text-amber-400 hover:text-amber-200 ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* DETECTIVE VOICE CAPTURE LOG (Dedicated Spoken Audio Capture Verification) */}
              <div className="border-t border-slate-800 bg-[#070a11] px-3.5 py-2">
                <div className="flex items-center justify-between text-[11px] font-terminal text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-bold uppercase tracking-wider">
                      Detective Voice Inquest Log
                    </span>
                    {voiceLogs.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                        {voiceLogs.length} spoken {voiceLogs.length === 1 ? 'question' : 'questions'}
                      </span>
                    )}
                  </div>

                  {voiceLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowVoiceHistory((prev) => !prev)}
                      className="text-[10px] font-terminal text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      <span>{showVoiceHistory ? 'Hide Voice History' : 'View All Spoken Audio'}</span>
                      {showVoiceHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Latest Voice Capture Quote & Verification */}
                {lastVoiceResult ? (
                  <div className="mt-1.5 bg-[#04060a] border border-slate-800 rounded p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-terminal text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        LATEST VOICE CAPTURE · {lastVoiceResult.timestamp}
                      </span>
                      <span className="font-mono text-slate-500">
                        {lastVoiceResult.durationSec.toFixed(1)}s audio clip
                      </span>
                    </div>
                    <div className="font-serif text-slate-200 italic pl-2.5 border-l-2 border-amber-500/60 py-0.5">
                      "{lastVoiceResult.transcript}"
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-terminal text-slate-500">
                      <span>Transcribed from microphone & questioned to {activeSuspect.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInputQuery(lastVoiceResult.transcript);
                          sound.playTypewriter();
                        }}
                        className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-0.5"
                        title="Copy to text box to edit or re-send"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Edit in text box</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] font-terminal text-slate-500 mt-1 italic">
                    No voice statements recorded yet. Click "VOICE TALK" to question {activeSuspect.name} through your microphone.
                  </div>
                )}

                {/* Full Voice History Drawer */}
                {showVoiceHistory && voiceLogs.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1 border-t border-slate-800/80 pt-2">
                    {voiceLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-950/80 border border-slate-800/80 rounded p-2 text-xs font-serif flex items-start justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="text-[10px] font-terminal text-slate-400 mb-0.5 flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{log.timestamp}</span>
                            <span>→ Questioned {log.suspectName}</span>
                            <span className="font-mono text-slate-500">({log.durationSec.toFixed(1)}s)</span>
                          </div>
                          <div className="italic text-slate-200">"{log.transcript}"</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTypewriter();
                            setInputQuery(log.transcript);
                          }}
                          title="Copy back to text box"
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input Box & Microphone to speak with suspect */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isRecording) {
                    handleStopVoiceRecording();
                  } else {
                    handleSendMessage();
                  }
                }}
                className="p-2.5 bg-[#070a10] border-t border-slate-800 flex items-center gap-2"
              >
                {/* Voice Talk Button (Push-to-Talk / Toggle Microphone) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      handleStopVoiceRecording();
                    } else {
                      handleStartVoiceRecording();
                    }
                  }}
                  disabled={isGenerating || isTranscribing}
                  title={isRecording ? 'Stop Recording and Send Question' : 'Speak to Suspect via Microphone'}
                  className={`p-2 rounded text-xs font-terminal flex items-center gap-1.5 transition-all shrink-0 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 animate-pulse border border-rose-400'
                      : isTranscribing
                      ? 'bg-cyan-950 border border-cyan-700 text-cyan-400 cursor-wait'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300'
                  }`}
                >
                  {isTranscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline font-bold">FINISH TALK</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline font-bold">VOICE TALK</span>
                    </>
                  )}
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    isRecording
                      ? 'Listening to your voice inquest... Speak clearly into your mic'
                      : `Question or accuse ${activeSuspect.name} by voice or typing...`
                  }
                  disabled={isGenerating || isTranscribing}
                  className={`flex-1 bg-slate-950 border rounded px-3 py-2 text-xs font-terminal text-slate-200 placeholder-slate-500 focus:outline-none transition-colors ${
                    isRecording
                      ? 'border-rose-500/80 bg-rose-950/20 text-rose-200'
                      : 'border-slate-700 focus:border-amber-500'
                  }`}
                />

                <button
                  type="submit"
                  disabled={(!inputQuery.trim() && !isRecording) || isGenerating || isTranscribing}
                  className={`px-4 py-2 rounded text-xs font-terminal font-bold flex items-center gap-1.5 transition-all ${
                    inputQuery.trim() && !isGenerating && !isTranscribing
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md'
                      : isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Breakthrough Feedback Banner */}
            {feedbackResult && (
              <div
                className={`p-4 rounded-lg border transition-all ${
                  feedbackResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold font-terminal uppercase">
                    {feedbackResult.success ? (
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{feedbackResult.title}</span>
                  </div>
                  <button
                    onClick={() => setFeedbackResult(null)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs font-terminal mt-2 leading-relaxed">
                  {feedbackResult.message}
                </p>
                {feedbackResult.breakdown && (
                  <div className="mt-3 p-3 rounded bg-slate-950/80 border border-emerald-500/30 text-xs italic font-serif text-emerald-200">
                    {feedbackResult.breakdown}
                  </div>
                )}
              </div>
            )}

            {/* STRUCTURED CASE TOPICS & STATEMENTS (OLDER BUTTONS KEPT AS REQUESTED) */}
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-terminal uppercase tracking-wider text-slate-400">
                  Case Record Topics & Baseline Statements
                </span>
                <button
                  onClick={() => setShowCaseTopics(!showCaseTopics)}
                  className="text-[10px] font-terminal text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {showCaseTopics ? (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Expand Topics</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {showCaseTopics && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {activeSuspect.statements.map((stmt, idx) => {
                      const isCracked = crackedStatements[stmt.id];
                      const isSelected = activeStatementIdx === idx;
                      return (
                        <button
                          key={stmt.id}
                          onClick={() => handleSelectTopic(idx)}
                          className={`px-3 py-1.5 rounded text-xs font-terminal transition-all border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-600 text-slate-950 font-bold border-amber-500'
                              : isCracked
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isCracked && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          <span>{stmt.interrogationTopic}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dialogue Transcript Card */}
                  <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
                    <div>
                      <div className="text-[10px] font-terminal text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Detective's Inquest</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium italic mt-0.5 pl-2 border-l-2 border-cyan-500/60">
                        "{currentStatement.detectiveQuestion}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="text-[10px] font-terminal text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Suspect's Formal Testimony</span>
                          <button
                            onClick={() => {
                              const textToSpeak = isAlreadyCracked
                                ? (currentStatement.confessionBreak || currentStatement.deceptionExplanation || currentStatement.suspectResponse)
                                : currentStatement.suspectResponse;
                              handleSpeakText(textToSpeak);
                            }}
                            className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-terminal text-[10px] border border-amber-500/40 rounded px-1.5 py-0.5 bg-amber-950/40 transition-colors"
                            title="Play Suspect Voice Audio"
                          >
                            <Volume2 className="w-3 h-3 text-amber-400" />
                            <span>PLAY VOICE</span>
                          </button>
                        </div>
                        {isAlreadyCracked && (
                          <span className="text-[10px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ALIBI BROKEN · CONFESSION EXTRACTED
                          </span>
                        )}
                      </div>

                      {isAlreadyCracked ? (
                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] font-terminal text-rose-400/80 uppercase mb-0.5">
                              [Initial Statement · Disproven]
                            </div>
                            <p className="text-xs text-slate-400 font-serif italic line-through pl-2 border-l-2 border-rose-900/60 opacity-60">
                              "{currentStatement.suspectResponse}"
                            </p>
                          </div>

                          <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/60 text-emerald-100 space-y-1.5 shadow-md">
                            <div className="text-[10px] font-terminal font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Extracted Admission (Case Record)</span>
                            </div>
                            <p className="text-xs md:text-sm text-emerald-200 font-serif italic leading-relaxed pl-2 border-l-2 border-emerald-400">
                              {currentStatement.confessionBreak || currentStatement.deceptionExplanation}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-amber-100 font-serif leading-relaxed mt-1 pl-2 border-l-2 border-amber-500/60">
                          "{currentStatement.suspectResponse}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONFRONTATION ACTION DOCK (OLDER BUTTONS KEPT IN FULL AS REQUESTED) */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-terminal uppercase tracking-wider text-slate-500 mb-2">
              <span>Standard Investigative Action Buttons:</span>
              {isAlreadyCracked && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 normal-case">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Admission secured in case file
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-terminal">
              {/* Option 1: Physical Evidence */}
              <button
                onClick={() => {
                  sound.playTypewriter();
                  setIsEvidenceModalOpen(true);
                }}
                className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Physical Clue</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Present contradicting document or forensic item
                </div>
              </button>

              {/* Option 2: Voice Stress Anomaly */}
              <button
                onClick={handleConfrontVoiceStress}
                className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Voice Stress</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Challenge pitch jitter or cadence latency vs baseline
                </div>
              </button>

              {/* Option 3: Facial Micro-Expression */}
              <button
                onClick={handleConfrontBiometrics}
                className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Micro-Cue</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Challenge pupil constriction or smirk asymmetry
                </div>
              </button>

              {/* Option 4: Accept Statement */}
              <button
                onClick={handleAcceptStatement}
                className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Accept Statement</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Validate as consistent with calibrated baseline
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Picker Modal for Confrontation */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0b0f17] border border-slate-700 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100 font-noir">
                  Select Evidence to Confront "{activeSuspect.name}"
                </h3>
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-terminal">
              Select the authenticated piece of physical or forensic evidence that directly refutes the suspect’s statement.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleConfrontWithEvidence(item)}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-500/60 hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 font-noir">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-terminal font-bold rounded shrink-0">
                    Present
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="px-4 py-1.5 text-xs font-terminal text-slate-400 hover:text-slate-200 rounded border border-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
