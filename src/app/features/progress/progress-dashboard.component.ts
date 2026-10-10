import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { PortfolioProject } from '../../core/models/study.models';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './progress-dashboard.component.html',
})
export class ProgressDashboardComponent {
  readonly storage = inject(StorageService);

  readonly openLab = output<PortfolioProject>();

  readonly editingProjectId = signal<string | null>(null);
  readonly repoInput = signal<string>('');

  get streak() {
    return this.storage.streak();
  }

  get allModules() {
    const active = this.storage.activeRoadmap();
    if (!active) return [];
    return active.phases.flatMap((p) => p.modules);
  }

  get completedCount() {
    return this.allModules.filter((m) => m.status === 'completed').length;
  }

  get inProgressCount() {
    return this.allModules.filter((m) => m.status === 'in_progress').length;
  }

  get totalHoursLogged(): string {
    const totalMins = this.allModules.reduce((acc, m) => acc + (m.loggedMinutes || 0), 0);
    return (totalMins / 60).toFixed(1);
  }

  get totalEstimatedHours(): number {
    const active = this.storage.activeRoadmap();
    if (!active) return 0;
    return active.phases.reduce((acc, p) => acc + p.estimatedHours, 0);
  }

  get last7Days(): { dayLabel: string; minutes: number }[] {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const list: { dayLabel: string; minutes: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayLabel = dayNames[d.getDay()];
      // Calculate minutes based on actual sessions on this date
      const dStr = d.toISOString().split('T')[0];
      const mins = this.storage
        .sessions()
        .filter((s) => s.date === dStr && s.completed)
        .reduce((acc, s) => acc + (s.actualMinutesSpent || s.durationMinutes), 0);
      list.push({ dayLabel, minutes: mins });
    }
    return list;
  }

  max7DaysMinutes(): number {
    const max = Math.max(...this.last7Days.map((d) => d.minutes));
    return max > 0 ? max : 90;
  }

  onOpenLab(proj: PortfolioProject): void {
    this.openLab.emit(proj);
  }

  startEditRepo(proj: PortfolioProject): void {
    this.editingProjectId.set(proj.id);
    this.repoInput.set(proj.repoUrl || '');
  }

  saveRepo(projectId: string): void {
    this.storage.updateProjectStatus(
      projectId,
      'in_progress',
      this.repoInput()
    );
    this.editingProjectId.set(null);
  }

  exportData(): void {
    const json = this.storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      if (this.storage.importData(content)) {
        alert('¡Datos restaurados con éxito!');
      } else {
        alert('Error al importar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  }
}
