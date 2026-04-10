import { useCallback, useRef, useState } from 'react';

import {
  getSpeechRecognitionConstructor,
  isSpeechRecognitionAvailable,
  requestMicrophoneStream,
  summarizeTranscriptWithOllama,
} from 'Modules/prototypes/financialInterview/openSourceVoiceAssist';

type Options = {
  onTranscriptFinal: (text: string) => void;
  onInputInterim: (text: string) => void;
  onListeningChange: (v: boolean) => void;
  /** When Web Speech API is missing: invoked on **pointer up** after a hold (demo line). */
  onDemoFallback: () => void;
};

export function usePrototypeVoiceSession({
  onTranscriptFinal,
  onInputInterim,
  onListeningChange,
  onDemoFallback,
}: Options) {
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [micSessionReady, setMicSessionReady] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [llmSummary, setLlmSummary] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalBufferRef = useRef('');
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const levelRafRef = useRef(0);
  const demoHoldRef = useRef(false);
  const pointerActiveRef = useRef(false);

  const stopLevelLoop = useCallback(() => {
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = 0;
    }
    setMicLevel(0);
  }, []);

  const startLevelLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) {
        const v = (buf[i]! - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setMicLevel(Math.min(1, rms * 5.5));
      levelRafRef.current = requestAnimationFrame(tick);
    };
    stopLevelLoop();
    levelRafRef.current = requestAnimationFrame(tick);
  }, [stopLevelLoop]);

  const ensureAudioGraph = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || sourceNodeRef.current) return;
    const AC =
      typeof window !== 'undefined'
        ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;
    if (!AC) return;
    const ctx = new AC();
    await ctx.resume();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.72;
    src.connect(an);
    sourceNodeRef.current = src;
    analyserRef.current = an;
  }, []);

  const stopRecognitionInstance = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  const startRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      return false;
    }

    finalBufferRef.current = '';
    setLlmSummary(null);
    setVoiceError(null);
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) {
          finalBufferRef.current += piece;
        } else {
          interim += piece;
        }
      }
      onInputInterim(`${finalBufferRef.current}${interim}`.trim());
    };

    rec.onerror = () => {
      recognitionRef.current = null;
      stopLevelLoop();
      onListeningChange(false);
      pointerActiveRef.current = false;
      setVoiceError('Speech recognition stopped. Try again or use the keyboard.');
    };

    rec.onend = () => {
      recognitionRef.current = null;
      stopLevelLoop();
      onListeningChange(false);
      pointerActiveRef.current = false;
      const text = finalBufferRef.current.trim();
      if (text) {
        void (async () => {
          try {
            const summary = await summarizeTranscriptWithOllama(text);
            setLlmSummary(summary);
          } catch (e) {
            setLlmSummary(null);
            setVoiceError(e instanceof Error ? e.message : 'Could not summarize.');
          }
          onTranscriptFinal(text);
        })();
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      onListeningChange(true);
      setVoiceError(null);
      void ensureAudioGraph().then(() => {
        void audioCtxRef.current?.resume();
        startLevelLoop();
      });
      return true;
    } catch {
      return false;
    }
  }, [
    ensureAudioGraph,
    onInputInterim,
    onListeningChange,
    onTranscriptFinal,
    startLevelLoop,
    stopLevelLoop,
  ]);

  const handleMicPointerDown = useCallback(() => {
    if (pointerActiveRef.current) return;
    if (!micSessionReady) {
      setPermissionDialogOpen(true);
      return;
    }
    pointerActiveRef.current = true;

    if (!isSpeechRecognitionAvailable()) {
      demoHoldRef.current = true;
      onListeningChange(true);
      void ensureAudioGraph().then(() => {
        void audioCtxRef.current?.resume();
        startLevelLoop();
      });
      return;
    }

    const ok = startRecognition();
    if (!ok) {
      demoHoldRef.current = true;
      onListeningChange(true);
      void ensureAudioGraph().then(() => {
        void audioCtxRef.current?.resume();
        startLevelLoop();
      });
    }
  }, [ensureAudioGraph, micSessionReady, onListeningChange, startLevelLoop, startRecognition]);

  const handleMicPointerUp = useCallback(() => {
    if (!pointerActiveRef.current) return;
    pointerActiveRef.current = false;

    if (demoHoldRef.current) {
      demoHoldRef.current = false;
      stopLevelLoop();
      onListeningChange(false);
      onDemoFallback();
      return;
    }

    stopRecognitionInstance();
  }, [onDemoFallback, onListeningChange, stopLevelLoop, stopRecognitionInstance]);

  const confirmPermissionDialog = useCallback(() => {
    setPermissionDialogOpen(false);
    void requestMicrophoneStream()
      .then(async (stream) => {
        streamRef.current = stream;
        await ensureAudioGraph();
        setMicSessionReady(true);
      })
      .catch(() => setVoiceError('Microphone access was blocked.'));
  }, [ensureAudioGraph]);

  const cancelPermissionDialog = useCallback(() => {
    setPermissionDialogOpen(false);
  }, []);

  return {
    permissionDialogOpen,
    confirmPermissionDialog,
    cancelPermissionDialog,
    handleMicPointerDown,
    handleMicPointerUp,
    micLevel,
    llmSummary,
    voiceError,
    setVoiceError,
  };
}
