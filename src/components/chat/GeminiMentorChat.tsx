import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MentorPersona, StudyRoadmap } from '../../types/study';
import { ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storageService';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Brain,
  Zap,
  Code2,
  Calendar,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';

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
    title: 'Gestor del Plan de Estudios (IA & Automatización)',
    description: 'Especialista en el Plan Maestro de 30 semanas, fases 0 a 5, entregables de portafolio y recursos oficiales.',
    systemInstruction: `Actúas como el Gestor del Plan de Estudios y Mentor Técnico de Aprendizaje. Tu comunicación es sumamente profesional pero en lenguaje natural, empática y clara.
Conoces en profundidad el Plan Maestro de 30 Semanas de Automatización con IA:
- Fase 0 (Semanas 1-3): Fundamentos Analíticos (JSON Schema, HTTP/REST, OAuth2).
- Fase 1 (Semanas 4-8): IA Aplicada y Prompting (Chain-of-thought, Structured Outputs).
- Fase 2 (Semanas 9-14): Automatización Visual (n8n/Make, webhooks, try/catch, certificación n8n Academy, Proyecto 1).
- Fase 3 (Semanas 15-20): Python Aplicado (ETL, PostgreSQL, SQLAlchemy async, FastAPI con Clean Architecture).
- Fase 4 (Semanas 21-26): RAG y LangGraph (ReAct, grafos de estado, pgvector, Proyecto 2).
- Fase 5 (Semanas 27-30): Observabilidad y MLOps (LangSmith, costos de tokens, Human-in-the-loop, Proyecto 3).
Tu objetivo es resolver bloqueos, validar entregables y adaptar los temas al tiempo disponible del usuario.`,
    defaultModel: 'gemini-3.5-flash',
    recommendedThinking: false,
  },
  architect: {
    title: 'Arquitecto de Software (SOLID & Clean Architecture)',
    description: 'Guardián de la calidad de software, independencia de frameworks, inversión de dependencias y patrones limpios.',
    systemInstruction: `Actúas como un Arquitecto de Software Senior y mentor técnico. Aplicas rigurosamente los principios SOLID (SRP, OCP, LSP, ISP, DIP) y Clean Architecture / Hexagonal.
- Independencia del Framework: el núcleo del dominio y casos de uso nunca se acoplan a FastAPI, bases de datos o librerías externas.
- Inversión de Dependencias (DIP) y Puertos/Adaptadores: uso de interfaces/protocols para repositorios y servicios externos.
- Explicas conceptos complejos con metáforas claras del mundo real y nunca devuelves monolitos. Muestras cómo estructurar routers, interactors/use cases y repositorios.`,
    defaultModel: 'gemini-3.1-pro-preview',
    recommendedThinking: true,
  },
  frontend_ux: {
    title: 'Diseñador UX/UI & Desarrollador Frontend',
    description: 'Experto en arquitectura visual intuitiva, feedback claro al usuario, ergonomía y componentes modernos.',
    systemInstruction: `Actúas como Arquitecto Frontend y Diseñador de Producto UX/UI. Tu misión es transformar requerimientos en experiencias visuales fluidas, sin fricción y accesibles.
Privilegias la claridad visual, jerarquía tipográfica, estados vacíos/de carga, transiciones sutiles y feedback amigable para el estudiante.`,
    defaultModel: 'gemini-3.5-flash',
    recommendedThinking: false,
  },
  productivity_coach: {
    title: 'Tutor de Planificación y Gestión de Tiempo',
    description: 'Especialista en distribución de hábitos, técnica Pomodoro y adaptación de metas según horas semanales.',
    systemInstruction: `Actúas como Tutor de Productividad Académica y Gestión del Tiempo.
Ayudas al estudiante a desglosar metas grandes en micro-sesiones de 45-90 minutos, evitar el agotamiento (burnout) y organizar su calendario según sus horas reales disponibles.`,
    defaultModel: 'gemini-3.1-flash-lite',
    recommendedThinking: false,
  },
};

