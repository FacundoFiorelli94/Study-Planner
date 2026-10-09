import React, { useState, useEffect, useRef } from 'react';
import { StudyModule, StudyPhase, StudyRoadmap } from '../../types/study';
import { StorageService } from '../../services/storageService';
import { NotificationEngine } from '../../services/notificationEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  X,
  Volume2,
  Coffee,
  Sparkles,
} from 'lucide-react';

interface FocusPomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule?: StudyModule | null;
  initialPhase?: StudyPhase | null;
  roadmap: StudyRoadmap;
  onSessionFinished: (moduleId: string, minutesSpent: number) => void;
}

export const FocusPomodoroTimer: React.FC<FocusPomodoroTimerProps> = ({
  isOpen,
  onClose,
  initialModule,
  initialPhase,
  roadmap,
  onSessionFinished,
}) => {
  const allModules = roadmap.phases.flatMap((p) =>
    p.modules.map((m) => ({ ...m, phaseTitle: p.title }))
  );

  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    initialModule?.id || allModules[0]?.id || ''
  );

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialModule) {
      setSelectedModuleId(initialModule.id);
    }
  }, [initialModule]);

  // Adjust timeLeft when mode or minutes change while paused
  useEffect(() => {
    if (!isRunning) {
      setTimeLeftSeconds(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [mode, workMinutes, breakMinutes]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, selectedModuleId]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // AudioContext may be blocked before interaction
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playChime();

    if (mode === 'work') {
      const targetMod = allModules.find((m) => m.id === selectedModuleId);
      const modTitle = targetMod?.title || 'tu sesión de estudio';
      NotificationEngine.triggerInAppOrSystem(
        '¡Bloque de Enfoque Completado!',
        `Completaste ${workMinutes} minutos de estudio productivo en "${modTitle}". Tómate un respiro merecido.`,
        'streak'
      );

      onSessionFinished(selectedModuleId, workMinutes);
      setMode('break');
      setTimeLeftSeconds(breakMinutes * 60);
    } else {
      NotificationEngine.triggerInAppOrSystem(
        '¡Pausa terminada!',
        'Tu descanso ha finalizado. ¿Listo para retomar el siguiente bloque?',
        'reminder'
      );
      setMode('work');
      setTimeLeftSeconds(workMinutes * 60);
    }
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const currentModule = allModules.find((m) => m.id === selectedModuleId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            <Timer className="w-3.5 h-3.5" />
            <span>Temporizador de Estudio Pomodoro</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'work' ? 'Bloque de Enfoque Profundo' : 'Pausa de Descanso'}
          </h2>
          <p className="text-xs text-slate-500">
            El tiempo invertido se registrará automáticamente en tu progreso.
          </p>
        </div>

        {/* Module Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Objetivo / Módulo Activo:
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={isRunning}
            className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {allModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selection (only when stopped) */}
        {!isRunning && (
          <div className="flex items-center justify-center gap-2">
            {[25, 45, 60].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => {
                  setWorkMinutes(dur);
                  setTimeLeftSeconds(dur * 60);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  workMinutes === dur && mode === 'work'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dur} min
              </button>
            ))}
          </div>
        )}

        {/* Clock Big Display */}
        <div className="py-4 text-center">
          <div className="text-6xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-xs font-medium text-slate-500 mt-2 block">
            {mode === 'work' ? '⚡ Concentración al 100%' : '☕ Relájate unos minutos'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={resetTimer}
            title="Reiniciar temporizador"
            className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Enfoque</span>
              </>
            )}
          </button>
        </div>

        {/* Logged Minutes info */}
        {currentModule && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between text-slate-600">
            <span>Tiempo acumulado en este módulo:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {Math.round((currentModule.loggedMinutes || 0) / 60)}h ({currentModule.loggedMinutes || 0} min)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
