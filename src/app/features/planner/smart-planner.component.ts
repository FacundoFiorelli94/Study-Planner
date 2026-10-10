import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { ScheduledSession, StudyModule } from '../../core/models/study.models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-smart-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-planner.component.html',
})
export class SmartPlannerComponent {
  readonly storage = inject(StorageService);
  private readonly notificationService = inject(NotificationService);

  readonly startFocus = output<ScheduledSession>();

  // State
  readonly isRebalancing = signal<boolean>(false);
  readonly showAddModal = signal<boolean>(false);

  // New session form
  selectedModuleId = '';
  sessionDate = new Date().toISOString().split('T')[0];
  durationMinutes = 90;
  sessionNotes = '';

  constructor() {
    const active = this.storage.activeRoadmap();
    if (active?.phases[0]?.modules[0]) {
      this.selectedModuleId = active.phases[0].modules[0].id;
    }
  }

  get allModules(): { id: string; title: string; phaseTitle: string }[] {
    const active = this.storage.activeRoadmap();
    if (!active) return [];
    return active.phases.flatMap((p) =>
      p.modules.map((m) => ({ id: m.id, title: m.title, phaseTitle: p.title }))
    );
  }

  get totalScheduledMinutes(): number {
    return this.storage.sessions().reduce((acc, s) => acc + s.durationMinutes, 0);
  }

  get completedScheduledMinutes(): number {
    return this.storage
      .sessions()
      .filter((s) => s.completed)
      .reduce((acc, s) => acc + (s.actualMinutesSpent || s.durationMinutes), 0);
  }

  get sortedSessions(): ScheduledSession[] {
    return [...this.storage.sessions()].sort((a, b) => a.date.localeCompare(b.date));
  }

  toggleSession(sessionId: string): void {
    this.storage.toggleSessionComplete(sessionId);
  }

  onStartTimer(session: ScheduledSession): void {
    this.startFocus.emit(session);
  }

  rebalanceWithAI(): void {
    this.isRebalancing.set(true);
    setTimeout(() => {
      const active = this.storage.activeRoadmap();
      const pending: { mod: StudyModule; phaseTitle: string }[] = [];
      for (const p of active.phases) {
        for (const m of p.modules) {
          if (m.status !== 'completed') {
            pending.push({ mod: m, phaseTitle: p.title });
          }
        }
      }

      const newSessions: ScheduledSession[] = [];
      const today = new Date();
      const preferredDays = active.preferredDays || ['Lunes', 'Miércoles', 'Viernes', 'Sábado'];
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      let modIndex = 0;
      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        const dayName = dayNames[d.getDay()];

        if (preferredDays.includes(dayName)) {
          const item = pending[modIndex % (pending.length || 1)];
          if (item) {
            newSessions.push({
              id: `sess-ai-${Date.now()}-${dayOffset}`,
              roadmapId: active.id,
              moduleId: item.mod.id,
              moduleTitle: item.mod.title,
              phaseTitle: item.phaseTitle,
              date: d.toISOString().split('T')[0],
              dayOfWeek: dayName,
              durationMinutes: Math.round((active.weeklyHoursBudget * 60) / preferredDays.length),
              completed: false,
              actualMinutesSpent: 0,
              notes: `Asignado por IA: Enfocarse en ${item.mod.topics[0] || 'fundamentos'}`,
            });
            modIndex++;
          }
        }
      }

      this.storage.replaceSessions(newSessions);
      this.isRebalancing.set(false);
      this.notificationService.triggerInAppOrSystem(
        'Calendario Reorganizado por IA',
        `Se han distribuido ${newSessions.length} sesiones optimizadas según tu disponibilidad (${active.weeklyHoursBudget}h/semana).`,
        'reminder'
      );
    }, 700);
  }

  saveNewSession(): void {
    const mod = this.allModules.find((m) => m.id === this.selectedModuleId);
    if (!mod) return;

    const d = new Date(this.sessionDate);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    this.storage.addSession({
      roadmapId: this.storage.activeRoadmap().id,
      moduleId: mod.id,
      moduleTitle: mod.title,
      phaseTitle: mod.phaseTitle,
      date: this.sessionDate,
      dayOfWeek: dayNames[d.getDay()],
      durationMinutes: this.durationMinutes,
      completed: false,
      actualMinutesSpent: 0,
      notes: this.sessionNotes || `Sesión de ${this.durationMinutes} min`,
    });

    this.showAddModal.set(false);
    this.sessionNotes = '';
  }
}
