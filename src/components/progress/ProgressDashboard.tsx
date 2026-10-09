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
} from 'lucide-react';

interface ProgressDashboardProps {
  roadmap: StudyRoadmap;
  onUpdateProjectStatus: (projectId: string, status: PortfolioProject['status'], repoUrl?: string) => void;
  onDataImported: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  roadmap,
  onUpdateProjectStatus,
  onDataImported,
}) => {
  const streakData = StorageService.getStreakData();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [repoInput, setRepoInput] = useState('');

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
    a.download = `kamino-backup-${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="space-y-8 pb-16">
      {/* Top Banner Stats */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Métricas de Desempeño Académico</span>
              <span aria-hidden="true">·</span>
              <span>Ruta: {roadmap.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Seguimiento de Progreso & Portafolio de Entregables
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Monitorea el avance de tus horas acumuladas, consistencia en racha de estudio y el estado de tus 3 proyectos troncales de portafolio.
            </p>
          </div>

          {/* Backup & Restore buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Respaldo</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar Respaldo</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* 4 Cards Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Avance Global</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({completedModules}/{totalModules} módulos)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Horas Invertidas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalHoursLogged}h
              </span>
              <span className="text-xs text-slate-500">
                / {totalEstimatedHours}h meta
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-3">
              Ritmo semanal: {roadmap.weeklyHoursBudget}h/semana
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-xs text-amber-900 font-medium block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Racha Actual</span>
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-amber-950 tabular-nums">
                {streakData.currentStreak} días
              </span>
            </div>
            <span className="text-[11px] text-amber-800/80 block mt-3">
              Récord histórico: {streakData.longestStreak} días seguidos
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Enfoque Actual</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {inProgressModules}
              </span>
              <span className="text-xs text-slate-500">
                módulos en curso
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-3 truncate">
              {allModules.find((m) => m.status === 'in_progress')?.title || 'Todo al día'}
            </span>
          </div>
        </div>
      </section>

      {/* Activity Chart & Phases Matrix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Logs Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Actividad Semanal
              </h2>
              <span className="text-xs text-slate-500 font-medium">Últimos 7 días</span>
            </div>

            <p className="text-xs text-slate-600 mb-6">
              Minutos reales acumulados por cada sesión de estudio completada.
            </p>

            <div className="flex items-end justify-between gap-2 h-40 pt-4">
              {last7Days.map((d, idx) => {
                const heightPct = Math.min(100, Math.round((d.minutes / maxDailyMinutes) * 100));
                const isToday = idx === 6;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-slate-500 tabular-nums font-semibold">
                      {d.minutes > 0 ? `${d.minutes}m` : '-'}
                    </span>
                    <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isToday ? 'bg-amber-600' : d.minutes > 0 ? 'bg-slate-800' : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium ${isToday ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Objetivo diario recomendado:</span>
            <span className="font-bold text-slate-900 tabular-nums">90 min/día</span>
          </div>
        </div>

        {/* Phase Breakdown List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Desglose por Fases del Plan
            </h2>
            <span className="text-xs text-slate-500">
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
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">
                        {p.weeksRange}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {p.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 sm:text-right">
                      <span className="tabular-nums">
                        {pLoggedHours}h / {p.estimatedHours}h
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums w-10 text-right">
                        {pPct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all"
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
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
              <Award className="w-4 h-4" />
              <span>Validación de Portafolio Técnico</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Los 3 Proyectos Maestros de Grado Profesional
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
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
                className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
                    : inProgress
                    ? 'border-amber-200 bg-amber-50/10 shadow-2xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Hito: Semana {proj.requiredWeek}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : inProgress
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted ? 'Validado' : inProgress ? 'En Desarrollo' : 'Pendiente'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>

                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-800 font-semibold hover:underline"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ver Repositorio del Proyecto</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>

                {/* Status Toggles & Repo Editing */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {editingProjectId === proj.id ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="https://github.com/usuario/mi-proyecto"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingProjectId(null)}
                          className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => saveProjectRepo(proj.id)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-md"
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
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
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
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
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
    </div>
  );
};
