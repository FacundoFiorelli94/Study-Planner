import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../../core/services/gemini.service';
import { StorageService } from '../../../core/services/storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StudyRoadmap } from '../../../core/models/study.models';

@Component({
  selector: 'app-create-roadmap-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-roadmap-dialog.component.html',
})
export class CreateRoadmapDialogComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly storage = inject(StorageService);
  private readonly notificationService = inject(NotificationService);

  readonly close = output<void>();
  readonly created = output<StudyRoadmap>();

  topic = '';
  weeklyHours = 10;
  targetWeeks = 12;
  currentLevel = 'Intermedio';
  selectedDays: string[] = ['Lunes', 'Miércoles', 'Viernes', 'Sábado'];
  notes = '';

  readonly allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  toggleDay(day: string): void {
    if (this.selectedDays.includes(day)) {
      if (this.selectedDays.length > 1) {
        this.selectedDays = this.selectedDays.filter((d) => d !== day);
      }
    } else {
      this.selectedDays = [...this.selectedDays, day];
    }
  }

  async generateRoadmap(): Promise<void> {
    if (!this.topic.trim() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const generated = await this.geminiService.generateSmartRoadmap({
        topic: this.topic,
        weeklyHours: this.weeklyHours,
        targetWeeks: this.targetWeeks,
        currentLevel: this.currentLevel,
        preferredDays: this.selectedDays,
        notes: this.notes,
      });

      const newRoadmap: StudyRoadmap = {
        id: `roadmap-${Date.now()}`,
        title: generated.title || this.topic,
        description: generated.description || `Ruta personalizada generada por IA para ${this.topic}`,
        category: generated.category || 'Inteligencia Artificial',
        totalWeeks: generated.totalWeeks || this.targetWeeks,
        weeklyHoursBudget: this.weeklyHours,
        targetPace: 'Balanceado',
        preferredDays: this.selectedDays,
        startDate: new Date().toISOString().split('T')[0],
        phases: generated.phases || [],
        portfolioProjects: generated.portfolioProjects || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.storage.addRoadmap(newRoadmap);
      this.notificationService.triggerInAppOrSystem(
        '¡Nueva Ruta de Estudio Creada!',
        `Se ha generado exitosamente la ruta "${newRoadmap.title}".`,
        'milestone'
      );

      this.created.emit(newRoadmap);
      this.close.emit();
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error al generar la ruta con Gemini.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
