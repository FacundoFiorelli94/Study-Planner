import React, { useState } from 'react';
import { StudyPhase } from '../../types/study';
import {
  Layers,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface PhaseHoverSidebarProps {
  phases: StudyPhase[];
  onSelectPhase: (phaseId: string) => void;
  onOpenMaterialsModal: () => void;
  onScrollToLabs: () => void;
}

export const PhaseHoverSidebar: React.FC<PhaseHoverSidebarProps> = ({
  phases,
  onSelectPhase,
  onOpenMaterialsModal,
  onScrollToLabs,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const completedPhasesCount = phases.filter((p) =>
    p.modules.every((m) => m.status === 'completed')
  ).length;

  return (
    <aside
      aria-label="Navegación de Fases"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-[72px] z-40 transition-all duration-300 ease-out select-none hidden md:block ${
        isHovered
          ? 'w-72 shadow-2xl'
          : 'w-12 shadow-md'
      }`}
    >
      <div className="bg-[#161822] border-y border-r border-[#262a36] rounded-r-2xl overflow-hidden backdrop-blur-md max-h-[calc(100vh-5.5rem)] flex flex-col">
        {/* Collapsed State Icon Bar */}
        {!isHovered ? (
          <div className="py-3 flex flex-col items-center justify-between min-h-[300px] gap-2.5">
            <div className="flex flex-col items-center gap-1.5">
              <div
                title="Fases de la Carrera (Pasa el mouse para desplegar)"
                className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
              </div>

              <span className="text-[9px] font-bold text-slate-400 rotate-90 my-4 tracking-wider uppercase">
                Fases
              </span>
            </div>

            {/* Quick mini indicators for Phase 0 to 5 */}
            <div className="flex flex-col items-center gap-1.5 my-auto">
              {phases.map((p) => {
                const isAllDone = p.modules.every((m) => m.status === 'completed');
                const hasInProgress = p.modules.some((m) => m.status === 'in_progress');

                return (
                  <div
                    key={p.id}
                    title={`Fase ${p.phaseNumber}: ${p.title}`}
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-colors ${
                      isAllDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : hasInProgress
                        ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                        : 'bg-[#1f222d] text-slate-400 border border-[#2b3040]'
                    }`}
                  >
                    {p.phaseNumber}
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-semibold tabular-nums">
              {completedPhasesCount}/{phases.length}
            </div>
          </div>
        ) : (
          /* Expanded Full Menu (On Mouse Hover) */
          <div className="p-3 space-y-2.5 animate-in fade-in duration-200 flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-[#262a36] pb-2 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  <Layers className="w-3 h-3" />
                  <span>Carrera de IA</span>
                </div>
                <h3 className="text-xs font-bold text-slate-100">
                  Navegación por Fases (0 a 5)
                </h3>
              </div>

              <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                {completedPhasesCount}/{phases.length}
              </span>
            </div>

            {/* Phase List */}
            <div className="space-y-1 max-h-[38vh] sm:max-h-[42vh] overflow-y-auto pr-1 flex-1">
              {phases.map((phase) => {
                const total = phase.modules.length;
                const done = phase.modules.filter((m) => m.status === 'completed').length;
                const isAllDone = total > 0 && done === total;

                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => onSelectPhase(phase.id)}
                    className="w-full text-left p-2 rounded-xl bg-[#1b1e27] hover:bg-[#222634] border border-[#272b38] hover:border-indigo-500/40 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          F{phase.phaseNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {phase.weeksRange}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate">
                        {phase.title.replace(/^Fase \d+:\s*/, '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAllDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {done}/{total}
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="border-t border-[#262a36] pt-2 space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={onScrollToLabs}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#1f222c] hover:bg-[#262b37] border border-[#2c3140] rounded-xl transition-colors shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-amber-300">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Laboratorios</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenMaterialsModal}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#1f222c] hover:bg-[#262b37] border border-[#2c3140] rounded-xl transition-colors shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Materiales de Estudio</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
