import {
  StudyRoadmap,
  ScheduledSession,
  StudyNotification,
  UserSettings,
  ChatMessage,
  ModuleStatus,
  ModuleVerification,
  StudyMaterial,
} from '../types/study';
import { FLAGSHIP_AI_AUTOMATION_ROADMAP, MULTI_AGENT_AI_ROADMAP } from '../data/defaultRoadmaps';

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

export class StorageService {
  // Roadmaps
  static getRoadmaps(): StudyRoadmap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
      if (stored) {
        let parsed: StudyRoadmap[] = JSON.parse(stored);
        let changed = false;

        // Purge any old Clean Architecture / SOLID roadmaps
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

        // Ensure MULTI_AGENT_AI_ROADMAP exists
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
            // Ensure Phase 3 does not have Clean Architecture / SOLID
            const p3 = r.phases?.find((p) => p.id === 'phase-3');
            if (p3 && (p3.title.includes('Clean Architecture') || p3.description.includes('SOLID'))) {
              p3.title = 'Fase 3: Python Aplicado y APIs para Automatización';
              p3.description =
                'Pipelines ETL de datos, persistencia en PostgreSQL con SQLAlchemy, peticiones asíncronas con HTTPX y APIs en FastAPI para alimentar agentes de IA y flujos automatizados.';
              const m3 = p3.modules?.find((m) => m.id === 'mod-3-3');
              if (m3 && (m3.title.includes('SOLID') || m3.title.includes('Clean Architecture'))) {
                m3.title = 'FastAPI y Endpoints Robustos para Automatización';
                m3.description =
                  'Endpoints RESTful asíncronos, inyección de dependencias con Depends, modelos Pydantic, manejo de Webhooks y background tasks.';
              }
              changed = true;
            }

            // Ensure portfolio projects have labGuides
            if (FLAGSHIP_AI_AUTOMATION_ROADMAP.portfolioProjects) {
              r.portfolioProjects = r.portfolioProjects.map((p, idx) => {
                const flagshipP = FLAGSHIP_AI_AUTOMATION_ROADMAP.portfolioProjects[idx];
                if (flagshipP?.labGuide && !p.labGuide) {
                  changed = true;
                  return { ...p, title: flagshipP.title, labGuide: flagshipP.labGuide };
                }
                return p;
              });
            }
          }
        });
        if (changed) {
          this.saveRoadmaps(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading roadmaps:', e);
    }
    const defaults = [FLAGSHIP_AI_AUTOMATION_ROADMAP, MULTI_AGENT_AI_ROADMAP];
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
      if (stored) {
        const parsed: ChatMessage[] = JSON.parse(stored);
        let changed = false;
        parsed.forEach((m) => {
          if (m.id === 'msg-welcome' && (m.text.includes('SOLID') || m.text.includes('Clean Architecture'))) {
            m.text =
              '¡Hola! Soy tu Mentor Técnico en Inteligencia Artificial y Automatización. Estoy aquí para acompañarte paso a paso en tu ruta de estudio, resolver dudas de flujos en n8n, agentes con LangGraph, RAG, Python y FastAPI, validar tus entregables y adaptar tu planificación a tu tiempo real disponible. ¿En qué módulo nos enfocaremos hoy?';
            changed = true;
          }
        });
        if (changed) {
          this.saveChatMessages(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: '¡Hola! Soy tu Mentor Técnico en Inteligencia Artificial y Automatización. Estoy aquí para acompañarte paso a paso en tu ruta de estudio, resolver dudas de flujos en n8n, agentes con LangGraph, RAG, Python y FastAPI, validar tus entregables y adaptar tu planificación a tu tiempo real disponible. ¿En qué módulo nos enfocaremos hoy?',
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

  static getThemePalette(): import('../types/study').ThemePalette {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME_PALETTE);
      if (stored && ['slate-calm', 'nord-dark', 'warm-charcoal', 'forest-night'].includes(stored)) {
        return stored as import('../types/study').ThemePalette;
      }
    } catch (e) {
      console.error(e);
    }
    return 'slate-calm';
  }

  static saveThemePalette(theme: import('../types/study').ThemePalette): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_PALETTE, theme);
    } catch (e) {
      console.error(e);
    }
  }

  // Project Lab Steps
  static toggleProjectLabStep(
    roadmapId: string,
    projectId: string,
    stepIndex: number
  ): StudyRoadmap {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return this.getActiveRoadmap();

    const project = roadmap.portfolioProjects?.find((p) => p.id === projectId);
    if (project) {
      const current = new Set(project.completedStepIndexes || []);
      if (current.has(stepIndex)) {
        current.delete(stepIndex);
      } else {
        current.add(stepIndex);
      }
      project.completedStepIndexes = Array.from(current).sort((a, b) => a - b);

      // If all steps completed, automatically set status to completed
      const totalSteps = project.labGuide?.steps.length || 0;
      if (totalSteps > 0 && project.completedStepIndexes.length === totalSteps) {
        project.status = 'completed';
      } else if (project.completedStepIndexes.length > 0 && project.status === 'pending') {
        project.status = 'in_progress';
      }
    }

    roadmap.updatedAt = new Date().toISOString();
    this.saveRoadmaps(roadmaps);
    return roadmap;
  }

  // Study Materials (Extensibility for future materials)
  static getStudyMaterials(roadmapId?: string): StudyMaterial[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_MATERIALS);
      if (stored) {
        const materials: StudyMaterial[] = JSON.parse(stored);
        if (roadmapId) {
          return materials.filter((m) => m.roadmapId === roadmapId);
        }
        return materials;
      }
    } catch (e) {
      console.error('Error loading study materials:', e);
    }

    // Default seeded materials
    const initial: StudyMaterial[] = [
      {
        id: 'mat-1',
        roadmapId: 'roadmap-ai-automation-30w',
        phaseId: 'phase-0',
        moduleId: 'mod-0-2',
        title: 'Cheat Sheet: JSON Schema 2020-12 & Tipado Canónico',
        type: 'Cheatsheet',
        description: 'Referencia rápida con tipos primitivos, validadores regex comunes y directivas strict.',
        fileName: 'cheatsheet-json-schema-2020-12.pdf',
        tags: ['JSON Schema', 'Validación', 'Tipado'],
        createdAt: new Date().toISOString(),
        author: 'Facultad Técnica',
      },
      {
        id: 'mat-2',
        roadmapId: 'roadmap-ai-automation-30w',
        phaseId: 'phase-2',
        moduleId: 'mod-2-1',
        title: 'Guía de Despliegue n8n en Docker Swarm & Kubernetes',
        type: 'Guía',
        description: 'Arquitectura de alta disponibilidad con colas Redis y workers desacoplados en n8n.',
        fileName: 'n8n-production-cluster-guide.pdf',
        tags: ['n8n', 'DevOps', 'Docker', 'Escalabilidad'],
        createdAt: new Date().toISOString(),
        author: 'Infraestructura & MLOps',
      },
      {
        id: 'mat-3',
        roadmapId: 'roadmap-ai-automation-30w',
        phaseId: 'phase-4',
        moduleId: 'mod-4-3',
        title: 'Patrones Avanzados de Grafos Cíclicos con LangGraph',
        type: 'PDF',
        description: 'Documento técnico detallando patrones Human-in-the-loop, time travel debugging y checkpoints.',
        fileName: 'langgraph-state-patterns.pdf',
        tags: ['LangGraph', 'ReAct', 'StateGraph', 'Python'],
        createdAt: new Date().toISOString(),
        author: 'Laboratorio de IA',
      },
    ];

    this.saveStudyMaterials(initial);
    return roadmapId ? initial.filter((m) => m.roadmapId === roadmapId) : initial;
  }

  static saveStudyMaterials(materials: StudyMaterial[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Error saving study materials:', e);
    }
  }

  static addStudyMaterial(material: StudyMaterial): void {
    const list = this.getStudyMaterials();
    list.unshift(material);
    this.saveStudyMaterials(list);
  }

  static deleteStudyMaterial(id: string): void {
    const list = this.getStudyMaterials().filter((m) => m.id !== id);
    this.saveStudyMaterials(list);
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
