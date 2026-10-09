import React, { useState, useEffect } from 'react';
import {
  StudyRoadmap,
  ScheduledSession,
  StudyNotification,
  StudyModule,
  StudyPhase,
  ModuleStatus,
  ModuleVerification,
  PortfolioProject,
} from './types/study';
import { StorageService } from './services/storageService';
import { NotificationEngine } from './services/notificationEngine';
import { Navbar } from './components/layout/Navbar';
import { RoadmapViewer } from './components/roadmap/RoadmapViewer';
import { SmartPlanner } from './components/planner/SmartPlanner';
import { ProgressDashboard } from './components/progress/ProgressDashboard';
import { GeminiMentorChat } from './components/chat/GeminiMentorChat';
import { FocusPomodoroTimer } from './components/timer/FocusPomodoroTimer';
import { EvaluateMilestoneModal } from './components/modals/EvaluateMilestoneModal';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { CreateRoadmapModal } from './components/modals/CreateRoadmapModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'roadmap' | 'planner' | 'progress' | 'chat'>('roadmap');
  const [allRoadmaps, setAllRoadmaps] = useState<StudyRoadmap[]>(() => StorageService.getRoadmaps());
  const [activeRoadmap, setActiveRoadmap] = useState<StudyRoadmap>(() => StorageService.getActiveRoadmap());
  const [sessions, setSessions] = useState<ScheduledSession[]>(() => StorageService.getSessions());
  const [notifications, setNotifications] = useState<StudyNotification[]>(() => StorageService.getNotifications());

  // Modals state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerTarget, setTimerTarget] = useState<{ module: StudyModule | null; phase: StudyPhase | null }>({
    module: null,
    phase: null,
  });

  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [evaluateTarget, setEvaluateTarget] = useState<{ module: StudyModule | null; phase: StudyPhase | null }>({
    module: null,
    phase: null,
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Initial check on mount
  useEffect(() => {
    NotificationEngine.checkUpcomingSessions(sessions);
    setNotifications(StorageService.getNotifications());
  }, []);

  // Update active roadmap when selected
  const handleSelectRoadmap = (roadmapId: string) => {
    StorageService.setActiveRoadmapId(roadmapId);
    const updated = StorageService.getActiveRoadmap();
    setActiveRoadmap(updated);
  };

  // Module status update
  const handleUpdateModuleStatus = (moduleId: string, status: ModuleStatus) => {
    const updated = StorageService.updateModuleStatus(activeRoadmap.id, moduleId, status);
    setActiveRoadmap(updated);
    setAllRoadmaps(StorageService.getRoadmaps());

    if (status === 'completed') {
      NotificationEngine.triggerInAppOrSystem(
        '¡Hito de estudio dominado!',
        `Has marcado como completado un módulo de "${activeRoadmap.title}". ¡Continúa con el siguiente paso!`,
        'milestone'
      );
      setNotifications(StorageService.getNotifications());
    }
  };

  // Deliverable update
  const handleUpdateDeliverable = (moduleId: string, completed: boolean) => {
    const updated = StorageService.updateDeliverableStatus(activeRoadmap.id, moduleId, completed);
    setActiveRoadmap(updated);
    setAllRoadmaps(StorageService.getRoadmaps());

    if (completed) {
      NotificationEngine.triggerInAppOrSystem(
        'Entregable Práctico Registrado',
        'Has registrado la entrega práctica de tu módulo. Tu portafolio avanza con éxito.',
        'milestone'
      );
      setNotifications(StorageService.getNotifications());
    }
  };

  // Save verification from AI
  const handleVerificationSaved = (moduleId: string, verification: ModuleVerification) => {
    const status: ModuleStatus = verification.passed ? 'completed' : 'in_progress';
    const updated = StorageService.updateModuleStatus(activeRoadmap.id, moduleId, status, 30, verification);
    setActiveRoadmap(updated);
    setAllRoadmaps(StorageService.getRoadmaps());

    NotificationEngine.triggerInAppOrSystem(
      'Hito Validado por Inteligencia Artificial',
      `Gemini evaluó tu solución con calificación ${verification.score}/100.`,
      'milestone'
    );
    setNotifications(StorageService.getNotifications());
  };

  // Update weekly pace and budget
  const handleUpdatePaceAndBudget = (weeklyHours: number, preferredDays: string[]) => {
    const updated = StorageService.updateRoadmapSettings(activeRoadmap.id, {
      weeklyHoursBudget: weeklyHours,
      preferredDays,
    });
    setActiveRoadmap(updated);
    setAllRoadmaps(StorageService.getRoadmaps());

    NotificationEngine.triggerInAppOrSystem(
      'Planificador Recalculado',
      `Se ajustó la disponibilidad a ${weeklyHours}h/semana. Tu cronograma se adaptó a tu ritmo disponible.`,
      'reminder'
    );
    setNotifications(StorageService.getNotifications());
  };

  // Start Pomodoro Focus session from module
  const handleStartFocusSession = (module: StudyModule, phase: StudyPhase) => {
    setTimerTarget({ module, phase });
    setIsTimerOpen(true);
  };

  // Start Pomodoro from scheduled session
  const handleStartFocusFromScheduled = (session: ScheduledSession) => {
    // Find matching module
    let foundMod: StudyModule | null = null;
    let foundPhase: StudyPhase | null = null;
    for (const p of activeRoadmap.phases) {
      const m = p.modules.find((mod) => mod.id === session.moduleId);
      if (m) {
        foundMod = m;
        foundPhase = p;
        break;
      }
    }
    setTimerTarget({ module: foundMod, phase: foundPhase });
    setIsTimerOpen(true);
  };

  // Session completed in Pomodoro
  const handlePomodoroFinished = (moduleId: string, minutesSpent: number) => {
    const updated = StorageService.updateModuleStatus(
      activeRoadmap.id,
      moduleId,
      'in_progress',
      minutesSpent
    );
    setActiveRoadmap(updated);
    setAllRoadmaps(StorageService.getRoadmaps());
    setNotifications(StorageService.getNotifications());
  };

  // Open AI evaluation modal
  const handleOpenEvaluateModal = (phase: StudyPhase, module: StudyModule) => {
    setEvaluateTarget({ phase, module });
    setIsEvaluateOpen(true);
  };

  // Planner sessions
  const handleAddSession = (newSess: Omit<ScheduledSession, 'id'>) => {
    const sessionObj: ScheduledSession = {
      ...newSess,
      id: `sess-${Date.now()}`,
    };
    const updated = [...sessions, sessionObj];
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleToggleSessionComplete = (sessionId: string) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextState = !s.completed;
        if (nextState) {
          // Log time to module
          StorageService.updateModuleStatus(
            s.roadmapId,
            s.moduleId,
            'in_progress',
            s.durationMinutes
          );
        }
        return {
          ...s,
          completed: nextState,
          actualMinutesSpent: nextState ? s.durationMinutes : 0,
        };
      }
      return s;
    });

    setSessions(updated);
    StorageService.saveSessions(updated);
    setActiveRoadmap(StorageService.getActiveRoadmap());
    setAllRoadmaps(StorageService.getRoadmaps());
  };

  // Rebalance schedule with AI
  const handleRebalanceScheduleWithAI = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      // Generate intelligent sessions for the upcoming 7 days
      const pendingModules: { mod: StudyModule; phase: StudyPhase }[] = [];
      for (const p of activeRoadmap.phases) {
        for (const m of p.modules) {
          if (m.status !== 'completed') {
            pendingModules.push({ mod: m, phase: p });
          }
        }
      }

      const newSessions: ScheduledSession[] = [];
      const today = new Date();
      const preferredDays = activeRoadmap.preferredDays || ['Lunes', 'Miércoles', 'Viernes', 'Sábado'];
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      let modIndex = 0;
      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        const dayName = dayNames[d.getDay()];

        if (preferredDays.includes(dayName)) {
          const item = pendingModules[modIndex % pendingModules.length];
          if (item) {
            newSessions.push({
              id: `sess-ai-${Date.now()}-${dayOffset}`,
              roadmapId: activeRoadmap.id,
              moduleId: item.mod.id,
              moduleTitle: item.mod.title,
              phaseTitle: item.phase.title,
              date: d.toISOString().split('T')[0],
              dayOfWeek: dayName,
              durationMinutes: Math.round((activeRoadmap.weeklyHoursBudget * 60) / preferredDays.length),
              completed: false,
              actualMinutesSpent: 0,
              notes: `Asignado por IA: Enfocarse en ${item.mod.topics[0] || 'fundamentos'}`,
            });
            modIndex++;
          }
        }
      }

      setSessions(newSessions);
      StorageService.saveSessions(newSessions);
      setIsRebalancing(false);

      NotificationEngine.triggerInAppOrSystem(
        'Calendario Reorganizado por IA',
        `Se han distribuido ${newSessions.length} sesiones optimizadas según tu disponibilidad semanal (${activeRoadmap.weeklyHoursBudget}h).`,
        'reminder'
      );
      setNotifications(StorageService.getNotifications());
    }, 700);
  };

  // Update portfolio projects
  const handleUpdateProjectStatus = (
    projectId: string,
    status: PortfolioProject['status'],
    repoUrl?: string
  ) => {
    const updated = { ...activeRoadmap };
    const proj = updated.portfolioProjects?.find((p) => p.id === projectId);
    if (proj) {
      proj.status = status;
      if (repoUrl !== undefined) proj.repoUrl = repoUrl;
    }
    const all = StorageService.getRoadmaps().map((r) =>
      r.id === updated.id ? updated : r
    );
    StorageService.saveRoadmaps(all);
    setActiveRoadmap(updated);
    setAllRoadmaps(all);
  };

  // Handle new roadmap created
  const handleRoadmapCreated = (newRoadmap: StudyRoadmap) => {
    StorageService.addRoadmap(newRoadmap);
    setAllRoadmaps(StorageService.getRoadmaps());
    setActiveRoadmap(newRoadmap);
    setCurrentTab('roadmap');

    NotificationEngine.triggerInAppOrSystem(
      '¡Nueva Ruta de Estudio Activada!',
      `Has creado "${newRoadmap.title}". Tu planificador inteligente ya está preparado.`,
      'milestone'
    );
    setNotifications(StorageService.getNotifications());
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenNewRoadmapModal={() => setIsCreateRoadmapOpen(true)}
        onOpenTimerModal={() => {
          setTimerTarget({
            module: activeRoadmap.phases[0]?.modules[0] || null,
            phase: activeRoadmap.phases[0] || null,
          });
          setIsTimerOpen(true);
        }}
        activeRoadmapTitle={activeRoadmap.title}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'roadmap' && (
          <RoadmapViewer
            roadmap={activeRoadmap}
            allRoadmaps={allRoadmaps}
            onSelectRoadmap={handleSelectRoadmap}
            onUpdateModuleStatus={handleUpdateModuleStatus}
            onUpdateDeliverable={handleUpdateDeliverable}
            onOpenEvaluateModal={handleOpenEvaluateModal}
            onStartFocusSession={handleStartFocusSession}
            onUpdatePaceAndBudget={handleUpdatePaceAndBudget}
          />
        )}

        {currentTab === 'planner' && (
          <SmartPlanner
            roadmap={activeRoadmap}
            sessions={sessions}
            onAddSession={handleAddSession}
            onToggleSessionComplete={handleToggleSessionComplete}
            onStartFocusSessionForScheduled={handleStartFocusFromScheduled}
            onRebalanceScheduleWithAI={handleRebalanceScheduleWithAI}
            isRebalancing={isRebalancing}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressDashboard
            roadmap={activeRoadmap}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onDataImported={() => {
              setActiveRoadmap(StorageService.getActiveRoadmap());
              setAllRoadmaps(StorageService.getRoadmaps());
              setSessions(StorageService.getSessions());
              setNotifications(StorageService.getNotifications());
            }}
          />
        )}

        {currentTab === 'chat' && (
          <GeminiMentorChat roadmap={activeRoadmap} />
        )}
      </main>

      {/* Modals & Drawers */}
      <FocusPomodoroTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialModule={timerTarget.module}
        initialPhase={timerTarget.phase}
        roadmap={activeRoadmap}
        onSessionFinished={handlePomodoroFinished}
      />

      <EvaluateMilestoneModal
        isOpen={isEvaluateOpen}
        onClose={() => setIsEvaluateOpen(false)}
        module={evaluateTarget.module}
        phase={evaluateTarget.phase}
        onVerificationSaved={handleVerificationSaved}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onNotificationsUpdated={() => {
          setNotifications(StorageService.getNotifications());
        }}
      />

      <CreateRoadmapModal
        isOpen={isCreateRoadmapOpen}
        onClose={() => setIsCreateRoadmapOpen(false)}
        onRoadmapCreated={handleRoadmapCreated}
      />
    </div>
  );
}
