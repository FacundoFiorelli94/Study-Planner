import { Injectable } from '@angular/core';

export interface ChatApiRequest {
  messages: { role: 'user' | 'model'; text: string }[];
  model?: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  systemInstruction?: string;
  enableHighThinking?: boolean;
  useGoogleSearch?: boolean;
}

export interface ChatApiResponse {
  response: string;
  modelUsed: string;
  highThinkingEnabled?: boolean;
  groundedWithSearch?: boolean;
  sources?: { title: string; url: string }[];
  warning?: string;
}

export interface PlannerGenerateRequest {
  topic: string;
  weeklyHours: number;
  preferredDays: string[];
  currentLevel: string;
  targetWeeks: number;
  notes?: string;
}

export interface EvaluateRequest {
  moduleTitle: string;
  phaseTitle: string;
  topics: string[];
  userCodeOrAnswer?: string;
}

export interface EvaluateResponse {
  score: number;
  passed: boolean;
  summaryFeedback: string;
  detailedCritique: string;
  recommendedAction: string;
  followUpChallenge?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  async sendChatMessage(payload: ChatApiRequest): Promise<ChatApiResponse> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error en el servidor: HTTP ${res.status}`);
    }

    return res.json();
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64Audio,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error transcribiendo audio con Gemini');
    }

    const data = await res.json();
    return data.text || '';
  }

  async generateSmartRoadmap(payload: PlannerGenerateRequest): Promise<any> {
    const res = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error al generar la ruta: HTTP ${res.status}`);
    }

    return res.json();
  }

  async evaluateMilestone(payload: EvaluateRequest): Promise<EvaluateResponse> {
    const res = await fetch('/api/evaluate-milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error evaluando el hito: HTTP ${res.status}`);
    }

    return res.json();
  }
}
