import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Bell,
  Bot,
  Flame,
  ArrowRight,
  Send,
  Timer,
  Sliders,
  ChevronRight,
  Globe,
  Mic,
} from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { NotificationEngine } from '../../services/notificationEngine';
import { AudioTranscriberButton } from '../audio/AudioTranscriberButton';

interface QuickDemoCardProps {
  onSwitchToFullApp: () => void;
  onOpenTimerModal: () => void;
  onOpenNotifications: () => void;
}

export const QuickDemoCard: React.FC<QuickDemoCardProps> = ({
  onSwitchToFullApp,
  onOpenTimerModal,
  onOpenNotifications,
}) => {
  // Step 1: Smart planner time personalization
  const [demoHours, setDemoHours] = useState(8);

  // Step 2: Milestone progress
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Lógica Estructural & JSON Schema', hours: 10, done: true },
    { id: 2, title: 'HTTP/REST & Flujos OAuth2', hours: 10, done: false },
    { id: 3, title: 'Ingeniería de Prompts & CoT', hours: 12, done: false },
  ]);

  // Step 3: Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Step 4: Mini Gemini Mentor
  const [aiQuestion, setAiQuestion] = useState('');
  const [useSearchInDemo, setUseSearchInDemo] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    '¡Hola! Soy tu mentor IA. Puedes preguntarme cómo organizar tus 8h semanales, activar búsqueda en Google, o usar el micrófono para dictarme tu duda.'
  );
  const [aiLoading, setAiLoading] = useState(false);

  const toggleMilestone = (id: number) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

  const completedCount = milestones.filter((m) => m.done).length;
  const progressPct = Math.round((completedCount / milestones.length) * 100);
  const projectedWeeks = Math.ceil(32 / demoHours);

  const handleTriggerNotification = () => {
    const msg = `Recordatorio Automático: Tienes 90 min de estudio pendientes para hoy según tu meta de ${demoHours}h/sem.`;
    NotificationEngine.triggerInAppOrSystem('Aviso de Estudio Study Planner', msg, 'reminder');
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAskMentor = async (textPrompt?: string, forceSearch = false) => {
    const q = textPrompt || aiQuestion;
    if (!q.trim() || aiLoading) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await ApiService.sendChatMessage({
        messages: [{ role: 'user', text: q }],
        model: 'gemini-3.5-flash',
        useGoogleSearch: forceSearch || useSearchInDemo,
        systemInstruction: `Eres un mentor conciso y directo para una demostración rápida de la app. Responde en 2 o 3 oraciones precisas en español. Si se usa Google Search, resume los hallazgos recientes.`,
      });
      setAiResponse(res.response);
      setAiQuestion('');
    } catch (err: any) {
      setAiResponse(`Respuesta rápida: Para estudiar ${demoHours}h semanales, divide 2 horas los lunes, miércoles, viernes y sábado.`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-[#181a22] border border-[#262a36] rounded-2xl p-6 sm:p-7 space-y-6 max-w-5xl mx-auto my-4 text-slate-200 transition-colors">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#222634] text-slate-100 px-4 py-2.5 rounded-xl shadow-lg border border-[#383e52] flex items-center gap-2.5 text-xs">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252836] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Demostración Express Reducida</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Prueba Interactiva en 4 Pasos Clave
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Experimenta el funcionamiento esencial: planificación según tiempo disponible, progreso visual en vivo, alertas automáticas y mentoría IA con dictado por voz y búsqueda web.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToFullApp}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shrink-0 shadow-sm"
        >
          <span>Abrir Plataforma Completa (30 Semanas)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Interactive Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: Time Customizer */}
        <div className="p-5 bg-[#1d202a] rounded-xl border border-[#2b303e] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
              <span className="w-6 h-6 rounded-md bg-[#272b37] border border-[#353b4c] text-slate-300 text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-sm font-bold text-slate-100">Planificador Adaptativo</span>
            </div>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-lg tabular-nums">
              {demoHours} horas / semana
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium block">
              Mueve el slider para ajustar tu tiempo libre disponible:
            </label>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={demoHours}
              onChange={(e) => setDemoHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-[#252834] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium tabular-nums">
              <span>4h (Poco tiempo)</span>
              <span className="text-indigo-400 font-semibold">12h (Balanceado)</span>
              <span>24h (Intensivo)</span>
            </div>
          </div>

          {/* Dynamic Calculation Result */}
          <div className="p-3 bg-[#161820] rounded-xl border border-[#272b38] text-xs space-y-1">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Cálculo Inteligente en Tiempo Real:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Completarás esta etapa en <strong className="text-slate-100 font-semibold tabular-nums">{projectedWeeks} semanas</strong> dedicando{' '}
              <strong className="text-slate-100 font-semibold tabular-nums">{(demoHours / 4).toFixed(1)}h</strong> por día (4 sesiones/semana).
            </p>
          </div>
        </div>

        {/* Pillar 2: Visual Progress Tracker */}
        <div className="p-5 bg-[#1d202a] rounded-xl border border-[#2b303e] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
              <span className="w-6 h-6 rounded-md bg-[#272b37] border border-[#353b4c] text-slate-300 text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-sm font-bold text-slate-100">Seguimiento de Progreso</span>
            </div>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg tabular-nums">
              {progressPct}% completado
            </span>
          </div>

          <div className="w-full bg-[#252834] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 block">
              Haz clic para marcar o desmarcar hitos:
            </span>
            {milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMilestone(m.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-center justify-between text-xs ${
                  m.done
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-[#161820] border-[#272b38] text-slate-300 hover:bg-[#202431]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${m.done ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                  <span>{m.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                  {m.hours}h
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pillar 3: Pomodoro & Automatic Notifications */}
        <div className="p-5 bg-[#1d202a] rounded-xl border border-[#2b303e] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
              <span className="w-6 h-6 rounded-md bg-[#272b37] border border-[#353b4c] text-slate-300 text-xs flex items-center justify-center font-bold">3</span>
              <span className="text-sm font-bold text-slate-100">Notificaciones & Foco</span>
            </div>
            <span className="text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Racha: 3 días</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Comprueba cómo el sistema te avisa y registra automáticamente tus minutos de concentración activa.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerNotification}
              className="p-3 bg-[#161820] hover:bg-[#202431] border border-[#272b38] hover:border-amber-500/30 rounded-xl text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Simular Alerta</span>
              </div>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Dispara una notificación emergente en vivo
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTimerModal}
              className="p-3 bg-[#161820] hover:bg-[#202431] border border-[#272b38] hover:border-indigo-500/30 rounded-xl text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                <Timer className="w-4 h-4 text-indigo-400" />
                <span>Abrir Pomodoro</span>
              </div>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Bloques de 25/45m con registro de tiempo
              </span>
            </button>
          </div>
        </div>

        {/* Pillar 4: Mini Gemini Mentor */}
        <div className="p-5 bg-[#1d202a] rounded-xl border border-[#2b303e] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
              <span className="w-6 h-6 rounded-md bg-[#272b37] border border-[#353b4c] text-slate-300 text-xs flex items-center justify-center font-bold">4</span>
              <span className="text-sm font-bold text-slate-100">Mentor IA con Voz & Búsqueda</span>
            </div>
            <span className="text-[11px] font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-lg">
              Gemini 3.5 Flash
            </span>
          </div>

          {/* Quick Questions buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAskMentor('¿Cómo distribuir 8 horas semanales para no procrastinar?')}
              className="text-[11px] bg-[#161820] hover:bg-[#202431] border border-[#282d3b] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              💡 Distribuir 8h/semana
            </button>
            <button
              type="button"
              onClick={() => handleAskMentor('¿Cuáles son las últimas novedades de LangGraph en 2026?', true)}
              className="text-[11px] bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium"
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Novedades LangGraph (Google Search)</span>
            </button>
          </div>

          {/* Chat Response Display */}
          <div className="bg-[#161820] p-3.5 rounded-xl border border-[#272b38] border-l-2 border-l-sky-500 min-h-[75px] text-xs text-slate-300 leading-relaxed">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-sky-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <span>Gemini procesando respuesta...</span>
              </div>
            ) : (
              <p>{aiResponse}</p>
            )}
          </div>

          {/* Question input with Audio Transcription Mic */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Haz una pregunta o usa el micrófono para dictar..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskMentor()}
              className="flex-1 text-xs p-2.5 rounded-xl border border-[#2b303e] bg-[#161820] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {/* Audio transcription button using gemini-3.5-transcribe */}
            <AudioTranscriberButton onTranscription={(text) => setAiQuestion((prev) => (prev ? `${prev} ${text}` : text))} />

            <button
              type="button"
              onClick={() => handleAskMentor()}
              disabled={aiLoading || !aiQuestion.trim()}
              className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="p-5 bg-[#1d202a] text-slate-200 rounded-xl border border-[#2b303e] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
            <span>¿Listo para sumergirte en la Carrera de IA y Automatización?</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Accede a las 6 fases estructuradas, el portafolio de 3 proyectos, el calendario inteligente y los 4 roles del mentor con Thinking Mode de alta profundidad.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToFullApp}
          className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors whitespace-nowrap shadow-sm"
        >
          Explorar Aplicación Completa
        </button>
      </div>
    </div>
  );
};
