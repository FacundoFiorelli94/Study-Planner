import { Component, input, output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../core/services/storage.service';
import { StudyModule } from '../../../core/models/study.models';

@Component({
  selector: 'app-pomodoro-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro-dialog.component.html',
})
export class PomodoroDialogComponent {
  private readonly storage = inject(StorageService);

  readonly initialModule = input<StudyModule | null>(null);
  readonly close = output<void>();

  // State
  readonly mode = signal<'work' | 'break'>('work');
  readonly workMinutes = signal<number>(45);
  readonly breakMinutes = signal<number>(10);
  readonly timeLeftSeconds = signal<number>(45 * 60);
  readonly isRunning = signal<boolean>(false);
  selectedModuleId = '';

  private timerInterval: any = null;

  constructor() {
    effect(() => {
      const initMod = this.initialModule();
      if (initMod) {
        this.selectedModuleId = initMod.id;
      } else {
        const active = this.storage.activeRoadmap();
        if (active?.phases[0]?.modules[0]) {
          this.selectedModuleId = active.phases[0].modules[0].id;
        }
      }
    });
  }

  get allModules(): { id: string; title: string; phaseTitle: string }[] {
    const active = this.storage.activeRoadmap();
    if (!active) return [];
    return active.phases.flatMap((p) =>
      p.modules.map((m) => ({ id: m.id, title: m.title, phaseTitle: p.title }))
    );
  }

  get formattedTime(): string {
    const totalSec = this.timeLeftSeconds();
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get progressPercent(): number {
    const total = (this.mode() === 'work' ? this.workMinutes() : this.breakMinutes()) * 60;
    const elapsed = total - this.timeLeftSeconds();
    return Math.round((elapsed / total) * 100);
  }

  toggleTimer(): void {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    this.isRunning.set(true);
    this.timerInterval = setInterval(() => {
      if (this.timeLeftSeconds() > 0) {
        this.timeLeftSeconds.update((s) => s - 1);
      } else {
        this.handleFinished();
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.isRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    this.timeLeftSeconds.set(
      (this.mode() === 'work' ? this.workMinutes() : this.breakMinutes()) * 60
    );
  }

  setMode(newMode: 'work' | 'break'): void {
    this.pauseTimer();
    this.mode.set(newMode);
    this.timeLeftSeconds.set((newMode === 'work' ? this.workMinutes() : this.breakMinutes()) * 60);
  }

  private handleFinished(): void {
    this.pauseTimer();
    if (this.mode() === 'work') {
      const active = this.storage.activeRoadmap();
      if (this.selectedModuleId) {
        this.storage.updateModuleStatus(
          active.id,
          this.selectedModuleId,
          'in_progress',
          this.workMinutes()
        );
      }
      this.setMode('break');
    } else {
      this.setMode('work');
    }
  }
}
