/**
 * ElevenLabs TTS hook for the financial-interview prototype.
 *
 * Calls the ElevenLabs streaming REST API — no WASM, no workers, no large
 * downloads. Works in any modern browser that supports fetch + Web Audio API.
 *
 * API key is read from localStorage key "el_api_key" so nothing is
 * hardcoded. The hook prompts the user for a key on first `speak()` if one
 * isn't stored yet.
 *
 * Recommended voices for a bright, warm female American voice:
 *   Rachel  — 21m00Tcm4TlvDq8ikWAM  (default)
 *   Elli    — MF3mGyEYCl7XYWbV9V6O
 *   Aria    — 9BWtsMINqrJLrRacOk9x
 *
 * Free tier: 10,000 characters/month — plenty for a prototype.
 * https://elevenlabs.io/docs/api-reference/text-to-speech
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type ElevenLabsTtsStatus = 'idle' | 'loading' | 'ready' | 'speaking' | 'error';

const LS_KEY = 'el_api_key';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const MODEL_ID = 'eleven_turbo_v2_5'; // lowest latency, high quality

export function useElevenLabsTts(voiceId = DEFAULT_VOICE_ID) {
  const [status, setStatus] = useState<ElevenLabsTtsStatus>('idle');
  const statusRef = useRef<ElevenLabsTtsStatus>('idle');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateStatus = useCallback((s: ElevenLabsTtsStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  const playArrayBuffer = useCallback(
    async (buffer: ArrayBuffer) => {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        updateStatus('ready');
        return;
      }
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      await ctx.resume();

      let decoded: AudioBuffer;
      try {
        decoded = await ctx.decodeAudioData(buffer);
      } catch {
        updateStatus('error');
        return;
      }

      const src = ctx.createBufferSource();
      src.buffer = decoded;
      src.connect(ctx.destination);
      src.onended = () => updateStatus('ready');

      try {
        currentSourceRef.current?.stop();
      } catch {
        /* already stopped */
      }
      currentSourceRef.current = src;
      src.start();
      updateStatus('speaking');
    },
    [updateStatus],
  );

  // ---------------------------------------------------------------------------
  // API key helpers
  // ---------------------------------------------------------------------------

  const getApiKey = useCallback((): string | null => {
    try {
      return localStorage.getItem(LS_KEY);
    } catch {
      return null;
    }
  }, []);

  const promptAndSaveApiKey = useCallback((): string | null => {
    const key = window.prompt(
      'Enter your ElevenLabs API key to enable voice.\n\nGet one free at https://elevenlabs.io — it will be stored in localStorage.',
    );
    if (key?.trim()) {
      try {
        localStorage.setItem(LS_KEY, key.trim());
      } catch {
        /* storage unavailable */
      }
      return key.trim();
    }
    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // Core speak / cancel
  // ---------------------------------------------------------------------------

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      let apiKey = getApiKey();
      if (!apiKey) {
        apiKey = promptAndSaveApiKey();
        if (!apiKey) return; // user dismissed
      }

      // Cancel any in-flight request or playback
      abortRef.current?.abort();
      try {
        currentSourceRef.current?.stop();
      } catch {
        /* already stopped */
      }

      const controller = new AbortController();
      abortRef.current = controller;
      updateStatus('loading');

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
              Accept: 'audio/mpeg',
            },
            signal: controller.signal,
            body: JSON.stringify({
              text,
              model_id: MODEL_ID,
              voice_settings: {
                stability: 0.45,
                similarity_boost: 0.82,
                style: 0.35,
                use_speaker_boost: true,
              },
            }),
          },
        );

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          console.warn(`[ElevenLabs TTS] ${res.status}:`, body);
          // 401 → bad key, clear it so user is prompted next time
          if (res.status === 401) {
            try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
          }
          updateStatus('error');
          return;
        }

        const audioBuffer = await res.arrayBuffer();
        if (controller.signal.aborted) return;
        await playArrayBuffer(audioBuffer);
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        console.warn('[ElevenLabs TTS]', err);
        updateStatus('error');
      }
    },
    [voiceId, getApiKey, promptAndSaveApiKey, playArrayBuffer, updateStatus],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    try {
      currentSourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    currentSourceRef.current = null;
    if (statusRef.current === 'speaking' || statusRef.current === 'loading') {
      updateStatus('ready');
    }
  }, [updateStatus]);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  useEffect(
    () => () => {
      abortRef.current?.abort();
      try {
        currentSourceRef.current?.stop();
      } catch {
        /* noop */
      }
    },
    [],
  );

  /** Remove the stored API key (e.g. for resetting in dev). */
  const clearApiKey = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
  }, []);

  return { speak, cancel, status, clearApiKey } as const;
}
