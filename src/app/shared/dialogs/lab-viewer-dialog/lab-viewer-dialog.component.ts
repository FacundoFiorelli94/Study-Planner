import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioProject } from '../../../core/models/study.models';

@Component({
  selector: 'app-lab-viewer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-viewer-dialog.component.html',
})
export class LabViewerDialogComponent {
  readonly project = input<PortfolioProject | null>(null);
  readonly close = output<void>();
  readonly toggleStep = output<{ projectId: string; stepIndex: number }>();
  readonly updateRepo = output<{ projectId: string; repoUrl: string }>();

  readonly activeTab = signal<'guide' | 'steps' | 'architecture' | 'delivery'>('guide');
  readonly copiedIndex = signal<number | null>(null);
  readonly repoInput = signal<string>('');

  constructor() {
    // initialize
  }

  get completedStepsCount(): number {
    const proj = this.project();
    if (!proj || !proj.labGuide?.steps) return 0;
    return proj.labGuide.steps.filter((s) => s.completed).length;
  }

  get totalStepsCount(): number {
    return this.project()?.labGuide?.steps.length || 0;
  }

  get progressPercent(): number {
    if (this.totalStepsCount === 0) return 0;
    return Math.round((this.completedStepsCount / this.totalStepsCount) * 100);
  }

  copySnippet(snippet: string, index: number): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(snippet);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    }
  }

  onToggleStep(index: number): void {
    const p = this.project();
    if (p) {
      this.toggleStep.emit({ projectId: p.id, stepIndex: index });
    }
  }

  saveRepoUrl(): void {
    const p = this.project();
    if (p) {
      this.updateRepo.emit({ projectId: p.id, repoUrl: this.repoInput() });
    }
  }
}
