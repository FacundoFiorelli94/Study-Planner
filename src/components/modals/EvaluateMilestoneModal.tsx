import React, { useState } from 'react';
import { StudyModule, StudyPhase, ModuleVerification } from '../../types/study';
import { ApiService, EvaluateResponse } from '../../services/apiService';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Send,
  Award,
} from 'lucide-react';

interface EvaluateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: StudyModule | null;
  phase: StudyPhase | null;
  onVerificationSaved: (moduleId: string, verification: ModuleVerification) => void;
}

export const EvaluateMilestoneModal: React.FC<EvaluateMilestoneModalProps> = ({
  isOpen,
  onClose,
  module,
  phase,
  onVerificationSaved,
}) => {
  const [userSubmission, setUserSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !module || !phase) return null;

  const handleEvaluate = async (requestChallengeOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.evaluateMilestone({
        moduleTitle: module.title,
        phaseTitle: phase.title,
        topics: module.topics,
        userCodeOrAnswer: requestChallengeOnly
          ? 'El estudiante solicita un desafío técnico interactivo para poner a prueba su comprensión.'
          : userSubmission,
      });
      setEvaluation(res);
    } catch (err: any) {
      setError(err.message || 'Error evaluando el hito.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndApprove = () => {
    if (!evaluation) return;
    onVerificationSaved(module.id, {
      passed: evaluation.passed,
      score: evaluation.score,
      feedback: evaluation.summaryFeedback,
      verifiedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181a22] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-[#2b303e] space-y-5 max-h-[90vh] overflow-y-auto text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#262a36] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluación Técnica con IA</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{phase.weeksRange}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              Validar: {module.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fase: {phase.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable & Topics Context */}
        <div className="p-3.5 bg-[#15171f] rounded-xl border border-[#262a36] space-y-2 text-xs text-slate-300">
          <div className="font-semibold text-slate-200">Temas evaluados:</div>
          <div className="flex flex-wrap gap-1.5 text-slate-300">
            {module.topics.map((t, i) => (
              <span key={i} className="bg-[#202431] px-2 py-0.5 rounded-md border border-[#2d3242] text-[11px] font-medium text-slate-300">
                {t}
              </span>
            ))}
          </div>

          {module.deliverable && (
            <div className="pt-1 text-slate-300">
              <strong className="text-amber-400 font-semibold">Entregable esperado:</strong> {module.deliverable.title}
            </div>
          )}
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Pega tu solución, código, esquema JSON o resumen técnico:
          </label>
          <textarea
            rows={5}
            value={userSubmission}
            onChange={(e) => setUserSubmission(e.target.value)}
            placeholder="Pega aquí el extracto de código de tu endpoint FastAPI, tu esquema JSON Schema, tus prompts CoT o una explicación de tu arquitectura..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-[#2b303e] focus:outline-none focus:border-indigo-500 bg-[#15171f] text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleEvaluate(true)}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
          >
            ¿No tienes código? Solicitar desafío interactivo
          </button>

          <button
            type="button"
            onClick={() => handleEvaluate(false)}
            disabled={loading || !userSubmission.trim()}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{loading ? 'Evaluando con Gemini...' : 'Evaluar Solución'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 text-rose-300 text-xs rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        {/* Evaluation Output */}
        {evaluation && (
          <div className="mt-4 pt-4 border-t border-[#262a36] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Resultado de la Evaluación:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                    evaluation.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  Puntuación: {evaluation.score}/100 ({evaluation.passed ? 'APROBADO' : 'REQUIERE AJUSTES'})
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#15171f] rounded-xl border border-[#262a36] text-xs space-y-2 text-slate-300">
              <p className="font-bold text-slate-100 text-sm">{evaluation.summaryFeedback}</p>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{evaluation.detailedCritique}</p>
              <div className="pt-1 text-slate-200">
                <strong className="text-indigo-400 font-semibold">Acción recomendada:</strong> {evaluation.recommendedAction}
              </div>
            </div>

            {evaluation.passed && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAndApprove}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Marcar Hito como Dominado</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
