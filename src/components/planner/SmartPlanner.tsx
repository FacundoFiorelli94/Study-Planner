import React, { useState } from 'react';
import {
  ScheduledSession,
  StudyRoadmap,
  StudyModule,
} from '../../types/study';
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
    <div className="space-y-8 pb-16">
      {/* Header with Planner Summary */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Planificador Inteligente</span>
              <span aria-hidden="true">·</span>
              <span>Disponibilidad: {roadmap.weeklyHoursBudget}h/semana</span>
              <span aria-hidden="true">·</span>
              <span>Ritmo {roadmap.targetPace}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Distribución de Sesiones y Calendario de Estudio
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Organiza bloques de estudio personalizados para cada objetivo académico. Marca las sesiones conforme las completes para registrar el progreso de cada módulo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRebalanceScheduleWithAI}
              disabled={isRebalancing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isRebalancing ? 'Calculando con IA...' : 'Optimizar con IA'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Sesión</span>
            </button>
          </div>
        </div>

        {/* Weekly Time Allocation Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Objetivo Semanal</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {roadmap.weeklyHoursBudget}h
              </span>
              <span className="text-xs text-slate-500">
                ({weeklyBudgetMinutes} min)
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Tiempo Agendado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {(totalScheduledMinutes / 60).toFixed(1)}h
              </span>
              <span className="text-xs text-slate-500">
                ({sessions.length} sesiones)
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Completado esta semana</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-700 tabular-nums">
                {(completedMinutes / 60).toFixed(1)}h
              </span>
              <span className="text-xs text-slate-500">
                ({sessions.filter((s) => s.completed).length} sesiones hechas)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Timeline List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Próximas Sesiones Programadas
          </h2>
          <span className="text-xs text-slate-500">
            {sessions.filter((s) => !s.completed).length} pendientes
          </span>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">
              No tienes sesiones agendadas todavía
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Comienza programando tu primer bloque de estudio o pulsa "Optimizar con IA" para distribuir tus temas automáticamente.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
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
                  className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all flex flex-col justify-between ${
                    sess.completed
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isToday
                      ? 'border-amber-300 ring-2 ring-amber-200/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Date and Day Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{sess.dayOfWeek}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{sess.date}</span>
                        {isToday && (
                          <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                            HOY
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-600 tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sess.durationMinutes} min
                      </span>
                    </div>

                    {/* Module Title */}
                    <div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {sess.phaseTitle}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {sess.moduleTitle}
                      </h4>
                    </div>

                    {/* Notes */}
                    {sess.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {sess.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSessionComplete(sess.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        sess.completed
                          ? 'bg-emerald-100 text-emerald-800 font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sess.completed ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Agendar Nueva Sesión de Estudio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Módulo a Estudiar
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none"
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Duración (minutos)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notas de Enfoque (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Leer documentación de LangGraph y armar grafo mínimo"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
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
