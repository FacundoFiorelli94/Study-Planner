import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './core/services/storage.service';
import { NotificationService } from './core/services/notification.service';
import { ThemeService } from './core/services/theme.service';
import { NavbarComponent, ActiveTab } from './layout/navbar/navbar.component';
import { RoadmapViewerComponent } from './features/roadmap/roadmap-viewer.component';
import { SmartPlannerComponent } from './features/planner/smart-planner.component';
import { ProgressDashboardComponent } from './features/progress/progress-dashboard.component';
import { GeminiMentorChatComponent } from './features/chat/gemini-mentor-chat.component';
import { QuickDemoComponent } from './features/demo/quick-demo.component';
import { PomodoroDialogComponent } from './shared/dialogs/pomodoro-dialog/pomodoro-dialog.component';
import { EvaluateDialogComponent } from './shared/dialogs/evaluate-dialog/evaluate-dialog.component';
import { NotificationDrawerComponent } from './shared/dialogs/notification-drawer/notification-drawer.component';
import { CreateRoadmapDialogComponent } from './shared/dialogs/create-roadmap-dialog/create-roadmap-dialog.component';
import { PdfViewerDialogComponent } from './shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { LabViewerDialogComponent } from './shared/dialogs/lab-viewer-dialog/lab-viewer-dialog.component';
import { StudyModule, StudyPhase, PortfolioProject, ScheduledSession } from './core/models/study.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RoadmapViewerComponent,
    SmartPlannerComponent,
    ProgressDashboardComponent,
    GeminiMentorChatComponent,
    QuickDemoComponent,
    PomodoroDialogComponent,
    EvaluateDialogComponent,
    NotificationDrawerComponent,
    CreateRoadmapDialogComponent,
    PdfViewerDialogComponent,
    LabViewerDialogComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly storage = inject(StorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly themeService = inject(ThemeService);

  readonly currentTab = signal<ActiveTab>('roadmap');
  readonly isDemoMode = signal<boolean>(false);

  // Modals state
  readonly isTimerOpen = signal<boolean>(false);
  readonly timerModule = signal<StudyModule | null>(null);

  readonly isEvaluateOpen = signal<boolean>(false);
  readonly evaluateModule = signal<StudyModule | null>(null);
  readonly evaluatePhase = signal<StudyPhase | null>(null);

  readonly isNotificationsOpen = signal<boolean>(false);
  readonly isCreateRoadmapOpen = signal<boolean>(false);

  readonly isPdfOpen = signal<boolean>(false);
  readonly pdfModule = signal<StudyModule | null>(null);

  readonly isLabOpen = signal<boolean>(false);
  readonly labProject = signal<PortfolioProject | null>(null);

  ngOnInit(): void {
    this.notificationService.checkUpcomingSessions(this.storage.sessions());
  }

  setTab(tab: ActiveTab): void {
    this.currentTab.set(tab);
  }

  toggleDemoMode(): void {
    this.isDemoMode.update((v) => !v);
  }

  openTimerModal(mod?: StudyModule | null): void {
    this.timerModule.set(mod || this.storage.activeRoadmap().phases[0]?.modules[0] || null);
    this.isTimerOpen.set(true);
  }

  openTimerFromSession(session: ScheduledSession): void {
    const active = this.storage.activeRoadmap();
    let foundMod: StudyModule | null = null;
    for (const p of active.phases) {
      const m = p.modules.find((mod) => mod.id === session.moduleId);
      if (m) {
        foundMod = m;
        break;
      }
    }
    this.openTimerModal(foundMod);
  }

  openEvaluateModal(target: { phase: StudyPhase; module: StudyModule }): void {
    this.evaluatePhase.set(target.phase);
    this.evaluateModule.set(target.module);
    this.isEvaluateOpen.set(true);
  }

  openPdfViewer(module: StudyModule): void {
    this.pdfModule.set(module);
    this.isPdfOpen.set(true);
  }

  openLabViewer(project: PortfolioProject): void {
    this.labProject.set(project);
    this.isLabOpen.set(true);
  }

  onToggleLabStep(data: { projectId: string; stepIndex: number }): void {
    this.storage.toggleProjectLabStep(
      this.storage.activeRoadmap().id,
      data.projectId,
      data.stepIndex
    );
  }

  onUpdateProjectRepo(data: { projectId: string; repoUrl: string }): void {
    this.storage.updateProjectStatus(data.projectId, 'in_progress', data.repoUrl);
  }
}
