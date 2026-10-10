import { Injectable, signal, computed } from '@angular/core';
import {
  StudyRoadmap,
  ScheduledSession,
  StudyNotification,
  UserSettings,
  ChatMessage,
  ModuleStatus,
  ModuleVerification,
  ThemePalette,
  StudyStreak,
  StudyMaterial,
} from '../models/study.models';
import { FLAGSHIP_AI_AUTOMATION_ROADMAP, MULTI_AGENT_AI_ROADMAP } from '../data/default-roadmaps';

const STORAGE_KEYS = {
  ROADMAPS: 'kamino_study_roadmaps_v1',
  ACTIVE_ROADMAP_ID: 'kamino_active_roadmap_id_v1',
  SESSIONS: 'kamino_study_sessions_v1',
  NOTIFICATIONS: 'kamino_notifications_v1',
  SETTINGS: 'kamino_user_settings_v1',
  CHAT_MESSAGES: 'kamino_chat_messages_v1',
  STUDY_STREAK: 'kamino_study_streak_v1',
  THEME_PALETTE: 'kamino_theme_palette_v1',
  STUDY_MATERIALS: 'kamino_study_materials_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: true,
  browserNotifications: false,
  studyReminderTime: '19:00',
  reminderDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
  pomodoroWorkMinutes: 45,
  pomodoroBreakMinutes: 10,
  dailyGoalMinutes: 90,
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Reactive Signals
  readonly roadmaps = signal<StudyRoadmap[]>(this.loadRoadmaps());
  readonly activeRoadmapId = signal<string>(this.loadActiveRoadmapId());
  readonly sessions = signal<ScheduledSession[]>(this.loadSessions());
  readonly notifications = signal<StudyNotification[]>(this.loadNotifications());
  readonly currentTheme = signal<ThemePalette>(this.loadThemePalette());
  readonly streak = signal<StudyStreak>(this.loadStreakData());
  readonly chatMessages = signal<ChatMessage[]>(this.loadChatMessages());

  // Computed Signals
  readonly activeRoadmap = computed<StudyRoadmap>(() => {
    const list = this.roadmaps();
    const id = this.activeRoadmapId();
    return list.find((r) => r.id === id) || list[0] || FLAGSHIP_AI_AUTOMATION_ROADMAP;
  });

  readonly unreadNotificationsCount = computed<number>(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  readonly roadmapProgress = computed(() => {
    const active = this.activeRoadmap();
    if (!active || !active.phases) return { completed: 0, total: 0, percent: 0, loggedHours: 0, estimatedHours: 0 };
    const allModules = active.phases.flatMap((p) => p.modules);
    const completed = allModules.filter((m) => m.status === 'completed').length;
    const total = allModules.length;
    const totalMinutes = allModules.reduce((acc, m) => acc + (m.loggedMinutes || 0), 0);
    const estimatedHours = active.phases.reduce((acc, p) => acc + (p.estimatedHours || 0), 0);
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      loggedHours: +(totalMinutes / 60).toFixed(1),
      estimatedHours,
    };
  });

  // Roadmaps Management
  private loadRoadmaps(): StudyRoadmap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
      if (stored) {
        let parsed: StudyRoadmap[] = JSON.parse(stored);
        let changed = false;

        // Cleanup deprecated roadmaps
        const filtered = parsed.filter(
          (r) =>
            r.id !== 'roadmap-clean-arch-fastapi-12w' &&
            !r.title.toLowerCase().includes('clean architecture') &&
            !r.title.toLowerCase().includes('solid')
        );
        if (filtered.length !== parsed.length) {
          parsed = filtered;
          changed = true;
        }

        if (!parsed.some((r) => r.id === MULTI_AGENT_AI_ROADMAP.id)) {
          parsed.push(MULTI_AGENT_AI_ROADMAP);
          changed = true;
        }

        parsed.forEach((r) => {
          if (r.id === 'roadmap-ai-automation-30w') {
            if (r.title !== 'Carrera de IA y Automatización') {
              r.title = 'Carrera de IA y Automatización';
              changed = true;
            }
            if (FLAGSHIP_AI_AUTOMATION_ROADMAP.portfolioProjects) {
              r.portfolioProjects = r.portfolioProjects?.map((p, idx) => {
                const flagshipP = FLAGSHIP_AI_AUTOMATION_ROADMAP.portfolioProjects?.[idx];
                if (flagshipP?.labGuide && !p.labGuide) {
                  changed = true;
                  return { ...p, title: flagshipP.title, labGuide: flagshipP.labGuide };
                }
                return p;
              }) || FLAGSHIP_AI_AUTOMATION_ROADMAP.portfolioProjects;
            }
          }
        });

        if (changed) {
          this.persistRoadmaps(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error cargando roadmaps:', e);
    }
    const defaults = [FLAGSHIP_AI_AUTOMATION_ROADMAP, MULTI_AGENT_AI_ROADMAP];
    this.persistRoadmaps(defaults);
    return defaults;
  }

  private persistRoadmaps(list: StudyRoadmap[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando roadmaps:', e);
    }
  }

  private loadActiveRoadmapId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROADMAP_ID);
    if (stored) return stored;
    return FLAGSHIP_AI_AUTOMATION_ROADMAP.id;
  }

  setActiveRoadmapId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROADMAP_ID, id);
    this.activeRoadmapId.set(id);
  }

  updateModuleStatus(
    roadmapId: string,
    moduleId: string,
    status: ModuleStatus,
    additionalMinutes = 0,
    verification?: ModuleVerification
  ): void {
    const currentList = this.roadmaps();
    const updated = currentList.map((roadmap) => {
      if (roadmap.id !== roadmapId) return roadmap;

      const phases = roadmap.phases.map((phase) => {
        const modules = phase.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            status,
            loggedMinutes: (mod.loggedMinutes || 0) + (additionalMinutes > 0 ? additionalMinutes : 0),
            completedDate: status === 'completed' ? mod.completedDate || new Date().toISOString() : mod.completedDate,
            verification: verification || mod.verification,
          };
        });
        return { ...phase, modules };
      });

      return { ...roadmap, phases, updatedAt: new Date().toISOString() };
    });

    this.roadmaps.set(updated);
    this.persistRoadmaps(updated);
    this.recordStudyActivity(additionalMinutes > 0 ? additionalMinutes : 15);
  }

  updateDeliverableStatus(
    roadmapId: string,
    moduleId: string,
    completed: boolean,
    url?: string,
    notes?: string
  ): void {
    const currentList = this.roadmaps();
    const updated = currentList.map((roadmap) => {
      if (roadmap.id !== roadmapId) return roadmap;

      const phases = roadmap.phases.map((phase) => {
        const modules = phase.modules.map((mod) => {
          if (mod.id !== moduleId || !mod.deliverable) return mod;
          return {
            ...mod,
            deliverable: {
              ...mod.deliverable,
              completed,
              url: url !== undefined ? url : mod.deliverable.url,
              notes: notes !== undefined ? notes : mod.deliverable.notes,
            },
          };
        });
        return { ...phase, modules };
      });

      return { ...roadmap, phases, updatedAt: new Date().toISOString() };
    });

    this.roadmaps.set(updated);
    this.persistRoadmaps(updated);
  }

  updateRoadmapSettings(
    roadmapId: string,
    updates: { weeklyHoursBudget?: number; targetPace?: 'Intensivo' | 'Balanceado' | 'Sostenible' | 'Relajado'; preferredDays?: string[] }
  ): void {
    const currentList = this.roadmaps();
    const updated = currentList.map((roadmap) => {
      if (roadmap.id !== roadmapId) return roadmap;
      const totalHours = roadmap.phases.reduce((acc, p) => acc + p.estimatedHours, 0);
      const weeklyHours = updates.weeklyHoursBudget ?? roadmap.weeklyHoursBudget;
      const totalWeeks = Math.max(1, Math.ceil(totalHours / weeklyHours));

      return {
        ...roadmap,
        weeklyHoursBudget: weeklyHours,
        totalWeeks,
        targetPace: updates.targetPace ?? roadmap.targetPace,
        preferredDays: updates.preferredDays ?? roadmap.preferredDays,
        updatedAt: new Date().toISOString(),
      };
    });

    this.roadmaps.set(updated);
    this.persistRoadmaps(updated);
  }

  addRoadmap(newRoadmap: StudyRoadmap): void {
    const currentList = [newRoadmap, ...this.roadmaps()];
    this.roadmaps.set(currentList);
    this.persistRoadmaps(currentList);
    this.setActiveRoadmapId(newRoadmap.id);
  }

  deleteRoadmap(id: string): void {
    let currentList = this.roadmaps().filter((r) => r.id !== id);
    if (currentList.length === 0) {
      currentList = [FLAGSHIP_AI_AUTOMATION_ROADMAP];
    }
    this.roadmaps.set(currentList);
    this.persistRoadmaps(currentList);
    this.setActiveRoadmapId(currentList[0].id);
  }

  // Sessions Management
  private loadSessions(): ScheduledSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const initial = this.generateInitialSessions();
    this.persistSessions(initial);
    return initial;
  }

  private persistSessions(sessions: ScheduledSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }

  private generateInitialSessions(): ScheduledSession[] {
    const roadmap = FLAGSHIP_AI_AUTOMATION_ROADMAP;
    const sessions: ScheduledSession[] = [];
    const today = new Date();
    const daysOffset = [0, 2, 4, 6];
    const modulesToSchedule = [
      roadmap.phases[0].modules[1],
      roadmap.phases[0].modules[2],
      roadmap.phases[1].modules[0],
      roadmap.phases[1].modules[1],
    ];

    daysOffset.forEach((offset, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      const mod = modulesToSchedule[idx] || modulesToSchedule[0];
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      sessions.push({
        id: `sess-${Date.now()}-${idx}`,
        roadmapId: roadmap.id,
        moduleId: mod.id,
        moduleTitle: mod.title,
        phaseTitle: roadmap.phases[idx < 2 ? 0 : 1].title,
        date: d.toISOString().split('T')[0],
        dayOfWeek: dayNames[d.getDay()],
        durationMinutes: 90,
        completed: idx === 0,
        actualMinutesSpent: idx === 0 ? 90 : 0,
        notes: `Enfoque: ${mod.topics.slice(0, 2).join(', ')}`,
      });
    });

    return sessions;
  }

  addSession(session: Omit<ScheduledSession, 'id'>): void {
    const newSession: ScheduledSession = {
      ...session,
      id: `sess-${Date.now()}`,
    };
    const updated = [...this.sessions(), newSession];
    this.sessions.set(updated);
    this.persistSessions(updated);
  }

  toggleSessionComplete(sessionId: string): void {
    const updated = this.sessions().map((s) => {
      if (s.id !== sessionId) return s;
      const nextCompleted = !s.completed;
      if (nextCompleted) {
        this.updateModuleStatus(s.roadmapId, s.moduleId, 'in_progress', s.durationMinutes);
      }
      return {
        ...s,
        completed: nextCompleted,
        actualMinutesSpent: nextCompleted ? s.durationMinutes : 0,
      };
    });
    this.sessions.set(updated);
    this.persistSessions(updated);
  }

  replaceSessions(sessions: ScheduledSession[]): void {
    this.sessions.set(sessions);
    this.persistSessions(sessions);
  }

  // Notifications Management
  private loadNotifications(): StudyNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const initial: StudyNotification[] = [
      {
        id: 'notif-1',
        type: 'reminder',
        title: 'Sesión de hoy programada',
        message: 'Tienes programado estudiar "JSON Schema y Validación de Contratos" a las 19:00 (90 min).',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        type: 'streak',
        title: '¡Racha de 3 días consecutivos!',
        message: 'Excelente consistencia académica. Mantén el ritmo para desbloquear la Fase 1.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        read: false,
      },
      {
        id: 'notif-3',
        type: 'milestone',
        title: 'Hito completado',
        message: 'Completaste con éxito "Lógica Estructural y Algoritmos de Flujo". Tu entregable está verificado.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ];
    this.persistNotifications(initial);
    return initial;
  }

  private persistNotifications(list: StudyNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  addNotification(item: Omit<StudyNotification, 'id' | 'timestamp' | 'read'>): StudyNotification {
    const newNotif: StudyNotification = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...this.notifications()];
    this.notifications.set(updated);
    this.persistNotifications(updated);
    return newNotif;
  }

  markAllNotificationsRead(): void {
    const updated = this.notifications().map((n) => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.persistNotifications(updated);
  }

  clearNotifications(): void {
    this.notifications.set([]);
    this.persistNotifications([]);
  }

  // Theme Management
  private loadThemePalette(): ThemePalette {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME_PALETTE);
      if (stored && ['slate-calm', 'nord-dark', 'warm-charcoal', 'forest-night'].includes(stored)) {
        return stored as ThemePalette;
      }
    } catch (e) {
      console.error(e);
    }
    return 'slate-calm';
  }

  setThemePalette(theme: ThemePalette): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_PALETTE, theme);
    } catch (e) {
      console.error(e);
    }
    this.currentTheme.set(theme);
    document.body.setAttribute('data-theme', theme);
  }

  // Streak & Activity
  private loadStreakData(): StudyStreak {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      currentStreakDays: 3,
      longestStreakDays: 5,
      lastStudyDate: new Date().toISOString().split('T')[0],
      totalStudyDays: 12,
    };
  }

  recordStudyActivity(minutes: number): void {
    const data = this.streak();
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = data.lastStudyDate !== today;
    const updatedStreak: StudyStreak = {
      currentStreakDays: isNewDay ? data.currentStreakDays + 1 : data.currentStreakDays,
      longestStreakDays: Math.max(data.longestStreakDays, isNewDay ? data.currentStreakDays + 1 : data.currentStreakDays),
      lastStudyDate: today,
      totalStudyDays: isNewDay ? data.totalStudyDays + 1 : data.totalStudyDays,
    };
    this.streak.set(updatedStreak);
    localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, JSON.stringify(updatedStreak));
  }

  // Chat Messages
  private loadChatMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content:
          '¡Hola! Soy tu Mentor Técnico en Inteligencia Artificial y Automatización. Estoy aquí para acompañarte paso a paso en tu ruta de estudio, resolver dudas de flujos en n8n, agentes con LangGraph, RAG, Python y FastAPI, validar tus entregables y adaptar tu planificación a tu tiempo real disponible. ¿En qué módulo nos enfocaremos hoy?',
        timestamp: new Date().toISOString(),
        personaUsed: 'roadmap_master',
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  }

  addChatMessage(msg: ChatMessage): void {
    const updated = [...this.chatMessages(), msg];
    this.chatMessages.set(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  clearChatMessages(): void {
    const welcome = this.loadChatMessages().slice(0, 1);
    this.chatMessages.set(welcome);
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(welcome));
    } catch (e) {
      console.error(e);
    }
  }

  // Lab Steps
  toggleProjectLabStep(roadmapId: string, projectId: string, stepIndex: number): void {
    const currentList = this.roadmaps();
    const updated = currentList.map((roadmap) => {
      if (roadmap.id !== roadmapId) return roadmap;
      const portfolioProjects = roadmap.portfolioProjects?.map((proj) => {
        if (proj.id !== projectId || !proj.labGuide) return proj;
        const steps = proj.labGuide.steps.map((st, idx) => {
          if (idx !== stepIndex) return st;
          return { ...st, completed: !st.completed };
        });
        const allCompleted = steps.every((s) => s.completed);
        const hasSome = steps.some((s) => s.completed);
        const status = allCompleted ? ('completed' as const) : hasSome ? ('in_progress' as const) : ('pending' as const);
        return {
          ...proj,
          status,
          labGuide: { ...proj.labGuide, steps },
        };
      });
      return { ...roadmap, portfolioProjects, updatedAt: new Date().toISOString() };
    });

    this.roadmaps.set(updated);
    this.persistRoadmaps(updated);
  }

  updateProjectStatus(projectId: string, status: 'pending' | 'in_progress' | 'completed', repoUrl?: string): void {
    const active = this.activeRoadmap();
    const currentList = this.roadmaps();
    const updated = currentList.map((r) => {
      if (r.id !== active.id) return r;
      const portfolioProjects = r.portfolioProjects?.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          status,
          repoUrl: repoUrl !== undefined ? repoUrl : p.repoUrl,
        };
      });
      return { ...r, portfolioProjects, updatedAt: new Date().toISOString() };
    });

    this.roadmaps.set(updated);
    this.persistRoadmaps(updated);
  }

  // Export / Import
  exportAllData(): string {
    const data = {
      version: '2.0-angular',
      exportedAt: new Date().toISOString(),
      roadmaps: this.roadmaps(),
      activeRoadmapId: this.activeRoadmapId(),
      sessions: this.sessions(),
      notifications: this.notifications(),
      streak: this.streak(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.roadmaps && Array.isArray(data.roadmaps)) {
        this.roadmaps.set(data.roadmaps);
        this.persistRoadmaps(data.roadmaps);
        if (data.activeRoadmapId) this.setActiveRoadmapId(data.activeRoadmapId);
        if (data.sessions) {
          this.sessions.set(data.sessions);
          this.persistSessions(data.sessions);
        }
        if (data.notifications) {
          this.notifications.set(data.notifications);
          this.persistNotifications(data.notifications);
        }
        return true;
      }
    } catch (e) {
      console.error('Error importando datos:', e);
    }
    return false;
  }
}
