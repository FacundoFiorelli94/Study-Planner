import React, { useState } from 'react';
import {
  StudyRoadmap,
  StudyPhase,
  StudyModule,
  ModuleStatus,
  PortfolioProject,
  StudyMaterial,
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
  Layers,
  FileText,
  FlaskConical,
  FolderGit2,
  ChevronsUpDown,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { ModulePdfViewerModal } from './ModulePdfViewerModal';
import { LabViewerModal } from './LabViewerModal';
import { PhaseHoverSidebar } from './PhaseHoverSidebar';
import { StudyMaterialsModal } from './StudyMaterialsModal';

interface RoadmapViewerProps {
  roadmap: StudyRoadmap;
  allRoadmaps: StudyRoadmap[];
  onSelectRoadmap: (id: string) => void;
  onUpdateModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  onUpdateDeliverable: (moduleId: string, completed: boolean) => void;
  onOpenEvaluateModal: (phase: StudyPhase, module: StudyModule) => void;
  onStartFocusSession: (module: StudyModule, phase: StudyPhase) => void;
  onUpdatePaceAndBudget: (weeklyHours: number, preferredDays: string[]) => void;
  onUpdateProjectStatus?: (projectId: string, status: PortfolioProject['status'], repoUrl?: string) => void;
  onToggleLabStep?: (projectId: string, stepIndex: number) => void;
  onDeleteRoadmap?: (id: string) => void;
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
  onUpdateProjectStatus,
  onToggleLabStep,
  onDeleteRoadmap,
}) => {
  // All phases expanded by default, or controllable individually/globally
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    roadmap.phases.forEach((p, idx) => {
      // First two open, others can be toggled
      init[p.id] = idx < 2;
    });
    return init;
  });

  const [showPaceCustomizer, setShowPaceCustomizer] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(roadmap.weeklyHoursBudget);
  const [selectedDays, setSelectedDays] = useState<string[]>(roadmap.preferredDays || []);

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTarget, setPdfTarget] = useState<{ module: StudyModule | null; phase: StudyPhase | null }>({
    module: null,
    phase: null,
  });

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [selectedLabProject, setSelectedLabProject] = useState<PortfolioProject | null>(null);

  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);

  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleExpandAllPhases = () => {
    const next: Record<string, boolean> = {};
    roadmap.phases.forEach((p) => {
      next[p.id] = true;
    });
    setExpandedPhases(next);
  };

  const handleCollapseAllPhases = () => {
    const next: Record<string, boolean> = {};
    roadmap.phases.forEach((p) => {
      next[p.id] = false;
    });
    setExpandedPhases(next);
  };

  const areAllExpanded = roadmap.phases.every((p) => expandedPhases[p.id]);

  const handleSelectPhaseFromSidebar = (phaseId: string) => {
    // Ensure the targeted phase is expanded
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: true,
    }));

    // Smooth scroll into targeted phase card
    setTimeout(() => {
      const el = document.getElementById(`phase-${phaseId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleOpenPdfModal = (phase: StudyPhase, module: StudyModule) => {
    setPdfTarget({ phase, module });
    setIsPdfModalOpen(true);
  };

  const handleOpenLabModal = (proj: PortfolioProject) => {
    setSelectedLabProject(proj);
    setIsLabModalOpen(true);
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
    <div className="space-y-4 pb-8 relative">
      {/* Hover Side Navigation Menu (Auto hides & expands smoothly on mouse hover) */}
      <PhaseHoverSidebar
        phases={roadmap.phases}
        onSelectPhase={handleSelectPhaseFromSidebar}
        onOpenMaterialsModal={() => setIsMaterialsModalOpen(true)}
        onScrollToLabs={() => {
          document.getElementById('labs-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Compact Master Dashboard Bar */}
      <section className="bg-[#181a22] border border-[#262a36] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Row 1: Title, Category & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
              <Layers className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{roadmap.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">{roadmap.totalWeeks} Semanas estimadas</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {roadmap.title}
            </h1>
          </div>

          {/* Action buttons & Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaterialsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#222634] hover:bg-[#2c3142] border border-[#303546] rounded-xl transition-colors shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Materiales de Estudio</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPaceCustomizer(!showPaceCustomizer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#222634] hover:bg-[#2c3142] border border-[#303546] rounded-xl transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ajustar Horario</span>
            </button>

            <button
              type="button"
              onClick={areAllExpanded ? handleCollapseAllPhases : handleExpandAllPhases}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#222634] hover:bg-[#2c3142] border border-[#303546] rounded-xl transition-colors shadow-sm"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>{areAllExpanded ? 'Colapsar Fases' : 'Expandir Fases'}</span>
            </button>

            <label htmlFor="roadmap-select" className="sr-only">Seleccionar Ruta</label>
            <select
              id="roadmap-select"
              value={roadmap.id}
              onChange={(e) => onSelectRoadmap(e.target.value)}
              className="bg-[#1b1e27] hover:bg-[#222632] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-[#2e3342] focus:outline-none cursor-pointer shadow-sm"
            >
              {allRoadmaps.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#181a22] text-slate-200">
                  {r.title}
                </option>
              ))}
            </select>

            {/* Delete button for custom roadmaps */}
            {roadmap.id !== 'roadmap-ai-automation-30w' && roadmap.id !== 'roadmap-multi-agent-automation-12w' && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Estás seguro de que deseas borrar la ruta personalizada "${roadmap.title}"? Esta acción no se puede deshacer.`
                    )
                  ) {
                    onDeleteRoadmap?.(roadmap.id);
                  }
                }}
                title="Eliminar ruta personalizada"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 rounded-xl transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrar Ruta</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Metrics Strip */}
        <div className="pt-3 border-t border-[#252834] flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Progress bar */}
          <div className="flex items-center gap-3 min-w-[240px] flex-1">
            <span className="text-slate-400 font-medium">Progreso Global:</span>
            <div className="w-32 bg-[#252834] h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-bold text-slate-100 tabular-nums">
              {progressPercent}% ({completedModules}/{totalModules} módulos)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div>
              <span className="text-slate-400">Total: </span>
              <strong className="text-slate-100">{totalHours}h</strong>
            </div>
            <div>
              <span className="text-slate-400">Ritmo: </span>
              <strong className="text-indigo-300">{roadmap.weeklyHoursBudget}h/sem</strong> ({roadmap.targetPace})
            </div>
          </div>
        </div>

        {/* Time Budget Customizer Drawer (when open) */}
        {showPaceCustomizer && (
          <div className="mt-3 p-4 bg-[#141620] border border-[#272b38] rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-100">
                Ajustar Planificador de Horas Disponibles
              </h2>
              <span className="text-xs text-slate-400">
                Aproximadamente <strong className="text-slate-200">{Math.ceil(totalHours / weeklyHours)} semanas</strong> a este ritmo.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Horas semanales: <span className="text-indigo-400 font-bold tabular-nums">{weeklyHours} horas</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-[#252834] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Días de estudio:
                </label>
                <div className="flex flex-wrap gap-1">
                  {allDays.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#181a22] text-slate-300 border border-[#2b303e] hover:bg-[#20232e]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#232734]">
              <button
                type="button"
                onClick={() => setShowPaceCustomizer(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSavePace}
                className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
              >
                Guardar Horario
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Phases & Curriculum List (Collapsible Cards for Phase 0 to Phase 5) */}
      <div className="space-y-4">
        {roadmap.phases.map((phase) => {
          const isExpanded = !!expandedPhases[phase.id];
          const phaseCompleted = phase.modules.every((m) => m.status === 'completed');
          const phaseModulesCompleted = phase.modules.filter((m) => m.status === 'completed').length;

          return (
            <div
              key={phase.id}
              id={`phase-${phase.id}`}
              className={`bg-[#181a22] border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 scroll-mt-24 ${
                isExpanded ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' : 'border-[#262a36] hover:border-[#323646]'
              }`}
            >
              {/* Collapsible Phase Header */}
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1d202b] transition-colors cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30">
                      FASE {String(phase.phaseNumber).padStart(2, '0')}
                    </span>
                    <span className="text-slate-300 font-semibold">{phase.weeksRange}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums text-slate-400 font-medium">{phase.estimatedHours} horas requeridas</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                    {phase.title}
                    {phaseCompleted && (
                      <span className="text-emerald-300 text-xs font-semibold flex items-center gap-1 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/35">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Completada
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-300 tabular-nums">
                      {phaseModulesCompleted}/{phase.modules.length}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">módulos</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#242735] flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Modules List inside Expanded Phase */}
              {isExpanded && (
                <div className="border-t border-[#252834] divide-y divide-[#212430] bg-[#15171f] animate-in fade-in duration-200">
                  {/* Flagship Laboratory Banner if Phase contains one */}
                  {(() => {
                    const phaseLab = roadmap.portfolioProjects?.find((p) => p.phaseNumber === phase.phaseNumber);
                    if (!phaseLab) return null;
                    const labStepsDone = phaseLab.completedStepIndexes?.length || 0;
                    const labTotalSteps = phaseLab.labGuide?.steps.length || 5;

                    return (
                      <div className="p-4 sm:p-5 bg-[#1a1e2a] border-b border-[#292e3d]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#141620] border border-amber-500/30">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/35 flex items-center gap-1.5">
                                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                                Laboratorio Práctico Troncal de la Fase {phase.phaseNumber}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-300">Semana {phaseLab.requiredWeek}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-indigo-300 font-semibold">{labStepsDone}/{labTotalSteps} pasos listos</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-100">
                              {phaseLab.title}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                              {phaseLab.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenLabModal(phaseLab)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors shrink-0"
                          >
                            <FlaskConical className="w-4 h-4 text-amber-300" />
                            <span>Abrir Laboratorio en Pop-up</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {phase.modules.map((mod, modIdx) => {
                    const isDone = mod.status === 'completed';
                    const inProgress = mod.status === 'in_progress';

                    return (
                      <div key={mod.id} className="p-5 sm:p-6 hover:bg-[#181a24] transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          {/* Module Main Information */}
                          <div className="space-y-3 max-w-3xl flex-1">
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
                                className="mt-0.5 text-slate-500 hover:text-white transition-colors shrink-0"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : inProgress ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                  <span className="font-semibold text-slate-300">Módulo {modIdx + 1}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums text-slate-300">{mod.estimatedHours}h estimadas</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums text-indigo-300 font-semibold">
                                    {Math.round((mod.loggedMinutes || 0) / 60)}h dedicadas
                                  </span>
                                  {isDone && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-emerald-400 font-semibold">Dominado ✓</span>
                                    </>
                                  )}
                                </div>
                                <h4 className="text-base font-bold text-slate-100 tracking-tight">
                                  {mod.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                                  {mod.description}
                                </p>
                              </div>
                            </div>

                            {/* Topics List */}
                            <div className="pl-8">
                              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                Temas clave abordados:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-xs">
                                {mod.topics.map((topic, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#212430] border border-[#2e3342] text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>{topic}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Deliverable Project */}
                            {mod.deliverable && (
                              <div className="pl-8 pt-2">
                                <div className="p-3.5 bg-[#1b1e27] rounded-xl border border-[#282d3a] flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                                      <Award className="w-4 h-4 text-amber-400" />
                                      <span>Entregable Práctico:</span>
                                      <span className="font-normal text-slate-300">
                                        {mod.deliverable.title}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                      {mod.deliverable.description}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateDeliverable(mod.id, !mod.deliverable?.completed)
                                    }
                                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                      mod.deliverable.completed
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-[#252834] text-slate-300 border border-[#313646] hover:text-white'
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
                                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                                    <span>Hito Validado por Gemini IA</span>
                                    <span className="tabular-nums">Puntuación: {mod.verification.score}/100</span>
                                  </div>
                                  <p className="text-slate-300">{mod.verification.feedback}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Sidebar for Module (Includes PDF Viewer) */}
                          <div className="lg:w-64 flex flex-col gap-2 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-[#272b38] lg:pl-6">
                            {/* PDF VIEWER BUTTON (Requested by user) */}
                            <button
                              type="button"
                              onClick={() => handleOpenPdfModal(phase, mod)}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-100 bg-[#222634] hover:bg-[#2b3142] border border-[#31374a] rounded-xl transition-all shadow-sm group cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                              <span>Visor de PDF del Módulo</span>
                            </button>

                            {/* Focus Timer Launch */}
                            <button
                              type="button"
                              onClick={() => onStartFocusSession(mod, phase)}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1b1e27] hover:bg-[#242834] border border-[#2d3240] rounded-xl transition-colors shadow-sm"
                            >
                              <Play className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Estudiar con Pomodoro</span>
                            </button>

                            {/* IA Challenge Verification */}
                            <button
                              type="button"
                              onClick={() => onOpenEvaluateModal(phase, mod)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Validar Hito con IA</span>
                            </button>

                            {/* Official Resources */}
                            {mod.resources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#252834]">
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
                                      className="flex items-center justify-between text-xs text-slate-400 hover:text-indigo-300 hover:underline transition-colors"
                                    >
                                      <span className="truncate">{res.name}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0 text-slate-500 ml-1" />
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

      {/* LABORATORIOS PRÁCTICOS TRONCALES (Requested by user: Laboratorio format with step-by-step complete execution explanation) */}
      <section
        id="labs-section"
        className="bg-[#181a22] border border-[#262a36] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>Laboratorios Prácticos de Portafolio (Fases 2, 4 y 5)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Laboratorios Prácticos con Guía de Realización Completa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Cada laboratorio incluye objetivo empresarial, comandos reproducibles paso a paso, checklist de verificación y registro de repositorio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roadmap.portfolioProjects?.map((proj) => {
            const isCompleted = proj.status === 'completed';
            const inProgress = proj.status === 'in_progress';
            const completedCount = proj.completedStepIndexes?.length || 0;
            const totalSteps = proj.labGuide?.steps.length || 5;

            return (
              <div
                key={proj.id}
                className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-[#16201a]'
                    : inProgress
                    ? 'border-amber-500/40 bg-[#1e212b]'
                    : 'border-[#282d3a] bg-[#1a1c26] hover:border-[#353b4c]'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Hito: Semana {proj.requiredWeek} · Fase {proj.phaseNumber}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                          : inProgress
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                          : 'bg-[#252834] text-slate-400 border-[#313646]'
                      }`}
                    >
                      {isCompleted ? 'Superado ✓' : inProgress ? 'En Laboratorio' : 'Pendiente'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Step completion pill */}
                  <div className="p-3 bg-[#13151f] rounded-xl border border-[#232734] flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">Pasos de laboratorio:</span>
                    <span className="font-bold text-indigo-300 tabular-nums">
                      {completedCount} / {totalSteps} completados
                    </span>
                  </div>

                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-medium hover:underline truncate"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">Ver Repositorio</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#262a36]">
                  <button
                    type="button"
                    onClick={() => handleOpenLabModal(proj)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 text-amber-300" />
                    <span>Abrir en Pop-up de Lectura Cómoda</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODALS */}
      {/* 1. PDF Viewer Modal for Module */}
      <ModulePdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        module={pdfTarget.module}
        phase={pdfTarget.phase}
      />

      {/* 2. Laboratory Execution Modal */}
      <LabViewerModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        project={selectedLabProject}
        onToggleLabStep={(projId, stepIndex) => {
          if (onToggleLabStep) {
            onToggleLabStep(projId, stepIndex);
          }
          // Update local target project in modal state as well
          setSelectedLabProject((prev) => {
            if (!prev || prev.id !== projId) return prev;
            const current = new Set(prev.completedStepIndexes || []);
            if (current.has(stepIndex)) current.delete(stepIndex);
            else current.add(stepIndex);
            return {
              ...prev,
              completedStepIndexes: Array.from(current).sort((a, b) => a - b),
            };
          });
        }}
        onUpdateStatus={(projId, status, repoUrl) => {
          if (onUpdateProjectStatus) {
            onUpdateProjectStatus(projId, status, repoUrl);
          }
          setSelectedLabProject((prev) => (prev ? { ...prev, status, repoUrl } : null));
        }}
      />

      {/* 3. Study Materials Library Modal (Extensibility for future materials) */}
      <StudyMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        roadmapId={roadmap.id}
        phases={roadmap.phases}
        onOpenPdfViewerForMaterial={(mat) => {
          // Open PDF viewer with this material
          setIsMaterialsModalOpen(false);
          const foundPhase = roadmap.phases.find((p) => p.id === mat.phaseId) || roadmap.phases[0];
          const mockModule: StudyModule = {
            id: mat.id,
            title: mat.title,
            description: mat.description || '',
            topics: mat.tags,
            status: 'in_progress',
            estimatedHours: 4,
            loggedMinutes: 0,
            resources: mat.url ? [{ name: mat.title, type: 'Doc', url: mat.url }] : [],
            pdfGuide: {
              title: mat.title,
              totalPages: 2,
              author: mat.author || 'Biblioteca de Estudio',
              summary: mat.description || 'Material complementario para la Carrera de IA y Automatización.',
              pages: [
                {
                  pageNumber: 1,
                  title: mat.title,
                  sections: [
                    {
                      heading: 'Descripción del Documento',
                      content: mat.description || 'Lectura formativa agregada por el estudiante.',
                      bulletPoints: mat.tags.map((t) => `Etiqueta: ${t}`),
                    },
                  ],
                },
              ],
              fileUrl: mat.fileData,
              fileName: mat.fileName,
            },
          };
          setPdfTarget({ module: mockModule, phase: foundPhase });
          setIsPdfModalOpen(true);
        }}
      />
    </div>
  );
};
