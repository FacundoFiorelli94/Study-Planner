import React, { useState } from 'react';
import {
  StudyRoadmap,
  PortfolioProject,
} from '../../types/study';
import { StorageService } from '../../services/storageService';
import {
  Flame,
  Award,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  FolderGit2,
  FlaskConical,
} from 'lucide-react';
import { LabViewerModal } from '../roadmap/LabViewerModal';

interface ProgressDashboardProps {
  roadmap: StudyRoadmap;
  onUpdateProjectStatus: (projectId: string, status: PortfolioProject['status'], repoUrl?: string) => void;
  onDataImported: () => void;
  onToggleLabStep?: (projectId: string, stepIndex: number) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  roadmap,
  onUpdateProjectStatus,
  onDataImported,
  onToggleLabStep,
}) => {
  const streakData = StorageService.getStreakData();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [repoInput, setRepoInput] = useState('');
  const [selectedLabProject, setSelectedLabProject] = useState<PortfolioProject | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Calculations
  const allModules = roadmap.phases.flatMap((p) => p.modules);
  const totalModules = allModules.length;
  const completedModules = allModules.filter((m) => m.status === 'completed').length;
  const inProgressModules = allModules.filter((m) => m.status === 'in_progress').length;
  const overallPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const totalLoggedMinutes = allModules.reduce((acc, m) => acc + (m.loggedMinutes || 0), 0);
  const totalHoursLogged = (totalLoggedMinutes / 60).toFixed(1);
  const totalEstimatedHours = roadmap.phases.reduce((acc, p) => acc + p.estimatedHours, 0);

  // Daily logs for last 7 days
  const last7Days: { dateStr: string; dayLabel: string; minutes: number }[] = [];
  const today = new Date();
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const mins = streakData.dailyLogs[dStr] || 0;
    last7Days.push({
      dateStr: dStr,
      dayLabel: dayNamesShort[d.getDay()],
      minutes: mins,
    });
  }

  const maxDailyMinutes = Math.max(90, ...last7Days.map((d) => d.minutes));

  const handleExport = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importData(content)) {
        alert('Datos importados exitosamente.');
        onDataImported();
      } else {
        alert('Formato de respaldo no válido.');
      }
    };
    reader.readAsText(file);
  };

  const saveProjectRepo = (projectId: string) => {
    onUpdateProjectStatus(projectId, 'in_progress', repoInput);
    setEditingProjectId(null);
    setRepoInput('');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner Stats */}
      <section className="bg-[#181a22] border border-[#262a36] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <span className="uppercase tracking-wider">Métricas de Desempeño Académico</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">Ruta: <strong className="text-slate-100">{roadmap.title}</strong></span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              Seguimiento de Progreso & Portafolio de Entregables
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Monitorea el avance de tus horas acumuladas, racha de estudio y el estado de tus laboratorios.
            </p>
          </div>

          {/* Backup & Restore buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1f222c] border border-[#2b303e] hover:bg-[#262b37] rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exportar Respaldo</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1f222c] border border-[#2b303e] hover:bg-[#262b37] rounded-xl transition-colors cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importar Respaldo</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* 4 Cards Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#252834]">
          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Avance Global</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-100 tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-400">
                ({completedModules}/{totalModules})
              </span>
            </div>
            <div className="w-full bg-[#252834] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Horas Invertidas</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-slate-100 tabular-nums">
                {totalHoursLogged}h
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {totalEstimatedHours}h meta
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1.5">
              Ritmo: {roadmap.weeklyHoursBudget}h/semana
            </span>
          </div>

          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-amber-300 font-medium block flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Racha Actual</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-amber-300 tabular-nums">
                {streakData.currentStreak} días
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1.5">
              Récord: {streakData.longestStreak} días
            </span>
          </div>

          <div className="p-3 bg-[#1b1e27] rounded-xl border border-[#282d3a]">
            <span className="text-xs text-slate-400 font-medium block">Enfoque Actual</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-indigo-300 tabular-nums">
                {inProgressModules}
              </span>
              <span className="text-xs text-slate-400">
                módulos en curso
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1.5 truncate">
              {allModules.find((m) => m.status === 'in_progress')?.title || 'Todo al día'}
            </span>
          </div>
        </div>
      </section>

      {/* Activity Chart & Phases Matrix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Logs Bar Chart */}
        <div className="bg-[#181a22] border border-[#262a36] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100">
                Actividad Semanal
              </h2>
              <span className="text-xs text-slate-400 font-medium">Últimos 7 días</span>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Minutos reales acumulados por cada sesión de estudio completada.
            </p>

            <div className="flex items-end justify-between gap-2 h-40 pt-4">
              {last7Days.map((d, idx) => {
                const heightPct = Math.min(100, Math.round((d.minutes / maxDailyMinutes) * 100));
                const isToday = idx === 6;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-slate-400 tabular-nums font-medium">
                      {d.minutes > 0 ? `${d.minutes}m` : '-'}
                    </span>
                    <div className="w-full max-w-[28px] bg-[#15171f] rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isToday
                            ? 'bg-amber-400'
                            : d.minutes > 0
                            ? 'bg-indigo-500'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold ${isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#262a36] flex items-center justify-between text-xs text-slate-400">
            <span>Objetivo diario recomendado:</span>
            <span className="font-semibold text-indigo-300 tabular-nums">90 min/día</span>
          </div>
        </div>

        {/* Phase Breakdown List */}
        <div className="lg:col-span-2 bg-[#181a22] border border-[#262a36] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">
              Desglose por Fases del Plan
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {roadmap.phases.length} fases secuenciales
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.phases.map((p) => {
              const pTotal = p.modules.length;
              const pDone = p.modules.filter((m) => m.status === 'completed').length;
              const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
              const pLoggedHours = Math.round(
                p.modules.reduce((acc, m) => acc + (m.loggedMinutes || 0), 0) / 60
              );

              return (
                <div key={p.id} className="p-4 bg-[#1b1e27] rounded-xl border border-[#282d3a] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">
                        {p.weeksRange}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">
                        {p.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 sm:text-right">
                      <span className="tabular-nums">
                        {pLoggedHours}h / {p.estimatedHours}h
                      </span>
                      <span className="font-bold text-indigo-300 tabular-nums w-10 text-right">
                        {pPct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#252834] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Deliverables Showcase */}
      <section className="bg-[#181a22] border border-[#262a36] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <Award className="w-4 h-4" />
              <span>Validación de Portafolio Técnico</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Los 3 Proyectos Maestros de Grado Profesional
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Requisitos esenciales para culminar la semana 30 y certificar dominio en automatización y backend con IA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roadmap.portfolioProjects?.map((proj) => {
            const isCompleted = proj.status === 'completed';
            const inProgress = proj.status === 'in_progress';

            return (
              <div
                key={proj.id}
                className={`border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-[#16201a]'
                    : inProgress
                    ? 'border-amber-500/40 bg-[#212328]'
                    : 'border-[#282d3a] bg-[#1b1e27]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Hito: Semana {proj.requiredWeek}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                          : inProgress
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                          : 'bg-[#252834] text-slate-400 border-[#313646]'
                      }`}
                    >
                      {isCompleted ? 'Validado ✓' : inProgress ? 'En Desarrollo' : 'Pendiente'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Lab step completion pill */}
                  <div className="p-2.5 bg-[#14161f] rounded-lg border border-[#232734] flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <FlaskConical className="w-3.5 h-3.5" />
                      Laboratorio Práctico:
                    </span>
                    <span className="font-bold text-indigo-300 tabular-nums">
                      {proj.completedStepIndexes?.length || 0} / {proj.labGuide?.steps.length || 5} pasos
                    </span>
                  </div>

                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-medium hover:underline"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ver Repositorio del Proyecto</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>

                {/* Status Toggles & Repo Editing */}
                <div className="mt-5 pt-4 border-t border-[#282d3a] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLabProject(proj);
                      setIsLabModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 text-amber-300" />
                    <span>Abrir en Pop-up de Lectura Cómoda</span>
                  </button>

                  {editingProjectId === proj.id ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="https://github.com/usuario/mi-proyecto"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-[#303546] bg-[#15171f] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingProjectId(null)}
                          className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => saveProjectRepo(proj.id)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                        >
                          Guardar URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProjectId(proj.id);
                          setRepoInput(proj.repoUrl || '');
                        }}
                        className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline"
                      >
                        {proj.repoUrl ? 'Editar Repo' : '+ Adjuntar Repo'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProjectStatus(
                            proj.id,
                            isCompleted ? 'pending' : inProgress ? 'completed' : 'in_progress',
                            proj.repoUrl
                          )
                        }
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl transition-colors shadow-sm ${
                          isCompleted
                            ? 'bg-[#252834] text-slate-300 hover:bg-[#2d3140]'
                            : inProgress
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-[#252834] text-slate-300 hover:text-white'
                        }`}
                      >
                        {isCompleted ? 'Reabrir' : inProgress ? 'Marcar Aprobado' : 'Iniciar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lab Modal in Progress Dashboard */}
      <LabViewerModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        project={selectedLabProject}
        onToggleLabStep={(projId, stepIndex) => {
          if (onToggleLabStep) {
            onToggleLabStep(projId, stepIndex);
          }
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
          onUpdateProjectStatus(projId, status, repoUrl);
          setSelectedLabProject((prev) => (prev ? { ...prev, status, repoUrl } : null));
        }}
      />
    </div>
  );
};
