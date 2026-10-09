import React, { useState } from 'react';
import { PortfolioProject } from '../../types/study';
import {
  X,
  FlaskConical,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  FolderGit2,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
  ListChecks,
  Network,
  Type,
} from 'lucide-react';

interface LabViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PortfolioProject | null;
  onToggleLabStep: (projectId: string, stepIndex: number) => void;
  onUpdateStatus: (projectId: string, status: PortfolioProject['status'], repoUrl?: string) => void;
}

export const LabViewerModal: React.FC<LabViewerModalProps> = ({
  isOpen,
  onClose,
  project,
  onToggleLabStep,
  onUpdateStatus,
}) => {
  if (!isOpen || !project) return null;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [repoUrlInput, setRepoUrlInput] = useState(project.repoUrl || '');
  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isComfortText, setIsComfortText] = useState(true);
  const [activeTab, setActiveTab] = useState<'guide' | 'steps' | 'architecture' | 'delivery'>('guide');

  const guide = project.labGuide;
  const completedSteps = project.completedStepIndexes || [];
  const totalSteps = guide?.steps.length || 0;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveRepo = () => {
    onUpdateStatus(
      project.id,
      project.status === 'pending' ? 'in_progress' : project.status,
      repoUrlInput
    );
    setIsEditingRepo(false);
  };

  const handleToggleComplete = () => {
    const nextStatus = project.status === 'completed' ? 'in_progress' : 'completed';
    onUpdateStatus(project.id, nextStatus, repoUrlInput);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 lg:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#161822] border border-[#2b3040] shadow-2xl flex flex-col w-full transition-all duration-200 overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 h-full max-h-none rounded-none'
            : 'max-w-4xl lg:max-w-5xl h-[88vh] max-h-[760px] rounded-2xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-[#12141d] border-b border-[#252836] p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1 text-[11px] shadow-xs">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                Laboratorio #{project.phaseNumber === 2 ? '1' : project.phaseNumber === 4 ? '2' : '3'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-[11px]">
                Fase {project.phaseNumber}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-[11px]">Semana: {project.requiredWeek}</span>
              {guide && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 flex items-center gap-1 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {guide.estimatedHours}h estimadas
                  </span>
                </>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-slate-100 tracking-tight leading-snug">
              {project.title}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl">
              {project.description}
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
            {/* Reading Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsComfortText(!isComfortText)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                isComfortText
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-[#181a24] text-slate-400 hover:text-slate-200 border-[#2b3040]'
              }`}
              title="Alternar tamaño de lectura"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isComfortText ? 'Lectura A+' : 'Estándar'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white bg-[#181a24] hover:bg-[#232738] border border-[#2b3040] rounded-xl transition-colors"
              title={isFullscreen ? 'Restaurar ventana' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-[#181a24] hover:bg-[#232738] border border-[#2b3040] rounded-xl transition-colors"
              title="Cerrar laboratorio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation & Progress Strip */}
        <div className="bg-[#14161f] border-b border-[#252836] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* View Tab Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-[#1a1d28] rounded-xl border border-[#2a2e3d]">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#222634]'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Guía</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('steps')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'steps'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#222634]'
              }`}
            >
              <ListChecks className="w-3 h-3" />
              <span>Pasos ({completedSteps.length}/{totalSteps})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#222634]'
              }`}
            >
              <Network className="w-3 h-3" />
              <span>Arquitectura</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'delivery'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#222634]'
              }`}
            >
              <FolderGit2 className="w-3 h-3" />
              <span>Entrega</span>
            </button>
          </div>

          {/* Quick Progress Indicator & Status Action */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 font-medium">Progreso:</span>
              <div className="w-20 sm:w-28 bg-[#252834] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">
                {progressPct}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors shadow-xs ${
                project.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {project.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Completado ✓</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Marcar Superado</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Reading & Interactive Workspace */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#14161f]">
          {guide ? (
            <>
              {/* TAB 1: FULL GUIDE OR TAB 3: ARCHITECTURE */}
              {(activeTab === 'guide' || activeTab === 'architecture') && (
                <div className="space-y-4">
                  {/* Context Cards: Objective & Business Challenge */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#1a1d27] border border-[#282d3c] rounded-xl space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Objetivo Técnico del Laboratorio</span>
                      </div>
                      <p className={`text-slate-200 leading-relaxed font-normal ${isComfortText ? 'text-xs sm:text-sm' : 'text-[11.5px]'}`}>
                        {guide.objective}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#1a1d27] border border-[#282d3c] rounded-xl space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Escenario & Reto de Negocio</span>
                      </div>
                      <p className={`text-slate-200 leading-relaxed font-normal ${isComfortText ? 'text-xs sm:text-sm' : 'text-[11.5px]'}`}>
                        {guide.scenario}
                      </p>
                    </div>
                  </div>

                  {/* Architecture Topology Box */}
                  <div className="p-3.5 bg-[#171a24] border border-[#282d3c] rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                        <Network className="w-3.5 h-3.5 text-indigo-400" />
                        Topología de Arquitectura
                      </span>
                      <span className="text-[10px] text-slate-400">Entorno de producción</span>
                    </div>

                    <div className="p-3 bg-[#10121a] rounded-xl border border-[#232735] font-mono text-xs text-indigo-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {guide.architectureOverview}
                    </div>
                  </div>

                  {/* Environment Prerequisites */}
                  {guide.prerequisites && guide.prerequisites.length > 0 && (
                    <div className="p-3.5 bg-[#1a1d27] border border-[#282d3c] rounded-xl space-y-2 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Requisitos Previos del Entorno Local
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {guide.prerequisites.map((prereq, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-2 bg-[#13151f] p-2 rounded-lg border border-[#232635] text-xs text-slate-300"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{prereq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP-BY-STEP COMPLETE GUIDE (Shown in 'guide' or 'steps' tab) */}
              {(activeTab === 'guide' || activeTab === 'steps') && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#252836]">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        <span>Guía de Ejecución Paso a Paso</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Ejecuta cada paso en tu terminal, copia los comandos y marca el progreso.
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-300 bg-[#1f2230] px-2.5 py-1 rounded-lg border border-[#2b3040]">
                      {completedSteps.length}/{totalSteps} listos
                    </span>
                  </div>

                  {/* Steps List with comfortable readability */}
                  <div className="space-y-3">
                    {guide.steps.map((step, sIdx) => {
                      const isDone = completedSteps.includes(sIdx);

                      return (
                        <div
                          key={step.stepNumber}
                          className={`rounded-xl border transition-all p-3.5 sm:p-4 space-y-2.5 shadow-xs ${
                            isDone
                              ? 'bg-[#141d18] border-emerald-500/35 ring-1 ring-emerald-500/10'
                              : 'bg-[#181b26] border-[#292e3e]'
                          }`}
                        >
                          {/* Step Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => onToggleLabStep(project.id, sIdx)}
                                className="mt-0.5 text-slate-400 hover:text-white transition-colors shrink-0"
                                title={isDone ? 'Marcar paso como pendiente' : 'Marcar paso como completado'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-1.5 text-xs mb-0.5">
                                  <span className="px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                                    PASO {step.stepNumber}
                                  </span>
                                  <span className="text-slate-500">·</span>
                                  <span className="text-slate-300 font-medium tabular-nums flex items-center gap-1 text-[11px]">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {step.duration}
                                  </span>
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                                  {step.title}
                                </h4>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleLabStep(project.id, sIdx)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-colors shrink-0 self-start sm:self-center ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-[#232736] text-slate-200 hover:text-white hover:bg-[#2c3245] border border-[#2e3447]'
                              }`}
                            >
                              {isDone ? '✓ Listo' : 'Marcar'}
                            </button>
                          </div>

                          {/* Step Explanation with comfortable font */}
                          <div className="pl-0 sm:pl-7.5">
                            <p
                              className={`text-slate-200 leading-relaxed ${
                                isComfortText ? 'text-xs sm:text-sm font-normal' : 'text-[11.5px]'
                              }`}
                            >
                              {step.explanation}
                            </p>
                          </div>

                          {/* Command or Code Snippet with full readability */}
                          {step.commandOrSnippet && (
                            <div className="pl-0 sm:pl-7.5 pt-0.5">
                              <div className="rounded-xl overflow-hidden border border-[#2b3040] bg-[#0f1118] shadow-inner">
                                <div className="bg-[#151722] px-3 py-1.5 border-b border-[#252836] flex items-center justify-between text-xs text-slate-300 font-mono">
                                  <span className="flex items-center gap-1.5 text-[11px]">
                                    <Terminal className="w-3 h-3 text-indigo-400" />
                                    <span className="font-semibold text-slate-200">{step.commandLanguage || 'bash'}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCommand(step.commandOrSnippet!, sIdx)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#212433] hover:bg-[#2a2f42] text-slate-200 hover:text-white transition-colors text-[11px] font-sans font-medium"
                                  >
                                    {copiedIndex === sIdx ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400 font-semibold">Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-400" />
                                        <span>Copiar</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed bg-[#0d0f16]">
                                  <code>{step.commandOrSnippet}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Deliverable Verification Rule */}
                          {step.deliverableCheck && (
                            <div className="pl-0 sm:pl-7.5 flex items-start gap-1.5 text-xs text-slate-300 bg-[#13151f] p-2.5 rounded-xl border border-[#232736]">
                              <span className="font-bold text-amber-400 shrink-0 text-[11px]">Validación:</span>
                              <span className="leading-relaxed text-[11.5px]">{step.deliverableCheck}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: DELIVERY & VERIFICATION CHECKLIST (Or in 'guide' tab bottom) */}
              {(activeTab === 'guide' || activeTab === 'delivery') && (
                <div className="space-y-3 pt-1">
                  {/* Verification Acceptance Checklist */}
                  {guide.verificationChecklist && guide.verificationChecklist.length > 0 && (
                    <div className="p-3.5 bg-[#181b26] border border-[#292e3e] rounded-xl space-y-2 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                          Criterios de Aceptación para la Entrega
                        </h4>
                      </div>
                      <div className="space-y-1.5">
                        {guide.verificationChecklist.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-start gap-2 text-xs text-slate-200">
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GitHub Repository Registration */}
                  <div className="p-3.5 bg-[#161822] border border-[#292e3e] rounded-xl space-y-2.5 shadow-xs">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Repositorio Oficial de Entrega</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Registra la URL de tu repositorio en GitHub para validar este hito en tu portafolio.
                      </p>
                    </div>

                    {isEditingRepo || !project.repoUrl ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          placeholder={guide.suggestedDeliverableRepo || 'https://github.com/tu-usuario/laboratorio-ia'}
                          value={repoUrlInput}
                          onChange={(e) => setRepoUrlInput(e.target.value)}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#303546] bg-[#10121a] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveRepo}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs shrink-0"
                        >
                          Guardar Repositorio
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-2.5 bg-[#10121a] rounded-xl border border-[#252838]">
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-indigo-300 font-semibold hover:underline truncate"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{project.repoUrl}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setIsEditingRepo(true)}
                          className="text-xs text-slate-400 hover:text-white underline shrink-0 px-1 py-0.5"
                        >
                          Editar URL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <FlaskConical className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">
                Guía en preparación
              </p>
              <p className="text-xs text-slate-400 mt-1">
                La guía técnica detallada para este hito estará disponible próximamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
