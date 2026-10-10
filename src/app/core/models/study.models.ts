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
  fileUrl?: string;
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
  description?: string;
  weeksRange?: string;
  focusArea?: string;
  estimatedWeeks?: number;
  estimatedHours: number;
  modules: StudyModule[];
  milestoneProject?: string;
}

export interface PortfolioProject {
  id: string;
  phaseNumber: number;
  requiredWeek: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  repoUrl?: string;
  liveDemoUrl?: string;
  liveUrl?: string;
  notes?: string;
  completedStepIndexes?: number[];
  deliverableFiles?: string[];
  labGuide?: {
    objective: string;
    scenario: string;
    estimatedHours: number;
    difficulty: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
    prerequisites: string[];
    architectureOverview: string;
    steps: {
      stepNumber: number;
      title: string;
      duration: string;
      explanation: string;
      commandLanguage?: string;
      commandOrSnippet?: string;
      completed?: boolean;
      deliverableCheck?: string;
    }[];
  };
}

export interface StudyRoadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalWeeks: number;
  weeklyHoursBudget: number;
  targetPace: 'Intensivo' | 'Balanceado' | 'Sostenible' | 'Relajado';
  preferredDays: string[];
  startDate: string;
  phases: StudyPhase[];
  isFlagship?: boolean;
  portfolioProjects?: PortfolioProject[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledSession {
  id: string;
  roadmapId: string;
  moduleId: string;
  moduleTitle: string;
  phaseTitle: string;
  date: string;
  dayOfWeek: string;
  durationMinutes: number;
  completed: boolean;
  actualMinutesSpent?: number;
  notes?: string;
}

export interface StudyNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'milestone' | 'streak' | 'break';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  browserNotifications: boolean;
  studyReminderTime: string;
  reminderDays: string[];
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  dailyGoalMinutes: number;
}

export type MentorPersona = 'roadmap_master' | 'automation_engineer' | 'ai_architect';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  personaUsed?: MentorPersona;
  thinkingProcess?: string;
  groundedWithSearch?: boolean;
  sources?: { title: string; url: string }[];
}

export interface StudyStreak {
  currentStreakDays: number;
  longestStreakDays: number;
  lastStudyDate: string;
  totalStudyDays: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link' | 'exercise';
  url: string;
  phaseId?: string;
  moduleId?: string;
  isCompleted?: boolean;
}

export type ThemePalette = 'slate-calm' | 'nord-dark' | 'warm-charcoal' | 'forest-night';
