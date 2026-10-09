import React, { useState } from 'react';
import { BookOpen, Calendar, LineChart, MessageSquare, Bell, Plus, Timer, Sparkles, Palette, ChevronDown, Check } from 'lucide-react';
import { ThemePalette } from '../../types/study';

interface NavbarProps {
  currentTab: 'roadmap' | 'planner' | 'progress' | 'chat';
  onSelectTab: (tab: 'roadmap' | 'planner' | 'progress' | 'chat') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenNewRoadmapModal: () => void;
  onOpenTimerModal: () => void;
  activeRoadmapTitle: string;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  currentTheme: ThemePalette;
  onSelectTheme: (theme: ThemePalette) => void;
}

export const THEMES: { id: ThemePalette; name: string; label: string; icon: string; badge: string; solidButton: string; textAccent: string }[] = [
  {
    id: 'slate-calm',
    name: 'Pizarra Suave',
    label: 'Índigo & Grafito',
    icon: '🌙',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    solidButton: 'bg-indigo-600 hover:bg-indigo-500',
    textAccent: 'text-indigo-400',
  },
  {
    id: 'nord-dark',
    name: 'Nórdico Frío',
    label: 'Azul Calmo & Carbón',
    icon: '❄️',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    solidButton: 'bg-sky-600 hover:bg-sky-500',
    textAccent: 'text-sky-400',
  },
  {
    id: 'warm-charcoal',
    name: 'Grafito Cálido',
    label: 'Ámbar Suave & Ceniza',
    icon: '☕',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    solidButton: 'bg-amber-600 hover:bg-amber-500',
    textAccent: 'text-amber-400',
  },
  {
    id: 'forest-night',
    name: 'Bosque Nocturno',
    label: 'Salvia & Oliva Oscuro',
    icon: '🌲',
    badge: 'bg-emerald-600/15 text-emerald-300 border-emerald-600/30',
    solidButton: 'bg-emerald-700 hover:bg-emerald-600',
    textAccent: 'text-emerald-400',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenNewRoadmapModal,
  onOpenTimerModal,
  activeRoadmapTitle,
  isDemoMode,
  onToggleDemoMode,
  currentTheme,
  onSelectTheme,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const activeThemeMeta = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#16181f]/95 backdrop-blur-md border-b border-[#252834]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-9 h-9 rounded-xl ${activeThemeMeta.solidButton} text-white flex items-center justify-center transition-all duration-300 shadow-md shadow-indigo-950/40 relative overflow-hidden group`}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h7" />
              <path d="m14 14 2 2 4-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap flex items-center gap-1.5">
              <span>Study Planner</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-[220px]">
              {activeRoadmapTitle}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap mr-2 ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border border-[#2b2f3d] hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemoMode ? 'Vista Demo' : 'Demo Express ⚡'}</span>
          </button>

          <button
            onClick={() => onSelectTab('roadmap')}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'roadmap' && !isDemoMode
                ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e222c]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Rutas de Estudio</span>
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'planner' && !isDemoMode
                ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e222c]'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Planificador</span>
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'progress' && !isDemoMode
                ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e222c]'
            }`}
          >
            <LineChart className="w-4 h-4 text-emerald-400" />
            <span>Progreso</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'chat' && !isDemoMode
                ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e222c]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>Mentor IA</span>
          </button>
        </nav>

        {/* Zone 3: Palette Switcher + Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="px-2.5 py-1.5 bg-[#1b1e27] hover:bg-[#232733] text-slate-300 border border-[#2b2f3d] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Paleta de colores suave"
            >
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline text-[11px] font-medium text-slate-300">{activeThemeMeta.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1b1e27] border border-[#2d3240] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#282c38] mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Paleta de Tonos Suaves
                  </p>
                  <p className="text-xs text-slate-300 font-normal">
                    Confort visual y descansado
                  </p>
                </div>

                <div className="space-y-1">
                  {THEMES.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSelectTheme(theme.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#262a36] text-white border border-[#3b4154]'
                            : 'text-slate-300 hover:text-white hover:bg-[#222530]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{theme.icon}</span>
                          <div className="text-left">
                            <div className="text-xs text-slate-200 flex items-center gap-1.5">
                              <span>{theme.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${theme.badge}`}>
                                {theme.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenTimerModal}
            title="Temporizador de Enfoque Pomodoro"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#1f222c] rounded-xl transition-colors border border-[#262936]"
          >
            <Timer className="w-5 h-5 text-indigo-400" />
          </button>

          <button
            onClick={onOpenNotifications}
            title="Notificaciones automáticas"
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-[#1f222c] rounded-xl transition-colors border border-[#262936]"
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNewRoadmapModal}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white ${activeThemeMeta.solidButton} rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Ruta</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-[#252834] px-4 py-2 flex items-center justify-around bg-[#16181f]">
        <button
          onClick={() => onSelectTab('roadmap')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'roadmap' && !isDemoMode ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          Rutas
        </button>
        <button
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'planner' && !isDemoMode ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          Planificador
        </button>
        <button
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'progress' && !isDemoMode ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          Progreso
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'chat' && !isDemoMode ? 'text-sky-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          Mentor IA
        </button>
      </div>
    </header>
  );
};
