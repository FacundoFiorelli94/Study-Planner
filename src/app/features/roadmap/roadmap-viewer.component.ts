import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import {
  StudyRoadmap,
  StudyPhase,
  StudyModule,
  ModuleStatus,
  PortfolioProject,
} from '../../core/models/study.models';
import { MODULE_PDF_GUIDES } from '../../core/data/module-guides';

@Component({
  selector: 'app-roadmap-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roadmap-viewer.component.html',
})
export class RoadmapViewerComponent {
  readonly storage = inject(StorageService);

  readonly openEvaluateModal = output<{ phase: StudyPhase; module: StudyModule }>();
  readonly startFocusSession = output<{ phase: StudyPhase; module: StudyModule }>();
  readonly openPdfModal = output<StudyModule>();
  readonly openLabModal = output<PortfolioProject>();

  // UI state signals
  readonly expandedPhases = signal<Record<string, boolean>>({ 'phase-0': true, 'phase-1': true });
  readonly showPaceSettings = signal<boolean>(false);
  readonly selectedPaceHours = signal<number>(10);
  readonly selectedDays = signal<string[]>(['Lunes', 'Miércoles', 'Viernes', 'Sábado']);

  allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor() {
    const active = this.storage.activeRoadmap();
    if (active) {
      this.selectedPaceHours.set(active.weeklyHoursBudget || 10);
      this.selectedDays.set(active.preferredDays || ['Lunes', 'Miércoles', 'Viernes', 'Sábado']);
    }
  }

  togglePhase(phaseId: string): void {
    this.expandedPhases.update((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  }

  isPhaseExpanded(phaseId: string): boolean {
    return !!this.expandedPhases()[phaseId];
  }

  getPhaseProgress(phase: StudyPhase): { completed: number; total: number; percent: number } {
    const total = phase.modules.length;
    const completed = phase.modules.filter((m) => m.status === 'completed').length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  selectRoadmap(id: string): void {
    this.storage.setActiveRoadmapId(id);
    const active = this.storage.activeRoadmap();
    this.selectedPaceHours.set(active.weeklyHoursBudget || 10);
    this.selectedDays.set(active.preferredDays || ['Lunes', 'Miércoles', 'Viernes', 'Sábado']);
  }

  updateModuleStatus(moduleId: string, status: ModuleStatus): void {
    this.storage.updateModuleStatus(this.storage.activeRoadmap().id, moduleId, status);
  }

  toggleDeliverable(module: StudyModule): void {
    if (!module.deliverable) return;
    const nextState = !module.deliverable.completed;
    this.storage.updateDeliverableStatus(
      this.storage.activeRoadmap().id,
      module.id,
      nextState,
      module.deliverable.url,
      module.deliverable.notes
    );
  }

  toggleDay(day: string): void {
    this.selectedDays.update((days) => {
      if (days.includes(day)) {
        return days.filter((d) => d !== day);
      } else {
        return [...days, day];
      }
    });
  }

  savePaceSettings(): void {
    this.storage.updateRoadmapSettings(this.storage.activeRoadmap().id, {
      weeklyHoursBudget: this.selectedPaceHours(),
      preferredDays: this.selectedDays(),
    });
    this.showPaceSettings.set(false);
  }

  hasPdfGuide(module: StudyModule): boolean {
    return !!module.pdfGuide || !!MODULE_PDF_GUIDES[module.id];
  }

  onViewPdf(module: StudyModule): void {
    this.openPdfModal.emit(module);
  }

  onStartTimer(phase: StudyPhase, module: StudyModule): void {
    this.startFocusSession.emit({ phase, module });
  }

  onEvaluate(phase: StudyPhase, module: StudyModule): void {
    this.openEvaluateModal.emit({ phase, module });
  }

  onViewLab(proj: PortfolioProject): void {
    this.openLabModal.emit(proj);
  }

  toggleLabStep(projectId: string, stepIndex: number): void {
    this.storage.toggleProjectLabStep(this.storage.activeRoadmap().id, projectId, stepIndex);
  }
}
