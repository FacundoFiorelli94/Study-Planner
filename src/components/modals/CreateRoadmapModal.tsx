import React, { useState } from 'react';
import { StudyRoadmap } from '../../types/study';
import { ApiService } from '../../services/apiService';
import {
  Sparkles,
  X,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapCreated: (roadmap: StudyRoadmap) => void;
}

export const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({
  isOpen,
  onClose,
  onRoadmapCreated,
}) => {
  const [topic, setTopic] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [targetWeeks, setTargetWeeks] = useState(12);
  const [currentLevel, setCurrentLevel] = useState('Intermedio');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Lunes',
    'Miércoles',
    'Viernes',
    'Sábado',
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const generated = await ApiService.generateSmartRoadmap({
        topic,
        weeklyHours,
        preferredDays: selectedDays,
        currentLevel,
        targetWeeks,
        notes,
      });

      // Construct StudyRoadmap object from generated JSON
      const newRoadmap: StudyRoadmap = {
        id: `roadmap-${Date.now()}`,
        title: generated.title || topic,
        description: generated.description || `Ruta de estudio enfocada en ${topic}`,
        category: topic,
        totalWeeks: generated.totalWeeks || targetWeeks,
        weeklyHoursBudget: weeklyHours,
        targetPace: (generated.targetPace as any) || 'Balanceado',
        preferredDays: selectedDays,
        startDate: new Date().toISOString().split('T')[0],
        phases: (generated.phases || []).map((p: any, pIdx: number) => ({
          id: `phase-${Date.now()}-${pIdx}`,
          phaseNumber: p.phaseNumber ?? pIdx,
          title: p.title || `Fase ${pIdx + 1}`,
          description: p.description || '',
          weeksRange: p.weeksRange || `Semanas ${pIdx * 2 + 1} - ${pIdx * 2 + 2}`,
          estimatedHours: p.estimatedHours || 20,
          modules: (p.modules || []).map((m: any, mIdx: number) => ({
            id: `mod-${Date.now()}-${pIdx}-${mIdx}`,
            title: m.title || `Módulo ${mIdx + 1}`,
            description: m.description || '',
            topics: m.topics || [],
            status: 'not_started' as const,
            estimatedHours: m.estimatedHours || 10,
            loggedMinutes: 0,
            deliverable: {
              title: m.deliverable || `Entregable del módulo ${mIdx + 1}`,
              description: 'Implementación práctica verificable.',
              completed: false,
            },
            resources: (m.resources || []).map((r: any) => ({
              name: r.name || 'Recurso Oficial',
              type: 'Doc' as const,
              url: r.url || 'https://google.com',
            })),
          })),
        })),
        portfolioProjects: [
          {
            id: `proj-${Date.now()}-1`,
            phaseNumber: 1,
            requiredWeek: Math.round(targetWeeks / 2),
            title: `Proyecto Integrador 1: ${topic}`,
            description: `Desarrollo práctico aplicado a mitad del curso.`,
            status: 'pending',
          },
          {
            id: `proj-${Date.now()}-2`,
            phaseNumber: (generated.phases?.length || 2) - 1,
            requiredWeek: targetWeeks,
            title: `Proyecto de Portafolio Final: ${topic}`,
            description: `Entregable de grado de producción completo.`,
            status: 'pending',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onRoadmapCreated(newRoadmap);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error generando la ruta con IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181a22] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-[#2b303e] space-y-5 max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-start justify-between border-b border-[#262a36] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planificador Inteligente con Gemini</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              Crear Nueva Ruta de Estudio Personalizada
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Define tu objetivo y disponibilidad semanal; la IA estructurará las fases, módulos y entregables.
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

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              ¿Qué habilidad o tecnología deseas dominar?
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. LangGraph y Agentes Autónomos, Cloud Native DevOps, Rust Backend..."
              className="w-full text-xs font-medium p-3 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Horas disponibles por semana: <span className="text-indigo-400 font-bold">{weeklyHours}h</span>
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-[#252834] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>3h</span>
                <span>15h</span>
                <span>30h</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Duración meta (semanas):
              </label>
              <select
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(Number(e.target.value))}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={4} className="bg-[#181a22]">4 semanas (Sprint de 1 mes)</option>
                <option value={8} className="bg-[#181a22]">8 semanas (2 meses)</option>
                <option value={12} className="bg-[#181a22]">12 semanas (Trimestre recomendado)</option>
                <option value={20} className="bg-[#181a22]">20 semanas (5 meses)</option>
                <option value={30} className="bg-[#181a22]">30 semanas (Carrera Completa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Días en los que podrás estudiar:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    selectedDays.includes(d)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#15171f] text-slate-400 hover:text-white border border-[#282d3b]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nivel de partida:
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Principiante" className="bg-[#181a22]">Principiante (Desde cero)</option>
                <option value="Intermedio" className="bg-[#181a22]">Intermedio (Tengo bases previas)</option>
                <option value="Avanzado" className="bg-[#181a22]">Avanzado (Especialización profunda)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Notas técnicas (opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Preferencia por Docker, FastAPI o LangGraph"
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#2b303e] bg-[#15171f] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 text-rose-300 text-xs rounded-xl border border-rose-500/30">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262a36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Generando Ruta con Gemini...' : 'Generar Ruta Inteligente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
