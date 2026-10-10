import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { GeminiService } from '../../core/services/gemini.service';
import { ChatMessage, MentorPersona } from '../../core/models/study.models';
import { AudioTranscriberComponent } from '../../shared/components/audio-transcriber/audio-transcriber.component';

export interface ExtendedChatMessage extends ChatMessage {
  groundedWithSearch?: boolean;
  sources?: { title: string; url: string }[];
}

const PERSONA_CONFIGS: Record<
  MentorPersona,
  {
    title: string;
    description: string;
    systemInstruction: string;
    defaultModel: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
    recommendedThinking: boolean;
  }
> = {
  roadmap_master: {
    title: 'Gestor de Carrera (IA & Automatización)',
    description: 'Especialista en la Carrera de IA y Automatización, fases 0 a 5, entregables de portafolio y recursos oficiales.',
    systemInstruction: `Actúas como el Gestor del Plan de Estudios y Mentor Técnico de Aprendizaje. Tu comunicación es sumamente profesional pero en lenguaje natural, empática y clara.
Conoces en profundidad la Carrera de IA y Automatización (30 semanas):
- Fase 0 (Semanas 1-3): Fundamentos Analíticos (JSON Schema, HTTP/REST, OAuth2).
- Fase 1 (Semanas 4-8): IA Aplicada y Prompting (Chain-of-thought, Structured Outputs).
- Fase 2 (Semanas 9-14): Automatización Visual (n8n/Make, webhooks, try/catch, certificación n8n Academy, Laboratorio 1).
- Fase 3 (Semanas 15-20): Python Aplicado (ETL, PostgreSQL, SQLAlchemy async, FastAPI para automatización e IA).
- Fase 4 (Semanas 21-26): RAG y LangGraph (ReAct, grafos de estado, pgvector, Laboratorio 2).
- Fase 5 (Semanas 27-30): Observabilidad y MLOps (LangSmith, costos de tokens, Human-in-the-loop, Laboratorio 3).
Tu objetivo es resolver bloqueos, validar entregables y adaptar los temas al tiempo disponible del usuario. Enfoque exclusivo en Inteligencia Artificial y Automatización.`,
    defaultModel: 'gemini-3.5-flash',
    recommendedThinking: false,
  },
  automation_engineer: {
    title: 'Especialista en Automatización (n8n & APIs)',
    description: 'Experto en diseño de flujos en n8n, webhooks asíncronos, integración de herramientas y automatización empresarial.',
    systemInstruction: `Actúas como Ingeniero Senior de Automatización de Procesos.
Dominas n8n en Docker, Make, webhooks, manejo de errores robusto con try/catch, subflujos, llamadas HTTP con autenticación Bearer/OAuth2 y transformaciones de datos JSON.
Explicas soluciones paso a paso, con configuraciones de nodos reales y buenas prácticas para entornos de producción.`,
    defaultModel: 'gemini-3.5-flash',
    recommendedThinking: false,
  },
  ai_architect: {
    title: 'Ingeniero de IA & Agentes Autónomos',
    description: 'Experto en LLMs, LangGraph, RAG vectorial con pgvector, tool calling y arquitecturas multi-agente.',
    systemInstruction: `Actúas como Ingeniero Senior de Inteligencia Artificial y Agentes Autónomos.
Dominas modelos de última generación (Gemini, Claude, GPT), orquestación de grafos cíclicos con LangGraph, bases de datos vectoriales (pgvector), embeddings semánticos, chunking, técnicas avanzadas de prompt engineering y ejecución de herramientas (Tool Calling).
Guias al estudiante con código limpio en Python y explicaciones claras y aplicadas.`,
    defaultModel: 'gemini-3.1-pro-preview',
    recommendedThinking: true,
  },
};

@Component({
  selector: 'app-gemini-mentor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioTranscriberComponent],
  templateUrl: './gemini-mentor-chat.component.html',
})
export class GeminiMentorChatComponent implements AfterViewChecked {
  private readonly geminiService = inject(GeminiService);
  readonly storage = inject(StorageService);

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  readonly selectedPersona = signal<MentorPersona>('roadmap_master');
  readonly selectedModel = signal<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  readonly enableHighThinking = signal<boolean>(false);
  readonly useGoogleSearch = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly showConfig = signal<boolean>(false);
  readonly copiedId = signal<string | null>(null);

  inputText = '';
  personaConfigs = PERSONA_CONFIGS;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop =
          this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  onPersonaChange(p: MentorPersona): void {
    this.selectedPersona.set(p);
    const cfg = PERSONA_CONFIGS[p];
    this.selectedModel.set(cfg.defaultModel);
    this.enableHighThinking.set(cfg.recommendedThinking);
  }

  async sendMessage(promptText?: string): Promise<void> {
    const textToSend = promptText || this.inputText.trim();
    if (!textToSend || this.isLoading()) return;

    const userMsg: ExtendedChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    this.storage.addChatMessage(userMsg);
    this.inputText = '';
    this.isLoading.set(true);

    try {
      const messages = this.storage.chatMessages().map((m) => ({
        role: m.role,
        text: m.content,
      }));

      const res = await this.geminiService.sendChatMessage({
        messages,
        model: this.selectedModel(),
        systemInstruction: PERSONA_CONFIGS[this.selectedPersona()].systemInstruction,
        enableHighThinking: this.enableHighThinking(),
        useGoogleSearch: this.useGoogleSearch(),
      });

      const modelMsg: ExtendedChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        content: res.response,
        timestamp: new Date().toISOString(),
        modelUsed: res.modelUsed,
        personaUsed: this.selectedPersona(),
        groundedWithSearch: res.groundedWithSearch,
        sources: res.sources,
      };

      this.storage.addChatMessage(modelMsg);
    } catch (e: any) {
      const errorMsg: ExtendedChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: `Error al conectar con Gemini: ${e.message || 'Verifica tu conexión y clave de API.'}`,
        timestamp: new Date().toISOString(),
      };
      this.storage.addChatMessage(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  onVoiceTranscription(text: string): void {
    this.inputText = this.inputText ? `${this.inputText} ${text}` : text;
  }

  copyMessage(content: string, id: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content);
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.set(null), 2000);
    }
  }

  clearChat(): void {
    this.storage.clearChatMessages();
  }
}
