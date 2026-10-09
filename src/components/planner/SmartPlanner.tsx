import React, { useState } from 'react';
import {
  ScheduledSession,
  StudyRoadmap,
  StudyModule,
} from '../../types/study';
import { AudioTranscriberButton } from '../audio/AudioTranscriberButton';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';

interface SmartPlannerProps {
  roadmap: StudyRoadmap;
  sessions: ScheduledSession[];
  onAddSession: (session: Omit<ScheduledSession, 'id'>) => void;
  onToggleSessionComplete: (sessionId: string) => void;
  onStartFocusSessionForScheduled: (session: ScheduledSession) => void;
  onRebalanceScheduleWithAI: () => void;
  isRebalancing: boolean;
}

export const SmartPlanner: React.FC<SmartPlannerProps> = ({
  roadmap,
  sessions,
  onAddSession,
  onToggleSessionComplete,
  onStartFocusSessionForScheduled,
  onRebalanceScheduleWithAI,
  isRebalancing,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(
    roadmap.phases[0]?.modules[0]?.id || ''
  );
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [sessionNotes, setSessionNotes] = useState('');

  // Collect all available modules from roadmap
  const allModules = roadmap.phases.flatMap((p) =>
    p.modules.map((m) => ({ ...m, phaseTitle: p.title }))
  );

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const mod = allModules.find((m) => m.id === selectedModuleId);
    if (!mod) return;

    const d = new Date(sessionDate);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    onAddSession({
      roadmapId: roadmap.id,
      moduleId: mod.id,
      moduleTitle: mod.title,
      phaseTitle: mod.phaseTitle,
      date: sessionDate,
      dayOfWeek: dayNames[d.getDay()],
      durationMinutes,
      completed: false,
      actualMinutesSpent: 0,
      notes: sessionNotes || `Sesión de ${durationMinutes} min`,
    });

    setShowAddModal(false);
    setSessionNotes('');
  };

  // Weekly stats
  const totalScheduledMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = sessions.filter((s) => s.completed).reduce((acc, s) => acc + (s.actualMinutesSpent || s.durationMinutes), 0);
  const weeklyBudgetMinutes = roadmap.weeklyHoursBudget * 60;

  // Group sessions by date
  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4 pb-8">
      {/* Header with Planner Summary */}
      <section className="bg-[#181a22] border border-[#262a36] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1 tracking-wide">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Planificador Inteligente</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">Disponibilidad: <strong className="text-slate-100">{roadmap.weeklyHoursBudget}h/semana</strong></span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">Ritmo {roadmap.targetPace}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              Distribución de Sesiones y Calendario de Estudio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Organiza bloques de estudio personalizados para cada objetivo académico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRebalanceScheduleWithAI}
              disabled={isRebalancing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRebalancing ? 'Calculando...' : 'Optimizar con IA'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Sesión</span>
            </button>
          </div>
        </div>

        {/* Weekly Time Allocation Bar */}
        <div className="mt-4 pt-4 border-t border-[#252834] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Objetivo Semanal</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-100 tabular-nums">
                {roadmap.weeklyHoursBudget}h
              </span>
              <span className="text-xs text-slate-400">
                ({weeklyBudgetMinutes} min)
              </span>
            </div>
            <span className="text-[11px] text-indigo-400 font-medium block mt-0.5">Meta configurada</span>
          </div>

          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Tiempo Agendado</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-100 tabular-nums">
                {(totalScheduledMinutes / 60).toFixed(1)}h
              </span>
              <span className="text-xs text-slate-400">
                ({sessions.length} sesiones)
              </span>
            </div>
            <span className="text-[11px] text-sky-400 font-medium block mt-0.5">En calendario</span>
          </div>

          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Completado esta semana</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-300 tabular-nums">
                {(completedMinutes / 60).toFixed(1)}h
              </span>
              <span className="text-xs text-slate-400">
                ({sessions.filter((s) => s.completed).length} sesiones hechas)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">Tiempo validado</span>
          </div>
        </div>
      </section>

      {/* Sessions Timeline List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Próximas Sesiones Programadas
          </h2>
          <span className="text-xs text-slate-400">
            {sessions.filter((s) => !s.completed).length} pendientes
          </span>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="bg-[#181a22] border border-[#262a36] rounded-2xl p-12 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">
              No tienes sesiones agendadas todavía
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Comienza programando tu primer bloque de estudio o pulsa "Optimizar con IA" para distribuir tus temas automáticamente.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar mi Primera Sesión</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSessions.map((sess) => {
              const isToday = sess.date === new Date().toISOString().split('T')[0];
              const isPast = sess.date < new Date().toISOString().split('T')[0];

              return (
                <div
                  key={sess.id}
                  className={`bg-[#181a22] border rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between ${
                    sess.completed
                      ? 'border-emerald-500/30 bg-[#16201a]'
                      : isToday
                      ? 'border-amber-400/50 bg-[#212328]'
                      : 'border-[#262a36] hover:border-[#323746]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Date and Day Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">{sess.dayOfWeek}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{sess.date}</span>
                        {isToday && (
                          <span className="font-bold text-amber-950 bg-amber-400 px-1.5 py-0.2 rounded text-[10px]">
                            HOY
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-indigo-300 tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {sess.durationMinutes} min
                      </span>
                    </div>

                    {/* Module Title */}
                    <div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {sess.phaseTitle}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 line-clamp-2 mt-0.5">
                        {sess.moduleTitle}
                      </h4>
                    </div>

                    {/* Notes */}
                    {sess.notes && (
                      <p className="text-xs text-slate-400 bg-[#15171f] p-2.5 rounded-xl border border-[#262a36]">
                        {sess.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-[#262a36] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSessionComplete(sess.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                        sess.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#252834] text-slate-300 hover:text-white hover:bg-[#2d3140]'
                      }`}
                    >
                      {sess.completed ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Completada</span>
                        </>
                      ) : (
                        <span>Marcar Hecha</span>
                      )}
                    </button>

                    {!sess.completed && (
                      <button
                        type="button"
                        onClick={() => onStartFocusSessionForScheduled(sess)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        <span>Iniciar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal to add session */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181a22] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#2b303e] space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-[#262a36] pb-3">
              <h3 className="text-base font-bold text-slate-100">
                Agendar Nueva Sesión de Estudio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Módulo a Estudiar
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {allModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.phaseTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Duración (minutos)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora (60 min)</option>
                    <option value={90}>1.5 horas (90 min)</option>
                    <option value={120}>2 horas (120 min)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Notas de Enfoque (o dicta con voz)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ej. Leer documentación de LangGraph y armar grafo mínimo"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="flex-1 text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <AudioTranscriberButton onTranscription={(text) => setSessionNotes((prev) => (prev ? `${prev} ${text}` : text))} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#262a36]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
                >
                  Guardar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
