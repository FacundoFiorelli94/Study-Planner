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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluación Técnica con IA</span>
              <span aria-hidden="true">·</span>
              <span>{phase.weeksRange}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Validar: {module.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fase: {phase.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable & Topics Context */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
          <div className="font-semibold text-slate-800">Temas evaluados:</div>
          <div className="flex flex-wrap gap-1 text-slate-600">
            {module.topics.map((t, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                {t}
              </span>
            ))}
          </div>

          {module.deliverable && (
            <div className="pt-1 text-slate-700">
              <strong>Entregable esperado:</strong> {module.deliverable.title}
            </div>
          )}
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Pega tu solución, código, esquema JSON o resumen técnico:
          </label>
          <textarea
            rows={5}
            value={userSubmission}
            onChange={(e) => setUserSubmission(e.target.value)}
            placeholder="Pega aquí el extracto de código de tu endpoint FastAPI, tu esquema JSON Schema, tus prompts CoT o una explicación de tu arquitectura..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleEvaluate(true)}
            disabled={loading}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
          >
            ¿No tienes código? Solicitar desafío técnico interactivo
          </button>

          <button
            type="button"
            onClick={() => handleEvaluate(false)}
            disabled={loading || !userSubmission.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{loading ? 'Evaluando con Gemini...' : 'Evaluar Solución'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {/* Evaluation Output */}
        {evaluation && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Resultado de la Evaluación:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    evaluation.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Puntuación: {evaluation.score}/100 ({evaluation.passed ? 'APROBADO' : 'REQUIERE AJUSTES'})
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <p className="font-semibold text-slate-900">{evaluation.summaryFeedback}</p>
              <p className="text-slate-600 whitespace-pre-wrap">{evaluation.detailedCritique}</p>
              <div className="pt-1 text-slate-700">
                <strong>Acción recomendada:</strong> {evaluation.recommendedAction}
              </div>
            </div>

            {evaluation.passed && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAndApprove}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2"
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
