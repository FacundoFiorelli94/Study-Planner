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
} from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { NotificationEngine } from '../../services/notificationEngine';

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
  const [aiResponse, setAiResponse] = useState<string | null>(
    '¡Hola! Soy tu mentor IA. Puedo organizar tu plan de estudio según tus 8 horas semanales o resolver dudas de código.'
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
    NotificationEngine.triggerInAppOrSystem('Aviso de Estudio Kamino', msg, 'reminder');
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAskMentor = async (textPrompt?: string) => {
    const q = textPrompt || aiQuestion;
    if (!q.trim() || aiLoading) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await ApiService.sendChatMessage({
        messages: [{ role: 'user', text: q }],
        model: 'gemini-3.5-flash',
        systemInstruction: `Eres un mentor conciso y directo para una demostración rápida de la app. Responde en 2 o 3 oraciones precisas en español.`,
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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 max-w-5xl mx-auto my-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-top-4">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Demostración Express Reducida</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Prueba Interactiva en 4 Pasos Clave
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Experimenta el funcionamiento esencial: planificación según tiempo, progreso visual, notificaciones y mentoría IA.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToFullApp}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm shrink-0"
        >
          <span>Abrir Plataforma Completa (30 Semanas)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Interactive Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Time Customizer */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Planificador Adaptativo</span>
            </div>
            <span className="text-xs font-bold text-amber-800 tabular-nums">
              {demoHours} horas / semana
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-600 block">
              Mueve el slider para ajustar tu tiempo libre disponible:
            </label>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={demoHours}
              onChange={(e) => setDemoHours(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 tabular-nums">
              <span>4h (Poco tiempo)</span>
              <span>12h (Medio)</span>
              <span>24h (Full-time)</span>
            </div>
          </div>

          {/* Dynamic Calculation Result */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Cálculo Inteligente en Tiempo Real:</span>
            </div>
            <p className="text-slate-600">
              Completarás esta etapa en <strong className="text-slate-900 font-bold tabular-nums">{projectedWeeks} semanas</strong> dedicando{' '}
              <strong className="text-slate-900 font-bold tabular-nums">{(demoHours / 4).toFixed(1)}h</strong> por día (4 sesiones/semana).
            </p>
          </div>
        </div>

        {/* Pillar 2: Visual Progress Tracker */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Seguimiento de Progreso en Vivo</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 tabular-nums">
              {progressPct}% completado
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Haz clic para marcar o desmarcar hitos:
            </span>
            {milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMilestone(m.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  m.done
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${m.done ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span>{m.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums font-mono">
                  {m.hours}h
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pillar 3: Pomodoro & Automatic Notifications */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Notificaciones & Temporizador</span>
            </div>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Racha: 3 días</span>
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Comprueba cómo el sistema te avisa y registra automáticamente tus minutos de concentración.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerNotification}
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Simular Alerta</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-tight">
                Dispara una notificación automática en pantalla
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTimerModal}
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Timer className="w-3.5 h-3.5 text-slate-800" />
                <span>Abrir Pomodoro</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-tight">
                Bloques de 25/45m con registro de avance
              </span>
            </button>
          </div>
        </div>

        {/* Pillar 4: Mini Gemini Mentor */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
              <span>Mentor IA Multi-Turn</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Gemini 3.5 Flash
            </span>
          </div>

          {/* Quick Questions buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAskMentor('¿Cómo distribuir 8 horas semanales para no procrastinar?')}
              className="text-[11px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg transition-colors"
            >
              💡 Distribuir 8h/semana
            </button>
            <button
              type="button"
              onClick={() => handleAskMentor('¿Por qué es clave JSON Schema antes de programar agentes?')}
              className="text-[11px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg transition-colors"
            >
              ⚡ ¿Por qué JSON Schema?
            </button>
          </div>

          {/* Chat Response Display */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 min-h-[75px] text-xs text-slate-800 leading-relaxed">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Gemini pensando respuesta...</span>
              </div>
            ) : (
              <p>{aiResponse}</p>
            )}
          </div>

          {/* Question input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Hazle una pregunta a tu tutor..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskMentor()}
              className="flex-1 text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="button"
              onClick={() => handleAskMentor()}
              disabled={aiLoading || !aiQuestion.trim()}
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold">¿Listo para ver toda la estructura?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Explora las 6 fases (30 semanas), el portafolio de 3 proyectos, el calendario interactivo y los 4 roles del mentor con High Thinking.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToFullApp}
          className="px-5 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors whitespace-nowrap shadow-sm"
        >
          Explorar Aplicación Completa
        </button>
      </div>
    </div>
  );
};
