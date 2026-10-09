import { StorageService } from './storageService';
import { StudyNotification, ScheduledSession } from '../types/study';

export class NotificationEngine {
  static async requestBrowserPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  static triggerInAppOrSystem(title: string, body: string, type: StudyNotification['type'] = 'reminder') {
    // 1. Add to storage
    StorageService.addNotification({
      type,
      title,
      message: body,
    });

    // 2. If browser notifications enabled and granted
    const settings = StorageService.getSettings();
    if (settings.browserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Browser notification error:', e);
        }
      }
    }
  }

  static checkUpcomingSessions(sessions: ScheduledSession[]): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === todayStr && !s.completed);

    if (todaySessions.length > 0) {
      const existing = StorageService.getNotifications();
      const alreadyNotified = existing.some(
        (n) => n.timestamp.startsWith(todayStr) && n.title.includes('Sesión de hoy')
      );

      if (!alreadyNotified) {
        this.triggerInAppOrSystem(
          'Sesión de hoy programada',
          `Tienes ${todaySessions.length} sesión(es) para hoy: "${todaySessions[0].moduleTitle}". ¡Buen momento para avanzar!`,
          'reminder'
        );
      }
    }
  }

  static simulateStudyReminder(): void {
    const activeRoadmap = StorageService.getActiveRoadmap();
    // Find next in_progress or not_started module
    let targetModuleTitle = 'el próximo módulo';
    for (const phase of activeRoadmap.phases) {
      const mod = phase.modules.find((m) => m.status !== 'completed');
      if (mod) {
        targetModuleTitle = mod.title;
        break;
      }
    }

    this.triggerInAppOrSystem(
      '¡Hora de tu sesión de estudio!',
      `Bloque programado según tu disponibilidad semanal (${activeRoadmap.weeklyHoursBudget}h/sem). Continúa con: "${targetModuleTitle}".`,
      'reminder'
    );
  }
}
