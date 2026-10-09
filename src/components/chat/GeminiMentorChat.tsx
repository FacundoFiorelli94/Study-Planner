import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MentorPersona, StudyRoadmap } from '../../types/study';
import { ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storageService';
import { AudioTranscriberButton } from '../audio/AudioTranscriberButton';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Brain,
  Globe,
  Layers,
  Copy,
  Check,
  Clock,
  ExternalLink,
  Cpu,
  SlidersHorizontal,
} from 'lucide-react';

interface ExtendedChatMessage extends ChatMessage {
  groundedWithSearch?: boolean;
  sources?: { title: string; url: string }[];
}

interface GeminiMentorChatProps {
  roadmap: StudyRoadmap;
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
  ai_engineer: {
    title: 'Ingeniero de IA & Agentes Autónomos',
    description: 'Experto en LLMs, LangGraph, RAG vectorial con pgvector, tool calling y arquitecturas multi-agente.',
    systemInstruction: `Actúas como Ingeniero Senior de Inteligencia Artificial y Agentes Autónomos.
Dominas modelos de última generación (Gemini, Claude, GPT), orquestación de grafos cíclicos con LangGraph, bases de datos vectoriales (pgvector), embeddings semánticos, chunking, técnicas avanzadas de prompt engineering y ejecución de herramientas (Tool Calling).
Guias al estudiante con código limpio en Python y explicaciones claras y aplicadas.`,
    defaultModel: 'gemini-3.1-pro-preview',
    recommendedThinking: true,
  },
  productivity_coach: {
    title: 'Tutor de Planificación y Horarios',
    description: 'Especialista en distribución de hábitos, técnica Pomodoro y adaptación de metas según horas disponibles.',
    systemInstruction: `Actúas como Tutor de Productividad Académica y Gestión del Tiempo.
Ayudas al estudiante a desglosar metas grandes en micro-sesiones de 45-90 minutos, evitar el agotamiento (burnout) y organizar su calendario según sus horas reales disponibles.`,
    defaultModel: 'gemini-3.1-flash-lite',
    recommendedThinking: false,
  },
};

