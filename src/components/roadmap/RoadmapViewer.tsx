import React, { useState } from 'react';
import {
  StudyRoadmap,
  StudyPhase,
  StudyModule,
  ModuleStatus,
} from '../../types/study';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Play,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RoadmapViewerProps {
  roadmap: StudyRoadmap;
  allRoadmaps: StudyRoadmap[];
  onSelectRoadmap: (id: string) => void;
  onUpdateModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  onUpdateDeliverable: (moduleId: string, completed: boolean) => void;
  onOpenEvaluateModal: (phase: StudyPhase, module: StudyModule) => void;
  onStartFocusSession: (module: StudyModule, phase: StudyPhase) => void;
  onUpdatePaceAndBudget: (weeklyHours: number, preferredDays: string[]) => void;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({
  roadmap,
  allRoadmaps,
  onSelectRoadmap,
  onUpdateModuleStatus,
  onUpdateDeliverable,
  onOpenEvaluateModal,
  onStartFocusSession,
  onUpdatePaceAndBudget,
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    [roadmap.phases[0]?.id || '']: true,
    [roadmap.phases[1]?.id || '']: true,
  });

  const [showPaceCustomizer, setShowPaceCustomizer] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(roadmap.weeklyHoursBudget);
  const [selectedDays, setSelectedDays] = useState<string[]>(roadmap.preferredDays || []);

  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleSavePace = () => {
    onUpdatePaceAndBudget(weeklyHours, selectedDays);
    setShowPaceCustomizer(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Metrics
  const totalModules = roadmap.phases.reduce((acc, p) => acc + p.modules.length, 0);
  const completedModules = roadmap.phases.reduce(
    (acc, p) => acc + p.modules.filter((m) => m.status === 'completed').length,
    0
  );
  const totalHours = roadmap.phases.reduce((acc, p) => acc + p.estimatedHours, 0);
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner & Roadmap Switcher */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="relative h-44 sm:h-52 w-full bg-slate-900 overflow-hidden">
          <img
            src="/src/assets/images/study_hub_banner_1791511795199.jpg"
            alt="Study Hub Banner"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{roadmap.category}</span>
                <span aria-hidden="true">·</span>
                <span>{roadmap.totalWeeks} Semanas estimadas</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {roadmap.title}
              </h1>
            </div>

            {/* Switcher dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="roadmap-select" className="sr-only">Seleccionar Ruta</label>
              <select
                id="roadmap-select"
                value={roadmap.id}
                onChange={(e) => onSelectRoadmap(e.target.value)}
                className="bg-slate-800/90 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {allRoadmaps.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Bar */}
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
            {roadmap.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Progreso General</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">{progressPercent}%</span>
                <span className="text-xs text-slate-500">
                  ({completedModules}/{totalModules} módulos)
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">Tiempo Total Estimado</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">{totalHours}h</span>
                <span className="text-xs text-slate-500">planificadas</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">Tu Presupuesto Semanal</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">{roadmap.weeklyHoursBudget}h</span>
                <span className="text-xs text-slate-500">por semana</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <button
                onClick={() => setShowPaceCustomizer(!showPaceCustomizer)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Personalizar Tiempos</span>
              </button>
            </div>
          </div>

          {/* Time Budget Customizer Drawer */}
          {showPaceCustomizer && (
            <div className="mt-4 p-5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Ajustar Planificador a tus Tiempos Disponibles
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Modifica tus horas disponibles para recalcular automáticamente las semanas estimadas y la distribución de sesiones.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Horas disponibles por semana: <span className="text-amber-800 font-bold tabular-nums">{weeklyHours} horas</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 tabular-nums">
                    <span>3h (Relajado)</span>
                    <span>10h (Recomendado)</span>
                    <span>20h+ (Intensivo)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Con {weeklyHours}h/semana, completarás la ruta de {totalHours}h en aproximadamente{' '}
                    <strong className="text-slate-900 font-bold">{Math.ceil(totalHours / weeklyHours)} semanas</strong>.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Días prioritarios para estudiar:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allDays.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Sesión promedio: {Math.round((weeklyHours * 60) / selectedDays.length)} min por día seleccionado.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setShowPaceCustomizer(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePace}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Aplicar Nuevo Horario
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Phases & Curriculum List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Estructura Modular del Plan de Estudios
          </h2>
          <span className="text-xs text-slate-500">
            {roadmap.phases.length} fases · Total {totalModules} módulos
          </span>
        </div>

        {roadmap.phases.map((phase) => {
          const isExpanded = !!expandedPhases[phase.id];
          const phaseCompleted = phase.modules.every((m) => m.status === 'completed');
          const phaseModulesCompleted = phase.modules.filter((m) => m.status === 'completed').length;

          return (
            <div
              key={phase.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
            >
              {/* Phase Header */}
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {String(phase.phaseNumber).padStart(2, '0')}.
                    </span>
                    <span>{phase.weeksRange}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{phase.estimatedHours} horas requeridas</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    {phase.title}
                    {phaseCompleted && (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Completada
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                    {phase.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      {phaseModulesCompleted}/{phase.modules.length}
                    </span>
                    <span className="text-xs text-slate-500 block">módulos</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Modules list */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/40">
                  {phase.modules.map((mod, modIdx) => {
                    const isDone = mod.status === 'completed';
                    const inProgress = mod.status === 'in_progress';

                    return (
                      <div key={mod.id} className="p-6 bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          {/* Module Main Information */}
                          <div className="space-y-3 max-w-3xl">
                            <div className="flex items-start gap-3">
                              {/* Status Toggle Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateModuleStatus(
                                    mod.id,
                                    isDone ? 'not_started' : inProgress ? 'completed' : 'in_progress'
                                  )
                                }
                                title={
                                  isDone
                                    ? 'Marcar como pendiente'
                                    : inProgress
                                    ? 'Marcar como completado'
                                    : 'Marcar en progreso'
                                }
                                className="mt-0.5 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : inProgress ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                  <span>Módulo {modIdx + 1}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{mod.estimatedHours}h estimadas</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">
                                    {Math.round((mod.loggedMinutes || 0) / 60)}h dedicadas
                                  </span>
                                  {isDone && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-emerald-700 font-semibold">Dominado</span>
                                    </>
                                  )}
                                </div>
                                <h4 className="text-base font-bold text-slate-900">
                                  {mod.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                                  {mod.description}
                                </p>
                              </div>
                            </div>

                            {/* Topics List */}
                            <div className="pl-8">
                              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                                Temas clave abordados:
                              </span>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                                {mod.topics.map((topic, i) => (
                                  <span key={i} className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                                    <span>{topic}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Deliverable Project */}
                            {mod.deliverable && (
                              <div className="pl-8 pt-2">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                      <Award className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Entregable Práctico:</span>
                                      <span className="font-normal text-slate-700">
                                        {mod.deliverable.title}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      {mod.deliverable.description}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateDeliverable(mod.id, !mod.deliverable?.completed)
                                    }
                                    className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                      mod.deliverable.completed
                                        ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {mod.deliverable.completed ? '✓ Entregado' : 'Marcar Entregado'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Verification Result if evaluated */}
                            {mod.verification && (
                              <div className="pl-8 pt-1">
                                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                                  <div className="flex items-center justify-between text-emerald-900 font-semibold">
                                    <span>Hito Validado por Gemini IA</span>
                                    <span className="tabular-nums font-bold">Puntuación: {mod.verification.score}/100</span>
                                  </div>
                                  <p className="text-slate-700">{mod.verification.feedback}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Sidebar for Module */}
                          <div className="lg:w-64 flex flex-col gap-2 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                            {/* Focus Timer Launch */}
                            <button
                              type="button"
                              onClick={() => onStartFocusSession(mod, phase)}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 text-slate-700" />
                              <span>Estudiar con Pomodoro</span>
                            </button>

                            {/* IA Challenge Verification */}
                            <button
                              type="button"
                              onClick={() => onOpenEvaluateModal(phase, mod)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-lg transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Validar Hito con IA</span>
                            </button>

                            {/* Official Resources */}
                            {mod.resources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100">
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                  Recursos Oficiales:
                                </span>
                                <div className="space-y-1">
                                  {mod.resources.map((res, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 hover:underline"
                                    >
                                      <span className="truncate">{res.name}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0 text-slate-400 ml-1" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
