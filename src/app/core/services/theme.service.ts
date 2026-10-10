import { Injectable, inject, effect } from '@angular/core';
import { StorageService } from './storage.service';
import { ThemePalette } from '../models/study.models';

export interface ThemeMeta {
  id: ThemePalette;
  name: string;
  label: string;
  icon: string;
  badgeClass: string;
  buttonClass: string;
  textAccentClass: string;
  primaryColor: string;
  accentColor: string;
}

export const APP_THEMES: ThemeMeta[] = [
  {
    id: 'slate-calm',
    name: 'Pizarra Suave',
    label: 'Índigo & Grafito',
    icon: '🌙',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    textAccentClass: 'text-indigo-400',
    primaryColor: '#6366f1',
    accentColor: '#818cf8',
  },
  {
    id: 'nord-dark',
    name: 'Nórdico Frío',
    label: 'Azul Calmo & Carbón',
    icon: '❄️',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    buttonClass: 'bg-sky-600 hover:bg-sky-500 text-white',
    textAccentClass: 'text-sky-400',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
  },
  {
    id: 'warm-charcoal',
    name: 'Grafito Cálido',
    label: 'Ámbar Suave & Ceniza',
    icon: '☕',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
    textAccentClass: 'text-amber-400',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
  },
  {
    id: 'forest-night',
    name: 'Bosque Nocturno',
    label: 'Salvia & Oliva Oscuro',
    icon: '🌲',
    badgeClass: 'bg-emerald-600/15 text-emerald-300 border-emerald-600/30',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-600 text-white',
    textAccentClass: 'text-emerald-400',
    primaryColor: '#059669',
    accentColor: '#34d399',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(StorageService);

  readonly currentTheme = this.storage.currentTheme;

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', theme);
      }
    });
  }

  get currentThemeMeta(): ThemeMeta {
    return APP_THEMES.find((t) => t.id === this.currentTheme()) || APP_THEMES[0];
  }

  setTheme(theme: ThemePalette): void {
    this.storage.setThemePalette(theme);
  }
}
