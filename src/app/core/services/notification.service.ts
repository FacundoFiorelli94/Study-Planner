import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StudyNotification, ScheduledSession } from '../models/study.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly storage = inject(StorageService);

  async requestBrowserPermission(): Promise<boolean> {
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

  triggerInAppOrSystem(title: string, body: string, type: StudyNotification['type'] = 'reminder'): void {
    // 1. Add to reactive storage
    this.storage.addNotification({
      type,
      title,
      message: body,
    });

    // 2. Browser native notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Error en notificación de navegador:', e);
        }
      }
    }
  }

  checkUpcomingSessions(sessions: ScheduledSession[]): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === todayStr && !s.completed);

    if (todaySessions.length > 0) {
      const existing = this.storage.notifications();
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

  simulateStudyReminder(): void {
    const activeRoadmap = this.storage.activeRoadmap();
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