export const GeminiMentorChat: React.FC<GeminiMentorChatProps> = ({ roadmap }) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() =>
    StorageService.getChatMessages()
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<MentorPersona>('roadmap_master');
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'
  >('gemini-3.5-flash');
  const [enableHighThinking, setEnableHighThinking] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    StorageService.saveChatMessages(messages);
  }, [messages]);

  // Adjust model / thinking when persona changes
  const handlePersonaChange = (persona: MentorPersona) => {
    setSelectedPersona(persona);
    const config = PERSONA_CONFIGS[persona];
    setSelectedModel(config.defaultModel);
    setEnableHighThinking(config.recommendedThinking);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const activeConfig = PERSONA_CONFIGS[selectedPersona];
      const contextSystemInstruction = `${activeConfig.systemInstruction}\n\nContexto actual del estudiante:\n- Ruta de estudio: "${roadmap.title}"\n- Horas disponibles: ${roadmap.weeklyHoursBudget} h/semana\n- Ritmo: ${roadmap.targetPace}`;

      const res = await ApiService.sendChatMessage({
        messages: historyPayload,
        model: selectedModel,
        systemInstruction: contextSystemInstruction,
        enableHighThinking: enableHighThinking || selectedModel === 'gemini-3.1-pro-preview',
        useGoogleSearch,
      });

      const modelMessage: ExtendedChatMessage = {
        id: `msg-model-${Date.now()}`,
        role: 'model',
        text: res.response,
        timestamp: new Date().toISOString(),
        modelUsed: res.modelUsed,
        rolePersona: selectedPersona,
        highThinking: enableHighThinking || selectedModel === 'gemini-3.1-pro-preview',
        groundedWithSearch: res.groundedWithSearch,
        sources: res.sources,
      };

      setMessages([...newMessages, modelMessage]);
    } catch (error) {
      console.error('Error generating mentor response:', error);
      const errorMessage: ExtendedChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: 'Ocurrió un error al consultar con el mentor IA. Por favor verifica tu conexión y vuelve a intentar en unos segundos.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioTranscribed = (transcript: string) => {
    if (transcript.trim()) {
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Reiniciar la conversación del mentor? Se limpiará el historial del chat.')) {
      const resetMessages: ExtendedChatMessage[] = [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'model',
          text: `¡Hola! Soy tu ${PERSONA_CONFIGS[selectedPersona].title}. Estoy listo para acompañarte en tu formación en Inteligencia Artificial y Automatización. ¿En qué módulo o desafío técnico deseas avanzar hoy?`,
          timestamp: new Date().toISOString(),
          rolePersona: selectedPersona,
          modelUsed: selectedModel,
        },
      ];
      setMessages(resetMessages);
      StorageService.saveChatMessages(resetMessages);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    '¿Cómo organizar la Fase 0 en mis horas semanales?',
    '¿Cómo conectar un webhook con n8n y un agente IA?',
    '¿Cómo estructurar un flujo con LangGraph y pgvector?',
    'Plantéame un desafío técnico para validar esquemas JSON',
  ];

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-[#161822] border border-[#262a36] rounded-2xl shadow-lg overflow-hidden">
      {/* 1. Integrated Sleek Top Header Bar (~46px) */}
      <div className="bg-[#13151e] border-b border-[#252834] px-3.5 py-2 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Persona info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-[#10121a] shrink-0 border border-[#2b303e]">
            <img
              src="/src/assets/images/mentor_avatar_bot_1791511805346.jpg"
              alt="Mentor Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 truncate">
                {PERSONA_CONFIGS[selectedPersona].title}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="En línea" />
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              {PERSONA_CONFIGS[selectedPersona].description}
            </p>
          </div>
        </div>

        {/* Right: Persona selector pills & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 p-0.5 bg-[#10121a] rounded-lg border border-[#232734]">
            {(
              [
                ['roadmap_master', 'Plan IA', Layers],
                ['automation_engineer', 'Automatización', Cpu],
                ['ai_engineer', 'Agentes IA', Sparkles],
                ['productivity_coach', 'Horarios', Clock],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePersonaChange(key)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                  selectedPersona === key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a1d28]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Model / Grounding configuration toggle */}
          <button
            type="button"
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`p-1.5 rounded-lg border transition-colors text-xs flex items-center gap-1 ${
              showConfigPanel
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-[#10121a] text-slate-400 hover:text-slate-200 border-[#232734]'
            }`}
            title="Ajustes de modelo y búsqueda"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Reset chat button */}
          <button
            type="button"
            onClick={handleClearChat}
            title="Reiniciar chat"
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#10121a] hover:bg-[#1f1a24] border border-[#232734] rounded-lg transition-colors text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional dropdown panel for Model & Tools (takes ~36px when open) */}
      {showConfigPanel && (
        <div className="bg-[#10121b] border-b border-[#252834] px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Modelo:</span>
              <select
                value={selectedModel}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setSelectedModel(m);
                  if (m === 'gemini-3.1-pro-preview') {
                    setEnableHighThinking(true);
                  }
                }}
                className="bg-[#151722] border border-[#292e3e] text-slate-200 text-[11px] px-2 py-0.5 rounded-md focus:outline-none"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Rápido)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Thinking: High)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Rápido)</option>
              </select>
            </div>

            <label className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
              <input
                type="checkbox"
                checked={enableHighThinking || selectedModel === 'gemini-3.1-pro-preview'}
                onChange={(e) => setEnableHighThinking(e.target.checked)}
                className="rounded text-indigo-500 focus:ring-0 w-2.5 h-2.5"
              />
              <Brain className="w-2.5 h-2.5 text-indigo-400" />
              <span>Thinking</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
              <input
                type="checkbox"
                checked={useGoogleSearch}
                onChange={(e) => setUseGoogleSearch(e.target.checked)}
                className="rounded text-sky-500 focus:ring-0 w-2.5 h-2.5"
              />
              <Globe className="w-2.5 h-2.5 text-sky-400" />
              <span>Search</span>
            </label>
          </div>

          <span className="text-[10px] text-slate-400 truncate">
            {roadmap.title}
          </span>
        </div>
      )}

      {/* 2. Scrollable Message Thread (Fills 100% of remaining space with internal scroll only) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-2.5 space-y-2 bg-[#13151c]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-xl sm:max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] mt-0.5 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#222634] text-slate-200 border border-[#2b3040]'
                }`}
              >
                {isUser ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5 text-indigo-400" />}
              </div>

              {/* Message Body Bubble */}
              <div
                className={`space-y-0.5 rounded-xl px-3 py-2 text-xs leading-normal ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                    : 'bg-[#181a24] border border-[#272b38] text-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Model Header Badges */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-0.5 border-b border-[#252834] mb-1 text-[9px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">
                        {msg.modelUsed || selectedModel}
                      </span>
                      {msg.highThinking && (
                        <span className="text-indigo-300 font-semibold flex items-center gap-0.5 bg-indigo-500/15 px-1 py-0.2 rounded border border-indigo-500/30">
                          <Brain className="w-2.5 h-2.5 text-indigo-400" />
                          Thinking
                        </span>
                      )}
                      {msg.groundedWithSearch && (
                        <span className="text-sky-300 font-semibold flex items-center gap-0.5 bg-sky-500/15 px-1 py-0.2 rounded border border-sky-500/30">
                          <Globe className="w-2.5 h-2.5 text-sky-400" />
                          Search
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      title="Copiar texto"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words font-normal text-[11.5px] leading-relaxed">
                  {msg.text}
                </div>

                {/* Search Sources Grounding Chips */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-800 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider block">
                      Fuentes verificadas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[9px] border border-slate-700 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{src.title}</span>
                          <ExternalLink className="w-2 h-2 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[8.5px] text-right pt-0.5 ${
                    isUser ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading indicator with thinking feedback */}
        {isLoading && (
          <div className="flex gap-2 max-w-sm mr-auto">
            <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-2.5 h-2.5 animate-pulse" />
            </div>
            <div className="bg-[#181a24] border border-[#272b38] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-semibold text-white text-[10.5px]">
                  {useGoogleSearch
                    ? 'Consultando fuentes con Google Search...'
                    : enableHighThinking || selectedModel === 'gemini-3.1-pro-preview'
                    ? 'Razonando a fondo (Thinking: High)...'
                    : 'Generando respuesta con Gemini...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* 3. Quick Suggestion Prompts - Super compact single-line strip (~28px) */}
      <div className="px-3 py-1 border-t border-[#232635] bg-[#12141d] overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
        <span className="text-[9px] font-semibold text-indigo-400 shrink-0">
          Sugerencias:
        </span>
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            className="text-[10px] text-slate-300 hover:text-white bg-[#1a1d27] hover:bg-[#232735] border border-[#2b3040] hover:border-indigo-500/40 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-colors font-medium"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* 4. Compact Input Bar (~44px) */}
      <div className="p-2 border-t border-[#232635] bg-[#141620] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Pregunta a tu ${PERSONA_CONFIGS[selectedPersona].title}...`}
            disabled={isLoading}
            className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-[#2b303e] focus:outline-none focus:border-indigo-500 bg-[#10121a] text-slate-200 placeholder-slate-500 h-8"
          />

          {/* Audio transcription button using gemini-3.5-transcribe */}
          <AudioTranscriberButton onTranscription={handleAudioTranscribed} />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
