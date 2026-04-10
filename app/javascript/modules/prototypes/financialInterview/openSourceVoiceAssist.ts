/**
 * Prototype voice assist using open, standard / self-hostable pieces:
 *
 * - **Speech → text:** Web Speech API (`SpeechRecognition`), supported in Chromium; Safari support varies.
 *   Spec: https://wicg.github.io/speech-api/
 *
 * - **Summary (optional):** [Ollama](https://github.com/ollama/ollama) HTTP API when `VITE_OLLAMA_URL` (Vite demo)
 *   or `OLLAMA_URL` (webpack) is set, e.g. `http://localhost:11434`.
 */

function getOllamaBaseUrl(): string | undefined {
  if (typeof process !== 'undefined' && process.env?.OLLAMA_URL) {
    return process.env.OLLAMA_URL.replace(/\/$/, '');
  }
  return undefined;
}

function getOllamaModel(): string {
  if (typeof process !== 'undefined' && process.env?.OLLAMA_MODEL) return process.env.OLLAMA_MODEL;
  return 'llama3.2';
}

export function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionAvailable(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/** Triggers the native browser/OS microphone permission prompt (after user gesture). */
export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export async function summarizeTranscriptWithOllama(transcript: string): Promise<string> {
  const trimmed = transcript.trim();
  if (!trimmed) return '';

  const base = getOllamaBaseUrl();
  if (!base) {
    return `We heard: “${trimmed.slice(0, 160)}${trimmed.length > 160 ? '…' : ''}”. Add a local summary by running Ollama and setting VITE_OLLAMA_URL (demo) or OLLAMA_URL (webpack).`;
  }

  const model = getOllamaModel();
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      prompt: `You are a calm financial coach. In at most 2 short sentences, summarize what the user said for a planning app. No bullet points.\n\nUser said:\n${trimmed}`,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Ollama error ${res.status}`);
  }

  const data = (await res.json()) as { response?: string };
  const out = data.response?.trim();
  return out || trimmed.slice(0, 200);
}
