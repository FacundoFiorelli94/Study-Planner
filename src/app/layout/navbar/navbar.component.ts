import { Component, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, APP_THEMES, ThemeMeta } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { ThemePalette } from '../../core/models/study.models';

export type ActiveTab = 'roadmap' | 'planner' | 'progress' | 'chat';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly themeService = inject(ThemeService);
  readonly storage = inject(StorageService);

  readonly currentTab = input<ActiveTab>('roadmap');
  readonly isDemoMode = input<boolean>(false);

  readonly tabChange = output<ActiveTab>();
  readonly openTimer = output<void>();
  readonly openNotifications = output<void>();
  readonly openNewRoadmap = output<void>();
  readonly toggleDemoMode = output<void>();

  readonly showThemeMenu = signal<boolean>(false);
  readonly themes = APP_THEMES;

  get currentTheme(): ThemePalette {
    return this.themeService.currentTheme();
  }

  get activeThemeMeta(): ThemeMeta {
    return this.themeService.currentThemeMeta;
  }

  selectTab(tab: ActiveTab): void {
    this.tabChange.emit(tab);
  }

  toggleThemeDropdown(): void {
    this.showThemeMenu.update((v) => !v);
  }

  selectTheme(themeId: ThemePalette): void {
    this.themeService.setTheme(themeId);
    this.showThemeMenu.set(false);
  }
}
