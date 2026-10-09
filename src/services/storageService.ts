import {
  StudyRoadmap,
  ScheduledSession,
  StudyNotification,
  UserSettings,
  ChatMessage,
  ModuleStatus,
  ModuleVerification,
} from '../types/study';
import { FLAGSHIP_AI_AUTOMATION_ROADMAP, CLEAN_ARCH_ROADMAP } from '../data/defaultRoadmaps';

const STORAGE_KEYS = {
  ROADMAPS: 'kamino_study_roadmaps_v1',
  ACTIVE_ROADMAP_ID: 'kamino_active_roadmap_id_v1',
  SESSIONS: 'kamino_study_sessions_v1',
  NOTIFICATIONS: 'kamino_notifications_v1',
  SETTINGS: 'kamino_user_settings_v1',
  CHAT_MESSAGES: 'kamino_chat_messages_v1',
  STUDY_STREAK: 'kamino_study_streak_v1',
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

export class StorageService {
  // Roadmaps
  static getRoadmaps(): StudyRoadmap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading roadmaps:', e);
    }
    const defaults = [FLAGSHIP_AI_AUTOMATION_ROADMAP, CLEAN_ARCH_ROADMAP];
    this.saveRoadmaps(defaults);
    return defaults;
  }

  static saveRoadmaps(roadmaps: StudyRoadmap[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(roadmaps));
    } catch (e) {
      console.error('Error saving roadmaps:', e);
    }
  }

  static getActiveRoadmapId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROADMAP_ID);
    if (stored) return stored;
    const roadmaps = this.getRoadmaps();
    const firstId = roadmaps[0]?.id || FLAGSHIP_AI_AUTOMATION_ROADMAP.id;
    this.setActiveRoadmapId(firstId);
    return firstId;
  }

  static setActiveRoadmapId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROADMAP_ID, id);
  }

  static getActiveRoadmap(): StudyRoadmap {
    const roadmaps = this.getRoadmaps();
    const activeId = this.getActiveRoadmapId();
    const found = roadmaps.find((r) => r.id === activeId);
    return found || roadmaps[0] || FLAGSHIP_AI_AUTOMATION_ROADMAP;
  }

  static updateModuleStatus(
    roadmapId: string,
    moduleId: string,
    status: ModuleStatus,
    additionalMinutes = 0,
    verification?: ModuleVerification
  ): StudyRoadmap {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return this.getActiveRoadmap();

    for (const phase of roadmap.phases) {
      const mod = phase.modules.find((m) => m.id === moduleId);
      if (mod) {
        mod.status = status;
        if (additionalMinutes > 0) {
          mod.loggedMinutes = (mod.loggedMinutes || 0) + additionalMinutes;
        }
        if (status === 'completed' && !mod.completedDate) {
          mod.completedDate = new Date().toISOString();
        }
        if (verification) {
          mod.verification = verification;
        }
        break;
      }
    }

    roadmap.updatedAt = new Date().toISOString();
    this.saveRoadmaps(roadmaps);
    this.recordStudyActivity(additionalMinutes > 0 ? additionalMinutes : 15);
    return roadmap;
  }

  static updateDeliverableStatus(
    roadmapId: string,
    moduleId: string,
    completed: boolean,
    url?: string,
    notes?: string
  ): StudyRoadmap {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return this.getActiveRoadmap();

    for (const phase of roadmap.phases) {
      const mod = phase.modules.find((m) => m.id === moduleId);
      if (mod && mod.deliverable) {
        mod.deliverable.completed = completed;
        if (url !== undefined) mod.deliverable.url = url;
        if (notes !== undefined) mod.deliverable.notes = notes;
        break;
      }
    }

    roadmap.updatedAt = new Date().toISOString();
    this.saveRoadmaps(roadmaps);
    return roadmap;
  }

  static updateRoadmapSettings(
    roadmapId: string,
    updates: { weeklyHoursBudget?: number; targetPace?: 'Intensivo' | 'Balanceado' | 'Sostenible'; preferredDays?: string[] }
  ): StudyRoadmap {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return this.getActiveRoadmap();

    if (updates.weeklyHoursBudget !== undefined) {
      roadmap.weeklyHoursBudget = updates.weeklyHoursBudget;
      // Recalculate weeks based on total estimated hours
      const totalHours = roadmap.phases.reduce((acc, p) => acc + p.estimatedHours, 0);
      roadmap.totalWeeks = Math.max(1, Math.ceil(totalHours / updates.weeklyHoursBudget));
    }
    if (updates.targetPace) {
      roadmap.targetPace = updates.targetPace;
    }
    if (updates.preferredDays) {
      roadmap.preferredDays = updates.preferredDays;
    }

    roadmap.updatedAt = new Date().toISOString();
    this.saveRoadmaps(roadmaps);
    return roadmap;
  }

  static addRoadmap(newRoadmap: StudyRoadmap): void {
    const roadmaps = this.getRoadmaps();
    roadmaps.unshift(newRoadmap);
    this.saveRoadmaps(roadmaps);
    this.setActiveRoadmapId(newRoadmap.id);
  }

  static deleteRoadmap(id: string): void {
    let roadmaps = this.getRoadmaps();
    roadmaps = roadmaps.filter((r) => r.id !== id);
    if (roadmaps.length === 0) {
      roadmaps = [FLAGSHIP_AI_AUTOMATION_ROADMAP];
    }
    this.saveRoadmaps(roadmaps);
    this.setActiveRoadmapId(roadmaps[0].id);
  }

  // Sessions (Planner Calendar)
  static getSessions(): ScheduledSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading sessions:', e);
    }
    return this.generateInitialSessions();
  }

  static saveSessions(sessions: ScheduledSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions:', e);
    }
  }

  private static generateInitialSessions(): ScheduledSession[] {
    const roadmap = FLAGSHIP_AI_AUTOMATION_ROADMAP;
    const sessions: ScheduledSession[] = [];
    const today = new Date();

    const daysOffset = [0, 2, 4, 6]; // Today, +2 days, +4 days, +6 days
    const modulesToSchedule = [
      roadmap.phases[0].modules[1], // JSON schema
      roadmap.phases[0].modules[2], // HTTP/REST
      roadmap.phases[1].modules[0], // Prompting
      roadmap.phases[1].modules[1], // Chain-of-thought
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

    this.saveSessions(sessions);
    return sessions;
  }

  // Activity & Streak Tracking
  static recordStudyActivity(minutes: number): { streak: number; totalMinutesToday: number } {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = this.getStreakData();

    if (!data.dailyLogs[todayStr]) {
      data.dailyLogs[todayStr] = 0;
    }
    data.dailyLogs[todayStr] += minutes;

    // Calculate streak
    const dates = Object.keys(data.dailyLogs).sort();
    let currentStreak = 0;
    const checkDate = new Date();

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (data.dailyLogs[dStr] && data.dailyLogs[dStr] > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    data.currentStreak = Math.max(1, currentStreak);
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    data.lastActiveDate = todayStr;

    localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, JSON.stringify(data));
    return { streak: data.currentStreak, totalMinutesToday: data.dailyLogs[todayStr] };
  }

  static getStreakData(): {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    dailyLogs: Record<string, number>;
  } {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: today,
      dailyLogs: {
        [yesterday]: 60,
        [today]: 45,
      },
    };
  }

  // Notifications
  static getNotifications(): StudyNotification[] {
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
    this.saveNotifications(initial);
    return initial;
  }

  static saveNotifications(notifications: StudyNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }

  static addNotification(item: Omit<StudyNotification, 'id' | 'timestamp' | 'read'>): StudyNotification {
    const list = this.getNotifications();
    const newNotif: StudyNotification = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(newNotif);
    this.saveNotifications(list);
    return newNotif;
  }

  static markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(list);
  }

  // User Settings
  static getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }

  // Chat Messages
  static getChatMessages(): ChatMessage[] {
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
        text: '¡Hola! Soy tu Mentor Técnico y Arquitecto de Aprendizaje. Estoy aquí para acompañarte paso a paso en tu ruta de estudio, resolver dudas de arquitectura (Clean Architecture, SOLID, FastAPI, LangGraph), validar tus entregables y adaptar tu planificación a tu tiempo real disponible. ¿En qué módulo nos enfocaremos hoy?',
        timestamp: new Date().toISOString(),
        rolePersona: 'roadmap_master',
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }

  // Export & Import full workspace
  static exportAllData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      roadmaps: this.getRoadmaps(),
      activeRoadmapId: this.getActiveRoadmapId(),
      sessions: this.getSessions(),
      notifications: this.getNotifications(),
      settings: this.getSettings(),
      streak: this.getStreakData(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.roadmaps && Array.isArray(data.roadmaps)) {
        this.saveRoadmaps(data.roadmaps);
        if (data.activeRoadmapId) this.setActiveRoadmapId(data.activeRoadmapId);
        if (data.sessions) this.saveSessions(data.sessions);
        if (data.notifications) this.saveNotifications(data.notifications);
        if (data.settings) this.saveSettings(data.settings);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }
}
