export type ModuleStatus = 'not_started' | 'in_progress' | 'completed' | 'in_review';

export interface StudyResource {
  name: string;
  type: 'Doc' | 'Curso' | 'Repo' | 'Video' | 'Herramienta';
  url: string;
}

export interface ModuleVerification {
  passed: boolean;
  score: number;
  feedback: string;
  verifiedAt: string;
}

export interface ModuleDeliverable {
  title: string;
  description: string;
  completed: boolean;
  url?: string;
  notes?: string;
}

export interface ModulePdfGuide {
  title: string;
  totalPages: number;
  author: string;
  summary: string;
  pages: {
    pageNumber: number;
    title: string;
    sections: {
      heading: string;
      content?: string;
      codeSnippet?: string;
      bulletPoints?: string[];
      callout?: string;
    }[];
  }[];
  fileUrl?: string; // Optional custom user-uploaded PDF object/blob URL
  fileName?: string;
}

export interface StudyModule {
  id: string;
  title: string;
  description: string;
  topics: string[];
  status: ModuleStatus;
  estimatedHours: number;
  loggedMinutes: number;
  completedDate?: string;
  deliverable?: ModuleDeliverable;
  resources: StudyResource[];
  verification?: ModuleVerification;
  pdfGuide?: ModulePdfGuide;
}

export interface StudyPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  weeksRange: string;
  estimatedHours: number;
  modules: StudyModule[];
}

export interface LabStep {
  stepNumber: number;
  title: string;
  duration: string;
  explanation: string;
  commandOrSnippet?: string;
  commandLanguage?: string;
  deliverableCheck?: string;
}

export interface LabGuide {
  objective: string;
  scenario: string;
  estimatedHours: number;
  difficulty: 'Intermedio' | 'Avanzado' | 'Experto';
  prerequisites: string[];
  architectureOverview: string;
  steps: LabStep[];
  verificationChecklist: string[];
  suggestedDeliverableRepo: string;
}

export interface PortfolioProject {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  requiredWeek: number;
  repoUrl?: string;
  liveUrl?: string;
  notes?: string;
  labGuide?: LabGuide;
  completedStepIndexes?: number[];
}

export interface StudyMaterial {
  id: string;
  roadmapId: string;
  phaseId?: string;
  moduleId?: string;
  title: string;
  type: 'PDF' | 'Guía' | 'Código' | 'Video' | 'Cheatsheet' | 'Enlace';
  description: string;
  url?: string;
  fileData?: string; // Data URL or text content
  fileName?: string;
  fileSize?: string;
  tags: string[];
  createdAt: string;
  author?: string;
}

export interface StudyRoadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalWeeks: number;
  weeklyHoursBudget: number;
  targetPace: 'Intensivo' | 'Balanceado' | 'Sostenible';
  preferredDays: string[];
  startDate: string;
  phases: StudyPhase[];
  portfolioProjects: PortfolioProject[];
  createdAt: string;
  updatedAt: string;
  isFlagship?: boolean;
}

export interface ScheduledSession {
  id: string;
  roadmapId: string;
  moduleId: string;
  moduleTitle: string;
  phaseTitle: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  durationMinutes: number;
  completed: boolean;
  actualMinutesSpent: number;
  notes?: string;
}

export interface StudyNotification {
  id: string;
  type: 'reminder' | 'streak' | 'milestone' | 'warning' | 'tip';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  roadmapId?: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  browserNotifications: boolean;
  studyReminderTime: string; // "19:00"
  reminderDays: string[];
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  dailyGoalMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  rolePersona?: string;
  highThinking?: boolean;
}

export type MentorPersona =
  | 'roadmap_master' // Gestor de la Carrera - IA y Automatización
  | 'automation_engineer' // Automatización de Flujos (n8n, APIs, Webhooks)
  | 'ai_engineer' // Modelos de IA, LangGraph, RAG y Agentes Autónomos
  | 'productivity_coach'; // Planificación y hábitos de estudio

export type ThemePalette = 'slate-calm' | 'nord-dark' | 'warm-charcoal' | 'forest-night';

export interface ThemeConfig {
  id: ThemePalette;
  name: string;
  badge: string;
  solidAccent: string;
  accentColor: string;
  textColor: string;
  description: string;
}
