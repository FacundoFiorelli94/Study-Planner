import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, EvaluateResponse } from '../../../core/services/gemini.service';
import { StorageService } from '../../../core/services/storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StudyModule, StudyPhase, ModuleStatus } from '../../../core/models/study.models';

@Component({
  selector: 'app-evaluate-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluate-dialog.component.html',
})
export class EvaluateDialogComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly storage = inject(StorageService);
  private readonly notificationService = inject(NotificationService);

  readonly module = input<StudyModule | null>(null);
  readonly phase = input<StudyPhase | null>(null);
  readonly close = output<void>();

  userCodeOrAnswer = '';
  readonly isLoading = signal<boolean>(false);
  readonly evaluation = signal<EvaluateResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);

  async evaluate(requestChallengeOnly = false): Promise<void> {
    const mod = this.module();
    const ph = this.phase();
    if (!mod || !ph) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.geminiService.evaluateMilestone({
        moduleTitle: mod.title,
        phaseTitle: ph.title,
        topics: mod.topics,
        userCodeOrAnswer: requestChallengeOnly
          ? 'El estudiante solicita un desafío técnico interactivo para evaluar su comprensión.'
          : this.userCodeOrAnswer,
      });
      this.evaluation.set(res);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error al conectar con la IA de evaluación.');
    } finally {
      this.isLoading.set(false);
    }
  }

  saveVerification(): void {
    const evalData = this.evaluation();
    const mod = this.module();
    if (!evalData || !mod) return;

    const status: ModuleStatus = evalData.passed ? 'completed' : 'in_progress';
    this.storage.updateModuleStatus(
      this.storage.activeRoadmap().id,
      mod.id,
      status,
      30,
      {
        passed: evalData.passed,
        score: evalData.score,
        feedback: evalData.summaryFeedback,
        verifiedAt: new Date().toISOString(),
      }
    );

    this.notificationService.triggerInAppOrSystem(
      'Hito Validado por IA',
      `Gemini evaluó tu solución con calificación ${evalData.score}/100.`,
      'milestone'
    );

    this.close.emit();
  }
}
