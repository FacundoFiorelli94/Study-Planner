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
  | 'architect' // SOLID & Clean Architecture
  | 'roadmap_master' // Gestor del Plan de Estudios - IA y Automatización
  | 'frontend_ux' // Diseñador UX/UI & Frontend
  | 'productivity_coach'; // Planificación y hábitos