export const GeminiMentorChat: React.FC<GeminiMentorChatProps> = ({ roadmap }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageService.getChatMessages()
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<MentorPersona>('roadmap_master');
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'
  >('gemini-3.5-flash');
  const [enableHighThinking, setEnableHighThinking] = useState(false);
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

    const userMessage: ChatMessage = {
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
      });

      const modelMessage: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        role: 'model',
        text: res.response,
        timestamp: new Date().toISOString(),
        modelUsed: res.modelUsed,
        rolePersona: selectedPersona,
        highThinking: res.highThinkingEnabled,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: `Lo siento, ocurrió un error al consultar con el modelo (${err.message || 'Error de conexión'}). Por favor, intenta de nuevo o cambia de modelo.`,
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con tu mentor?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'model',
          text: `Hola, he reiniciado nuestra sesión. Estoy listo como **${PERSONA_CONFIGS[selectedPersona].title}** para resolver cualquier duda o planificar tus metas. ¿Por dónde empezamos?`,
          timestamp: new Date().toISOString(),
          modelUsed: selectedModel,
          rolePersona: selectedPersona,
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
    '¿Cómo organizar la Fase 0 en mis horas disponibles semanales?',
    'Explícame cómo aplicar el principio SRP y OCP en un pipeline de datos',
    'Dame una arquitectura limpia para LangGraph con checkpoints y pgvector',
    'Plantéame un desafío técnico para validar contratos JSON Schema',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Mentor Header Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-md">
              <img
                src="/src/assets/images/mentor_avatar_bot_1791511805346.jpg"
                alt="Mentor Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <span>Mentoría Técnica Gemini Multi-Turn</span>
                <span aria-hidden="true">·</span>
                <span>Contexto Activo: {roadmap.title}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {PERSONA_CONFIGS[selectedPersona].title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl">
                {PERSONA_CONFIGS[selectedPersona].description}
              </p>
            </div>
          </div>

          {/* Persona selector tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(
              [
                ['roadmap_master', 'Plan IA', Layers],
                ['architect', 'Arquitecto SOLID', Code2],
                ['frontend_ux', 'Diseño UX', Sparkles],
                ['productivity_coach', 'Tutor Tiempo', Clock],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePersonaChange(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedPersona === key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model and Thinking Controls Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Modelo Gemini:</span>
              <select
                value={selectedModel}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setSelectedModel(m);
                  if (m === 'gemini-3.1-pro-preview') {
                    setEnableHighThinking(true);
                  }
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General & Rápido)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complejo / High Thinking)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Baja Latencia)</option>
              </select>
            </div>

            {/* High Thinking Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200/60 hover:bg-amber-100/60 transition-colors">
              <input
                type="checkbox"
                checked={enableHighThinking || selectedModel === 'gemini-3.1-pro-preview'}
                onChange={(e) => setEnableHighThinking(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 text-amber-900">
                <Brain className="w-3.5 h-3.5 text-amber-600" />
                <span>Modo High Thinking</span>
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar Chat</span>
          </button>
        </div>
      </section>

      {/* Main Chat Thread Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[560px]">
        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-amber-500 text-slate-950 font-bold'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body Bubble */}
                <div
                  className={`space-y-1.5 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Model Header Badges (for model output) */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-200/50 mb-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">
                          {msg.modelUsed || selectedModel}
                        </span>
                        {msg.highThinking && (
                          <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-100/70 px-1.5 py-0.2 rounded">
                            <Brain className="w-3 h-3 text-amber-700" />
                            Thinking: High
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        title="Copiar texto"
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content formatted with Markdown-like paragraphs */}
                  <div className="whitespace-pre-wrap break-words font-normal">
                    {msg.text}
                  </div>

                  <span
                    className={`block text-[10px] text-right pt-1 ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
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
            <div className="flex gap-3.5 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-semibold text-slate-800">
                    {enableHighThinking || selectedModel === 'gemini-3.1-pro-preview'
                      ? 'Analizando y razonando a fondo (Thinking: High)...'
                      : 'Generando respuesta con Gemini...'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Evaluando reglas de Clean Architecture y planificador de 30 semanas.
                </p>
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">
            Sugerencias:
          </span>
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(promptText)}
              className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors shadow-2xs"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Pregunta a tu ${PERSONA_CONFIGS[selectedPersona].title}...`}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-3 text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
